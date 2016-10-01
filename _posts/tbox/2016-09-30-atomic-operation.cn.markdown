---
layout: post.cn
title:  "聊聊原子操作那些事"
tags: tbox 原子操作 atomic 自旋锁
categories: tbox
---

原子操作，线程间交互数据最细粒度的同步操作，它可以保证线程间读写某个数值的原子性。

由于不需要加重量级的互斥锁进行同步，因此非常轻量，而且也不需要在内核间来回切换调度，效率是非常高的。。

那如何使用原子操作了，各个平台下都有相关api提供了支持，并且向gcc、clang这些编译器，也提供了编译器级的__builtin接口进行支持

1. windows的Interlockedxxx和Interlockedxxx64系列api
2. macosx的OSAtomicXXX系列api
3. gcc的`__sync_val_compare_and_swap`和`__sync_val_compare_and_swap_8`等__builtin接口
4. x86和x86_64架构的`lock`汇编指令
5. tbox的跨平台原子接口

#### tbox接口使用

先拿tbox的`tb_atomic_fetch_and_add`接口为例，顾名思义，这个api会先读取原有数值，然后在其基础上加上一个数值：

```c
// 相当于原子进行：b = *a++;
tb_atomic_t a = 0;
tb_long_t   b = tb_atomic_fetch_and_add(&a, 1);
```

如果需要先进行add计算，再返回结果可以用：

```c
// 相当于原子进行：b = ++*a;
tb_atomic_t a = 0;
tb_long_t   b = tb_atomic_add_and_fetch(&a, 1);
```

或者可以更加简化为：

```c
tb_long_t b = tb_atomic_fetch_and_inc(&a);
tb_long_t b = tb_atomic_inc_and_fetch(&a);
```






那tbox在内部如何去适配各个平台的呢，我们可以简单看下，基本上就是对原生api进行了一层wrap而已。

#### windows接口封装

```c
static __tb_inline__ tb_long_t tb_atomic_fetch_and_add_windows(tb_atomic_t* a, tb_long_t v)
{
    return (tb_long_t)InterlockedExchangeAdd((LONG __tb_volatile__*)a, v);
}
static __tb_inline__ tb_long_t tb_atomic_inc_and_fetch_windows(tb_atomic_t* a)
{
    return (tb_long_t)InterlockedIncrement((LONG __tb_volatile__*)a);
}
```

#### gcc接口的封装

```c
static __tb_inline__ tb_long_t tb_atomic_fetch_and_add_sync(tb_atomic_t* a, tb_long_t v)
{
    return __sync_fetch_and_add(a, v);
}
```

#### x86和x86_64架构汇编实现

```c
static __tb_inline__ tb_long_t tb_atomic_fetch_and_add_x86(tb_atomic_t* a, tb_long_t v)
{
    /*
     * xaddl v, [a]:
     *
     * o = [a]
     * [a] += v;
     * v = o;
     *
     * cf, ef, of, sf, zf, pf... maybe changed
     */
    __tb_asm__ __tb_volatile__ 
    (
#if TB_CPU_BITSIZE == 64
        "lock xaddq %0, %1 \n"          //!< xaddq v, [a]
#else
        "lock xaddl %0, %1 \n"          //!< xaddl v, [a]
#endif

        : "+r" (v) 
        : "m" (*a) 
        : "cc", "memory"
    );

    return v;
}

```

原子操作除了可以进行对int32和int64数值加减乘除外，还可以进行xor, or, and等逻辑计算，用法类似，这里就不多说了。

下面我们再来个简单的实例，来实际运用下，原子的应用场景还是蛮多的，比如：

* 用于实现自旋锁
* 用于实现无锁队列
* 线程间的状态同步
* 用于实现单例

等等。。

#### 自旋锁的实现

我们先来看下如何去实现一个简单的自旋锁，为了统一规范演示代码，下面的代码都用tbox提供的原子接口为例：

```c
static __tb_inline_force__ tb_bool_t tb_spinlock_init(tb_spinlock_ref_t lock)
{
    // init 
    *lock = 0;

    // ok
    return tb_true;
}
static __tb_inline_force__ tb_void_t tb_spinlock_exit(tb_spinlock_ref_t lock)
{
    // exit 
    *lock = 0;
}
static __tb_inline_force__ tb_void_t tb_spinlock_enter(tb_spinlock_ref_t lock)
{
    /* 尝试读取lock的状态值，如果还没获取到lock（状态0），则获取它（设置为1）
     * 如果对方线程已经获取到lock（状态1），那么循环等待尝试重新获取
     *
     * 注：整个状态读取和设置，是原子的，无法被打断
     */
    tb_size_t tryn = 5;
    while (tb_atomic_fetch_and_pset((tb_atomic_t*)lock, 0, 1))
    {
        // 没获取到lock，尝试5次后，还不成功，则让出cpu切到其他线程运行，之后重新尝试获取
        if (!tryn--)
        {
            // yield
            tb_sched_yield();

            // reset tryn
            tryn = 5;
        }
    }
}
static __tb_inline_force__ tb_void_t tb_spinlock_leave(tb_spinlock_ref_t lock)
{
    // 释放lock，此处无需原子，设置到一半被打断，数值部位0，对方线程还是在等待中，不收影响
    *((tb_atomic_t*)lock) = 0;
}
```

这个实现非常简单，但是tbox里面，基本上默认都是在使用这个spinlock，因为tbox里面大部分多线程实现，粒度都被拆的很细

大部分情况下，用自旋锁就ok了，无需进入内核态切换等待。。

使用方式如下：

```c
// 获取lock
tb_spinlock_enter(&lock);

// 一些同步操作
// ..

// 释放lock
tb_spinlock_leave(&lock);
```

上面的代码中，省略了init和exit操作，实际使用时，在响应初始化和释放的地方，做相应处理下就行了。。

#### 类`pthread_once`的实现

`pthread_once` 可以在多线程函数内，可以保证传入的函数只被调用到一次，一般可以用来初始化全局单例或者TLS的key初始化

以tbox的接口为例，我先来来看下，这个函数的使用方式：

```c

// 初始化函数，只会被调用到一次
static tb_void_t tb_once_func(tb_cpointer_t priv)
{
    // 初始化一些单例对象，全局变量
    // 或者执行一些初始化调用
}

// 线程函数
static tb_int_t tb_thread_func(tb_cpointer_t priv)
{
    // 全局存储lock，并初始化为0
    static tb_atomic_t lock = 0;
    if (tb_thread_once(&lock, tb_once_func, "user data"))
    {
        // ok
    }
}
```

我们这里拿原子操作，可以简单模拟实现下这个函数：

```c
tb_bool_t tb_thread_once(tb_atomic_t* lock, tb_bool_t (*func)(tb_cpointer_t), tb_cpointer_t priv)
{
    // check
    tb_check_return_val(lock && func, tb_false);

    /* 原子获取lock的状态
     *
     * 0: func还没有被调用
     * 1: 已经获取到lock，func正在被其他线程调用中
     * 2: func已经被调用完成，并且func返回ok
     * -2: func已经被调用，并且func返回失败failed
     */
    tb_atomic_t called = tb_atomic_fetch_and_pset(lock, 0, 1);

    // func已经被其他线程调用过了？直接返回
    if (called && called != 1) 
    {
        return called == 2;
    }
    // func还没有被调用过？那么调用它
    else if (!called)
    {
        // 调用函数
        tb_bool_t ok = func(priv);

        // 设置返回状态
        tb_atomic_set(lock, ok? 2 : -1);

        // ok?
        return ok;
    }
    // 正在被其他线程获取到lock，func正在被调用中，还没完成？尝试等待lock
    else
    {
        // 此处简单的做了些sleep循环等待，直到对方线程func执行完成
        tb_size_t tryn = 50;
        while ((1 == tb_atomic_get(lock)) && tryn--)
        {
            // wait some time
            tb_msleep(100);
        }
    }

    /* 重新获取lock的状态，判断是否成功
     * 
     * 成功：2
     * 超时：1
     * 失败：-2
     *
     * 此处只要不是2，都算失败
     */
    return tb_atomic_get(lock) == 2;
}
```

#### 64位原子操作

64位操作跟32位的接口使用方式，是完全一样的，仅仅只是变量类型的区别：

1. tbox中类型为`tb_atomic64_t`，接口改为`tb_atomic64_xxxx`
2. gcc中类型为`volatile long long`，接口改为`__sync_xxxx_8`系列
3. windows上则为Interlockedxxx64

具体使用方式参考32位，这里就不详细介绍了。。
