---
layout: post.cn
title:  "tbox v1.5.1 更新内容"
categories: tbox
---

1. 优化stream，支持对字符设备文件的读写
2. 自动检测所有系统libc接口，优先使用系统版本
3. 修复android下的一些bug
4. 修改tb_init接口，增加allocator自定义内存分配器参数，实现用户的侵入式内存管理
5. 重构内存管理，完全采用分配器allocator模式，可以灵活切换内存管理，支持原生系统内存、静态buffer内存、内存池等各种分配方式
6. 支持自定义内存分配器，并且能够在debug模式下，获取每次分配的代码位置信息，用于自定义追踪
7. 增加轻量级static_pool来维护整块buffer的内存分配，适合局部管理部分内存，pool虽然也能维护，但是底层基于large_pool，比较重量级，适合全局管理内存
8. 修复stream的seek问题
9. 增加stream快速读取全部数据到string的接口
10. 增加adler32 hash算法
11. 增加tb_memmem接口
12. 重定义assert，debug模式遇到assert直接abort执行
13. 采用pcre/pcre2/posix regex实现正则表达式库

