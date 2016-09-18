---
layout: post.cn
title:  "使用printf定制化打印对象"
tags: tbox printf 打印
categories: tbox
---

tbox内置的libc库，有一份自有的printf实现，在支持了所有标准格式化参数的同时，也对其进行了一些扩展，来支持自定义的格式化参数打印， 例如：

```c
    // 输出定点数：3.14
    tb_printf("%{fixed}\n", tb_float_to_fixed(3.14));

    // 输出ipv4地址：127.0.0.1
    tb_ipv4_t addr;
    tb_ipv4_set(&addr, "127.0.0.1");
    tb_printf("%{ipv4}\n", &addr);
```

以上两种都是TBOX内置的对象参数打印，你只需要吧你需要打印的对象名和对象描述函数注册进来，就行了。

其中`%{object_name}` 就是自定义参数化对象打印的格式，这个是对%s、%f等标准格式的扩展，使你可以像ios中的`NSLog(@"%@", object)` 那样方便的打印自定义对象的内容。

例如：如果你要支持自定义打印如下内容：

```c
    typedef struct _rect_t
    {
        tb_long_t x;
        tb_long_t y;
        tb_size_t w;
        tb_size_t h;

    }rect_t;

    tb_printf("%{rect}\n", &rect);
```





那么你只需要提供对应的rect对象的描述函数，并对其进行注册，就行了：
 
```c
    // rect对象的描述函数，将描述内容格式化到cstr中，并返回实际的字符串大小
    static tb_long_t tb_printf_rect_func(tb_cpointer_t object, tb_char_t* cstr, tb_size_t maxn)
    {
        // check
        tb_assert_and_check_return_val(object && cstr && maxn, -1);

        // the rect
        rect_t* rect = (rect_t*)object;

        // format
        tb_long_t size = tb_snprintf(cstr, maxn - 1, "(x: %ld, y: %ld, w: %lu, h: %lu)", rect->x, rect->y, rect->w, rect->h);
        if (size >= 0) cstr[size] = '\0';

        // ok?
        return size;
    }

    // 注册%{rect}对象的printf参数化打印支持，注：最好在程序初始化阶段来进行注册
    tb_printf_object_register("rect", tb_printf_rect_func);

    // 打印rect对象信息，显示："(x: 10, y: 10, w: 640, h: 480)"
    rect_t rect = {10, 10, 640, 480};
    tb_printf("%{rect}\n", &rect);
```

当然不仅仅只有printf支持自定义的参数化对象打印，只要是printf系列的都支持这个特性，例如如下接口：

* tb_printf
* tb_snprintf
* tb_vsnprintf
* tb_wprintf
* tb_swprintf
* tb_vswprintf
* tb_trace_i
* tb_trace_d
* tb_trace_e
* tb_trace_w

等等，这些都是可以自定义的参数化对象打印，每个对象，只要注册一次就行了。


 
