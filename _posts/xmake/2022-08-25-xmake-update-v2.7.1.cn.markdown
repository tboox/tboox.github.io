---
layout: post.cn
title:  "Xmake v2.7.1 发布，更好的 C++ Modules 支持"
tags: xmake lua C/C++ remote ccache C++20 Modules headerunits fs-watcher
categories: xmake
---

[Xmake](https://github.com/xmake-io/xmake) 是一个基于 Lua 的轻量级跨平台构建工具。

它非常的轻量，没有任何依赖，因为它内置了 Lua 运行时。

它使用 xmake.lua 维护项目构建，相比 makefile/CMakeLists.txt，配置语法更加简洁直观，对新手非常友好，短时间内就能快速入门，能够让用户把更多的精力集中在实际的项目开发上。

我们能够使用它像 Make/Ninja 那样可以直接编译项目，也可以像 CMake/Meson 那样生成工程文件，另外它还有内置的包管理系统来帮助用户解决 C/C++ 依赖库的集成使用问题。

目前，Xmake 主要用于 C/C++ 项目的构建，但是同时也支持其他 native 语言的构建，可以实现跟 C/C++ 进行混合编译，同时编译速度也是非常的快，可以跟 Ninja 持平。

```
Xmake = Build backend + Project Generator + Package Manager + [Remote|Distributed] Build + Cache
```

尽管不是很准确，但我们还是可以把 Xmake 按下面的方式来理解：

```
Xmake ~= Make/Ninja + CMake/Meson + Vcpkg/Conan + distcc + ccache/sccache
```

* [项目源码](https://github.com/xmake-io/xmake)
* [官方文档](https://xmake.io/#/zh-cn/)
* [入门课程](https://xmake.io/#/zh-cn/about/course)

## 新特性介绍

这个版本我们对 C++20 Modules 的实现进行了重构和改进，改进了模块文件的依赖图解析，新增了对 STL 和 User HeaderUnits 的支持，同时让 CMakelists/compile_commands 生成器也支持了 C++ Modules。

另外，我们新增了一个 `xmake watch` 插件，可以实时监控当前工程文件更新，自动触发增量构建，或者运行一些自定义的命令。

<img src="/static/img/xmake/xmake-watch.gif" width="60%" />






### C++ Modules 改进

### 工程文件监视和自动构建

### Mac Catalyst 支持

### 改进远程编译

#### 拉取远程构建文件

#### 实时回显输出

### 改进分布式编译调度算法

### 更灵活的 cmake 包查找

### armcc/armclang/rc 增量编译支持


## 更新内容

### 新特性

* [#2555](https://github.com/xmake-io/xmake/issues/2555): 添加 fwatcher 模块和 `xmake watch` 插件命令
* 添加 `xmake service --pull 'build/**' outputdir` 命令去拉取远程构建服务器上的文件
* [#2641](https://github.com/xmake-io/xmake/pull/2641): 改进 C++20 模块, 支持 headerunits 和 project 生成
* [#2679](https://github.com/xmake-io/xmake/issues/2679): 支持 Mac Catalyst 构建

### 改进

* [#2576](https://github.com/xmake-io/xmake/issues/2576): 改进从 cmake 中查找包，提供更过灵活的可选配置
* [#2577](https://github.com/xmake-io/xmake/issues/2577): 改进 add_headerfiles()，增加 `{install = false}` 支持
* [#2603](https://github.com/xmake-io/xmake/issues/2603): 为 ccache 默认禁用 `-fdirectives-only`
* [#2580](https://github.com/xmake-io/xmake/issues/2580): 设置 stdout 到 line 缓冲输出
* [#2571](https://github.com/xmake-io/xmake/issues/2571): 改进分布式编译的调度算法，增加 cpu/memory 状态权重
* [#2410](https://github.com/xmake-io/xmake/issues/2410): 改进 cmakelists 生成
* [#2690](https://github.com/xmake-io/xmake/issues/2690): 改机传递 toolchains 到包
* [#2686](https://github.com/xmake-io/xmake/issues/2686): 改进 armcc/armclang 支持增量编译
* [#2562](https://github.com/xmake-io/xmake/issues/2562): 改进 rc.exe 对引用文件依赖的解析和增量编译支持
* 改进默认的并行构建任务数

### Bugs 修复

* [#2614](https://github.com/xmake-io/xmake/issues/2614): 为 msvc 修复构建 submodules2 测试工程
* [#2620](https://github.com/xmake-io/xmake/issues/2620): 修复构建缓存导致的增量编译问题
* [#2177](https://github.com/xmake-io/xmake/issues/2177): 修复 python.library 在 macOS 上段错误崩溃
* [#2708](https://github.com/xmake-io/xmake/issues/2708): 修复 mode.coverage 规则的链接错误
* 修复 ios/macOS framework 和 application 的 rpath 加载路径

