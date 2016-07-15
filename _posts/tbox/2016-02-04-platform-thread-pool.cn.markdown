---
layout: post.cn
title:  "线程池的使用"
tags: tbox c 线程池
categories: tbox
---

TBOX的线程池通过在每个worker中批量一次拉取多个task，对锁的竞争进行了优化。

由于每个task的函数实现不会太多，所以可以根据每个task的函数地址做hash，统计出每个task执行所花费的平均时间。然后根据这个平均值来动态计算每个worker一次拉取的task的数量，TBOX里面默认每个worker一次拉取10s的task量，这样可以尽可能的避免worker间锁的频繁抢占。

所有从等待队列被拉取出来的task，都会被放到pending队列中去，如果等待队列中的task都被取完了，某个worker处于了空闲状态，就会尝试去pending中，重新拉取其他worker还没有执行到的task， 这样可以解决某些task耗时太长，将worker中剩余的task阻塞住的问题。

重新从pending队列中拉取其他worker的task，并没有通过锁来维护，而是通过原子操作判断task的状态来维护的，所以性能上还是可以保证的。

整个线程池，只用到了一个锁来维护内部的几个队列，每个worker在大部分情况都是独立运行的，只有在自己的所有task都执行完空闲时，才回去全局等待队列中取task，并且上层接口也提供了批量投递任务的接口，来最小化对锁的使用。

下面看下简单的使用例子：



    static tb_void_t tb_demo_task_time_done(tb_cpointer_t priv)
    {
        tb_msleep((tb_size_t)(priv));
    }

    static tb_void_t tb_demo_task_time_exit(tb_cpointer_t priv)
    {
    }

    /* 投递一个60s的任务到全局线程池
     *
     * tb_thread_pool(): 全局线程池实例，如果不想用全局的，也可以自己创建个线程池
     * "60000ms": 指定的一个任务名，常量字符串
     * tb_demo_task_time_done: 任务函数地址
     * tb_demo_task_time_exit: 任务被执行完或取消的时候的清理函数，可以用于释放一些自有数据，这个是可选的，不用直接传tb_null
     * (tb_cpointer_t)60000: 传递的私有数据指针，这里简单的传了个等待时间值进去
     * tb_false: 是否为紧急任务， 如果为tb_true， 则这个任务会尽可能第一时间优先呗执行
     */
    tb_thread_pool_task_post(tb_thread_pool(), "60000ms", tb_demo_task_time_done, tb_demo_task_time_exit, (tb_cpointer_t)60000, tb_false);

    // 投递一个10s的紧急任务
    tb_thread_pool_task_post(tb_thread_pool(), "10000ms", tb_demo_task_time_done, tb_null, (tb_cpointer_t)10000, tb_true);

    // 批量投递两个任务
    tb_thread_pool_task_t list[2] = {0};
    list[0].name = "60000ms";
    list[0].done = tb_demo_task_time_done;
    list[0].exit = tb_demo_task_time_exit;
    list[0].priv = (tb_pointer_t)60000;
    list[0].urgent = tb_false;
    list[1].name = "10000ms";
    list[1].done = tb_demo_task_time_done;
    list[1].exit = tb_null;
    list[1].priv = (tb_pointer_t)10000;
    list[1].urgent = tb_true;
    tb_thread_pool_task_post_list(tb_thread_pool(), list, 2);

    // 初始化并且投递一个10s的紧急任务, 返回一个有效句柄
    tb_thread_pool_task_ref_t task = tb_thread_pool_task_init(tb_thread_pool(), "10000ms", tb_demo_task_time_done, tb_null, (tb_cpointer_t)10000, tb_true);
    if (task)
    {
        // 取消这个任务，如果这个任务已经在执行中了，就没法取消了
        tb_thread_pool_task_kill(tb_thread_pool(), task);
        
        // 等待任务取消或完成，超时值：-1：无限等待
        tb_thread_pool_task_wait(tb_thread_pool(), task, -1);
        
        // 释放这个任务
        tb_thread_pool_task_exit(tb_thread_pool(), task);
    }

如果不想用全局线程池，可以自己初始化一个：

    /* 初始化线程池
     *
     * 8：最大worker的数量，上限值，如果传0就是使用默认值
     * 0: 每个worker线程的堆栈大小，如果传0就是使用默认值
     */
    tb_thread_pool_ref_t thread_pool = tb_thread_pool_init(8, 0);
    if (thread_pool)
    {
        // 投递一个10s的紧急任务
        tb_thread_pool_task_post(thread_pool, "10000ms", tb_demo_task_time_done, tb_null, (tb_cpointer_t)10000, tb_true);
        
        // 如果的调试模式下，可以dump整个线程池的状态和所有处理中的任务状态
    #ifdef __tb_debug__
        tb_thread_pool_dump(thread_pool);
    #endif

        // 等待所有任务执行完成或被取消
        tb_thread_pool_task_wait_all(thread_pool, -1);
        
        // 退出线程池
        tb_thread_pool_exit(thread_pool);
    }


