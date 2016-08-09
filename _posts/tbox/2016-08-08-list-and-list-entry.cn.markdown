---
layout: post.cn
title:  "tbox链表list和list_entry的使用"
tags: tbox list 链表 双向链表 单向链表 容器
categories: tbox
---

TBOX中提供了各种列表操作：

1. list:              元素在内部维护的双向链表
2. list_entry:        元素在外部维护的双向链表
3. single_list:       元素在内部维护的单向链表
4. single_list_entry: 元素在外部维护的单向链表

由于双链和单链的接口使用类似，这里主要就讲解双链的具体使用。

那什么是内部维护和外部维护呢？ 简单地说：

* 外部维护：就是链表容器本身不存储元素，不开辟内存空间，仅仅是一个节点头，这样比较节省内存，更加灵活。（尤其是在多个链表间元素迁移的时候，或者多个链表需要统一内存池维护的时候）。

* 内部维护：就是链表容器本身回去开辟一块空间，去单独存储元素内容，这种方式对接口的操作比较简单，但是灵活性和性能不如前一种，如果不需要多个链表维护同一种元素，那么使用这种模式简单操作下，更为妥当。（而且内部元素的存储也是用内存池优化过的）。

##list的使用

list的使用很简单，接口用起来也很方便，这里给个简单的例子：

```c
// 创建一个long类型的双链，参数0表示采用默认的自动元素增长大小，也可以手动设置更适合的大小
tb_list_ref_t list = tb_list_init(0, tb_element_long());
if (list)
{
    // 在链表头部插入元素：1，并返回这个新元素的迭代器索引
    tb_size_t itor = tb_list_insert_head(list, (tb_pointer_t)1);

    // 在之前新的元素后面插入一个新元素：2
    tb_list_insert_next(list, itor, (tb_pointer_t)2);

    // 在链表尾部插入元素：3
    tb_list_insert_tail(list, (tb_pointer_t)3);

    // 移除指定的元素
    tb_list_remove(list, itor);

    // 遍历所有链表元素，
    tb_for_all(tb_long_t, item, list)
    {
        // 打印元素值
        tb_trace_i("%ld", item);
    }

    // 销毁list
    tb_list_exit(list);
}
```





## list_entry的使用

list_entry由于是外置式的容器，需要在外面自己定义的结构体上进行操作，例如定义:

```c
// 链表元素结构体
typedef struct __tb_demo_entry_t 
{
    // 外置双链的节点，用于链表维护
    tb_list_entry_t     entry;

    // 元素的实际数据
    tb_size_t           data;

}tb_demo_entry_t;
```

对链表的具体操作如下：

```c
// 定义一些静态元素，用于插入链表（实际使用可能需要自己动态创建他们）
tb_demo_entry_t entries[12] = 
{
    { {0}, 0 }
,   { {0}, 1 }
,   { {0}, 2 }
,   { {0}, 3 }
,   { {0}, 4 }
,   { {0}, 5 }
,   { {0}, 6 }
,   { {0}, 7 }
,   { {0}, 8 }
,   { {0}, 9 }
,   { {0}, 10}
,   { {0}, 11}
};

// 初始化链表，需要指定外置元素的结构体类型，链表的节点名字
tb_list_entry_head_t list;
tb_list_entry_init(&list, tb_demo_entry_t, entry, tb_null);

// 插入一些元素，注意：所有操作都是在外置结构体中的list_entry节点上操作
tb_list_entry_insert_tail(&list, &entries[5].entry);
tb_list_entry_insert_tail(&list, &entries[6].entry);
tb_list_entry_insert_tail(&list, &entries[7].entry);
tb_list_entry_insert_tail(&list, &entries[8].entry);
tb_list_entry_insert_tail(&list, &entries[9].entry);
tb_list_entry_insert_head(&list, &entries[4].entry);
tb_list_entry_insert_head(&list, &entries[3].entry);
tb_list_entry_insert_head(&list, &entries[2].entry);
tb_list_entry_insert_head(&list, &entries[1].entry);
tb_list_entry_insert_head(&list, &entries[0].entry);

// 访问具体某个节点的元素数据
tb_demo_entry_t* entry = (tb_demo_entry_t*)tb_list_entry(&list, &entries[5].entry);
tb_trace_i("entry: %lu", entry->data);

// 遍历所有元素
tb_trace_i("insert: %lu", tb_list_entry_size(&list));
tb_for_all_if(tb_demo_entry_t*, item0, tb_list_entry_itor(&list), item0)
{
    tb_trace_i("%lu", item0->data);
}

// 替换头尾的元素
tb_list_entry_replace_head(&list, &entries[10].entry);
tb_list_entry_replace_last(&list, &entries[11].entry);

// 移除头尾的元素
tb_list_entry_remove_head(&list);
tb_list_entry_remove_last(&list);

// 移动元素位置，这里吧头尾的元素对调了下
tb_list_entry_ref_t head = tb_list_entry_head(&list);
tb_list_entry_moveto_head(&list, tb_list_entry_last(&list));
tb_list_entry_moveto_tail(&list, head);

// 退出列表
tb_list_entry_exit(&list);
```

怎么样，也不是很复杂吧，由于元素的内存都在外面自己维护，所以灵活性提升了不少，并且可以多个链表同时维护，然后共用一个内存池进行优化，效率和内存都能得到最大的提升，这种模式在linux内核里面很常见。

如果要做比喻的话，list就是傻瓜式操作，list_entry就是定制化操作。。。

