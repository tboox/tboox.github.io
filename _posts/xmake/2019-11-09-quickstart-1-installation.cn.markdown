---
layout: post.cn
title:  "xmake从入门到精通1：安装和更新"
tags: xmake lua 安装 更新
categories: xmake
---

xmake是一个基于Lua的轻量级现代化c/c++的项目构建工具，主要特点是：语法简单易上手，提供更加可读的项目维护，实现跨平台行为一致的构建体验。

本文主要详细讲解xmake在各个平台下的安装过程。

* [项目源码](https://github.com/xmake-io/xmake)
* [官方文档](https://xmake.io/#/zh-cn/)

## 安装Master版本

通常情况下我们只需要通过一键安装脚本即可完成安装。

### 使用curl

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh)
```

### 使用wget

```bash
bash <(wget https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh -O -)
```

### 使用powershell

```bash
Invoke-Expression (Invoke-Webrequest 'https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.ps1' -UseBasicParsing).Content
```

注：如果ps脚本执行提示失败，可以尝试在管理员模式下执行







## 安装Windows版本

### 使用安装包

windows下提供了预制的nsis安装包，我们可直接从github的Releases下载页面下载后，运行安装包即可。

1. 从 [Releases](https://github.com/xmake-io/xmake/releases) 上下载windows安装包
2. 运行安装程序 xmake-[version].exe

### 使用scoop

```bash
scoop install xmake
```

## MacOS

```bash
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew install xmake
```

或者：

1. 从 [Releases](https://github.com/xmake-io/xmake/releases) 上下载pkg安装包
2. 双击运行

或者安装master版本:

```bash
# 使用homebrew安装master版本
$ brew install xmake --HEAD

# 或者直接调用shell下载安装
$ bash <(curl -fsSL https://raw.githubusercontent.com/tboox/xmake/master/scripts/get.sh)
```

## Linux

在archlinux上安装：

```bash
$ yaourt xmake
```

或者下载deb包来安装：

1. 从 [Releases](https://github.com/xmake-io/xmake/releases) 上下载deb安装包
2. 运行: `dpkg -i xmake-xxxx.deb`

## Termux

最新版本的xmake已经很好地支持了termux，而我们也通常只需要执行上面的一键安装脚本即可，如果失败，可参考下文自己拉取源码编译安装。

## 源码编译安装

### 安装

注：切记，xmake不建议在root下安装，所以尽量不要在root下拉取源码编译安装！

```bash
$ git clone --recursive https://github.com/xmake-io/xmake.git
$ cd ./xmake
$ ./scripts/get.sh __local__
$ source ~/.xmake/profile
```

如果觉得github的源太慢，可以通过gitee的镜像源拉取：`clone --recursive https://gitee.com/tboox/xmake.git`

注：由于目前xmake源码通过git submodule维护依赖，所以clone的时候需要加上`--recursive`参数同时拉取所有submodules代码，请不要直接下载tar.gz源码，因为github不会自动打包submodules里面的代码。

如果git clone的时候忘记加`--recursive`，那么也可以执行`git submodule update --init`来拉取所有submodules，例如：

```bash
$ git clone https://github.com/xmake-io/xmake.git
$ cd ./xmake
$ git submodule update --init
$ ./scripts/get.sh __local__
```

注：`./get.sh __local__`是安装到`~/.local/xmake`下，然后通过`source ~/.xmake/profile`方式来加载的，所以安装完，当前终端如果执行xmake失败，提示找不到，就手动执行下 `source ~/.xmake/profile`，而下次打开终端就不需要了。

### 卸载

```bash
$ ./scripts/get.sh __uninstall__
```

### 仅仅更新安装lua脚本

这个开发者本地调试xmake源码才需要：

```bash
$ ./scripts/get.sh __local__ __install_only__
```

### root下安装

xmake不推荐root下安装使用，因为这很不安全，如果用户非要root下装，装完后，如果提示xmake运行不了，请根据提示传递`--root`参数，或者设置`XMAKE_ROOT=y`环境变量强行启用下，前提是：用户需要随时注意root下误操作系统文件文件的风险。

### 依赖问题

1. 如果遇到readline相关问题，请装下readline-devel或者libreadline-dev依赖，这个是可选的，仅仅`xmake lua`命令执行REPL时候才需要。
2. 如果想要提速编译，可以装下ccache，xmake会自动检测并使用，这也是可选的。

## 其他安装方式 

注：这种也是源码编译安装，但是安装路径会直接写入`/usr/`下，需要root权限，因此除非特殊情况，不推荐这种安装方式，建议采用上文提供的`./get.sh __local__`方式来安装，这两种安装方式的安装路径是不同的，不要混用。

通过make进行编译安装:

```bash
$ make build; sudo make install
```

安装到其他指定目录:

```bash
$ sudo make install prefix=/usr/local
```

卸载:

```bash
$ sudo make uninstall
```

## 更新升级

从v2.2.3版本开始，新增了`xmake update`命令，来快速进行自我更新和升级，默认是升级到最新版本，当然也可以指定升级或者回退到某个版本：

```bash
$ xmake update 2.2.4
```

我们也可以指定更新到master/dev分支版本：

```bash
$ xmake update master
$ xmake update dev
```

从指定git源更新

```bash
$ xmake update github:xmake-io/xmake#master
$ xmake update gitee:tboox/xmake#dev # gitee镜像
```

如果xmake/core没动过，仅仅更新xmake的lua脚本改动，可以加`-s/--scriptonly`快速更新lua脚本

```bash
$ xmake update -s dev
```

最后，我们如果要卸载xmake，也是支持的：`xmake update --uninstall`
