---
layout: post.cn
title:  "线程局部存储tls的使用"
tags: tbox 多线程 tls 线程局部存储
categories: tbox
---

线程局部存储(Thread Local Storage，TLS)主要用于在多线程中，存储和维护一些线程相关的数据，存储的数据会被关联到当前线程中去，并不需要锁来维护。。

因此也没有多线程间资源竞争问题，那如何去实现TLS存储呢，主要有以下几种方式：

1. gcc和clang的`__thread`修饰符
2. windows下msvc的`__declspec(thread)`修饰符
3. pthread库`pthread_setspecific`和`pthread_getspecific`接口
4. windows下的`TlsSetValue`和`TlsGetValue`

#### __thread和__declspec(thread)的使用

其中__thread和__declspec(thread)用起来最为方便，只需要在static或者全局变量前加上此修饰符，然后在线程里面访问变量就行了

例如：

```c
tb_void_t tb_thread_func(tb_cpointer_t priv)
{
    // 定义一个线程局部变量
    static __thread int a = 0;
        
    // 初始化这个变量，设置为当前线程id
    if (!a) a = tb_thread_self();
}
```





如果运行多个线程的话，上述代码中每个线程的变量a的值，都是不相同的，值为每个线程的id

而 `__declspec(thread)` 用起来也是类似，只需替换下 `__thread`就行了

虽然这两个修饰符用起来很方便，但是需要编译器支持，虽然现在大部分平台的编译器都已支持，但是作为跨平台开发，这样还是不够的

毕竟还是有不少低版本gcc，不一定支持`__thread`，尤其是嵌入式开发领域，交叉编译工具链中的编译器支持力度差异还是蛮大的。。

另外，使用`__thread`进行tls数据维护，需要手动管理相关内存的释放问题，用的不好很容易导致内存泄露。。

#### pthread接口

pthread 的 tls 相关接口，比较完善，并且支持注册free函数，在线程退出的时候，自动释放相关tls数据，避免内存泄露，但是使用上稍显复杂了些

我们看个简单的例子：

```c
// 测试线程中tls变量存储的key，需定义为全局或者static
static pthread_key_t g_local_key = 0;

static tb_void_t tb_thread_local_free(tb_pointer_t priv)  
{  
    tb_trace_i("thread[%lx]: free: %p", tb_thread_self(), priv);
}  
static tb_void_t tb_thread_local_init(tb_void_t)
{
    // 创建tls的key，并且设置自动释放函数
	pthread_key_create(&g_local_key, tb_thread_local_free);
}
static tb_int_t tb_thread_local_test(tb_cpointer_t priv)
{
    // 在所有线程中，仅执行一次，用于在线程内部初始化 tls 的 key
    static pthread_once_t s_once = PTHREAD_ONCE_INIT;
    pthread_once(&s_once, tb_thread_local_init);

    // 尝试读取当前tls数据
    tb_size_t local;
    if (!(local = (tb_size_t)pthread_getspecific(g_local_key)))
    {
        // 设置tls数据为当前线程id
        tb_size_t self = tb_thread_self();
        if (0 == pthread_setspecific(g_local_key, (tb_pointer_t)self))
            local = self;
    }

    return 0;
}
```

看上去复杂了些，但是更加灵活，如果不需要在线程内部创建key的话，就不需要调用`pthread_once`了，直接把创建好的key传入线程内部去访问就好。

#### TlsSetValue 接口

此套接口（TlsSetValue, TlsGetValue, TlsAlloc, TlsFree），属于windows的tls操作接口，当然不能跨平台了，使用起来和pthread的差不多，但是无法注册自动释放函数，并且也没提供类似`pthread_once`的接口
在线程内部自创建key，功能上稍显不足。。

```c
static tb_int_t tb_thread_local_test(tb_cpointer_t priv)
{
    // 创建一个tls的key，注：此处非线程安全，最好放到类似pthread_once提供的init函数中去创建
    // 此处就临时先这么写了，仅仅只是为了方便描述api用法，不要照搬哦。。
    static DWORD s_key = 0;
    if (!s_key) s_key = TlsAlloc();

    // 尝试读取当前tls数据
    DWORD local;
    if (!(local = TlsGetValue(s_key))) 
    {
        // 设置tls数据为当前线程id
        tb_size_t self = tb_thread_self();
        if (TlsSetValue(s_key, (LPVOID)self))
            local = self;
    }

    return 0;
}
```

其实windows上还提供了FlsAlloc, FlsSetValue系列接口，给协程使用，并且支持注册自动释放的回调函数，不过对系统版本有些要求，像xp这些老系统就用不了了。。
这里就不多描述了。

#### tbox提供的`thread_local`接口封装

最近对tbox的tls接口进行了改造，并且重构了实现逻辑，在剪口易用性、功能性以及效率上都得到了很大的提升。。

目前支持以下功能：

* 支持注册自动释放回调，保证在线程退出时，自动释放设置的tls数据
* 支持在线程内部进行线程安全的key创建
* tbox退出时会自动销毁所有创建的key，当然也可以提前主动销毁它

用起来也很方便，很pthread很类似，但是内部自动调用了`pthread_once`，不用想pthread那样显式的去调用它了，例如：

```c
static tb_void_t tb_demo_thread_local_free(tb_cpointer_t priv)
{
    tb_trace_i("thread[%lx]: free: %p", tb_thread_self(), priv);
}
static tb_int_t tb_demo_thread_local_test(tb_cpointer_t priv)
{
    /* 线程安全地初始化一个tls对象，相当于key，并且注册自动free回调
     *
     * 注：虽然所有线程都会执行到这个tb_thread_local_init
     *     但是s_local的tls对象，只会确保初始化一次，内部有类似pthread_once接口来维护
     */
    static tb_thread_local_t s_local = TB_THREAD_LOCAL_INIT;
    if (!tb_thread_local_init(&s_local, tb_demo_thread_local_free)) return -1;

    // 尝试读取当前tls数据
    tb_size_t local;
    if (!(local = (tb_size_t)tb_thread_local_get(&s_local)))
    {
        // 设置tls数据为当前线程id
        tb_size_t self = tb_thread_self();
        if (tb_thread_local_set(&s_local, (tb_cpointer_t)self))
            local = self;
    }

    return 0;
}
```

在线程退出时，它会自动调用free回调，释放对应残留的tls数据，并且在`tb_exit`退出后，销毁所有创建的tls对象

当然你可以可以主动调用：`tb_thread_local_exit(&s_local)` 来销毁它。。

tbox的这套接口，相比pthread减少了一个init的回调函数，比windows那套多了自动释放的机制，并且同时支持跨平台。。

#### 杂谈

之前我看到一些库中，对`__thread`和pthread接口进行了混用，感到很是莫名，个人感觉是有问题的，例如：

```c
static __thread pthread_key_t g_key;
```

原本pthread文档中就明确表述key需要全局或者static存储，而这里加上`__thread`后，其实每个线程访问的key都不是同一个key了哦。。


#### 总结

如果仅仅只是想用来在线程内部存储一些简单的int数据，并且不考虑完备的跨平台支持，那么建议直接使用`__thread`或者`__declspec(thread)`j就行了，非常方便易用

如果要考虑跨平台操作的话，tbox的tls接口也是个不错的选择哦。。
