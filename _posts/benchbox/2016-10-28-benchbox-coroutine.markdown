---
layout: post
title:  "The benchmark reports of coroutine"
tags: benchbox tbox coroutine context switch channel
categories: benchbox
---

## Introduction

Benchbox is a benchmark testing utilities based on [xmake](http://xmake.io) and [tbox](https://github.com/waruqi/tbox).

## Build

Please install xmake first: [xmake](http://xmake.io)

```bash
    $ xmake
```


## The Coroutine Switch Reports (2 Coroutines)

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
tbox:                   10000000 switches in 154 ms, 64935064 switches per second
boost:                  10000000 switches in 485 ms, 20618556 switches per second
libmill:                10000000 switches in 689 ms, 14513788 switches per second
libtask:                10000000 switches in 4798 ms, 2084201 switches per second
libgo(boost):           10000000 switches in 1418 ms, 7052186 switches per second
libco:                  10000000 switches in 774 ms, 12919896 switches per second
coroutine(cloudwu):     10000000 switches in 4983 ms, 2006823 switches per second
libfiber(acl):          10000000 switches in 863 ms, 11587485 switches per second
golang:                 10000000 switches in 1239 ms, 8071025 switches per second
```

#### LinuxMint (x86_64) + VirtaulBox

```
tbox:                   10000000 switches in 187 ms, 53475935 switches per second
boost:                  10000000 switches in 199 ms, 50251256 switches per second
libmill:                10000000 switches in 145 ms, 68965517 switches per second
libtask:                10000000 switches in 5280 ms, 1893939 switches per second
libgo(boost):           10000000 switches in 1086 ms, 9208103 switches per second
libco:                  10000000 switches in 687 ms, 14556040 switches per second
coroutine(cloudwu):     10000000 switches in 5181 ms, 1930129 switches per second
libfiber(acl):          10000000 switches in 342 ms, 29239766 switches per second
golang:                 10000000 switches in 1200 ms, 8333333 switches per second
```

## The Coroutine Switch Reports (1000 Coroutines)

#### Run

```bash
$ xmake coroutine -n switch 1000
```

#### Macosx (x86_64)

```
tbox:               10000000 switches in 438 ms, 22831050 switches per second
boost:              10000000 switches in 1949 ms, 5130836 switches per second
libmill:            10000000 switches in 1405 ms, 7117437 switches per second
libtask:            10000000 switches in 2272 ms, 4401408 switches per second
golang:             10000000 switches in 1512 ms, 6613756 switches per second
```

#### ArchLinux (i386) + VirtualBox 

```
tbox:               10000000 switches in 295 ms, 33898305 switches per second
boost:              10000000 switches in 1021 ms, 9794319 switches per second
libmill:            10000000 switches in 2031 ms, 4923682 switches per second
libtask:            10000000 switches in 6369 ms, 1570105 switches per second
libgo(boost):       10000000 switches in 1853 ms, 5396654 switches per second
libco:              10000000 switches in 3328 ms, 3004807 switches per second
coroutine(cloudwu): 10000000 switches in 5082 ms, 1967729 switches per second
libfiber(acl):      10000000 switches in 1448 ms, 6906077 switches per second
golang:             10000000 switches in 1747 ms, 5724098 switches per second
```

#### LinuxMint (x86_64) + VirtaulBox

```
tbox:               10000000 switches in 400 ms, 25000000 switches per second
boost:              10000000 switches in 894 ms, 11185682 switches per second
libmill:            10000000 switches in 1014 ms, 9861932 switches per second
libtask:            10000000 switches in 6936 ms, 1441753 switches per second
libgo(boost):       10000000 switches in 1768 ms, 5656108 switches per second
libco:              10000000 switches in 2288 ms, 4370629 switches per second
coroutine(cloudwu): 10000000 switches in 5468 ms, 1828822 switches per second
libfiber(acl):      10000000 switches in 958 ms, 10438413 switches per second
golang:             10000000 switches in 1985 ms, 5037783 switches per second
```

## The Coroutine Channel Reports (no buffer)

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

## The Coroutine Channel Reports (buffer: 10000)


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
