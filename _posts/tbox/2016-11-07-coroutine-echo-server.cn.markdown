---
layout: post.cn
title:  "协程使用之服务器实例"
tags: tbox 协程 服务器 
categories: tbox
---

tbox内部的所有io操作都是原生支持协程的，可以在线程和协程间任意切换，内置基于轮询的io调度器（epoll, kqueue等，后续还会支持iocp）.

我们在socket操作的时候，只需要像平常顺序编程那样操作就可以实现异步并发收发数据。

这里先给个简答的文件服务器的例子，可参考下，代码非常简单：


#### 文件接收服务器

这个文件服务器的功能很简单，就是不停的接收连接，然后开新协程，进行文件传输。

通过协程，从原始socket写起，也只需要不到100行代码，就可以实现一个高并发的文件服务器。

此处用到了`tb_socket_sendf`直接对文件句柄操作，发送到socket，内部使用sendfile实现，不需要再上层开buffer读文件发送，因此效率会有明显提升。

而`tb_socket_wait`内部会去将被等待的socket加入poll池，进行等待调度，直到事件到来才会继续执行。

并且协程的io调度器内部做了优化，不会去频繁得从轮询池里面添加删除socket，内部对epoll_ctl等操作会有个缓存，因此效率还是非常高的。







```c
static tb_void_t tb_demo_coroutine_client(tb_cpointer_t priv)
{
    // check
    tb_socket_ref_t sock = (tb_socket_ref_t)priv;
    tb_assert_and_check_return(sock);

    // trace
    tb_trace_d("[%p]: sending %s ..", sock, g_filepath);

    // init file
    tb_file_ref_t file = tb_file_init(g_filepath, TB_FILE_MODE_RO | TB_FILE_MODE_BINARY);
    tb_assert_and_check_return(file);

    // send data
    tb_hize_t send = 0;
    tb_hize_t size = tb_file_size(file);
    tb_long_t wait = 0;
    tb_hong_t time = tb_mclock();
    while (send < size)
    {
        // 直接发送文件，利用sendfile优化文件传输
        tb_hong_t real = tb_socket_sendf(sock, file, send, size - send);

        // trace
        tb_trace_d("[%p]: send: %ld", sock, real);

        // has data?
        if (real > 0)
        {
            send += real;
            wait = 0;
        }
        // no data? wait it
        else if (!real && !wait)
        {
            // 如果在协程模式下，会把socket添加到io调度器中，进行自动调度
            wait = tb_socket_wait(sock, TB_SOCKET_EVENT_SEND, TB_DEMO_TIMEOUT);
            tb_assert_and_check_break(wait >= 0);
        }
        // failed or end?
        else break;
    }

    // trace
    tb_trace_i("[%p]: send: %lld bytes %lld ms", sock, send, tb_mclock() - time);

    // exit file
    tb_file_exit(file);

    // exit socket
    tb_socket_exit(sock);
}
static tb_void_t tb_demo_coroutine_listen(tb_cpointer_t priv)
{
    // done
    tb_socket_ref_t sock = tb_null;
    do
    {
        // init socket
        sock = tb_socket_init(TB_SOCKET_TYPE_TCP, TB_IPADDR_FAMILY_IPV4);
        tb_assert_and_check_break(sock);

        // bind socket
        tb_ipaddr_t addr;
        tb_ipaddr_set(&addr, tb_null, TB_DEMO_PORT, TB_IPADDR_FAMILY_IPV4);
        if (!tb_socket_bind(sock, &addr)) break;

        // listen socket
        if (!tb_socket_listen(sock, 1000)) break;

        // trace
        tb_trace_i("listening ..");

        // 此处也会进入协程io调度，等待accept事件
        while (tb_socket_wait(sock, TB_SOCKET_EVENT_ACPT, -1) > 0)
        {
            // accept client sockets
            tb_size_t       count = 0;
            tb_socket_ref_t client = tb_null;
            while ((client = tb_socket_accept(sock, tb_null)))
            {
                // start client connection
                if (!tb_coroutine_start(tb_null, tb_demo_coroutine_client, client, 0)) break;
                count++;
            }

            // trace
            tb_trace_i("listened %lu", count);
        }

    } while (0);

    // exit socket
    if (sock) tb_socket_exit(sock);
    sock = tb_null;
}
tb_int_t main(tb_int_t argc, tb_char_t** argv)
{
    // check
    tb_assert_and_check_return_val(argc == 2 && argv[1], -1);

    // the file path
    tb_char_t const* filepath = argv[1];
    tb_assert_and_check_return_val(filepath, -1);

    // save the file path
    tb_strlcpy(g_filepath, filepath, sizeof(g_filepath));

    // init scheduler
    tb_co_scheduler_ref_t scheduler = tb_co_scheduler_init();
    if (scheduler)
    {
        // start listening
        tb_coroutine_start(scheduler, tb_demo_coroutine_listen, tb_null, 0);

        // run scheduler
        tb_co_scheduler_loop(scheduler, tb_true);

        // exit scheduler
        tb_co_scheduler_exit(scheduler);
    }
    return 0;
}
```


#### http服务器例子

这个例子，可以直接参考tbox的demo源码，这里就不贴了，基本上跟上面的代码差不多，非常精简。。

目前，tbox并没有提供更进一步的http等服务器开发上的封装，因为tbox的定位主要是轻量级跨平台基础库，因此会尽量保持精简（也为此移除了老的asio实现，功能部分重叠），只提供最基础的跨平台操作，不会涉及太多应用层的封装。

另外一个原因，就是协程的实现已经使得服务器开发非常的简单，一般写个精简的http服务器也就几百行代码，因此tbox仅在demo实例代码里面提供了一个精简实现。

有兴趣的同学，可以看下：[http_server](https://github.com/waruqi/tbox/blob/master/src/demo/coroutine/http_server.c)

虽然这个例子很精简，但是如果只是做做简单的http服务器实现，这个实现完全足够使用了，而且性能还是很不错的。。

后续有时间的话，我会基于tbox单独写个服务器框架。。
