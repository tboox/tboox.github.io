---
layout: post.cn
title: "ios方法调用自动追踪工具：itrace"
tags: xmake trace ios objc hook 方法调用 插件
categories: itrace
---

这个工具是我之前在做ios逆向分析的时候，随手写的一个小工具，虽然现在已经不怎么维护了，不过这里还是拿出来简单介绍下吧。。

当初写这个工具的背景主要是因为要在越狱的ios系统上，做些插件开发，所以要分析一些私有api的调用规则，以及传参情况。

虽然可以通过ida进行静态分析，也可以做到，但是有些需求毕竟还是需要动态分析来的方便，而且那个时候ida的arm f5插件还没流出，
只能通过人工逆向arm来分析，工作量还是挺大的。

因此就萌生了能否动态去追踪ios系统上对oc代码的调用逻辑呢，逼近objc是基于runtime的，总归是有些办法的。。

一开始，我的重点是在`objc_msgSend`这个接口，毕竟所有oc调用，最后都会路由到这个接口中，因此我写了个gdb的脚本去动态trace这个接口：

```
define to 
b objc_msgSend
c
set $__i = 0
while ($__i < $arg0)
printf "%d: [%s %s]\n", $__i, (char*)object_getClassName($r0), (char*)$r1
set $__i++
c
end
end
```

在.gdbinit这个文件中加入这个脚本api的定义，然后加载gdb attach到指定的系统进程后，执行：

```bash
$ to 100
```

就可以trace之后的100条`objc_msgSend`调用，并且打印出详细的objc方法调用名称。





但是，用了一段时间后，发现这种trace的方式效果和体验都不是很好，相当的慢，慢的几乎能把ui卡着动不了，毕竟是全局hook嘛。。。

没办法，只好重新想其他办法，于是乎，我开始研究objc的[runtime](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html)接口

发现还是可以通过直接改写method的imp地址，直接实现方法替换的，这个其实现在已经很常用了哈，基本上是一篇ios hook的文章都会有介绍，这里就不多说了

主要我不仅要通过这个来实现一个类的所有method的批量自动化trace，而且要能自动trace打印出这些method调用的所有参数数据，这才是难点。。

毕竟如果只能trace调用的方法名，其实用处不大，我的需求还是要窥探每个调用的参数传入情况，这样就能一目了然的实时查看某个app和系统进程的执行状态，以及到底干了什么事情。。

例如：

1. 我要trace系统的itunestore进程，只需要先通过ida反汇编这个程序，或者通过class-dump看看这个程序用到了哪些classes。。

然后配置需要trace的一些看上去比较有用的classes名：

```
    修改itrace.xml配置文件，增加需要hook的类名：
    <?xml version="1.0" encoding="utf-8"?>
    <itrace>
      <class>
        <SSDevice/>
        <SSDownload/>
        <SSDownloadManager/>
        <SSDownloadQueue/>
        <CPDistributedMessagingCenter/>
        <CPDistributedNotificationCenter/>
        <NSString args="0"/>
      </class>
    </itrace>
```

注： 尽量不要去hook， 频繁调用的class， 比如 UIView NSString， 否则会很卡，操作就不方便了。
注： 如果挂接某个class， 中途打印参数信息挂了， 可以在对应的类名后面 加上 args="0" 属性， 来禁止打印参数信息， 这样会稳定点。 
     如果要让所有类都不打印参数信息， 可以直接设置： <class args="0">


2. 安装文件

将整个itracer目录下的所有文件用手机助手工具，上传到ios系统上的 /tmp 下面：

```
    /tmp/itracer
    /tmp/itrace.dylib
    /tmp/itrace.xml
```

3. 进行trace

进入itracer所在目录：

```bash
$ cd /tmp
```

修改执行权限：

```bash
$ chmod 777 ./itracer
```

运行程序: 

```bash
$ ./itracer springboard (spingboard 为需要挂接的进程名， 支持简单的模糊匹配)
```

4. 查看 trace log， 注： log 的实际输出在： Xcode-Windows菜单-Organizer-Console 中：

```
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadQueue downloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadManager downloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadManager _copyDownloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadQueue _sendDownloadStatusChangedAtIndex:]: 0
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadQueue _messageObserversWithFunction:context:]: 0x334c5d51: 0x2fe89de0
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadQueue downloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadManager downloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownloadManager _copyDownloads]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownload cachedApplicationIdentifier]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownload status]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [SSDownload cachedApplicationIdentifier]
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [CPDistributedNotificationCenter postNotificationName:userInfo:]: SBApplicationNotificationStateChanged: {
          SBApplicationStateDisplayIDKey = "com.apple.AppStore";
          SBApplicationStateKey = 2;
          SBApplicationStateProcessIDKey = 5868;
          SBMostElevatedStateForProcessID = 2;
      }
    Jan 21 11:12:58 unknown SpringBoard[5706] <Warning>: [itrace]: [3edc9d98]: [CPDistributedNotificationCenter postNotificationName:userInfo:toBundleIdentifier:]: SBApplicationNotificationStateChanged: {
          SBApplicationStateDisplayIDKey = "com.apple.AppStore";
          SBApplicationStateKey = 2;
          SBApplicationStateProcessIDKey = 5868;
          SBMostElevatedStateForProcessID = 2;
      }: null
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownloadManager _handleMessage:fromServerConnection:]: 0xe6920b0: 0xe007040
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownloadManager _handleDownloadStatesChanged:]: 0xe6920b0
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownloadManager _copyDownloads]
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownload persistentIdentifier]
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownload _addCachedPropertyValues:]: {
          I = SSDownloadPhaseDownloading;
      }
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownload _applyPhase:toStatus:]: SSDownloadPhaseDownloading: <SSDownloadStatus: 0xe6b8e80>
    Jan 21 11:12:59 unknown SpringBoard[5706] <Warning>: [itrace]: [105d7000]: [SSDownloadQueue downloadManager:downloadStatesDidChange:]: <SSDownloadManager: 0x41ea60>: (
          "<SSDownload: 0xe6bd970>: -4085275246093726486"
      )
```

通过上面的log，可以看到很多调用的参数传递数据信息，当然目前还是有很多缺陷和限制在里面

比如：不能获取返回值，不能trace太多的classes（超过几百个，否则可能不稳定）

这个如果大家有兴趣，可以自己修改代码，帮我优化下哈，嘿嘿。。

最后，我就简单介绍下itrace的一些特性：

* 批量跟踪ios下指定class对象的所有调用流程
* 支持ios for armv6,armv7,arm64 以及mac for x86, x64
* 自动探测参数类型，并且打印所有参数的详细信息
* 增加对arm64的支持，刚调通稳定性有待测试。
   arm64进程注入没时间做了，暂时用了substrate的hookprocess， 所以大家需要先装下libsubstrate.dylib
   armv7的版本是完全不依赖substrate的。
* arm64的版本对参数的信息打印稍微做了些增强。


至于其自动化trace参数的原理，简单说下，就是通过`method_getTypeEncoding`这个runtime接口，获取每个调用method的方法中
参数原型，然后对其进行解析，获取到实际的参数个数，以及每个参数的类型信息，进行针对性打印输出。。

具体是如何处理的，这里就不多说了，有兴趣的同学可以看看[源码](https://github.com/waruqi/itrace)。。

如果大家想要编译这个项目，还是简单的，它也是基于[xmake](http://www.xmake.io/cn)的，并且xmake也已经被homebrew收录了，只需要执行：

```bash
$ sudo brew install xmake
$ xmake
```

就能编译通过。: )
