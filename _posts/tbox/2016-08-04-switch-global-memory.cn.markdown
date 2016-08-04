---
layout: post.cn
title:  "切换tbox全局内存分配器"
tags: tbox 内存池 分配器
categories: tbox
---

tbox的默认内存分配，是完全基于自己的内存池架构，支持内存的快速分配，和对碎片的优化，并且支持各种内存泄露、溢出检测。

如果不想用tbox内置的默认内存分配管理，也可以灵活切换到其他分配模式，因为tbox现在已经完全支持allocator架构，
只要在init阶段传入不同的分配器模型，就能快速切换分配模式，例如：

```c
    -- 采用默认的tbox内存管理，启用内存池维护、碎片优化、内存泄露溢出检测等所有特性
    -- 相当于使用了：tb_default_allocator(tb_null, 0)
    tb_init(tb_null, tb_null);

    -- 采用默认的tbox内存管理，启用内存池维护、碎片优化、内存泄露溢出检测等所有特性
    -- 并且完全使用外部传入的一整块buffer上进行维护，不再使用其他native内存
    tb_init(tb_null, tb_default_allocator((tb_byte_t*)malloc(300 * 1024 * 1024), 300 * 1024 * 1024));

    -- 采用一整块静态buffer上进行维护，启用内存泄露溢出检测等所有特性
    -- 这个跟tb_default_allocator的区别就是，这个allocator比较轻量，内部的数据结构简单，占用内存少，适合低资源环境
    -- 但是这个allocator不支持碎片优化，容易产生碎片
    tb_init(tb_null, tb_static_allocator((tb_byte_t*)malloc(300 * 1024 * 1024), 300 * 1024 * 1024));

    -- 完全使用系统native内存分配，内部不做任何处理和数据维护，所有特性依赖系统环境，tbox不再支持内存池和内存检测等特性
    tb_init(tb_null, tb_native_allocator());
```





如果觉得这些分配器还是不够用，可以自定义自己的内存分配器，让tbox去使用，自定义的方式也很简单，这里拿`tb_native_allocator`的实现代码为例：

```c
static tb_pointer_t tb_native_allocator_malloc(tb_allocator_ref_t allocator, tb_size_t size __tb_debug_decl__)
{
    // trace
    tb_trace_d("malloc(%lu) at %s(): %lu, %s", size, func_, line_, file_);

    // malloc it
    return malloc(size);
}
static tb_pointer_t tb_native_allocator_ralloc(tb_allocator_ref_t allocator, tb_pointer_t data, tb_size_t size __tb_debug_decl__)
{
    // trace
    tb_trace_d("realloc(%p, %lu) at %s(): %lu, %s", data, size, func_, line_, file_);

    // realloc it
    return realloc(data, size);
}
static tb_bool_t tb_native_allocator_free(tb_allocator_ref_t allocator, tb_pointer_t data __tb_debug_decl__)
{
    // trace    
    tb_trace_d("free(%p) at %s(): %lu, %s", data, func_, line_, file_);

    // free it
    return free(data);
}


// 初始化一个native分配器
tb_allocator_t allocator    = {0};
allocator.type              = TB_ALLOCATOR_NATIVE;
allocator.malloc            = tb_native_allocator_malloc;
allocator.ralloc            = tb_native_allocator_ralloc;
allocator.free              = tb_native_allocator_free;

```

是不是很简单，需要注意的是，上面的`__tb_debug_decl__`宏里面声明了一些debug信息，例如`_file, _func, _line`等内存分配时候记录的信息，
你可以在debug的时候打印出来，做调试，也可以利用这些信息自己去处理一些高级的内存检测操作，但是这些在release下，是不可获取的

所以处理的时候，需要使用`__tb_debug__`宏，来分别处理。。

将allocator传入`tb_init`接口后，之后 `tb_malloc/tb_ralloc/tb_free/...` 等所有tbox内存分配接口都会切到新的allocator上进行分配。。

当然如果想直接从一个特定的allocator上进行分配，还可以直接调用allocator的分配接口来实现：

```c
tb_allocator_malloc(allocator, 10);
tb_allocator_ralloc(allocator, data, 100);
tb_allocator_free(allocator, data);
```

等等。

