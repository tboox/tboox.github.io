---
layout: post.cn
title:  "排序和查找算法的使用"
tags: tbox 算法 排序 查找
categories: tbox
---

TBOX提供了各种常用算法，对容器中的元素进行各种操作，这里主要介绍下排序和查找算法。

排序算法目前支持如下几种：

1. 快速排序：tb_quick_sort
2. 堆排序：  tb_heap_sort
3. 插入排序：tb_bubble_sort
4. 冒泡排序：tb_insert_sort

并且提供通用的tb_sort接口，对各种排序算法进行自动适配，使得任何情况下，性能都是最优的。
例如：

1. 对具有随机迭代特性的容器，采用快速排序来优化
2. 对具有随机迭代特性，并且是超大规模的容器，采用堆排序
3. 对只能线性迭代的容器采用冒泡排序




所以一般情况下，只需要调用tb_sort就行了

```c
    // 初始化一个vector，元素类型为tb_long_t， 满256个元素自动增长
    tb_vector_ref_t vector = tb_vector_init(256, tb_item_func_long());
    if (vector)
    {
        // 插入一些元素
        tb_vector_insert_tail(vector, (tb_cpointer_t)10);
        tb_vector_insert_tail(vector, (tb_cpointer_t)2);
        tb_vector_insert_tail(vector, (tb_cpointer_t)5);
        tb_vector_insert_tail(vector, (tb_cpointer_t)6);
        tb_vector_insert_tail(vector, (tb_cpointer_t)9);
       
        // 排序所有，第二个参数是比较器函数，默认使用容器内置的比较器
        tb_sort_all(vector, tb_null);

        // 释放vector
        tb_vector_exit(vector);
    }
```

对于查找算法，目前提供：

1. 线性查找：    tb_find 
2. 反向线性查找：tb_rfind 
3. 二分法查找：  tb_binary_find 

如果容器具有随机迭代特性，你就可以使用二分查找来优化，例如：vector、原生数组等等。。

```c
    // 初始化一个vector，元素类型为tb_long_t， 满256个元素自动增长
    tb_vector_ref_t vector = tb_vector_init(256, tb_item_func_long());
    if (vector)
    {
        // 插入一些有序元素
        tb_vector_insert_tail(vector, (tb_cpointer_t)1);
        tb_vector_insert_tail(vector, (tb_cpointer_t)2);
        tb_vector_insert_tail(vector, (tb_cpointer_t)4);
        tb_vector_insert_tail(vector, (tb_cpointer_t)6);
        tb_vector_insert_tail(vector, (tb_cpointer_t)9);
       
        // 使用二分查找法，快速查找元素，算法复杂度O(log2)
        tb_size_t itor = tb_binary_find_all(vector, (tb_cpointer_t)5);
        if (itor != tb_iterator_tail(vector))
        {
            // 获取元素值：5
            tb_size_t value = tb_iterator_item(vector, itor);
        }

        // 释放vector
        tb_vector_exit(vector);
    }
```

你也可以指定比较器函数，来更灵活的进行查找。

```c
    // 按降序比较函数
    static tb_long_t your_comp_func(tb_iterator_ref_t iterator, tb_cpointer_t ltem, tb_cpointer_t rtem)
    {
        return ((tb_long_t)ltem < (tb_long_t)rtem? 1 : ((tb_long_t)ltem > (tb_long_t)rtem? -1 : 0));
    }

    // 初始化一个vector，元素类型为tb_long_t， 满256个元素自动增长
    tb_vector_ref_t vector = tb_vector_init(256, tb_item_func_long());
    if (vector)
    {
        // 插入一些有序元素
        tb_vector_insert_tail(vector, (tb_cpointer_t)1);
        tb_vector_insert_tail(vector, (tb_cpointer_t)2);
        tb_vector_insert_tail(vector, (tb_cpointer_t)4);
        tb_vector_insert_tail(vector, (tb_cpointer_t)6);
        tb_vector_insert_tail(vector, (tb_cpointer_t)9);
       
        // 使用二分查找法，快速查找元素，并且指定自己的比较器函数
        tb_size_t itor = tb_binary_find_all_if(vector, your_comp_func, tb_null);
        if (itor != tb_iterator_tail(vector))
        {
            // 获取元素值：5
            tb_size_t value = tb_iterator_item(vector, itor);
        }

        // 释放vector
        tb_vector_exit(vector);
    }
```

原生的数组也是可以使用算法进行比较的，下面给个比较常用的查找例子：

```c
    // 定义一个字符集操作的数据结构
    typedef struct __tb_charset_t
    {
        tb_size_t           type;
        tb_char_t const*    name;
        tb_long_t           (*get)(tb_static_stream_ref_t sstream, tb_bool_t be, tb_uint32_t* ch);
        tb_long_t           (*set)(tb_static_stream_ref_t sstream, tb_bool_t be, tb_uint32_t ch);

    }tb_charset_t;

    // 定义一个原生数组
    static tb_charset_t charsets[] =
    {
        {TB_CHARSET_TYPE_ASCII,     "ascii",    tb_charset_ascii_get,   tb_charset_ascii_set    }
    ,   {TB_CHARSET_TYPE_GB2312,    "gb2312",   tb_charset_gb2312_get,  tb_charset_gb2312_set   }
    ,   {TB_CHARSET_TYPE_GBK,       "gbk",      tb_charset_gb2312_get,  tb_charset_gb2312_set   }
    ,   {TB_CHARSET_TYPE_ISO8859,   "iso8859",  tb_charset_iso8859_get, tb_charset_iso8859_set  }
    ,   {TB_CHARSET_TYPE_UCS2,      "ucs3",     tb_charset_ucs2_get,    tb_charset_ucs2_set     }
    ,   {TB_CHARSET_TYPE_UCS4,      "ucs4",     tb_charset_ucs4_get,    tb_charset_ucs4_set     }
    ,   {TB_CHARSET_TYPE_UTF16,     "utf16",    tb_charset_utf16_get,   tb_charset_utf16_set    }
    ,   {TB_CHARSET_TYPE_UTF32,     "utf32",    tb_charset_utf32_get,   tb_charset_utf32_set    }
    ,   {TB_CHARSET_TYPE_UTF8,      "utf8",     tb_charset_utf8_get,    tb_charset_utf8_set     }
    };

    // 按名字查找比较函数
    static tb_long_t tb_charset_comp_by_name(tb_iterator_ref_t iterator, tb_cpointer_t item, tb_cpointer_t name)
    {
        return tb_stricmp(((tb_charset_ref_t)item)->name, (tb_char_t const*)name);
    }

    // 将原生的数组，初始化成一个迭代器
    tb_iterator_t iterator = tb_iterator_init_mem(charsets, tb_arrayn(charsets), sizeof(tb_charset_t));

    // 针对这个迭代器根据名字进行二分法查找
    tb_size_t itor = tb_binary_find_all_if(&iterator, tb_charset_comp_by_name, "utf8");

    // 如果找到
    if (itor != tb_iterator_tail(&iterator))
    {
        // 获取元素对象
        tb_charset_t* charset = (tb_charset_t*)tb_iterator_item(&iterator, itor);
    }
```

注：上面的例子摘录自TBOX库内部的代码，仅供参考，不能直接copy使用。

