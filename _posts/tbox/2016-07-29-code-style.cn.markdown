---
layout: post.cn
title:  "聊聊tbox的代码风格"
tags: tbox 代码风格
categories: tbox
---

每个开发者在写了一段时间代码后，都会有自己一套适合自己的代码规范。

最近，也看到很多人聊起这些风格上的事，什么命名规则那个好啊，什么的。。

这些我个人不做评价，每个人观点和审美观都不一样，永远都争不出一个结果来，其实只要代码看着简洁明了，整个项目的规范统一就行了。。

这里，我只说说我在写tbox时候，对于一些代码规范上的一些个人经验，以及其演进过程。。




### 命名规则

tbox的命名规则偏unix化些，主要以`小写+下划线`为主，很多人也许还是比较喜欢匈牙利、驼峰法什么的。这个主要还是看个人喜好，以及具体的项目。。

如果项目已经成型，里面已经自成规范，那么往里加代码的时候，还是配合项目风格，来命名比较好，这样整体看上去比较统一规范。。

不过我的大部分个人项目，都是一个人从零写起的，也就没这个约束，个人偏爱unix风格而已，看着挺舒服的。。


其实早期我也是从写mfc开始的，那个时候我命名规则，也习惯加个大写的`C`的什么的

后来为了写库，纠结了一阵子命名的问题，每次都为什么时候该大写，什么时候该小写纠结半天，然后敲代码经常要切换大小写，好麻烦，本人又很懒，怎么办呢。。

后来索性不纠结了，算了，还是全小写吧，不纠结大小写问题，由于不需要每次切换大小写，敲代码也更加行云流水了。再配合vim的supertab，哈哈，爽嗨了。。


### 缩进问题

早期tbox用的是基于tab的缩进规则，一直持续了几年，后来代码移交github维护后，发现了个大问题，哎呀，排版好乱。。

然后开始各种纠结，各种折腾，无果，最后妥协了，全部改用4个空格的缩进，并且把vim的默认缩进规则也改成了space4

### 类型问题

为了做到跨平台，tbox中用到的所有类型，都是全部重定义过的，例如：

```c
typedef signed int                  tb_int_t;
typedef unsigned int                tb_uint_t;
typedef signed short                tb_short_t;
typedef unsigned short              tb_ushort_t;
typedef tb_int_t                    tb_bool_t;
typedef signed char                 tb_int8_t;
typedef tb_int8_t                   tb_sint8_t;
typedef unsigned char               tb_uint8_t;
typedef tb_short_t                  tb_int16_t;
typedef tb_int16_t                  tb_sint16_t;
typedef tb_ushort_t                 tb_uint16_t;
typedef tb_int_t                    tb_int32_t;
typedef tb_int32_t                  tb_sint32_t;
typedef tb_uint_t                   tb_uint32_t;
typedef char                        tb_char_t;
typedef tb_int32_t                  tb_uchar_t;
typedef tb_uint8_t                  tb_byte_t;
typedef void                        tb_void_t;
typedef tb_void_t*                  tb_pointer_t;
typedef tb_void_t const*            tb_cpointer_t;
typedef tb_pointer_t                tb_handle_t;
```

对于这种方式，褒贬不一，也有人反馈过，这样太过于侵入式了，但是我在tbox中这么使用的原因：

```
主要还是为了解决平台统一问题，以及代码一致性。。
```

因为，很多平台的libc支持不是很完整，像`uint32_t`这种，每个平台typedef的方式都不相同，如果你的库用到了`uint32_t`

并且在其他平台的工程上使用，有时候会发现，`uint32_t`居然没有定义，或者typedef的不一样，导致编译报错，就很郁闷了。。这种问题我碰到的太多了。。

其中windows平台上最为典型，long在64bits上居然也是4bytes，而且定义方式有好几种，`long` 或者 `LONG` 等等。。

我在很多其他项目的代码里面，发现有些代码还混着使用，调用处用的是LONG，函数定义用的是long。。

又或者，返回值是`TRUE`，判断的时候用的确是`true`，汗~~


因此，tbox里面为了不想过多的纠结这些问题，就全部统一处理了，布尔返回值，也一并使用：

```c
#define tb_true     ((tb_bool_t)1)
#define tb_false    ((tb_bool_t)0)
```

### 接口设计

tbox里面的接口，也是基于对象式，但是跟c++的那种对象还有些区别的，这里一个对象类型，对应两个文件，这里拿对象`vector`为例：

```
vector.h
vector.c
```

一个是接口文件，一个是实现文件。。

#### 接口文件

也看下接口文件中的接口定义方式：

```c

// the vector ref type
typedef struct{}*   tb_vector_ref_t;

/*! init vector
 * 
 * @code
 *
    // init vector
    tb_vector_ref_t vector = tb_vector_init(0, tb_element_str(tb_true));
    if (vector)
    {
        // insert elements into head
        tb_vector_insert_head(vector, "hi!");

        // insert elements into tail
        tb_vector_insert_tail(vector, "how");
        tb_vector_insert_tail(vector, "are");
        tb_vector_insert_tail(vector, "you");

        // dump elements
        tb_for_all (tb_char_t const*, cstr, vector)
        {
            // trace
            tb_trace_d("%s", cstr);
        }

        // exit vector
        tb_vector_exit(vector);
    }
 * @endcode
 *
 * @param grow      the item grow
 * @param element   the element
 *
 * @return          the vector
 */
tb_vector_ref_t     tb_vector_init(tb_size_t grow, tb_element_t element);

/*! exist vector
 *
 * @param vector    the vector
 */
tb_void_t           tb_vector_exit(tb_vector_ref_t vector);

/*! insert the vector tail item
 *
 * @param vector    the vector
 * @param data      the item data
 */
tb_void_t           tb_vector_insert_tail(tb_vector_ref_t vector, tb_cpointer_t data);
```

在tbox里面，每个接口，都是有注释的，注释规范用的是doxygen的格式，并且对于一些接口的是有，我会加上如何调用的demo例子在注释中

这样，一般情况下，只需要看注释，就知道怎么用接口了，并且为了不想中英文切换，我注释也都是英文的，虽然我英文很菜，有很多语法问题。。：）

尤其需要说一下的是，这里的类型定义：

```c
typedef struct{}*   tb_vector_ref_t;
```

很多人也奇怪，我为什么要这么写，其实早期我不是这么写的，以前的写法是：

```c
typedef struct __tb_vector_t
{
    // the data size
    tb_size_t   size;

    // the data buffer
    tb_byte_t*  data;

    // ...

}tb_vector_t, *tb_vector_ref_t;
```

但是这样，会有个问题，因为把struct的成员暴露在了头文件中，很容易导致版本更新的时候，struct定义跟库接口不一致，产生一些莫名的问题。。

而且，这样容易使得别人去乱改里面的数据成员，但是这个成员应该是私有的，不能直接让别人访问的，要想方位，需要暴露接口的方式来访问

因为，我需要吧struct的实际定义隐藏起来，只暴露引用，这样还能解决头文件的`include`依赖过于复杂，导致循环`include`的问题。

那为什么，是直接定义成：

```c
typedef void* tb_vector_ref_t;
```

这种呢，这种方式，相当于去类型化了，把强类型削弱了，会导致一个vector对象，不小心传给`tb_list_remove`的接口，编译也不会报错。

使得容易产生一些隐藏bug，到时候很难查，为了让编译器能及时报错，必须要保证强类型检测生效，因此我才采用了这种方式定义：

```c
typedef struct{}* tb_vector_ref_t;
```

#### 实现文件

接口实现中，我们才会去真正的定义这个vector对象的具体成员结构，例如：

```c
typedef struct __tb_vector_t
{
    // the data size
    tb_size_t   size;

    // the data buffer
    tb_byte_t*  data;

    // ...

}tb_vector_t;

// 这里第一个参数名为self，相当于c++的this，表示当前对象实例的引用
tb_void_t tb_vector_exit(tb_vector_ref_t self)
{
    // tbox的每个接口开头，都会加上assert进行断言检测
    // 在debug下第一时间报告出现的问题，release下会禁用，不影响性能
    tb_vector_t* vector = (tb_vector_t*)self;
    tb_assert_and_check_return(vector);

    // exit data
    if (vector->data) tb_free(data);
    vector->data = tb_null;
    vector->size = 0;
}
```

另外，如果看到tbox里面有些地方，并不是按照上面的规范来的，也不用奇怪，毕竟这项目我陆陆续续写了很多年，有些历史遗留代码，可能没有及时更新，有时间的话，我会改掉。
