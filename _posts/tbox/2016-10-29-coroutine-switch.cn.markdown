---
layout: post.cn
title:  "tbox协程使用之切换与等待"
tags: tbox 协程 切换 调度器
categories: tbox
---

tbox的协程实现，是stackfull模式的，需要指定独立堆栈和协程函数，目前暂时还不能像golang那样实现堆栈的动态增长，之后会对其进行支持。

目前提供下面一些功能特性：

```
1. 提供yield切换调度支持，这个是必须的哈
2. 提供suspend(挂起)/resume(恢复)协程接口，不同于yield的是，被suspend后，如果不显示调用resume恢复它，是永远不会被调度到的
3. 提供sleep等待接口支持
4. 提供io调度支持，支持socket等io等待（内部使用epoll, poll, kqueue, select, poll等接口调度）
5. 原生支持stream，socket，http等模块的协程支持，可与线程进行无缝切换
6. 提供channel同道，进行协程间交互通信
7. 提供lock，semaphore等接口
```






这里主要讲讲，基础的切换调度如何使用。。

#### yield切换

这个的使用非常简单，直接上代码吧，嘿嘿。。

```c
static tb_void_t switchfunc(tb_cpointer_t priv)
{
    // 获取传入的参数
    tb_size_t count = (tb_size_t)priv;
    while (count--)
    {
        // 打印当前协程id
        tb_trace_i("[coroutine: %p]: %lu", tb_coroutine_self(), count);

        // 让出当前协程，进行切换
        tb_coroutine_yield();
    }
}
tb_int_t main(tb_int_t argc, tb_char_t** argv)
{
    // 初始化tbox
    if (!tb_init(tb_null, tb_null)) return -1;

    // 初始化一个调度器实例
    tb_co_scheduler_ref_t scheduler = tb_co_scheduler_init();
    if (scheduler)
    {
        // 开启一个协程，传递switchfunc切换函数和参数10，最后一个参数指定栈大小，传0使用默认值
        tb_coroutine_start(scheduler, switchfunc, (tb_cpointer_t)10, 0);

        // 开启协程，使用指定的栈大小：8192
        tb_coroutine_start(scheduler, switchfunc, (tb_cpointer_t)10, 8192);

        /* 运行调用，开始运行里面的所有协程
         *
         * 第二个参数指定是否启用独占模式，这个稍后细讲
         */
        tb_co_scheduler_loop(scheduler, tb_true);

        // 退出调度器
        tb_co_scheduler_exit(scheduler);
    }

    // 退出tbox
    tb_exit();
}
```

所有协程执行完后，就会从loop调用处返回，当然在协程函数内部也是可以嵌套开启新协程的

这个时候第一个参数就不需要显示指定scheduler了，传`tb_null`表示在当前调度器环境中开新协程，例如：

```c
static tb_void_t switchfunc2(tb_cpointer_t priv)
{
    // ..
}
static tb_void_t switchfunc(tb_cpointer_t priv)
{
    // 在当前协程函数内，开启一个新协程    
    tb_coroutine_start(tb_null, switchfunc2, tb_null, 0);

    // 获取传入的参数
    tb_size_t count = (tb_size_t)priv;
    while (count--)
    {
        // 让出当前协程，进行切换
        tb_coroutine_yield();
    }
}
```

#### 独占模式

上面的代码中提到的独占模式，需要特殊说明下，一般情况下，传`tb_false`到loop()中，不启用此模式是最为稳妥的。

因为这样每个scheduler对应的线程都会在Tls中维护自己的scheduler引用，使得协程中所有操作，都回去访问当前线程tls对应的独立scheduler，互不干涉。

这个在存在多个scheduler的情况，尤为重要，当时这样多少会有些tls操作上的性能损耗，像server端一般只有一个scheduler的情况下，就没必要放到独立tls中去了

可以传入tb_true启用独占模式，告诉tb_co_scheduler_loop()，我当前不需要tls维护，只需要一个全局scheduler变量来维护就行了

这样的话，性能会提升一些，因此在只有一个scheduler存在的情况下，启用独占效率会高些。。


#### sleep等待

tbox的`tb_sleep`和`tb_msleep()`接口，是可以原生支持协程的，在协程外就是线程等待，在协程内就是协程等待。

当然也可以直接使用协程的接口：`tb_coroutine_sleep()`

例如：

```c
static tb_void_t sleepfunc(tb_cpointer_t priv)
{
    while (1)
    {
        // 等待10ms，切换到其他协程，直到10ms后才会切换回来继续执行
        tb_msleep(10);
    }
}
```

#### resume/suspend接口

挂起域恢复，跟yield的区别就是，被suspend挂起的协程，默认是不会被切换调度回来的，除非执行resume恢复它。

因此这两个接口是成对使用的，像sleep，lock和semaphore的内部实现，也是基于此套接口。

这两个接口还有个功能，就是可以在两个协程间，更加快速方便的传递一些参数数据，进行交互，而不需要channel支持。。

例如：

```c
static tb_void_t resumefunc(tb_cpointer_t priv)
{
    // 获取suspend协程引用 
    tb_coroutine_ref_t coroutine = (tb_coroutine_ref_t)priv;

    /* 恢复suspend协程，传递参数"hello suspend!"给suspend()作为其返回值
     *
     * retval为suspend()中传入的参数："hello resume!"
     */
    tb_char_t const* retval = tb_coroutine_resume(coroutine, "hello suspend!");
}
static tb_void_t suspendfunc(tb_cpointer_t priv)
{
    // 开启一个恢复协程，传入当前协程引用
    tb_coroutine_start(tb_null, resumefunc, tb_coroutine_self(), 0);

    /* 挂起当前协程，传递参数"hello resume!"给resume()作为其返回值
     *
     * retval为resume()中传入的参数："hello suspend!"
     */
    tb_char_t const* retval = tb_coroutine_suspend("hello resume!");
}
```

当然，如果不需要交互数据，那么只需要传`tb_null`就行了。。
