---
layout: post.cn
title:  "高精度定时器的使用"
tags: tbox 定时器 最小堆 时间轮算法
categories: tbox
---

tbox内部提供了两种定时器实现：timer和ltimer

* timer: 高精度版本，采用最小堆实现，复杂度是：O(log(n))
* ltimer: 低精度版本，采用linux内核中的timing-wheel算法，复杂度是：O(1)

这里主要讲解下，如何使用timer实现高精度的定时器任务，精确到ms级别，对于低精度的ltimer，可以参考：[低精度定时器的使用](/cn/2016/08/03/low-precision-timer/)

下面先给个简单的例子来说明：

```c
/* 定义一个定时器任务处理函数
 *
 * @param killed 表示当前任务是否被tb_timer_task_kill强行kill掉的
 * @param priv   投递任务时传入的用户自定义数据指针
 */
static tb_void_t tb_demo_timer_task_func(tb_bool_t killed, tb_cpointer_t priv)
{
    
}

/* 投递一个定时器任务到全局timer中，间隔1000ms，会重复执行
 *
 * 其中tb_true表示是否会重复执行，如果设为tb_false，那么只会执行一次
 * tb_null参数，就是传入给任务函数的用户自定义数据指针
 */
tb_timer_task_post(tb_timer(), 1000, tb_true, tb_demo_timer_task_func, tb_null);
```






上面的投递，会在post调用完，立刻开始任务的计时和运行，如果想要在10s后，才开始启动定时器，可以这么投递：

```c
// 在10s后才开始投递一个定时器任务到全局timer中，间隔1000ms，会重复执行
tb_timer_task_post_after(tb_timer(), 10000, 1000, tb_true, tb_demo_timer_task_func, tb_null);
```

如果要确定绝对投递时间，可以这么投递：

```c
// 在指定时间戳tb_time() + 150000才开始投递一个定时器任务到全局timer中，间隔1000ms，会重复执行
// 这里相当于15s后才开始投递
tb_timer_task_post_at(tb_timer(), tb_time() + 150000, 1000, tb_true, tb_demo_timer_task_func, tb_null);
```

前面使用的post投递接口，都是无法维护和控制任务的，如果想要在某个特定的时刻取消还在执行队列中的定时器任务

可以使用下面的方式来维护：

```c
// 创建一个间隔10s的定时器任务，不会重复执行
tb_timer_task_ref_t task = tb_timer_task_init(tb_timer(), 10000, tb_false, tb_demo_timer_task_func, tb_null);

// 过段时间后
// ...

// 如果觉得不想执行这个任务了，可以手动取消掉，这个是线程安全的
if (task) tb_timer_task_kill(tb_timer(), task);


// 最后在程序退出时，销毁这个任务资源
if (task) tb_timer_task_exit(tb_timer(), task);
```

前面的例子都是在全局的默认`tb_timer()`中投递的定时器任务，tbox会在后台创建一个单独的线程去维护它的所有任务，如果觉得这个太占资源，
自己有特定线程在不断loop的话可以创建个独立的timer，挂接到自己的loop线程中，重用线程资源：

```c
// 假设这个是你自己的线程
static tb_pointer_t tb_demo_timer_loop(tb_cpointer_t priv)
{
    // the timer
    tb_timer_ref_t timer = (tb_ltimer_ref_t)priv;

#if 1
    // 自己的线程loop
    while (1)
    {
        // 等待特定的定时器延时
        // 不一定非得用sleep， 如果你的线程正在处理select/epoll等，可以直接利用这些接口的timeout参数来等待
        tb_sleep(tb_timer_delay(timer));

        // 自己的一些其他逻辑代码
        // ...

        // 固定调用，脉动一下定时器，很快的，不会长时间阻塞，除非有耗时的任务
        tb_timer_spak(timer);
    }
#else
    // 如果没有其他逻辑代码，那么可以直接用timer自带的loop来代替
    tb_timer_loop(timer);
#endif

    // exit it
    tb_thread_return(tb_null);
    return tb_null;
}

/* 创建一个定时器
 *
 * 第一个参数：指定定时器最大并发任务规模，默认可以传0，也可以自己指定规模数
 * 第二个参数：是否启用时间戳缓存优化，传tb_false就行了，这个一般用于服务器端高并发处理时的优化
 */
tb_timer_ref_t timer = tb_timer_init(0, tb_false);
if (timer)
{
    // 投递一些任务
    // ...

    // 退出定时器
    tb_timer_exit(timer);
}

```


