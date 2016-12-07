---
layout: post 
title:  "Add the Stackless Coroutines for tbox"
tags: tbox stackless coroutines
categories: tbox
---

[tbox](https://github.com/waruqi/tbox) provides a lightweight implementation of stackless coroutines

and it's interfaces are very simple too, for example:

```c  
tb_lo_coroutine_enter(coroutine)
{
    while (1)
    {
        tb_lo_coroutine_yield();
    }
}
```

The switch performance of this stackless coroutines is faster than the implementation of tbox's [stackfull coroutines](/2016/10/29/coroutine-switch/).

And the memory storage space of each coroutine is also reduced to only a few bytes, but it also has many limitations:

```
1. With a stackless coroutine, only the top-level routine may be suspended. 
Any routine called by that top-level routine may not itself suspend. 
This prohibits providing suspend/resume operations in routines within a general-purpose library.

2. Because stackless coroutines do not save the stack context across a blocking call, local variables are not preserved when the protothread blocks.
This means that local variables should be used with utmost care - if in doubt, do not use local variables inside a stackless coroutine!
```






Now let's look at how to use the stackless coroutine of tbox.

#### Switch


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

#### Passing arguments

You can pass the user private data and the custom free function before starting a new coroutine.

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

But this is very complicated to write, so we can use `tb_lo_coroutine_pass1` to simplify it:

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

This is functionally equivalent to the previous code.

#### Suspend and resume

The usage of the two interfaces is same with tbox's stackfull coroutine:

```c
tb_lo_coroutine_enter(coroutine)
{
    // suspend coroutine
    tb_lo_coroutine_suspend();
}

// resume the given coroutine
tb_lo_coroutine_resume(coroutine);
```

The difference between suspend()/resume() and yield() is that the coroutine after yield is then switched back, 
but the suspended coroutine will never be executed until resumed by calling resume().

#### Sleep

We can simply use sleep() to wait some time:

```c
tb_lo_coroutine_enter(coroutine)
{
    // wait 1s
    tb_lo_coroutine_sleep(1000);
}
```

#### Wait io

We can use `tb_lo_coroutine_waitio` to wait socket io events synchronously:

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
                // wait socket receiving events
                tb_lo_coroutine_waitio(client->sock, TB_SOCKET_EVENT_RECV, TB_DEMO_TIMEOUT);

                // get waited events
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

The scheduler of stackless coroutines will use a io poller (epoll, kqueue, poll ..) to schedule these waiting socket.

If you want to know more usage of the interfaces, please refer to the http server [example](https://github.com/waruqi/tbox/blob/master/src/demo/coroutine/stackless/http_server.c) based on stackless coroutine.

Or more examples [source codes](https://github.com/waruqi/tbox/tree/master/src/demo/coroutine/stackless).

#### Semaphone and lock

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

