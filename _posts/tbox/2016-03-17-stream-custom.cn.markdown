---
layout: post.cn
title:  "自定义流的实现和使用"
comments: true
categories: tbox
---

tbox中提供了常用的一些stream模块，例如：data、file、http、sock等，可以通过指定不同的url，使用相同的接口
进行数据流的读写，非常的方便。

例如：


    // init stream
    tb_stream_ref_t stream = tb_stream_init_from_url("http://www.xxx.com/file.txt");
    if (stream)
    {
        // open stream
        if (tb_stream_open(stream))
        {
            // read line
            tb_long_t size = 0;
            tb_char_t line[TB_STREAM_BLOCK_MAXN];
            while ((size = tb_stream_bread_line(stream, line, sizeof(line))) >= 0)
            {
                // trace
                tb_trace_i("line: %s", line);
            }
        }

        // exit stream
        tb_stream_exit(stream);
    }

<!-- more -->

这样的好处是，操作io的模块不需要关心实际的数据流协议，只管从stream中读写数据就行了，实现数据和业务逻辑的解耦。。

但是tbox提供的这些内置stream模块，有时候没法完全咱们的实际需求，例如：

我想读取一个实时数据流的缓存队列，这个数据流一段会不停的送入数据进来，另外一段会不停的读取数据，如果数据不够，就会进入等待

这其实是个很有用的功能，我的很多需求都会用到，例如：流媒体的一些实时数据获取和复用等等。。

那如何实现这样一个stream模块，让tbox的stream接口支持呢，我们只要实现一个自定义的流模块就好，实现起来也不复杂

我们先定义个一个stream类型，例如：


    // 用户自定义流类型：实时流
    #define TB_STREAM_TYPE_REAL         (TB_STREAM_TYPE_USER + 1)

    // 定义一个控制流代码，之后tb_stream_ctrl需要
    #define TM_STREAM_CTRL_REAL_PUSH    TB_STREAM_CTRL(TM_STREAM_TYPE_REAL, 1)

定义个自定义流的数据结构，用于维护咱们的私有数据

    // 实时流类型
    typedef struct __tb_stream_real_t
    {
        // 这里定义了一个数据块buffer的队列，用于缓存不断送入的数据
        tb_queue_ref_t      buffers;

        // 总的数据大小
        tb_size_t           size;

    }tb_stream_real_t, *tb_stream_real_ref_t;

    // 定义一个buffer块类型，用于维护单个数据块
    typedef struct __tm_real_buffer_t
    {
        // 数据地址
        tb_byte_t*          data;

        // 这个buffer总大小
        tb_size_t           size;

        // 在这个buffer中，当前读取到的数据
        tb_size_t           read;

    }tm_real_buffer_t, *tm_real_buffer_ref_t;


创建一个stream实例，注册一些需要的回调接口

    // 初始化创建个一个实时流
    tb_stream_ref_t tb_stream_init_real()
    {
        return tb_stream_init(  TB_STREAM_TYPE_REAL
                            ,   sizeof(tb_stream_real_t)
                            ,   0           // stream缓存大小（file/sock有用），这里禁用了，因为咱们的流不需要缓存读取
                            ,   tb_stream_real_open
                            ,   tb_stream_real_clos
                            ,   tb_stream_real_exit
                            ,   tb_stream_real_ctrl
                            ,   tb_stream_real_wait
                            ,   tb_stream_real_read
                            ,   tb_null     // 写回调，这里不需要
                            ,   tb_null     // seek，我们这里不需要
                            ,   tb_null     // 刷新写数据，不需要
                            ,   tb_null);   // kill当前的stream，很少用，一般用于中断内部读写
    }

下面就是具体的回调接口实现了

    // 实现open回调接口，用于打开stream，tb_stream_open会用到
    static tb_bool_t tb_stream_real_open(tb_stream_ref_t stream)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return_val(rstream, tb_false);

        // 初始化一个buffer队列，并注册自动释放接口：tb_real_buffer_exit，之后有说明
        rstream->buffers = tb_queue_init(0, tb_element_mem(sizeof(tb_real_buffer_t), tb_real_buffer_exit, tb_null));

        // init size
        rstream->size = 0;

        // ok
        return !!rstream->buffers;
    }

    // 实现close回调接口，用于关闭stream，tb_stream_clos会用到
    static tb_bool_t tb_stream_real_clos(tb_stream_ref_t stream)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return_val(rstream, tb_false);
        
        // exit buffers
        if (rstream->buffers) tb_queue_exit(rstream->buffers);
        rstream->buffers = tb_null;

        // ok
        return tb_true;
    }

    // 实现exit回调接口，用于销毁stream，tb_stream_exit会用到
    static tb_void_t tb_stream_real_exit(tb_stream_ref_t stream)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return(rstream);
        
        // exit buffers
        if (rstream->buffers) tb_queue_exit(rstream->buffers);
        rstream->buffers = tb_null;

        // clear size
        rstream->size = 0;
    }

    // 实现read回调接口，用于读取数据，tb_stream_read/tb_stream_bread等接口会用到
    static tb_long_t tb_stream_real_read(tb_stream_ref_t stream, tb_byte_t* data, tb_size_t size)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return_val(rstream && rstream->buffers, -1);

        // check
        tb_check_return_val(data, -1);
        tb_check_return_val(size, 0);

        // 依次从队列头部读取每块buffer的数据，直到读满为止
        tb_long_t read = 0;
        while (read < size && tb_queue_size(rstream->buffers))
        {
            // get buffer
            tb_real_buffer_ref_t buffer = tb_queue_get(rstream->buffers);
            tb_assert_and_check_break(buffer && buffer->data && buffer->size);

            // read data
            if (buffer->read < buffer->size)
            {
                // calculate the need size
                tb_size_t need = tb_min(size - read, buffer->size - buffer->read);

                // copy data
                tb_memcpy(data + read, buffer->data + buffer->read, need);

                // update the read size for buffer
                buffer->read += need;

                // update the total read size
                read += need;
            }

            // 将读空的buffer释放掉
            if (buffer->read == buffer->size)
                tb_queue_pop(rstream->buffers);
        }

        // ok?
        return read;
    }

    // 实现wait回调接口，用于等待数据，tb_stream_wait/tb_stream_bread等阻塞读取接口会用到
    static tb_long_t tb_stream_real_wait(tb_stream_ref_t stream, tb_size_t wait, tb_long_t timeout)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return_val(rstream && rstream->buffers, -1);

        // 当前是否有数据可读？
        return tb_queue_size(rstream->buffers)? TB_STREAM_WAIT_READ : TB_STREAM_WAIT_NONE;
    }

    // 实现ctrl回调接口，用于设置和获取一些状态，扩展一些自定义的接口，tb_stream_ctrl接口会用到
    static tb_bool_t tb_stream_real_ctrl(tb_stream_ref_t stream, tb_size_t ctrl, tb_va_list_t args)
    {
        // check
        tb_stream_real_ref_t rstream = (tb_stream_real_ref_t)stream;
        tb_assert_and_check_return_val(rstream, tb_false);

        // ctrl
        switch (ctrl)
        {
        case TB_STREAM_CTRL_GET_SIZE:
            {
                // the psize
                tb_hong_t* psize = (tb_hong_t*)tb_va_arg(args, tb_hong_t*);
                tb_assert_and_check_break(psize);

                // 获取数据流大小，tb_stream_size有用到
                *psize = rstream->size;

                // ok
                return tb_true;
            }   
            // 在另外一端通过tb_stream_ctrl来不断的送入数据块到stream
        case TB_STREAM_CTRL_REAL_PUSH:
            {
                // check
                tb_assert_and_check_break(rstream->buffers);

                // the data and size
                tb_byte_t const*    data = (tb_byte_t const*)tb_va_arg(args, tb_byte_t const*);
                tb_size_t           size = (tb_size_t)tb_va_arg(args, tb_size_t);
                tb_assert_and_check_break(data && size);

                // 压入一个数据块
                tb_real_buffer_t buffer;
                buffer.data = tb_memdup(data, size);
                buffer.size = size;
                buffer.read = 0;
                tb_queue_put(rstream->buffers, &buffer);

                // 更新总的数据大小
                rstream->size += size;

                // ok
                return tb_true;
            }
        default:
            break;
        }

        // failed
        return tb_false;
    }

通过上面四步， 基本上一个自定义流就实现好了，上面说的`tb_real_buffer_exit`主要用于queue维护的buffer的自动释放
详细说明和使用见容器章节，下面附属相关实现：

    static tb_void_t tb_real_buffer_exit(tb_element_ref_t element, tb_pointer_t buff)
    {
        // check
        tb_real_buffer_ref_t buffer = (tb_real_buffer_ref_t)buff;
        tb_assert_and_check_return(buffer);

        // exit it
        if (buffer->data) tb_free(buffer->data);
        buffer->data = tb_null;
        buffer->size = 0;
        buffer->read = 0;
    }

最后，贴下咱们这个自定义stream使用：

接收端

    // init stream
    tb_stream_ref_t stream = tb_stream_init_real();
    if (stream)
    {
        // open stream
        if (tb_stream_open(stream))
        {
            // read line
            tb_long_t size = 0;
            tb_char_t line[TB_STREAM_BLOCK_MAXN];
            while ((size = tb_stream_bread_line(stream, line, sizeof(line))) >= 0)
            {
                // trace
                tb_trace_i("line: %s", line);
            }
        }

        // exit stream
        tb_stream_exit(stream);
    }

基本上没什么变化，就是换了下stream的初始化创建接口

输入端

       
    // 将数据不停的送入stream中
    while (1)
    {
        // fill data
        tb_byte_t data[8192];
        tb_memset(data, 0xff, sizeof(data));

        // push data
        tb_stream_ctrl(stream, TB_STREAM_CTRL_REAL_PUSH, data, sizeof(data));
    }

上面介绍的实现和使用方式，只是个例子，方便理解tbox中stream的机制，具体实现和使用还是需要根据自己的实际需求做调整。

更详细的使用和扩展，可参考源代码来了解。。


