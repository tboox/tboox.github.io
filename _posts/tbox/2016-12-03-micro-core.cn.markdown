---
layout: post.cn
title:  "tbox新增64K微内核编译模式"
tags: tbox micro 微内核 
categories: tbox
---

为了进一步裁剪tbox，更好的适配嵌入式开发平台，tbox新增了`--micro=y`的微模块编译选项

如果启用此编译选项，那么只会编译tbox里面较轻量的一些模块，是的编译后的库大小，尽量保证在64K左右。

先来讲讲一些跟库大小相关的编译选项：

```
* `--smallest=y`: 通用平台，最小编译模式，会禁用所有第三方依赖库，禁用所有扩展模块，启用最小化编译优化（库内部也会尽可能节省内存使用）
* `--micro=y`: 专门针对嵌入式平台设计，仅编译最为轻量的一些模块，启用最小化编译优化（有可能会包含一些可选组件）
```

smallest和micro的区别在于，即使启用了smallest禁用所有扩展模块，但是还是会内置比micro更多的常用组件用于日常基础开发
而micro是专门为嵌入式平台设计，内置的默认组件更加的精简，一些重量级的模块就不放置进去了

因此如果要编译最小tbox库，只需要执行下面的配置：

``` bash
$ xmake f --micro=y 
$ xmake
```

如果要在micro下面启用协程支持，只需要：

``` bash
$ xmake f --micro=y --coroutine=y
$ xmake
```

进行编译就行了，一般库大小会控制在64K左右，目前内置模块还不是很多，后续会进一步精简优化，使其在64K内包含更多使用的模块。

目前微内核编译模式支持的一些模块有：

* stackless线程库（比stackfull版本更加轻量，每个协程仅占用几十个bytes，切换效率也提升了5-6倍，macosx上1000w次切换只需要40ms）
* 轻量libc库api支持（支持一些最长使用的接口）
* 支持`list_entry`/`single_list_entry`单双链容器（比`list`/`single_list`更加轻量，外置式，不会维护对象内存）
* 原始socket接口操作
* 文件操作相关api
* dns地址解析、ipv4、ipv6等操作接口
* bits数据操作和解析
* 提供系统内存、连续静态内存分配器（可以指定tbox所有内存仅在一块连续空间内分配，适用于内存资源有严格要求的场景）
* 支持内存越界、泄漏检测
* 线程相关基础接口
* 提供单例、原子操作接口
* 自旋锁支持
* 跨平台`__tb_thread_local__`线程局部存储支持
* trace打印接口
* 迭代器支持（目前仅用于`list_entry`/`single_list_entry`）

关于micro编译的更多支持模块列表，见[micro.lua](https://github.com/waruqi/tbox/blob/master/src/tbox/micro.lua)

后续在保持库大小不增加的前提下，还会增加更多轻量级模块（例如：定时器、更多的容器和算法支持。。）
