---
layout: post.cn
title:  "TBOOX开源工程2019总结和明年规划"
tags: tboox tbox xmake
categories: tboox
---

今年一年总体还是有不少收获的，尤其是[xmake](https://xmake.io)，今年大部分时间都花在这个项目上面，不过[tbox](https://github.com/tboox/tbox)也陆陆续续做了一些更新，还是有不少改进的地方。

关于今年整体的项目进展，这边也做个简单的总结吧，这里主要总结一些比较大的特性改进，一些零散的小模块改动就不一一列举了。

### 完成了远程包依赖管理

这也是是今年最大的收获了，毕竟陆陆续续耗时了将近一年时间，虽然还有不少需要改进的地方，自建的包仓库也还不是很丰富，明年我会继续去完善它。

```lua
add_requires("libuv master", "ffmpeg", "zlib 1.20.*")
add_requires("tbox >1.6.1", {optional = true, debug = true})
target("test")
    set_kind("binary")
    add_files("src/*.c")
    add_packages("libuv", "ffmpeg", "tbox", "zlib")
```

![](https://xmake.io/assets/img/index/package_arch.png)

### 新增vsxmake生成插件

新版本xmake重新实现了一个vs工程的生成插件（非常感谢@OpportunityLiu的贡献），跟之前的生成vs的插件处理模式上有很大的不同，原先生成的vs工程是把所有源文件展开后，转交给vs来处理编译。

但是像rules和自定义脚本这种是没法支持的，因为xmake的rules里面用了很多的on_build此类自定义脚本，无法展开，所以像qt， wdk此类的项目就没法支持导出到vs里面进行编译了。

因此，为了解决这个问题，新版本的vs生成插件通过在vs下直接调用xmake命令，去执行编译操作，并且对intellsence和定义跳转，还有断点调试也做了支持。

具体使用方式跟老版本类似：

```bash
$ xmake project -k [vsxmake2010|vsxmake2013|vsxmake2015|..] -m "debug;release"
```

![](https://xmake.io/assets/img/manual/qt_vs.png)

### 上线了新版的文档站点

由于之前的docute文档站仅支持单页markdown，随着文档的不断增多，维护起来越来越臃肿，因此今年我整体切到了docsify来管理。

文档站点：[https://xmake.io/#/zh-cn/](https://xmake.io/#/zh-cn/)









![](/static/img/xmake/xmake-docs.png)

### xmake日活用户翻了10倍

其实也就只有50多个日活用户（比较惨 = =），不过相比去年每天仅仅只有5个独立用户在使用xmake来构建，今年算是有了不少起色，借助github traffics的粗略统计，每天有超过50个用户在使用xmake来构建自己的项目，每天构建的项目数超过100个。

明年继续，哈哈~

![](/static/img/xmake/xmake-stats-2019.png)

### github star数也增长了不少

毕竟是冷门项目，受众很小，今年tbox和xmake都涨了1k多我已经知足了。

![](/static/img/xmake/xmake-history-2019.png)

### 一些使用了xmake的开源项目

今年也有了一些知名的第三方开源项目使用了xmake来维护构建，主要有：

* [libacl](https://github.com/acl-dev/acl): An advanced C/C++ Network library 
* [libfiber](https://github.com/acl-dev/libfiber): The high performance coroutine library for Linux/FreeBSD/Windows, supporting select/poll/epoll/kqueue/iocp/windows GUI
* [co](https://github.com/idealvin/co): An elegant and efficient C++ basic library for Linux, Windows and Mac.
* [hikyuu](https://github.com/fasiondog/hikyuu): Hikyuu Quant Framework 基于C++/Python的开源量化交易研究框架
* [LCUI.css](https://github.com/lc-ui/lcui.css): A UI component framework for building LCUI application.
* [LC-Finder](https://github.com/lc-soft/LC-Finder): A simple pciture resource manager, support tag search and thumbnail preview. 

这里有个项目列表，里面是我收集到一些使用了xmake的项目：[https://github.com/xmake-io/awesome-xmake#projects](https://github.com/xmake-io/awesome-xmake#projects)

### 明年xmake相关的一些计划

明年的重点主要是在远程编译和分布式编译上，为此最近我正在改进tbox的协程支持，并且正在对xmake的lua协程做进一步封装，实现对pipe，socket和process的统一调度支持，为后续的远程编译做准备。

1. 实现跨平台的远程编译
2. 实现跨平台的分布式编译
3. 继续完善xmake与编辑器/IDE的集成
4. 完善远程依赖包管理，自建仓库增加更多常用依赖包
5. 继续封装lua的io协程调度模块，实现对pipe，socket和process的统一调度支持
6. 提供对xcode工程的生成插件

### tbox的一些特性改进

今年没花太多时间在tbox上面，总共也就发了一个版本，大部分特性改动主要还是服务于xmake，例如：

* 添加stdfile接口去读写stdin, stdout和stderr。
* 添加对进程和线程的cpu亲缘性设置和获取
* 添加filelock文件锁跨平台api接口
* 添加匿名管道，命名管道支持
* 改进字符集编码转换，以及增加对ANSI编码的支持
* 改进原子操作，并增加c11风格原子接口
* 新增进程输出重定向到管道
* 针对协程栈使用虚拟内存
* 改进基于openssl/mbedtls的https访问

不过明年我会进一步改进和实现协程、网络相关的模块，提供更多实用的基础功能。
