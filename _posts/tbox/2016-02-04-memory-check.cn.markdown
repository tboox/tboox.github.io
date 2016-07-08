---
layout: post.cn
title:  "内存检测"
comments: true
categories: tbox
---

TBOX的内存分配在调试模式下，可以检测支持内存泄露和越界，而且还能精确定位到出问题的那块内存具体分配位置，和函数调用堆栈。 

1. 内存泄露检测

内存泄露的检测必须在程序退出的前一刻，调用tb_exit()的时候，才会执行，如果有泄露，会有详细输出到终端上。
    
    tb_void_t tb_demo_leak()
    {
        tb_pointer_t data = tb_malloc0(10);
    }
  
输出：

    [tbox]: [error]: leak: 0x7f9d5b058908 at tb_static_fixed_pool_dump(): 735, memory/impl/static_fixed_pool.c
    [tbox]: [error]: data: from: tb_demo_leak(): 43, memory/check.c
    [tbox]: [error]:     [0x000001050e742a]: 0   demo.b                              0x00000001050e742a tb_fixed_pool_malloc0_ + 186
    [tbox]: [error]:     [0x000001050f972b]: 1   demo.b                              0x00000001050f972b tb_small_pool_malloc0_ + 507
    [tbox]: [error]:     [0x000001050f593c]: 2   demo.b                              0x00000001050f593c tb_pool_malloc0_ + 540
    [tbox]: [error]:     [0x00000105063cd7]: 3   demo.b                              0x0000000105063cd7 tb_demo_leak + 55
    [tbox]: [error]:     [0x00000105063e44]: 4   demo.b                              0x0000000105063e44 tb_demo_memory_check_main + 20
    [tbox]: [error]:     [0x0000010505b08e]: 5   demo.b                              0x000000010505b08e main + 878
    [tbox]: [error]:     [0x007fff8c95a5fd]: 6   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: [error]:     [0x00000000000002]: 7   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: [error]: data: 0x7f9d5b058908, size: 10, patch: cc

<!-- more -->

2. 内存越界检测

越界溢出的检测，是实时完成的，而且对libc也做了插桩，所以对常用strcpy，memset等的使用，都回去检测

    tb_void_t tb_demo_overflow()
    {
        tb_pointer_t data = tb_malloc0(10);
        if (data)
        {
            tb_memset(data, 0, 11);
            tb_free(data);
        }
    }
  
输出：

    [tbox]: [memset]: [overflow]: [0x0 x 11] => [0x7f950b044508, 10]
    [tbox]: [memset]: [overflow]: [0x0000010991a1c7]: 0   demo.b                              0x000000010991a1c7 tb_memset + 151
    [tbox]: [memset]: [overflow]: [0x000001098a2d01]: 1   demo.b                              0x00000001098a2d01 tb_demo_overflow + 97
    [tbox]: [memset]: [overflow]: [0x000001098a3044]: 2   demo.b                              0x00000001098a3044 tb_demo_memory_check_main + 20
    [tbox]: [memset]: [overflow]: [0x0000010989a28e]: 3   demo.b                              0x000000010989a28e main + 878
    [tbox]: [memset]: [overflow]: [0x007fff8c95a5fd]: 4   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: [memset]: [overflow]: [0x00000000000002]: 5   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: 	[malloc]: [from]: data: from: tb_demo_overflow(): 12, memory/check.c
    [tbox]: 	[malloc]: [from]:     [0x0000010992662a]: 0   demo.b                              0x000000010992662a tb_fixed_pool_malloc0_ + 186
    [tbox]: 	[malloc]: [from]:     [0x0000010993892b]: 1   demo.b                              0x000000010993892b tb_small_pool_malloc0_ + 507
    [tbox]: 	[malloc]: [from]:     [0x00000109934b3c]: 2   demo.b                              0x0000000109934b3c tb_pool_malloc0_ + 540
    [tbox]: 	[malloc]: [from]:     [0x000001098a2cd7]: 3   demo.b                              0x00000001098a2cd7 tb_demo_overflow + 55
    [tbox]: 	[malloc]: [from]:     [0x000001098a3044]: 4   demo.b                              0x00000001098a3044 tb_demo_memory_check_main + 20
    [tbox]: 	[malloc]: [from]:     [0x0000010989a28e]: 5   demo.b                              0x000000010989a28e main + 878
    [tbox]: 	[malloc]: [from]:     [0x007fff8c95a5fd]: 6   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: 	[malloc]: [from]:     [0x00000000000002]: 7   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: 	[malloc]: [from]: data: 0x7f950b044508, size: 10, patch: cc
    [tbox]: 	[malloc]: [from]: data: first 10-bytes:
    [tbox]: ===================================================================================================================================================
    [tbox]: 00000000   00 00 00 00  00 00 00 00  00 00                                                                         ..........
    [tbox]: [error]: abort at tb_memset(): 255, libc/string/memset.c

3. 内存重叠覆盖检测

如果两块内存的copy发生了重叠，有可能会覆盖掉部分数据，导致bug，因此TBOX对此也做了些检测。

    tb_void_t tb_demo_overlap()
    {
        tb_pointer_t data = tb_malloc(10);
        if (data)
        {
            tb_memcpy(data, (tb_byte_t const*)data + 1, 5);
            tb_free(data);
        }
    }
    
输出

    [tbox]: [memcpy]: [overlap]: [0x7fe9b5042509, 5] => [0x7fe9b5042508, 5]
    [tbox]: [memcpy]: [overlap]: [0x000001094403b8]: 0   demo.b                              0x00000001094403b8 tb_memcpy + 632
    [tbox]: [memcpy]: [overlap]: [0x000001093c99f9]: 1   demo.b                              0x00000001093c99f9 tb_demo_overlap + 105
    [tbox]: [memcpy]: [overlap]: [0x000001093c9a44]: 2   demo.b                              0x00000001093c9a44 tb_demo_memory_check_main + 20
    [tbox]: [memcpy]: [overlap]: [0x000001093c0c8e]: 3   demo.b                              0x00000001093c0c8e main + 878
    [tbox]: [memcpy]: [overlap]: [0x007fff8c95a5fd]: 4   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: [memcpy]: [overlap]: [0x00000000000002]: 5   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: 	[malloc]: [from]: data: from: tb_demo_overlap(): 58, memory/check.c
    [tbox]: 	[malloc]: [from]:     [0x0000010945eadb]: 0   demo.b                              0x000000010945eadb tb_small_pool_malloc_ + 507
    [tbox]: 	[malloc]: [from]:     [0x0000010945b23c]: 1   demo.b                              0x000000010945b23c tb_pool_malloc_ + 540
    [tbox]: 	[malloc]: [from]:     [0x000001093c99c7]: 2   demo.b                              0x00000001093c99c7 tb_demo_overlap + 55
    [tbox]: 	[malloc]: [from]:     [0x000001093c9a44]: 3   demo.b                              0x00000001093c9a44 tb_demo_memory_check_main + 20
    [tbox]: 	[malloc]: [from]:     [0x000001093c0c8e]: 4   demo.b                              0x00000001093c0c8e main + 878
    [tbox]: 	[malloc]: [from]:     [0x007fff8c95a5fd]: 5   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: 	[malloc]: [from]:     [0x00000000000002]: 6   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: 	[malloc]: [from]: data: 0x7fe9b5042508, size: 10, patch: cc
    [tbox]: 	[malloc]: [from]: data: first 10-bytes:
    [tbox]: ===================================================================================================================================================
    [tbox]: 00000000   CC CC CC CC  CC CC CC CC  CC CC                                                                         ..........
    [tbox]: [error]: abort at tb_memcpy(): 125, libc/string/memcpy.c

4. 内存双重释放检测

    tb_void_t tb_demo_free2()
    {
        tb_pointer_t data = tb_malloc0(10);
        if (data)
        {
            tb_free(data);
            tb_free(data);
        }
    }

输出

    [tbox]: [assert]: expr[((impl->used_info)[(index) >> 3] & (0x1 << ((index) & 7)))]: double free data: 0x7fd93386c708 at tb_static_fixed_pool_free(): 612, memory/impl/static_fixed_pool.c
    [tbox]:     [0x0000010c9f553c]: 0   demo.b                              0x000000010c9f553c tb_static_fixed_pool_free + 972
    [tbox]:     [0x0000010c9ee7a9]: 1   demo.b                              0x000000010c9ee7a9 tb_fixed_pool_free_ + 713
    [tbox]:     [0x0000010ca01ff5]: 2   demo.b                              0x000000010ca01ff5 tb_small_pool_free_ + 885
    [tbox]:     [0x0000010c9fdb4f]: 3   demo.b                              0x000000010c9fdb4f tb_pool_free_ + 751
    [tbox]:     [0x0000010c96ac8e]: 4   demo.b                              0x000000010c96ac8e tb_demo_free2 + 158
    [tbox]:     [0x0000010c96ae44]: 5   demo.b                              0x000000010c96ae44 tb_demo_memory_check_main + 20
    [tbox]:     [0x0000010c96208e]: 6   demo.b                              0x000000010c96208e main + 878
    [tbox]:     [0x007fff8c95a5fd]: 7   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]:     [0x00000000000002]: 8   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: [error]: free(0x7fd93386c708) failed! at tb_demo_free2(): 37, memory/check.c at tb_static_fixed_pool_free(): 649, memory/impl/static_fixed_pool.c
    [tbox]: [error]: data: from: tb_demo_free2(): 33, memory/check.c
    [tbox]: [error]:     [0x0000010c9ee42a]: 0   demo.b                              0x000000010c9ee42a tb_fixed_pool_malloc0_ + 186
    [tbox]: [error]:     [0x0000010ca0072b]: 1   demo.b                              0x000000010ca0072b tb_small_pool_malloc0_ + 507
    [tbox]: [error]:     [0x0000010c9fc93c]: 2   demo.b                              0x000000010c9fc93c tb_pool_malloc0_ + 540
    [tbox]: [error]:     [0x0000010c96ac27]: 3   demo.b                              0x000000010c96ac27 tb_demo_free2 + 55
    [tbox]: [error]:     [0x0000010c96ae44]: 4   demo.b                              0x000000010c96ae44 tb_demo_memory_check_main + 20
    [tbox]: [error]:     [0x0000010c96208e]: 5   demo.b                              0x000000010c96208e main + 878
    [tbox]: [error]:     [0x007fff8c95a5fd]: 6   libdyld.dylib                       0x00007fff8c95a5fd start + 1
    [tbox]: [error]:     [0x00000000000002]: 7   ???                                 0x0000000000000002 0x0 + 2
    [tbox]: [error]: data: 0x7fd93386c708, size: 10, patch: cc
    [tbox]: [error]: data: first 10-bytes:
    [tbox]: ===================================================================================================================================================
    [tbox]: 00000000   00 00 00 00  00 00 00 00  00 00                                                                         ..........
    [tbox]: [error]: abort at tb_static_fixed_pool_free(): 655, memory/impl/static_fixed_pool.c


