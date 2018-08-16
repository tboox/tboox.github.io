---
layout: post.cn
title:  "记对协程增加IOCP支持时候踩过的一些坑"
tags: tbox IOCP 协程 坑点
categories: tbox
---


之前在对[tbox](https://github.com/tboox/tbox)的协程库中增加了基于IOCP的io处理，期间踩了不少的坑，这边就做个简单记录吧，省的到时候忘记了，自己看不懂自己这个代码 (= =)

## 坑点一

WSARecv/WSASend在lpNumberOfBytesRecv和overlap同时被设置的情况下，如果它们的io操作立即返回成功，并且lpNumberOfBytesRecv里面也已经获取到了实际的io处理字节数，但是io event还会被放到完成队列，需要调用GetQueuedCompletionStatus去获取。

之前就被这个坑了很久，我原本想既然如果WASRecv已经立即完成，那么没必要再去通过GetQueuedCompletionStatus等待了，我可以直接快速返回处理结果，减少不必要的协程等待和切换。

然而经过实测发现，实时并非如此，即时我这次立即从recv返回出去不再等待了，等到下次recv如果是pending状态的话，有可能等待到的是上次处理成功的io event，蛋疼。。

为了进一步了解其机制，我翻了下官方文档，里面对lpNumberOfBytesRecvd有如下说明:


```
lpNumberOfBytesRecvd

A pointer to the number, in bytes, of data received by this call if the receive operation completes immediately.

Use NULL for this parameter if the lpOverlapped parameter is not NULL to avoid potentially erroneous results. This parameter can be NULL only if the lpOverlapped parameter is not NULL.
```

大概得意思就是告诉我们，如果lpNumberOfBytesRecvd和lpOverlapped同时被设置，可能会有潜在的问题(估计多半就是我遇到的坑吧)，所以看文档这意思，估计是建议我们在传入lpOverlapped的情况下，尽量不要设置lpNumberOfBytesRecvd，传NULL就好。

但是这不是我想要的结果，我还是希望能够快速处理WSARecv立即成功返回的情况，没必要每次都切换协程去等待io event。

一种办法是调用两次WSARecv，一次不传lpOverlapped，直接尝试读取，如果成功立即返回结果，读不到的话，再通过lpOverlapped送入完成队列，去队列化等待事件完成。

另外一种办法就是每次GetQueuedCompletionStatus的时候去忽略之前已经成功处理和返回的时间对象。

不过这两种我试了下，都不是很理想，处理起来比较复杂，效率也不高，那有没有其他更好的办法呢，我翻了下golang源码中对于iocp的处理，终于找到了解决办法。(果然还是golang给力)

[poll/fd_windows.go](https://github.com/golang/go/blob/4b74506da1ccf8c2f57f11991b432a6d5ac86e4f/src/internal/poll/fd_windows.go)里面有这么字段代码和注释说明:

```go
// This package uses the SetFileCompletionNotificationModes Windows
// API to skip calling GetQueuedCompletionStatus if an IO operation
// completes synchronously. There is a known bug where
// SetFileCompletionNotificationModes crashes on some systems (see
// https://support.microsoft.com/kb/2568167 for details).

var useSetFileCompletionNotificationModes bool // determines is SetFileCompletionNotificationModes is present and safe to use
```

原来golang是用了SetFileCompletionNotificationModes API去设置iocp端口在每次GetQueuedCompletionStatus等待io事件的时候，去直接内部忽略已经立即成功返回的io事件，也就是说如果WSARecv如果立即成功返回，那么不会再队列化io event了。

这个好呀，正是我想要的东西，而且用起来也很简单，只需要:

```c
SetFileCompletionNotificationModes(socket, FILE_SKIP_COMPLETION_PORT_ON_SUCCESS);
```






不过这个接口，并不是所有win系统版本都支持，xp上就没法这么用了，不过好在现在用xp的也不多了，对于检测此接口的支持情况，golang也有相关实现，可以直接参考:

```go
// checkSetFileCompletionNotificationModes verifies that
// SetFileCompletionNotificationModes Windows API is present
// on the system and is safe to use.
// See https://support.microsoft.com/kb/2568167 for details.
func checkSetFileCompletionNotificationModes() {
	err := syscall.LoadSetFileCompletionNotificationModes()
	if err != nil {
		return
	}
	protos := [2]int32{syscall.IPPROTO_TCP, 0}
	var buf [32]syscall.WSAProtocolInfo
	len := uint32(unsafe.Sizeof(buf))
	n, err := syscall.WSAEnumProtocols(&protos[0], &buf[0], &len)
	if err != nil {
		return
	}
	for i := int32(0); i < n; i++ {
		if buf[i].ServiceFlags1&syscall.XP1_IFS_HANDLES == 0 {
			return
		}
	}
	useSetFileCompletionNotificationModes = true
}
```

这个就不细说了，大家自己看看代码都能明白，不过似乎通过SetFileCompletionNotificationModes设置忽略io event的方式，对于udp处理上有其他问题，具体我也没验证过，既然golang没将其用到udp上，我也就暂时只对tcp上这么处理了，具体可以看下下面的注释说明:

```go
if pollable && useSetFileCompletionNotificationModes {
		// We do not use events, so we can skip them always.
		flags := uint8(syscall.FILE_SKIP_SET_EVENT_ON_HANDLE)
		// It's not safe to skip completion notifications for UDP:
		// https://blogs.technet.com/b/winserverperformance/archive/2008/06/26/designing-applications-for-high-performance-part-iii.aspx
		if net == "tcp" {
			flags |= syscall.FILE_SKIP_COMPLETION_PORT_ON_SUCCESS
		}
		err := syscall.SetFileCompletionNotificationModes(fd.Sysfd, flags)
		if err == nil && flags&syscall.FILE_SKIP_COMPLETION_PORT_ON_SUCCESS != 0 {
			fd.skipSyncNotif = true
		}
	}
```

## 坑点二

GetQueuedCompletionStatusEx如果每次只等待到一个io event的情况下，效率比GetQueuedCompletionStatus慢了接近一倍。

由于GetQueuedCompletionStatusEx每次可同时等待n个io事件，可以极大减少调用次数，快速处理多个时间对象。

对于同时有多个事件完成的情况下，这个调用确实比使用GetQueuedCompletionStatus效率好很多，但是我在本地做压测的时候发现，如果每次只有一个io事件完成的情况下，GetQueuedCompletionStatusEx的效率真的很差，还不如GetQueuedCompletionStatus了。

为此，我在[tbox](https://github.com/tboox/tbox)的iocp处理里面稍微做了下优化：

```c
/* we can use GetQueuedCompletionStatusEx() to increase performance, perhaps, 
 * but we may end up lowering perf if you max out only one I/O thread.
 */
tb_long_t wait = -1;
if (poller->lastwait_count > 1 && poller->func.GetQueuedCompletionStatusEx)
    wait = tb_poller_iocp_event_wait_ex(poller, func, timeout);
else wait = tb_poller_iocp_event_wait(poller, func, timeout);

// save the last wait count
poller->lastwait_count = wait;
```

我记录了下最近一次的等待时间返回数，如果最近都是只有一次io事件的话，那么切换到GetQueuedCompletionStatus去等待io，如果当前io事件比较多的话，再切换到GetQueuedCompletionStatusEx去处理。

这里我目前只是简单处理了下，测试下来效果还不错，等后续有时间可以根据实际效果，再调整下优化策略。

## 坑点三

CancelIO只能用于取消当前线程投递的io事件，想要在取消其他线程投递的io事件，需要使用CancelIOEx，这个大家应该都知道，我就简单提下好了。

## 坑点四

写好IOCP程序，还是很不容易的，各种处理细节核注意事项非常多，这里暂时不一一列举了，等有时间我再补充下吧，大家也可以通过评论，贴下自己平常开发IOCP程序时候，经常遇到的一些坑点。
