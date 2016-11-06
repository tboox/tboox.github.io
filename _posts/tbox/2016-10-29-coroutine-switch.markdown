---
layout: post
title:  "Some examples for coroutine (tbox)"
tags: tbox coroutine examples
categories: tbox
---

tbox add a coroutine library with stackfull mode and provide the following features.


```
1. yield 
2. suspend and resume
3. sleep 
4. io scheduler with (epoll, poll, kqueue, select, poll ..)
5. supports stream, http and other all io modules of tbox
6. channel
7. lock
8. semaphore
```







#### yield


```c
static tb_void_t switchfunc(tb_cpointer_t priv)
{
    tb_size_t count = (tb_size_t)priv;
    while (count--)
    {
        // trace
        tb_trace_i("[coroutine: %p]: %lu", tb_coroutine_self(), count);

        // yield
        tb_coroutine_yield();
    }
}
tb_int_t main(tb_int_t argc, tb_char_t** argv)
{
    // init tbox
    if (!tb_init(tb_null, tb_null)) return -1;

    // init scheduler
    tb_co_scheduler_ref_t scheduler = tb_co_scheduler_init();
    if (scheduler)
    {
        // start coroutine with the default stack size
        tb_coroutine_start(scheduler, switchfunc, (tb_cpointer_t)10, 0);

        // start coroutine with stack size (8192)
        tb_coroutine_start(scheduler, switchfunc, (tb_cpointer_t)10, 8192);

        // run scheduler loop
        tb_co_scheduler_loop(scheduler, tb_true);

        // exit scheduler
        tb_co_scheduler_exit(scheduler);
    }

    // exit tbox
    tb_exit();
}
```


#### sleep

We can uses tb_sleep(), tb_msleep() or tb_coroutine_sleep() to sleep some times. 

```c
static tb_void_t sleepfunc(tb_cpointer_t priv)
{
    while (1)
    {
        tb_msleep(10);
    }
}
```

#### resume and suspend

Unlike yield(), the suspended coroutine will never be scheduled until it is resumed.

And we can pass some private data without channel between resume() and suspend()

```c
static tb_void_t resumefunc(tb_cpointer_t priv)
{
    // get coroutine of suspendfunc() 
    tb_coroutine_ref_t coroutine = (tb_coroutine_ref_t)priv;

    // resume the given coroutine to pass "hello suspend!"
    tb_char_t const* retval = tb_coroutine_resume(coroutine, "hello suspend!");

    // retval is "hello resume!"
}
static tb_void_t suspendfunc(tb_cpointer_t priv)
{
    // start coroutine of resumefunc()
    tb_coroutine_start(tb_null, resumefunc, tb_coroutine_self(), 0);

    // suspend current coroutine and pass "hello resume!" to resumefunc()
    tb_char_t const* retval = tb_coroutine_suspend("hello resume!");

    // retval is "hello suspend!"
}
```

