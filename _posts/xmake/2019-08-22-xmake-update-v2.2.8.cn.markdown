---
layout: post.cn
title:  "xmake v2.2.8 发布, 新版vs工程生成插件"
tags: xmake lua C/C++ 版本更新 VisualStudio
categories: xmake
---

这个版本提供了全新的vs工程生成插件（非常感谢@[OpportunityLiu](https://github.com/OpportunityLiu)的贡献），跟之前的生成vs的插件处理模式上有很大的不同，原先生成的vs工程是把所有源文件展开后，转交给vs来处理编译。

此外，我们重写了整个luajit的io runtime，使其更好的支持unicode字符集，尤其是windows上对中文字符的支持。

最后新版本开始尝试直接安装lua bitcode脚本，来减少安装包的大小（控制在2.4M以内），提高xmake启动加载的效率。

不过，需要注意的事，此版本的源码结构改成了git submodule来维护，所以老版本的`xmake update`无法完整支持对新版本的更新，请参考[安装文档](https://xmake.io/zh/guide/installation)进行完整安装。

* [项目源码](https://github.com/xmake-io/xmake)
* [官方文档](https://xmake.io/zh/)

## 新特性介绍

### 使用新版vsxmake集成编译

原先的vs生成插件对xmake的rules是没法支持的。因为xmake的rules里面用了很多的`on_build`此类自定义脚本，无法展开，所以像qt， wdk此类的项目就没法支持导出到vs里面进行编译了。

因此，为了解决这个问题，新版本的vs生成插件通过在vs下直接调用xmake命令，去执行编译操作，并且对intellsence和定义跳转，还有断点调试也做了支持。

具体使用方式跟老版本类似：

```bash
$ xmake project -k [vsxmake2010|vsxmake2013|vsxmake2015|..] -m "debug;release"
```

如果没指明版本，那么xmake会自动探测当前已有的vs版本来生成：

```bash
$ xmake project -k vsxmake -m "debug;release"
```

![](https://xmake.io/assets/img/manual/qt_vs.png)









另外，vsxmake插件还会额外生成一个自定义的配置属性页，用于在vs里面，方便灵活的修改和追加一些xmake编译配置，甚至可以在里面配置切换到其他交叉工具链，实现在vs中对android, linux等其他平台的交叉编译。

![](https://xmake.io/assets/img/manual/property_page_vsxmake.png)

顺便提下，这个vsxmake插件生成的工程，也是支持选择指定一批源文件来快速编译的。

### Unicode编码支持

原先的版本在某些windows环境下，并不能很好的处理unicode编码，显示的中文编译错误信息也可能出现乱码的情况，新版本中xmake多内置的luajit/io完全进行了重写，在win下对unicode编码提供更好的支持，哪怕是在xmake.lua或者源文件路径中存在emoji等字符都可以很好的处理。

```lua
target("程序")
    set_kind("binary")

    add_files("源文件🎆/*.c")
    add_includedirs("头文件✨")

    before_build(function()
        print("开始编译😊")
    end)

    after_build(function()
        print("结束编译🎉")
    end)
```

### Protobuf c/c++构建支持

[xmake-repo](https://github.com/xmake-io/xmake-repo)官方仓库新增了protobuf-c/cpp依赖包，用户可以很方便的在xmake.lua中集成使用protobuf了，配合内置的`protobuf.c`/`protobuf.cpp`构建规则，
我们可以在项目直接添加`*.proto`文件来开发基于protobuf的程序，例如：

#### 使用c库

```lua
add_requires("protobuf-c")

target("console_c")
    set_kind("binary")
    add_packages("protobuf-c")

    add_files("src/*.c")
    add_files("src/*.proto", {rules = "protobuf.c"})
```

#### 使用c++库

```lua
add_requires("protobuf-cpp")

target("console_c++")
    set_kind("binary")
    set_languages("c++11")

    add_packages("protobuf-cpp")

    add_files("src/*.cpp")
    add_files("src/*.proto", {rules = "protobuf.cpp"})
```

### Termux/Android支持

新版本xmake对android/termux进行了很好的支持，使用户可以随时随地在android手机上进行编码和编译，配合vim效果非常好。

![](https://user-images.githubusercontent.com/151335/62007118-5fa1a180-b17c-11e9-821c-9a6d8d00a23b.jpeg)

## 更新内容

### 新特性

* 添加protobuf c/c++构建规则
* [#468](https://github.com/xmake-io/xmake/pull/468): 添加对 Windows 的 UTF-8 支持
* [#472](https://github.com/xmake-io/xmake/pull/472): 添加`xmake project -k vsxmake`去更好的支持vs工程的生成，内部直接调用xmake来编译
* [#487](https://github.com/xmake-io/xmake/issues/487): 通过`xmake --files="src/*.c"`支持指定一批文件进行编译。
* 针对io模块增加文件锁接口
* [#513](https://github.com/xmake-io/xmake/issues/513): 增加对android/termux终端的支持，可在android设备上执行xmake来构建项目
* [#517](https://github.com/xmake-io/xmake/issues/517): 为target增加`add_cleanfiles`接口，实现快速定制化清理文件
* [#537](https://github.com/xmake-io/xmake/pull/537): 添加`set_runenv`接口去覆盖写入系统envs

### 改进

* [#257](https://github.com/xmake-io/xmake/issues/257): 锁定当前正在构建的工程，避免其他xmake进程同时对其操作
* 尝试采用/dev/shm作为os.tmpdir去改善构建过程中临时文件的读写效率
* [#542](https://github.com/xmake-io/xmake/pull/542): 改进vs系列工具链的unicode输出问题
* 对于安装的lua脚本，启用lua字节码存储，减少安装包大小（<2.4M），提高运行加载效率。

### Bugs修复

* [#549](https://github.com/xmake-io/xmake/issues/549): 修复新版vs2019下检测环境会卡死的问题

