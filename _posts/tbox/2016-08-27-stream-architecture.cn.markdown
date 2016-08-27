---
layout: post.cn
title:  "tbox stream流的架构介绍"
tags: tbox stream 流架构
categories: tbox
---

tbox主要有三种流：

1. **stream**: 最常用的流，一般用于单路阻塞、非阻塞io的处理，接口简单易用
2. **async_stream**：异步流，基于asio的流，全程回调处理，可以在单个线程里支持多路流的并发，节省系统资源，提高效率
3. **static_stream**：静态流，用于对纯buffer的位流处理，一般用于各种解析器

不管是stream还是async_stream，都可以在其上挂接多路filter，实现流之间数据过滤和变换。目前支持以下几种filter：

1. **zip_filter：gzip**、zlib的压缩和解压缩过滤器
2. **charset_filter**：字符集编码的过滤器
3. **chunked_filter：http** chunked编码的解码过滤器


如果在一个xml解析器上同时挂接：


```
http/xml => chunked_filter => zip_filter => charset_filter => stream/async_stream => xml_reader
```

就可以实现对xml文件的边下载、边解压、边转码、边解析，这样就可以完美支持大规模xml数据的解析支持，而且内存使用率也不会太高






还有两种**基于流的传输器**：

1. **transfer**：基于两路stream的传输器，可以用于简单的http下载、上传、文件之间的copy等等。
2. **async_transfer**：基于`async_stream`的异步传输器，可以用于多路并发io传输。

还有一个对`async_transfer`进行管理的传输池：**transfer_pool**，你可以把各种下载任务、上传任务以及其他io传输任务，一股脑的扔到池子里面去，什么时候哪个任务传输完了，传输了多少，都有进度回调报告状态，用起来相当方便。

目前的流可以支持如下几种url格式：

1. data://base64
2. file://path or unix path: e.g. /root/xxxx/file
3. sock://host:port?tcp=
4. sock://host:port?udp=
5. socks://host:port
6. http://host:port/path?arg0=&arg1=...
7. https://host:port/path?arg0=&arg1=...

具体架构见下图：

![流架构](/static/img/tbox/streamarch.png)

