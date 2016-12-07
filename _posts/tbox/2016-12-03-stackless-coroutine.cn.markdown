---
layout: post.cn
title:  "tbox新增stackless协程支持"
tags: tbox stackless 协程
categories: tbox
---

[tbox](https://github.com/waruqi/tbox)之前提供的stackfull协程库，虽然切换效率已经非常高了，但是由于每个协程都需要维护一个独立的堆栈，
内存空间利用率不是很高，在并发量非常大的时候，内存使用量会相当大。

之前考虑过采用stacksegment方式进行内存优化，实现动态增涨，但是这样对性能还是有一定的影响，暂时不去考虑了。

最近参考了下boost和protothreads的stackless协程实现，这种方式虽然易用性和灵活性上受到了很多限制，但是对切换效率和内存利用率的提升效果还是非常明显的。。

因此，我在tbox里面也加上了对stackless协程的支持，在切换原语上参考了protothreads的实现，接口封装上参考了boost的设计，使得更加可读易用

先晒段实际的接口使用代码：

```c  
tb_lo_coroutine_enter(coroutine)
{
    while (1)
    {
        tb_lo_coroutine_yield();
    }
}
```

然后实测对比了下：

```
* 切换性能在macosx上比tbox的stackfull版本提升了5-6倍，1000w次切换只需要40ms
* 每个协程的内存占用也减少到了只有固定几十个bytes
```






那么既然stackless的效率提升这么明显，stackfull模式还需要吗？可以比较下两者的优劣：

* stackfull协程：易用性和灵活性非常高，但是内存使用过大
* stackless协程：切换效率和内存利用率很高，更加轻量，但是使用上限制较多

由于stackless的实现比较轻量，占用资源也不是很多，因此tbox默认放置到了micro微内核模式下，作为基础模块，提供股嵌入式平台使用

而一般情况下，如果对资源使用和切换性能要求不是非常苛刻的话，使用stackfull的方式会更加方便，代码也更易于维护

具体如何选择，可根据实际使用场景，自己选择哦。。

#### 切换

下面给的tbox的stackless协程切换实例，直观感受下：

```c
static tb_void_t switchtask(tb_lo_coroutine_ref_t coroutine, tb_cpointer_t priv)
{
    // check
    tb_size_t* count = (tb_size_t*)priv;

    // enter coroutine
    tb_lo_coroutine_enter(coroutine)
    {
        // loop
        while ((*count)--)
        {
            // trace
            tb_trace_i("[coroutine: %p]: %lu", tb_lo_coroutine_self(), *count);

            // yield
            tb_lo_coroutine_yield();
        }
    }
}
static tb_void_t test()
{
    // init scheduler
    tb_lo_scheduler_ref_t scheduler = tb_lo_scheduler_init();
    if (scheduler)
    {
        // start coroutines
        tb_size_t counts[] = {10, 10};
        tb_lo_coroutine_start(scheduler, switchtask, &counts[0], tb_null);
        tb_lo_coroutine_start(scheduler, switchtask, &counts[1], tb_null);

        // run scheduler
        tb_lo_scheduler_loop(scheduler, tb_true);

        // exit scheduler
        tb_lo_scheduler_exit(scheduler);
    }
}
```

其实整体接口使用跟tbox的那套stackfull接口类似，并没有多少区别，但是相比stackfull还是有些限制的：

```
1. 目前只能支持在根函数进行协程切换和等待，嵌套协程不支持
2. 协程内部局部变量使用受限
```

对于限制1，我正在研究中，看看有没有好的实现方案，之前尝试过支持下，后来发现需要按栈结构分级保存每个入口的label地址，这样会占用更多内存，就放弃了。
对于限制2，由于stackless协程函数是需要重入的，因此目前只能在enter()块外部定以一些状态不变的变量，enter()块内部不要使用局部变量

接口设计上，这边采用boost的模式：

```c
// enter coroutine
tb_lo_coroutine_enter(coroutine)
{
    // yield
    tb_lo_coroutine_yield();
}
```

这样比起protothreads的那种begin()和end()，更加可读和精简，接口也少了一个。。

#### 参数传递

`tb_lo_coroutine_start`的最后两个参数，专门用来传递关联每个协程的私有数据priv和释放接口free，例如：

```c
typedef struct __tb_xxxx_priv_t
{
    tb_size_t   member;
    tb_size_t   others;

}tb_xxxx_priv_t;

static tb_void_t tb_xxx_free(tb_cpointer_t priv)
{
    if (priv) tb_free(priv);
}
 
static tb_void_t test()
{
    tb_xxxx_priv_t* priv = tb_malloc0_type(tb_xxxx_priv_t);
    if (priv)
    {
        priv->member = value;
    }

    tb_lo_coroutine_start(scheduler, switchtask, priv, tb_xxx_free);
}
```

上述例子，为协程分配一个私有的数据结构，用于数据状态的维护，解决不能操作局部变量的问题，但是这样写非常繁琐

tbox里面提供了一些辅助接口，用来简化这些流程：

```c
 
typedef struct __tb_xxxx_priv_t
{
    tb_size_t   member;
    tb_size_t   others;

}tb_xxxx_priv_t;

static tb_void_t test()
{
    // start coroutine 
    tb_lo_coroutine_start(scheduler, switchtask, tb_lo_coroutine_pass1(tb_xxxx_priv_t, member, value));
}
```

这个跟之前的代码功能上是等价的，这里利用`tb_lo_coroutine_pass1`宏接口，自动处理了之前的那些设置流程，
用来快速关联一个私有数据块给新协程。

#### 挂起和恢复

这个跟stackfull的接口用法上也是一样的：

```c
tb_lo_coroutine_enter(coroutine)
{
    // 挂起当前协程
    tb_lo_coroutine_suspend();
}

// 恢复指定协程（这个可以不在协程函数内部使用，其他地方也可以调用）
tb_lo_coroutine_resume(coroutine);
```

挂起和恢复跟yield的区别就是，yield后的协程，之后还会被切换回来，但是被挂起的协程，除非调用resume()恢复它，否则永远不会再被执行到。

#### 等待

当然一般，我们不会直接使用suspend()和resume()接口，这两个比较原始，如果需要定时等待，可以使用：

```c
tb_lo_coroutine_enter(coroutine)
{
    // 等待1s
    tb_lo_coroutine_sleep(1000);
}
```

来挂起当前协程1s，之后会自动恢复执行，如果要进行io等待，可以使用：

```c
static tb_void_t tb_demo_lo_coroutine_client(tb_lo_coroutine_ref_t coroutine, tb_cpointer_t priv)
{
    // check
    tb_demo_lo_client_ref_t client = (tb_demo_lo_client_ref_t)priv;
    tb_assert(client);

    // enter coroutine
    tb_lo_coroutine_enter(coroutine)
    {
        // read data
        client->size = sizeof(client->data) - 1;
        while (client->read < client->size)
        {
            // read it
            client->real = tb_socket_recv(client->sock, (tb_byte_t*)client->data + client->read, client->size - client->read);

            // has data?
            if (client->real > 0) 
            {
                client->read += client->real;
                client->wait = 0;
            }
            // no data? wait it
            else if (!client->real && !client->wait)
            {
                // 等待socket数据
                tb_lo_coroutine_waitio(client->sock, TB_SOCKET_EVENT_RECV, TB_DEMO_TIMEOUT);

                // 获取等到的io事件
                client->wait = tb_lo_coroutine_events();
                tb_assert_and_check_break(client->wait >= 0);
            }
            // failed or end?
            else break;
        }

        // trace
        tb_trace_i("echo: %s", client->data);

        // exit socket
        tb_socket_exit(client->sock);
    }
}
```

这个跟stackfull模式除了局部变量的区别，其他使用上几乎一样，也是同步模式，但是实际上tbox已经在底层把它放入了poller轮询器中进行等待

在没有数据，调用`tb_lo_coroutine_waitio`进行socket等待事件后，tbox会自动启用stackless调度器内部的io调度器（默认是不启用的，延迟加载，减少无畏的资源浪费）

然后进行poll切换调度（内部根据不同平台使用epoll, kqueue, poll, 后续还会支持iocp）。

如果有事件到来，会将收到事件的所有协程恢复执行，当然也可以指定等待超时，超时返回或者强行kill中断掉。

tbox中内置了一个stackless版本的[http_server](https://github.com/waruqi/tbox/blob/master/src/demo/coroutine/stackless/http_server.c)，实现也是非常轻量，经测试效率还是非常高的，
整体表现比stackfull的实现更好。

更多stackless接口使用demo，可以参考tbox的[源码](https://github.com/waruqi/tbox/tree/master/src/demo/coroutine/stackless)

#### 信号量和锁

这个就简单讲讲了，使用跟stackfull的类似，例如：

```c

// the lock
static tb_lo_lock_t     g_lock;

// enter coroutine
tb_lo_coroutine_enter(coroutine)
{
    // loop
    while (lock->count--)
    {
        // enter lock
        tb_lo_lock_enter(&g_lock);

        // trace
        tb_trace_i("[coroutine: %p]: enter", tb_lo_coroutine_self());

        // wait some time
        tb_lo_coroutine_sleep(1000);

        // trace
        tb_trace_i("[coroutine: %p]: leave", tb_lo_coroutine_self());

        // leave lock
        tb_lo_lock_leave(&g_lock);
    }
}
 
// init lock     
tb_lo_lock_init(&g_lock);

// start coroutine 
// ..

// exit lock
tb_lo_lock_exit(&g_lock);
```

这里只是举个例子，实际使用中尽量还是别这么直接用全局变量哦。。
