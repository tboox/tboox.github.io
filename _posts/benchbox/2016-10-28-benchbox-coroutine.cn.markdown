---
layout: post.cn
title:  "benchbox新增协程库性能基准测试"
tags: benchbox tbox 协程 上下文切换 channel
categories: benchbox
---

## 简介

[Benchbox](https://github.com/waruqi/benchbox)是一个基准测试包，基于[tbox](https://github.com/waruqi/tbox)和[xmake](http://xmake.io)，里面包含许多针对第三方库功能的性能基准测试和对比，可以很方便的扩展测试用例和模块。

目前内置：各大开源协程库性能基准测试，后续还会陆续增加各种开源库模块的分析测试

测试报告仅供参考，测试代码或者结果上如有问题，可以提交issues

## 编译

请先安装: [xmake](http://xmake.io)

然后运行：

```bash
    $ xmake
```

## 协程切换测试报告

#### Run

```bash
$ xmake coroutine -n switch
```

#### Macosx (x86_64)

```
tbox:               10000000 switches in 205 ms, 48780487 switches per second
boost:              10000000 switches in 728 ms, 13736263 switches per second
libmill:            10000000 switches in 525 ms, 19047619 switches per second
libtask:            10000000 switches in 1602 ms, 6242197 switches per second
golang:             10000000 switches in 1558 ms, 6418485 switches per second
```






#### ArchLinux (i386) + VirtualBox 

```
tbox:               10000000 switches in 258 ms, 38759689 switches per second
boost:              10000000 switches in 875 ms, 11428571 switches per second
libmill:            10000000 switches in 1232 ms, 8116883 switches per second
libtask:            10000000 switches in 8652 ms, 1155802 switches per second
libgo(boost):       10000000 switches in 2716 ms, 3681885 switches per second
libco:              10000000 switches in 1402 ms, 7132667 switches per second
coroutine(cloudwu): 10000000 switches in 8613 ms, 1161035 switches per second
libfiber(acl):      10000000 switches in 1493 ms, 6697923 switches per second
golang:             10000000 switches in 2250 ms, 4444444 switches per second
```

#### LinuxMint (x86_64) + VirtaulBox

```
tbox:               10000000 switches in 412 ms, 24271844 switches per second
boost:              10000000 switches in 425 ms, 23529411 switches per second
libmill:            10000000 switches in 458 ms, 21834061 switches per second
libtask:            10000000 switches in 9523 ms, 1050089 switches per second
libgo(boost):       10000000 switches in 2213 ms, 4518752 switches per second
libco:              10000000 switches in 1401 ms, 7137758 switches per second
coroutine(cloudwu): 10000000 switches in 9219 ms, 1084716 switches per second
libfiber(acl):      10000000 switches in 709 ms, 14104372 switches per second
golang:             10000000 switches in 2434 ms, 4108463 switches per second
```

## 协程channel测试报告（无buffer）

#### Run

```bash
$ xmake coroutine -n channel
```

#### Macosx (x86_64)

```
tbox:               10000000 passes in 916 ms, 10917030 passes per second
libmill:            10000000 passes in 3460 ms, 2890173 passes per second
libtask:            10000000 passes in 3646 ms, 2742731 passes per second
golang:             10000000 passes in 3180 ms, 3144654 passes per second
```

#### ArchLinux (i386) + VirtualBox 

```
tbox:               10000000 passes in 2137 ms, 4679457 passes per second
libmill:            10000000 passes in 7859 ms, 1272426 passes per second
libtask:            10000000 passes in 18693 ms, 534959 passes per second
libgo(boost):       10000000 passes in 20063 ms, 498429 passes per second
libfiber(acl):      10000000 passes in 9496 ms, 1053074 passes per second
golang:             10000000 passes in 8781 ms, 1138822 passes per second
```

#### LinuxMint (x86_64) + VirtaulBox

```
tbox:               10000000 passes in 1702 ms, 5875440 passes per second
libmill:            10000000 passes in 2298 ms, 4351610 passes per second
libtask:            10000000 passes in 12894 ms, 775554 passes per second
libgo(boost):       10000000 passes in 11391 ms, 877886 passes per second
libfiber(acl):      10000000 passes in 4452 ms, 2246181 passes per second
golang:             10000000 passes in 5343 ms, 1871607 passes per second
```


## 协程channel测试报告（buffer大小：10000）


#### Run 

```bash
$ xmake coroutine -n channel 10000
```

#### Macosx (x86_64)

```
tbox:               10000000 passes in 404 ms, 24752475 passes per second
libmill:            10000000 passes in 4401 ms, 2272210 passes per second
libtask:            10000000 passes in 2785 ms, 3590664 passes per second
golang:             10000000 passes in 1135 ms, 8810572 passes per second
```

#### ArchLinux (i386) + VirtualBox 

```
tbox:               10000000 passes in 212 ms, 47169811 passes per second
libmill:            10000000 passes in 3272 ms, 3056234 passes per second
libtask:            10000000 passes in 1624 ms, 6157635 passes per second
libgo(boost):       10000000 passes in 1720 ms, 5813953 passes per second
libfiber(acl):      10000000 passes in 1779 ms, 5621135 passes per second
golang:             10000000 passes in 768 ms, 13020833 passes per second
```

#### LinuxMint (x86_64) + VirtaulBox

```
tbox:               10000000 passes in 293 ms, 34129692 passes per second
libmill:            10000000 passes in 1135 ms, 8810572 passes per second
libtask:            10000000 passes in 1528 ms, 6544502 passes per second
libgo(boost):       10000000 passes in 1362 ms, 7342143 passes per second
libfiber(acl):      10000000 passes in 1510 ms, 6622516 passes per second
golang:             10000000 passes in 782 ms, 12787723 passes per second
```
