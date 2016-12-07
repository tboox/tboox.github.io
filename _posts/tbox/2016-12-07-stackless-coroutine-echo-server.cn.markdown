---
layout: post.cn
title:  "stackless协程使用之服务器实例"
tags: tbox stackless 协程 服务器 
categories: tbox
---


之前介绍过了stackfull的一些服务器使用例子，这里在贴一些使用stackless协程接口实现的server代码。

其实大部分接口，两者都是类似的，仅仅只是前缀的区别：`tb_co_xx` 和 `tb_lo_xx`，唯一需要注意的是：

```
* stackless协程尽量不要使用局部变量
* 不要再嵌套的过程里面进行协程挂起等待
```

#### 文件接收服务器

这个文件服务器的功能很简单，就是不停的接收连接，然后开新协程，进行文件传输。

通过协程，从原始socket写起，也只需要不到100行代码，就可以实现一个高并发的文件服务器。

此处用到了`tb_socket_sendf`直接对文件句柄操作，发送到socket，内部使用sendfile实现，不需要再上层开buffer读文件发送，因此效率会有明显提升。

而`tb_socket_wait`内部会去将被等待的socket加入poll池，进行等待调度，直到事件到来才会继续执行。

并且协程的io调度器内部做了优化，不会去频繁得从轮询池里面添加删除socket，内部对epoll_ctl等操作会有个缓存，因此效率还是非常高的。







```c
// the client type
typedef struct __tb_demo_lo_client_t
{
    // the client socket
    tb_socket_ref_t     sock;

    // the file
    tb_file_ref_t       file;

    // the data buffer size
    tb_hize_t           size;

    // the send size
    tb_hize_t           send;

    // the real size
    tb_hong_t           real;

    // the wait state
    tb_long_t           wait;

    // the time
    tb_hong_t           time;

}tb_demo_lo_client_t, *tb_demo_lo_client_ref_t;

// the listen type
typedef struct __tb_demo_lo_listen_t
{
    // the listen socket
    tb_socket_ref_t     sock;

    // the address
    tb_ipaddr_t         addr;

    // the client socket
    tb_socket_ref_t     client;

}tb_demo_lo_listen_t, *tb_demo_lo_listen_ref_t;

static tb_void_t tb_demo_lo_coroutine_client(tb_lo_coroutine_ref_t coroutine, tb_cpointer_t priv)
{
    // check
    tb_demo_lo_client_ref_t client = (tb_demo_lo_client_ref_t)priv;
    tb_assert(client);

    // enter coroutine
    tb_lo_coroutine_enter(coroutine)
    {
        // trace
        tb_trace_d("[%p]: sending %s ..", client->sock, g_filepath);

        // init file
        client->file = tb_file_init(g_filepath, TB_FILE_MODE_RO | TB_FILE_MODE_BINARY);
        tb_assert(client->file);

        // send data
        client->size = tb_file_size(client->file);
        client->time = tb_mclock();
        while (client->send < client->size)
        {
            // send it
            client->real = tb_socket_sendf(client->sock, client->file, client->send, client->size - client->send);

            // trace
            tb_trace_d("[%p]: send: %ld", client->sock, client->real);

            // has data?
            if (client->real > 0)
            {
                client->send += client->real;
                client->wait = 0;
            }
            // no data? wait it
            else if (!client->real && !client->wait)
            {
                // wait it
                tb_lo_coroutine_waitio(client->sock, TB_SOCKET_EVENT_SEND, TB_DEMO_TIMEOUT);

                // wait ok
                client->wait = tb_lo_coroutine_events();
                tb_assert_and_check_break(client->wait >= 0);
            }
            // failed or end?
            else break;
        }

        // trace
        tb_trace_i("[%p]: send: %lld bytes %lld ms", client->sock, client->send, tb_mclock() - client->time);

        // exit file
        tb_file_exit(client->file);

        // exit socket
        tb_socket_exit(client->sock);
    }
}
static tb_void_t tb_demo_lo_coroutine_listen(tb_lo_coroutine_ref_t coroutine, tb_cpointer_t priv)
{
    // check
    tb_demo_lo_listen_ref_t listen = (tb_demo_lo_listen_ref_t)priv;
    tb_assert(listen);

    // enter coroutine
    tb_lo_coroutine_enter(coroutine)
    {
        // done
        do
        {
            // init socket
            listen->sock = tb_socket_init(TB_SOCKET_TYPE_TCP, TB_IPADDR_FAMILY_IPV4);
            tb_assert_and_check_break(listen->sock);

            // bind socket
            tb_ipaddr_set(&listen->addr, tb_null, TB_DEMO_PORT, TB_IPADDR_FAMILY_IPV4);
            if (!tb_socket_bind(listen->sock, &listen->addr)) break;

            // listen socket
            if (!tb_socket_listen(listen->sock, 1000)) break;

            // trace
            tb_trace_i("listening ..");

            // loop
            while (1)
            {
                // wait accept events
                tb_lo_coroutine_waitio(listen->sock, TB_SOCKET_EVENT_ACPT, -1);

                // wait ok
                if (tb_lo_coroutine_events() > 0)
                {
                    // accept client sockets
                    while ((listen->client = tb_socket_accept(listen->sock, tb_null)))
                    {
                        // start client connection
                        if (!tb_lo_coroutine_start(tb_lo_scheduler_self(), tb_demo_lo_coroutine_client, tb_lo_coroutine_pass1(tb_demo_lo_client_t, sock, listen->client))) break;
                    }
                }
            }

        } while (0);

        // exit socket
        if (listen->sock) tb_socket_exit(listen->sock);
        listen->sock = tb_null;
    }
}

tb_int_t main(tb_int_t argc, tb_char_t** argv)
{
    // check
    tb_assert_and_check_return_val(argc == 2 && argv[1], -1);

    // init tbox
    if (!tb_init(tb_null, tb_null)) return -1;

    // the file path
    tb_char_t const* filepath = argv[1];
    tb_assert_and_check_return_val(filepath, -1);

    // save the file path
    tb_strlcpy(g_filepath, filepath, sizeof(g_filepath));

    // init scheduler
    tb_lo_scheduler_ref_t scheduler = tb_lo_scheduler_init();
    if (scheduler)
    {
        // start listening
        tb_lo_coroutine_start(scheduler, tb_demo_lo_coroutine_listen, tb_lo_coroutine_pass(tb_demo_lo_listen_t));

        // run scheduler
        tb_lo_scheduler_loop(scheduler, tb_true);

        // exit scheduler
        tb_lo_scheduler_exit(scheduler);
    }

    // exit tbox
    tb_exit();
    return 0;
}
```


#### http服务器例子

这个例子，可以直接参考tbox的demo源码，这里就不贴了，基本上跟上面的代码差不多，非常精简。。

目前，tbox并没有提供更进一步的http等服务器开发上的封装，因为tbox的定位主要是轻量级跨平台基础库，因此会尽量保持精简（也为此移除了老的asio实现，功能部分重叠），只提供最基础的跨平台操作，不会涉及太多应用层的封装。

另外一个原因，就是协程的实现已经使得服务器开发非常的简单，一般写个精简的http服务器也就几百行代码，因此tbox仅在demo实例代码里面提供了一个精简实现。

有兴趣的同学，可以看下：[http_server](https://github.com/waruqi/tbox/blob/master/src/demo/coroutine/stackless/http_server.c)

虽然这个例子很精简，但是如果只是做做简单的http服务器实现，这个实现完全足够使用了，而且性能还是很不错的。。

后续有时间的话，我会基于tbox单独写个服务器框架。。
