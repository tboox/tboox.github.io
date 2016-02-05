---
layout: page.cn
title: 文档
comments: true
permalink: /documents/
---

* content
{:toc}

## TBOX

* [在线文档](https://github.com/waruqi/tbox/wiki/%E7%9B%AE%E5%BD%95)

### 编译

一般情况下，编译只需要执行：

    cd ./tbox
    xmake 
	
如果要编译ios版本：

    cd ./tbox
    xmake f -p iphoneos 
    xmake
    
编译android需要指定ndk路径：

    cd ./tbox
    xmake f -p android --ndk=xxxxx
    xmake

使用xmake编译完tbox后，可以执行下面的命令，对tbox进行打包：

    # 打包输出到默认目录：tbox/build
    xmake p

    # 打包输出到指定目录
    xmake p -o outdir

更加详细的编译过程，请参考：

* [xmake的安装和使用](https://github.com/waruqi/xmake/wiki/%E7%9B%AE%E5%BD%95)
* [使用xmake进行编译](https://github.com/waruqi/xmake/wiki/%E7%BC%96%E8%AF%91%E5%B7%A5%E7%A8%8B)

## XMake

* [在线文档](https://github.com/waruqi/xmake/wiki/%E7%9B%AE%E5%BD%95)

### Windows

1. 下载xmake源码
2. 进入xmake目录
3. 双击运行install.bat 
4. 默认回车安装到c盘，也可指定安装目录（注：在win7以上的平台，可能会提示需要管理员权限，点击允许就行了）
5. windows下安装可能会比较慢，请耐心等待5分钟。。

### Linux

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

### Macosx

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

### Homebrew

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    sudo brew install xmake

### Linuxbrew

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/linuxbrew/go/install)"
    sudo brew install xmake

