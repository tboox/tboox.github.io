---
layout: page
title: Documents
comments: true
permalink: /documents/
---

* content
{:toc}

## TBOX

* [More Documents](https://github.com/waruqi/tbox/wiki/documents)

### Build
please install xmake first: [xmake](https://github.com/waruqi/xmake)

	// build for the host platform
    cd ./tbox
    xmake

	// build for the iphoneos platform
    cd ./tbox
    xmake f -p iphoneos 
    xmake
    
	// build for the android platform
    cd ./tbox
    xmake f -p android --ndk=xxxxx
    xmake

## XMake

* [More Documents](https://github.com/waruqi/xmake/wiki/documents)

### Install

#### Windows

1. download xmake source codes
2. enter the xmake directory
3. run install.bat 
4. select the install directory and enter
5. please wait some mintues

#### Linux

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

#### Macosx

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

#### Homebrew

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    sudo brew install xmake

#### Linuxbrew

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/linuxbrew/go/install)"
    sudo brew install xmake
