---
layout: post.cn
title:  "tbox中vector容器的使用"
tags: tbox vector 容器
categories: tbox
---

tbox的vector容器沿用了stl库中vector的命名，说白了就是以数组方式存储元素，也是整个容器库中最基础的容器之一。

当然，在c中用tbox的vector跟用stl的vector其实差不了太多，用起来都很方便。

先看个简单的例子熟悉下：

```c
    // 初始化一个维护大小写敏感字符串的vector容器，第一参数设置元素自动增长大小，这里使用0表示默认大小
    tb_vector_ref_t vector = tb_vector_init(0, tb_element_str(tb_true));
    if (vector)
    {
        // 在头部插入元素
        tb_vector_insert_head(vector, "hi!");

        // 在尾部插入元素
        tb_vector_insert_tail(vector, "how");
        tb_vector_insert_tail(vector, "are");
        tb_vector_insert_tail(vector, "you");

        // 遍历打印所有元素
        tb_for_all (tb_char_t const*, cstr, vector)
        {
            // trace
            tb_trace_d("%s", cstr);
        }

        // 销毁vector容器
        tb_vector_exit(vector);
    }
```





里面的`tb_for_all`是用迭代器遍历容器，这个对所有的容器都支持，具体使用可以参考：[迭代器的使用](/cn/2016/02/04/iterator/)

vector不仅可以在头尾插入元素，还可以在指定索引的位置的前后插入元素：

```c

// 在索引1的位置，插入元素，新元素的索引为1
tb_vector_insert_next(vector, 1, "xxx");

// 在索引1的前面插入元素， 新元素的索引为0
tb_vector_insert_prev(vector, 1, "xxx");

```

如果你要插入一连串重复的元素，可以使用 `tb_vector_ninsert_xxx` 版本：

```c

// 连续在尾部插入10个重复的"xxx"
tb_vector_ninsert_head(vector, "xxx", 10);

// 连续在头部插入10个重复的"xxx"
tb_vector_ninsert_tail(vector, "xxx", 10);
```

如果要替换指定索引位置的元素内容，可以使用replace系列操作：

```c
// 替换索引5的元素内容为"xxx"，前提是这个元素原本就存在
tb_vector_replace(vector, 5, "xxx");
```

要删除指定索引的元素，更简单：

```c

// 删除索引位置5处的元素
tb_vector_remove(vector, 5);

// 删除头部的一个元素
tb_vector_remove_head(vector);

// 删除尾部最后一个元素
tb_vector_remove_last(vector);
```

像 替换、删除、插入等操作都有对应的 `ninsert/nreplace/nremove` 等批量处理连续重复数据的接口，这里就不细说了。。

在debug模式下，你还有使用dump接口，快速打印这个vector容器的所有数据信息，方便调试，不过只能在debug下使用哦：

```c
#ifdef __tb_debug__
// dump 所有元素信息
tb_vector_dump(vector);
#endif
```

不仅仅是vector，所有容器的元素定义，全部采用`tb_element_xxx`的接口来定义，不仅能维护字符串，还能维护各种类型：

* tb_element_long: 元素类型为整数：tb_long_t
* tb_element_size: 元素类型为整数：tb_size_t
* tb_element_uint8: 元素类型为整数：tb_uint8_t
* tb_element_uint16: 元素类型为整数：tb_uint16_t
* tb_element_uint32: 元素类型为整数：tb_uint32_t
* tb_element_str: 元素类型为字符串，支持：大小写敏感区分
* tb_element_ptr: 元素类型为指针，支持自定义free回调，释放指针对应的元素数据，相当于析构函数
* tb_element_mem: 元素类型为内存，一般用于内置结构体元素的维护，容器会吧整个结构体的数据维护在容器内部，同时也支持自定义free函数
* tb_element_obj: 元素类型为object对象，用于object模块中对象的维护，支持自动维护引用计数和对象释放

一般情况下，自定义的各种结构体数据，可以通过`tb_element_ptr/tb_element_mem` 维护都能满足需求，这两者的区别在于，前者只维护指针，不维护数据，后者直接维护数据。

当然如果觉得这样还不能满足自己的需求，也可以自定义自己的element类型，只要继承下`tb_element_t`类型，实现下对应的api就行了。。

而且包括vector的所有容器，都跟algorithm算法库紧密相连，所有算法通过迭代器都可以完美适配各种容器，例如：

```c

// 使用通用算法接口remove移除所有内容为"xxx"的元素
tb_remove(vector, "xxx");

// 移除第一个内容为"xxx"的元素
tb_remove_first(vector, "xxx");

// 移除所有 < 10的元素，tb_predicate_le是谓词函数，也可以实现自己的谓词逻辑
tb_remove_if(vector, tb_predicate_le, (tb_cpointer_t)10);

// 统计所有 > 10的元素个数
tb_count_all_if(vector, tb_predicate_be, (tb_cpointer_t)10);
```

其他算法，可以参考：[排序和查找算法的使用](/cn/2016/02/04/algorithm-sort-find/)

