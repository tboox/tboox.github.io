---
layout: post.cn
title:  "xmake新增智能代码扫描编译模式，无需手写任何make文件"
tags: xmake lua makefile
categories: xmake
---

最近给[xmake](https://xmake.io/cn)增加了一个新特性，对于一份工程源码，可以不用编写makefile，也不用编写各种make相关的工程描述文件（例如：xmake.lua，makefile.am, cmakelist.txt等）

xmake就可以直接编译他们，这是如何做到的呢，简单来说下实现原理：

1. 首先扫描当前目录下，xmake所以支持的所有源代码文件
2. 分析代码，检测哪些代码拥有main入口函数
3. 所有没有main入口的代码编译成静态库
4. 带有main入口的代码，编译成可执行程序，同时链接其他静态库程序

这种代码扫描和智能编译，非常简单，目前xmake还不支持多级目录扫描，只对单级目录的代码进行扫描编译。。

#### 开源代码的移植和编译

虽然这种方式，并不是非常智能，限制也不少，但是对于想临时写些代码进行编译运行，或者临时想交叉编译一些简单的开源库代码

这种方式已经足够使用了，下面看下一个实际的例子：

我下载了一份zlib-1.2.10的源码，想要编译它，只需要进入zlib的源码目录执行：

```bash
$ cd zlib-1.2.10
$ xmake
```

就行了，输出结果如下：






```
xmake.lua not found, scanning files ..
target(zlib-1.2): static
    [+]: ./adler32.c
    [+]: ./compress.c
    [+]: ./crc32.c
    [+]: ./deflate.c
    [+]: ./gzclose.c
    [+]: ./gzlib.c
    [+]: ./gzread.c
    [+]: ./gzwrite.c
    [+]: ./infback.c
    [+]: ./inffast.c
    [+]: ./inflate.c
    [+]: ./inftrees.c
    [+]: ./trees.c
    [+]: ./uncompr.c
    [+]: ./zutil.c
xmake.lua generated, scan ok!👌
checking for the architecture ... x86_64
checking for the Xcode SDK version for macosx ... 10.12
checking for the target minimal version ... 10.12
checking for the c compiler (cc) ... xcrun -sdk macosx clang
checking for the c++ compiler (cxx) ... xcrun -sdk macosx clang
checking for the objc compiler (mm) ... xcrun -sdk macosx clang
checking for the objc++ compiler (mxx) ... xcrun -sdk macosx clang++
checking for the swift compiler (sc) ... xcrun -sdk macosx swiftc
checking for the assember (as) ... xcrun -sdk macosx clang
checking for the linker (ld) ... xcrun -sdk macosx clang++
checking for the static library archiver (ar) ... xcrun -sdk macosx ar
checking for the static library extractor (ex) ... xcrun -sdk macosx ar
checking for the shared library linker (sh) ... xcrun -sdk macosx clang++
checking for the debugger (dd) ... xcrun -sdk macosx lldb
checking for the golang compiler (go) ... go
configure
{
    ex = "xcrun -sdk macosx ar"
,   sh = "xcrun -sdk macosx clang++"
,   host = "macosx"
,   ar = "xcrun -sdk macosx ar"
,   buildir = "build"
,   as = "xcrun -sdk macosx clang"
,   plat = "macosx"
,   xcode_dir = "/Applications/Xcode.app"
,   arch = "x86_64"
,   mxx = "xcrun -sdk macosx clang++"
,   go = "go"
,   target_minver = "10.12"
,   ccache = "ccache"
,   mode = "release"
,   clean = true
,   cxx = "xcrun -sdk macosx clang"
,   cc = "xcrun -sdk macosx clang"
,   dd = "xcrun -sdk macosx lldb"
,   kind = "static"
,   ld = "xcrun -sdk macosx clang++"
,   xcode_sdkver = "10.12"
,   sc = "xcrun -sdk macosx swiftc"
,   mm = "xcrun -sdk macosx clang"
}
configure ok!
clean ok!
[00%]: ccache compiling.release ./adler32.c
[06%]: ccache compiling.release ./compress.c
[13%]: ccache compiling.release ./crc32.c
[20%]: ccache compiling.release ./deflate.c
[26%]: ccache compiling.release ./gzclose.c
[33%]: ccache compiling.release ./gzlib.c
[40%]: ccache compiling.release ./gzread.c
[46%]: ccache compiling.release ./gzwrite.c
[53%]: ccache compiling.release ./infback.c
[60%]: ccache compiling.release ./inffast.c
[66%]: ccache compiling.release ./inflate.c
[73%]: ccache compiling.release ./inftrees.c
[80%]: ccache compiling.release ./trees.c
[86%]: ccache compiling.release ./uncompr.c
[93%]: ccache compiling.release ./zutil.c
[100%]: archiving.release libzlib-1.2.a
build ok!👌
```

通过输出结果，可以看到，xmake会去检测扫描当前目录下的所有.c代码，发现没有main入口，应该是静态库程序，因此执行xmake后，就直接编译成静态库libzlib-1.2.a了

连xmake.lua都没有编写，其实xmake在扫描完成后，会去自动在当前目录下生成一份xmake.lua，下次编译就不需要重新扫描检测了。

自动生成的xmake.lua内容如下：

```lua
-- define target
target("zlib-1.2")

    -- set kind
    set_kind("static")

    -- add files
    add_files("./adler32.c")
    add_files("./compress.c")
    add_files("./crc32.c")
    add_files("./deflate.c")
    add_files("./gzclose.c")
    add_files("./gzlib.c")
    add_files("./gzread.c")
    add_files("./gzwrite.c")
    add_files("./infback.c")
    add_files("./inffast.c")
    add_files("./inflate.c")
    add_files("./inftrees.c")
    add_files("./trees.c")
    add_files("./uncompr.c")
    add_files("./zutil.c")
```

也许你会说，像这种开源库，直接`configure; make`不就好了吗，他们自己也有提供makefile来直接编译的，的确是这样，我这里只是举个例子而已。。

当然，很多开源库在交叉编译的时候，通过自带的`configure`，处理起来还是很繁琐的，用xmake进行交叉编译会更方便些。。

#### 即时地代码编写和编译运行 

xmake的这个扫描代码编译特性，主要的目的：还是为了让我们在临时想写些测试代码的时候，不用考虑太多东西，直接上手敲代码，然后快速执行`xmake run` 来调试验证结果。。

例如：

我想写了个简单的main.c的测试程序，打印`hello world!`，如果要写makefile或者直接通过gcc命令来，就很繁琐了，你需要：

```bash
gcc ./main.c -o demo
./demo
```

最快速的方式，也需要执行两行命令，而如果用xmake，只需要执行：

```bash
xmake run
```

就行了，它会自动检测到代码后，自动生成对应的xmake.lua，自动编译，自动运行，然后输出：

```
hello world!
```

如果你有十几个代码文件，用手敲gcc的方式，或者写makefile的方式，这个差距就更明显了，用xmake还是只需要一行命令：

```bash
xmake run
```

#### 多语言支持

这种代码检测和即时编译，是支持多语言的，不仅支持c/c++，还支持objc/swift，后期还会支持golang（正在开发中）

例如我下载了一份fmdb的ios开源框架代码：

```
.
├── FMDB.h
├── FMDatabase.h
├── FMDatabase.m
├── FMDatabaseAdditions.h
├── FMDatabaseAdditions.m
├── FMDatabasePool.h
├── FMDatabasePool.m
├── FMDatabaseQueue.h
├── FMDatabaseQueue.m
├── FMResultSet.h
└── FMResultSet.m
```

想要把它编译成ios的静态库，但是又不想写xmake.lua，或者makefile，那么只需要使用xmake的这个新特性，直接执行：

```bash
$ xmake f -p iphoneos; xmake
```

就行了，输出结果如下：

```
xmake.lua not found, scanning files ..
target(FMDB): static
    [+]: ./FMDatabase.m
    [+]: ./FMDatabaseAdditions.m
    [+]: ./FMDatabasePool.m
    [+]: ./FMDatabaseQueue.m
    [+]: ./FMResultSet.m
xmake.lua generated, scan ok!👌
checking for the architecture ... armv7
checking for the Xcode SDK version for iphoneos ... 10.1
checking for the target minimal version ... 10.1
checking for the c compiler (cc) ... xcrun -sdk iphoneos clang
checking for the c++ compiler (cxx) ... xcrun -sdk iphoneos clang
checking for the objc compiler (mm) ... xcrun -sdk iphoneos clang
checking for the objc++ compiler (mxx) ... xcrun -sdk iphoneos clang++
checking for the assember (as) ... gas-preprocessor.pl xcrun -sdk iphoneos clang
checking for the linker (ld) ... xcrun -sdk iphoneos clang++
checking for the static library archiver (ar) ... xcrun -sdk iphoneos ar
checking for the static library extractor (ex) ... xcrun -sdk iphoneos ar
checking for the shared library linker (sh) ... xcrun -sdk iphoneos clang++
checking for the swift compiler (sc) ... xcrun -sdk iphoneos swiftc
configure
{
    ex = "xcrun -sdk iphoneos ar"
,   ccache = "ccache"
,   host = "macosx"
,   ar = "xcrun -sdk iphoneos ar"
,   buildir = "build"
,   as = "/usr/local/share/xmake/tools/utils/gas-preprocessor.pl xcrun -sdk iphoneos clang"
,   arch = "armv7"
,   mxx = "xcrun -sdk iphoneos clang++"
,   cxx = "xcrun -sdk iphoneos clang"
,   target_minver = "10.1"
,   xcode_dir = "/Applications/Xcode.app"
,   clean = true
,   sh = "xcrun -sdk iphoneos clang++"
,   cc = "xcrun -sdk iphoneos clang"
,   ld = "xcrun -sdk iphoneos clang++"
,   mode = "release"
,   kind = "static"
,   plat = "iphoneos"
,   xcode_sdkver = "10.1"
,   sc = "xcrun -sdk iphoneos swiftc"
,   mm = "xcrun -sdk iphoneos clang"
}
configure ok!
clean ok!
[00%]: ccache compiling.release ./FMDatabase.m
[20%]: ccache compiling.release ./FMDatabaseAdditions.m
[40%]: ccache compiling.release ./FMDatabasePool.m
[60%]: ccache compiling.release ./FMDatabaseQueue.m
[80%]: ccache compiling.release ./FMResultSet.m
[100%]: archiving.release libFMDB.a
build ok!👌
```

#### 同时编译多个可执行文件

输出结果的开头部分，就是对代码的分析结果，虽然目前只支持单级目录结构的代码扫描，但是还是可以同时支持检测和编译多个可执行文件的

我们以libjpeg的开源库为例：

我们进入jpeg-6b目录后，执行：

```bash
$ xmake
```

输出如下：

```
xmake.lua not found, scanning files ..
target(jpeg-6b): static
    [+]: ./cdjpeg.c
    [+]: ./example.c
    [+]: ./jcapimin.c
    [+]: ./jcapistd.c
    [+]: ./jccoefct.c
    [+]: ./jccolor.c
    [+]: ./jcdctmgr.c
    [+]: ./jchuff.c
    [+]: ./jcinit.c
    [+]: ./jcmainct.c
    [+]: ./jcmarker.c
    [+]: ./jcmaster.c
    [+]: ./jcomapi.c
    [+]: ./jcparam.c
    [+]: ./jcphuff.c
    [+]: ./jcprepct.c
    [+]: ./jcsample.c
    [+]: ./jctrans.c
    [+]: ./jdapimin.c
    [+]: ./jdapistd.c
    [+]: ./jdatadst.c
    [+]: ./jdatasrc.c
    [+]: ./jdcoefct.c
    [+]: ./jdcolor.c
    [+]: ./jddctmgr.c
    [+]: ./jdhuff.c
    [+]: ./jdinput.c
    [+]: ./jdmainct.c
    [+]: ./jdmarker.c
    [+]: ./jdmaster.c
    [+]: ./jdmerge.c
    [+]: ./jdphuff.c
    [+]: ./jdpostct.c
    [+]: ./jdsample.c
    [+]: ./jdtrans.c
    [+]: ./jerror.c
    [+]: ./jfdctflt.c
    [+]: ./jfdctfst.c
    [+]: ./jfdctint.c
    [+]: ./jidctflt.c
    [+]: ./jidctfst.c
    [+]: ./jidctint.c
    [+]: ./jidctred.c
    [+]: ./jmemansi.c
    [+]: ./jmemmgr.c
    [+]: ./jmemname.c
    [+]: ./jmemnobs.c
    [+]: ./jquant1.c
    [+]: ./jquant2.c
    [+]: ./jutils.c
    [+]: ./rdbmp.c
    [+]: ./rdcolmap.c
    [+]: ./rdgif.c
    [+]: ./rdppm.c
    [+]: ./rdrle.c
    [+]: ./rdswitch.c
    [+]: ./rdtarga.c
    [+]: ./transupp.c
    [+]: ./wrbmp.c
    [+]: ./wrgif.c
    [+]: ./wrppm.c
    [+]: ./wrrle.c
    [+]: ./wrtarga.c
target(ansi2knr): binary
    [+]: ./ansi2knr.c
target(cjpeg): binary
    [+]: ./cjpeg.c
target(ckconfig): binary
    [+]: ./ckconfig.c
target(djpeg): binary
    [+]: ./djpeg.c
target(jpegtran): binary
    [+]: ./jpegtran.c
target(rdjpgcom): binary
    [+]: ./rdjpgcom.c
target(wrjpgcom): binary
    [+]: ./wrjpgcom.c
xmake.lua generated, scan ok!👌
checking for the architecture ... x86_64
checking for the Xcode SDK version for macosx ... 10.12
checking for the target minimal version ... 10.12
checking for the c compiler (cc) ... xcrun -sdk macosx clang
checking for the c++ compiler (cxx) ... xcrun -sdk macosx clang
checking for the objc compiler (mm) ... xcrun -sdk macosx clang
checking for the objc++ compiler (mxx) ... xcrun -sdk macosx clang++
checking for the swift compiler (sc) ... xcrun -sdk macosx swiftc
checking for the assember (as) ... xcrun -sdk macosx clang
checking for the linker (ld) ... xcrun -sdk macosx clang++
checking for the static library archiver (ar) ... xcrun -sdk macosx ar
checking for the static library extractor (ex) ... xcrun -sdk macosx ar
checking for the shared library linker (sh) ... xcrun -sdk macosx clang++
checking for the debugger (dd) ... xcrun -sdk macosx lldb
checking for the golang compiler (go) ... go
configure
{
    ex = "xcrun -sdk macosx ar"
,   sh = "xcrun -sdk macosx clang++"
,   host = "macosx"
,   ar = "xcrun -sdk macosx ar"
,   buildir = "build"
,   as = "xcrun -sdk macosx clang"
,   plat = "macosx"
,   xcode_dir = "/Applications/Xcode.app"
,   arch = "x86_64"
,   mxx = "xcrun -sdk macosx clang++"
,   go = "go"
,   target_minver = "10.12"
,   ccache = "ccache"
,   mode = "release"
,   clean = true
,   cxx = "xcrun -sdk macosx clang"
,   cc = "xcrun -sdk macosx clang"
,   dd = "xcrun -sdk macosx lldb"
,   kind = "static"
,   ld = "xcrun -sdk macosx clang++"
,   xcode_sdkver = "10.12"
,   sc = "xcrun -sdk macosx swiftc"
,   mm = "xcrun -sdk macosx clang"
}
configure ok!
clean ok!
[00%]: ccache compiling.release ./cdjpeg.c
[00%]: ccache compiling.release ./example.c
[00%]: ccache compiling.release ./jcapimin.c
[00%]: ccache compiling.release ./jcapistd.c
[00%]: ccache compiling.release ./jccoefct.c
[00%]: ccache compiling.release ./jccolor.c
[01%]: ccache compiling.release ./jcdctmgr.c
[01%]: ccache compiling.release ./jchuff.c
[01%]: ccache compiling.release ./jcinit.c
[01%]: ccache compiling.release ./jcmainct.c
[01%]: ccache compiling.release ./jcmarker.c
[02%]: ccache compiling.release ./jcmaster.c
[02%]: ccache compiling.release ./jcomapi.c
[02%]: ccache compiling.release ./jcparam.c
[02%]: ccache compiling.release ./jcphuff.c
[02%]: ccache compiling.release ./jcprepct.c
[03%]: ccache compiling.release ./jcsample.c
[03%]: ccache compiling.release ./jctrans.c
[03%]: ccache compiling.release ./jdapimin.c
[03%]: ccache compiling.release ./jdapistd.c
[03%]: ccache compiling.release ./jdatadst.c
[04%]: ccache compiling.release ./jdatasrc.c
[04%]: ccache compiling.release ./jdcoefct.c
[04%]: ccache compiling.release ./jdcolor.c
[04%]: ccache compiling.release ./jddctmgr.c
[04%]: ccache compiling.release ./jdhuff.c
[05%]: ccache compiling.release ./jdinput.c
[05%]: ccache compiling.release ./jdmainct.c
[05%]: ccache compiling.release ./jdmarker.c
[05%]: ccache compiling.release ./jdmaster.c
[05%]: ccache compiling.release ./jdmerge.c
[06%]: ccache compiling.release ./jdphuff.c
[06%]: ccache compiling.release ./jdpostct.c
[06%]: ccache compiling.release ./jdsample.c
[06%]: ccache compiling.release ./jdtrans.c
[06%]: ccache compiling.release ./jerror.c
[07%]: ccache compiling.release ./jfdctflt.c
[07%]: ccache compiling.release ./jfdctfst.c
[07%]: ccache compiling.release ./jfdctint.c
[07%]: ccache compiling.release ./jidctflt.c
[07%]: ccache compiling.release ./jidctfst.c
[08%]: ccache compiling.release ./jidctint.c
[08%]: ccache compiling.release ./jidctred.c
[08%]: ccache compiling.release ./jmemansi.c
[08%]: ccache compiling.release ./jmemmgr.c
[08%]: ccache compiling.release ./jmemname.c
[09%]: ccache compiling.release ./jmemnobs.c
[09%]: ccache compiling.release ./jquant1.c
[09%]: ccache compiling.release ./jquant2.c
[09%]: ccache compiling.release ./jutils.c
[09%]: ccache compiling.release ./rdbmp.c
[10%]: ccache compiling.release ./rdcolmap.c
[10%]: ccache compiling.release ./rdgif.c
[10%]: ccache compiling.release ./rdppm.c
[10%]: ccache compiling.release ./rdrle.c
[10%]: ccache compiling.release ./rdswitch.c
[11%]: ccache compiling.release ./rdtarga.c
[11%]: ccache compiling.release ./transupp.c
[11%]: ccache compiling.release ./wrbmp.c
[11%]: ccache compiling.release ./wrgif.c
[11%]: ccache compiling.release ./wrppm.c
[12%]: ccache compiling.release ./wrrle.c
[12%]: ccache compiling.release ./wrtarga.c
[12%]: archiving.release libjpeg-6b.a
[12%]: ccache compiling.release ./wrjpgcom.c
[25%]: linking.release wrjpgcom
[25%]: ccache compiling.release ./ansi2knr.c
[37%]: linking.release ansi2knr
[37%]: ccache compiling.release ./jpegtran.c
[50%]: linking.release jpegtran
[50%]: ccache compiling.release ./djpeg.c
[62%]: linking.release djpeg
[62%]: ccache compiling.release ./ckconfig.c
[75%]: linking.release ckconfig
[75%]: ccache compiling.release ./rdjpgcom.c
[87%]: linking.release rdjpgcom
[87%]: ccache compiling.release ./cjpeg.c
[100%]: linking.release cjpeg
build ok!👌
```

可以看到，处理静态库，xmake还分析出了很多可执行的测试程序，剩下的代码统一编译成一个 libjpeg.a 的静态库，供哪些测试程序链接使用。。

```
target(ansi2knr): binary
    [+]: ./ansi2knr.c
target(cjpeg): binary
    [+]: ./cjpeg.c
target(ckconfig): binary
    [+]: ./ckconfig.c
target(djpeg): binary
    [+]: ./djpeg.c
target(jpegtran): binary
    [+]: ./jpegtran.c
target(rdjpgcom): binary
    [+]: ./rdjpgcom.c
target(wrjpgcom): binary
    [+]: ./wrjpgcom.c
```

#### 遇到的一些问题和限制

当前xmake的这种自动分析检测还不是非常智能，对于：

1. 需要特殊的编译选项
2. 需要依赖其他目录的头文件搜索
3. 需要分条件编译不同源文件
4. 同目录需要生成多个静态库
5. 需要多级目录支持的源码库

以上这些情况，xmake暂时还没发自动化的智能处理，其中限制1，2还是可以解决的，通过半手动的方式，例如：

```bash
$ xmake f --cxflags="" --ldflags="" --includedirs="" --linkdirs=""; xmake
```

在自动检测编译的时候，手动配置这个源码工程需要的特殊编译选项，就可以直接通过编译了

而限制3，暂时只能通过删源代码来解决了，就像刚才编译jpeg的代码，其实它的目录下面同时存在了：

```
jmemdos.c
jmemmac.c
jmemansi.c
```

其中两个是没法编译过的，需要删掉后才行。。

