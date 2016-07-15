---
layout: post.cn
title:  "tbox的裁剪和定制化编译"
tags: tbox c 裁剪 编译 配置
categories: tbox
---

默认编译出来的tbox库，支持的功能比较全，带有所有模块，并且支持ssl（依赖polarssl/openssl）、gzip（依赖zlib）、database（依赖sqlite3/mysql）。

因此生成的库文件偏大，而且会依赖三个第三方库，如果你用不到上述三个模块，完全可以自己配置编译所需要的模块，减小生成库的大小。

新版采用xmake进行构建，裁剪模块已经是相当方便了，默认情况下回去自动检测依赖的第三方库进行编译。

如果要禁用某个第三方库或者模块，只要执行`xmake f --xxxx=false`就行了，所有第三方库依赖都是可选，完全可以禁用。。

例如，禁用所有第三方库支持：

    xmake f --polarssl=false --sqlite3=false --openssl=false --mysql=false --zlib=false

如果要最小化编译，可以禁用所有可选模块和特性：

    xmake f --network=false --asio=false --charset=false --xml=false --database=false --zip=false --thread=false

tbox中使用float相关的代码，也是可以裁剪掉的，并且tbox还提供了一整套fixed16、fixed30、fixed6的定点运算库，来应付一些需要float运算的地方



这个在图形算法上用的比较多，具体使用可以参考我的另外一个图形库项目：[gbox](https://github.com/waruqi/gbox)，具体的裁剪如下：

    xmake f --float=false

只要执行上面的配置，跟float相关的操作接口，都会禁用，非常适合一些低端的嵌入式设备上。

如果不想编译demo，节省时间，可以禁用demo模块：

    xmake f --demo=false

如果想要更小的话，就只能启用release模式了，编译发布版本，这样符号信息也被完全strip了：

    xmake f -m release

如果还想更小，可以修改xmake.lua，设置优化选项为最小化编译（当然，针对ios/android等移动端，tbox默认就是这么设置的）：

    set_optimize("smallest")

如果把这些配置全部禁用，按照上述模式编译出来的tbox库，会相当小，虽然小了不少，但是该有的基础功能还是都有的。

也可以根据自己的需要，启用部分模块和特性。

