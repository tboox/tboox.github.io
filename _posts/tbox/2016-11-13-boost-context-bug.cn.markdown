---
layout: post.cn
title:  "记boost协程切换bug发现和分析"
tags: tbox 协程 context boost 
categories: tbox
---

在分析了各大开源协程库实现后，最终选择参考boost.context的汇编实现，来写[tbox](https://github.com/waruqi/tbox)的切换内核。

在这过程中，我对boost各个架构平台下的context切换，都进行了分析和测试。

在macosx i386和mips平台上实现协程切换时，发现boost那套汇编实现是有问题的，如果放到[tbox](https://github.com/waruqi/tbox)切换demo上运行，会直接挂掉。

在分析这两个架构上，boost.context切换实现问题，这边先贴下[tbox](https://github.com/waruqi/tbox)上的context切换demo，方便之后的讲解：






```c
static tb_void_t func1(tb_context_from_t from)
{
    // check
    tb_context_ref_t* contexts = (tb_context_ref_t*)from.priv;
    tb_assert_and_check_return(contexts);

    // 先保存下主函数入口context，方便之后切换回去
    contexts[0] = from.context;

    // 初始化切换到func2
    from.context = contexts[2];

    // loop
    tb_size_t count = 10;
    while (count--)
    {
        // trace
        tb_trace_i("func1: %lu", count);

        // 切换到func2，返回后更新from中的context地址
        from = tb_context_jump(from.context, contexts);
    }

    // 切换回主入口函数
    tb_context_jump(contexts[0], tb_null);
}
static tb_void_t func2(tb_context_from_t from)
{
    // check
    tb_context_ref_t* contexts = (tb_context_ref_t*)from.priv;
    tb_assert_and_check_return(contexts);

    // loop
    tb_size_t count = 10;
    while (count--)
    {
        // trace
        tb_trace_i("func2: %lu", count);

        // 切换到func1，返回后更新from中的context地址
        from = tb_context_jump(from.context, contexts);
    }

    // 切换回主入口函数
    tb_context_jump(contexts[0], tb_null);
}
static tb_void_t test()
{ 
    // 定义全局堆栈
    static tb_context_ref_t contexts[3];
    static tb_byte_t        stacks1[8192];
    static tb_byte_t        stacks2[8192];

    // 生成两个context上下文，绑定对应函数和堆栈
    contexts[1] = tb_context_make(stacks1, sizeof(stacks1), func1);
    contexts[2] = tb_context_make(stacks2, sizeof(stacks2), func2);

    // 切换到func1并传递私有参数：context数组
    tb_context_jump(contexts[1], contexts);
}
```

这里为了测试context切换，直接使用的底层切换接口`tb_context_make`和`tb_context_jump`，所以代码使用上，比较原始。

这两个接口相当于boost的`make_fcontext`和`jump_fcontext`，当然实际应用中，[tbox](https://github.com/waruqi/tbox)的协程库提供了更上层的封装，并不会直接使用这两个接口。

这个demo很简单，就是创建两个context，来回切换，最后结束返回到主函数。

然后再直接尝试使用boost的实现时，出现了两个不同现象的crash

1. macosx i386下，从func2切换回到func1时发生了崩溃
2. mips32下，在执行完10次来回切换后，切回主函数是，发生了崩溃

#### macosx i386下的问题分析

我们先来分析下macosx i386的这个问题，由于之前[tbox](https://github.com/waruqi/tbox)已经参考了boost的linux i386下的实现，完成了上下文切换，是能正常运行的。

因此，可以在这两个平台下做下对比，结果发现，boost几乎是直接照搬了linux下那套实现，那么问题来了，为甚了linux下ok，macosx上就有问题呢。

大体可以猜到，应该是调用栈布局的不同导致的问题，因此我们看下macosx上的boost jump实现：

```
.text
.globl _jump_fcontext
.align 2
_jump_fcontext:
    pushl  %ebp  /* save EBP */
    pushl  %ebx  /* save EBX */
    pushl  %esi  /* save ESI */
    pushl  %edi  /* save EDI */

    /* store fcontext_t in ECX */
    movl  %esp, %ecx

    /* first arg of jump_fcontext() == context jumping to */
    movl  0x18(%esp), %eax

    /* second arg of jump_fcontext() == data to be transferred */
    movl  0x1c(%esp), %edx

    /* restore ESP (pointing to context-data) from EAX */
    movl  %eax, %esp

    /* address of returned transport_t */
    movl 0x14(%esp), %eax
    /* return parent fcontext_t */
    movl  %ecx, (%eax)
    /* return data */
    movl %edx, 0x4(%eax)

    popl  %edi  /* restore EDI */
    popl  %esi  /* restore ESI */
    popl  %ebx  /* restore EBX */
    popl  %ebp  /* restore EBP */

    /* jump to context */
    ret $4
```

`jump_fcontext`的参数原型是：`struct(context, data) = jump_fcontext(context, data)`，跟[tbox](https://github.com/waruqi/tbox)的`tb_context_jump`差不多

都是传入一个struct，相当于传入了两个参数，一个context，一个data，返回结果也是一个类似struct

而从上面的代码中可以看到，从esp + 0x18处取了第一个参数context，esp + 0x1c取得是第二个参数data，换算到_jump_fcontext的入口处

可以确定出_jump_fcontext入口处大体的栈布局：


```
esp + 12: data参数
esp + 8:  context参数
esp + 4:  ??
esp    :  _jump_fcontext的返回地址
```

按照i386的调用栈布局，函数入口处第一个参数，应该是通过 esp + 4 访问的，那为什么context参数却是在esp + 8处呢，esp + 4指向的内容又是什么？

我们可以看下，_jump_fcontext调用处的汇编伪代码：

```
pushl data
pushl context 
pushl hidden 
call _jump_fcontext
addl $12, %esp
```
其实编译器在调用_jump_fcontext处，实际压入了三个参数，这个esp + 4指向的hidden数据，这个是_jump_fcontext返回的struct数据的栈空间地址

用于在_jump_fcontext内部，设置返回struct(context, data)的数据，也就是：

```
/* address of returned transport_t */
movl 0x14(%esp), %eax
/* return parent fcontext_t */
movl %ecx, (%eax)
/* return data */
movl %edx, 0x4(%eax)
```

说白了，linux i386上返回struct数据，是通过传入一个指向栈空间的变量指针，作为隐藏的第一个参数，用于设置struct数据返回。

而boost在macosx i386上，也直接照搬了这种布局来实现，那macosx上是否真的也是这么做的呢？

我们来写个测试程序验证下：

```c
static tb_context_from_t test()
{
    tb_context_from_t from = {0};
    return from;
}
```

反汇编后的结果如下：


```
__text:00051BD0 _test           proc near               
__text:00051BD0
__text:00051BD0 var_10          = dword ptr -10h
__text:00051BD0 var_C           = dword ptr -0Ch
__text:00051BD0 var_8           = dword ptr -8
__text:00051BD0 var_4           = dword ptr -4
__text:00051BD0
__text:00051BD0                 push    ebp
__text:00051BD1                 mov     ebp, esp
__text:00051BD3                 sub     esp, 10h
__text:00051BD6                 mov     [ebp+var_C], 0
__text:00051BDD                 mov     [ebp+var_10], 0
__text:00051BE4                 mov     [ebp+var_4], 0
__text:00051BEB                 mov     [ebp+var_8], 0
__text:00051BF2                 mov     eax, [ebp+var_8]
__text:00051BF5                 mov     edx, [ebp+var_4]
__text:00051BF8                 add     esp, 10h
__text:00051BFB                 pop     ebp
__text:00051BFC                 retn
__text:00051BFC _test           endp
```

可以看到，实际上并没有像linux上那样通过一个struct指针来返回，而是直接将struct(context, data)，通过 eax, edx 进行返回。

到这里，我们大概可以猜到，macosx上，对这种小的struct结构体返回做了优化，直接放置在了eax，edx中，而我们的from结构体只有两个pointer，正好满足这种方式。

因此，为了修复macosx上的问题，[tbox](https://github.com/waruqi/tbox)在实现上，对栈布局做了调整，并且做了些额外的优化：

```
1. 调整jump实现，改用eax，edx直接返回from结构体
2. 由于不再像linux那样通过保留一个额外的栈空间返回struct，可以把linux那种跳板实现去掉，改为直接jump到实际位置（提升切换效率）
```


#### mips32下的问题分析

mips下这个问题，我之前也是调试了很久，在每次切换完成后，打算切换回主函数时，就会发生crash，也就是下面这个位置：

```c
static tb_void_t func1(tb_context_from_t from)
{
    // check
    tb_context_ref_t* contexts = (tb_context_ref_t*)from.priv;
    tb_assert_and_check_return(contexts);

    // 先保存下主函数入口context，方便之后切换回去
    contexts[0] = from.context;

    // 初始化切换到func2
    from.context = contexts[2];

    // loop
    tb_size_t count = 10;
    while (count--)
    {
        // trace
        tb_trace_i("func1: %lu", count);

        // 切换到func2，返回后更新from中的context地址
        from = tb_context_jump(from.context, contexts);
    }

    // 切换回主入口函数
    tb_context_jump(contexts[0], tb_null);   <-----  此处发生崩溃
}
```

我们先来初步分析下，既然之前的来回切换都是ok的，只有在最后这个切换发生问题，那么可以确定jump的大体实现应该还是ok的

可能是传入jump的参数不对导致的问题，最有可能的是 contexts[0] 指向的主函数上下文地址已经不对了。

通过printf确认，确实值不对了，那么在func1入口处这个contexts[0]，是否正确呢，我又继续printf了下，居然还是不对。 = =

然后，我又继续打印`contexts[0], contexts[1], contexts[2]`这三个在func1入口处的值，发现只有contexts[2]是对的

前两处都不对了，而且值得注意的是，这两个的值，正好是from.context和from.data的值。

由此，可以得出一个初步结论：

```
1. contexts这块buffer的前两处数据，在jump切换到func1的时候被自动改写了
2. 而且改写后的数据值，正好是from里面的context和data
```

说白了，也就是发生越界了。。

那什么情况下, contexts指向的数据会发生越界呢，可以先看下contexts的定义：

```c
static tb_void_t test()
{ 
    // 定义全局堆栈
    static tb_context_ref_t contexts[3];
    static tb_byte_t        stacks1[8192];
    static tb_byte_t        stacks2[8192];

    // 生成两个context上下文，绑定对应函数和堆栈
    contexts[1] = tb_context_make(stacks1, sizeof(stacks1), func1);
    contexts[2] = tb_context_make(stacks2, sizeof(stacks2), func2);

    // 切换到func1并传递私有参数：context数组
    tb_context_jump(contexts[1], contexts);
}
```

contexts[3]的数据定义，正好在stacks1的上面，而stacks1是作为func1的堆栈传入的，也就是说，如果func1的堆栈发生上溢，就会擦掉contexts里面的数据。

我们接着来看下，boost的实现，看看是否有地方会发生这种情况：

```
.text
.globl make_fcontext
.align 2
.type make_fcontext,@function
.ent make_fcontext
make_fcontext:
#ifdef __PIC__
.set    noreorder
.cpload $t9
.set    reorder
#endif
    # first arg of make_fcontext() == top address of context-stack
    move $v0, $a0

    # shift address in A0 to lower 16 byte boundary
    move $v1, $v0
    li $v0, -16 # 0xfffffffffffffff0
    and $v0, $v1, $v0

    # reserve space for context-data on context-stack
    # including 48 byte of shadow space (sp % 16 == 0)
    addiu $v0, $v0, -112

    # third arg of make_fcontext() == address of context-function
    sw  $a2, 44($v0)
    # save global pointer in context-data
    sw  $gp, 48($v0)

    # compute address of returned transfer_t
    addiu $t0, $v0, 52
    sw  $t0, 36($v0)

    # compute abs address of label finish
    la  $t9, finish
    # save address of finish as return-address for context-function
    # will be entered after context-function returns
    sw  $t9, 40($v0)

    jr  $ra # return pointer to context-data

finish:
    lw $gp, 0($sp)
    # allocate stack space (contains shadow space for subroutines)
    addiu  $sp, $sp, -32
    # save return address
    sw  $ra, 28($sp)

    # restore GP (global pointer)
#    move  $gp, $s1
    # exit code is zero
    move  $a0, $zero
    # address of exit
    lw  $t9, %call16(_exit)($gp)
    # exit application
    jalr  $t9
.end make_fcontext
.size make_fcontext, .-make_fcontext

.text
.globl jump_fcontext
.align 2
.type jump_fcontext,@function
.ent jump_fcontext
jump_fcontext:
    # reserve space on stack
    addiu $sp, $sp, -112

    sw  $s0, ($sp)  # save S0
    sw  $s1, 4($sp)  # save S1
    sw  $s2, 8($sp)  # save S2
    sw  $s3, 12($sp)  # save S3
    sw  $s4, 16($sp)  # save S4
    sw  $s5, 20($sp)  # save S5
    sw  $s6, 24($sp)  # save S6
    sw  $s7, 28($sp)  # save S7
    sw  $fp, 32($sp)  # save FP
    sw  $a0, 36($sp)  # save hidden, address of returned transfer_t
    sw  $ra, 40($sp)  # save RA
    sw  $ra, 44($sp)  # save RA as PC

    # store SP (pointing to context-data) in A0
    move  $a0, $sp

    # restore SP (pointing to context-data) from A1
    move  $sp, $a1

    lw  $s0, ($sp)  # restore S0
    lw  $s1, 4($sp)  # restore S1
    lw  $s2, 8($sp)  # restore S2
    lw  $s3, 12($sp)  # restore S3
    lw  $s4, 16($sp)  # restore S4
    lw  $s5, 20($sp)  # restore S5
    lw  $s6, 24($sp)  # restore S6
    lw  $s7, 28($sp)  # restore S7
    lw  $fp, 32($sp)  # restore FP
    lw  $t0, 36($sp)  # restore hidden, address of returned transfer_t
    lw  $ra, 40($sp)  # restore RA

    # load PC
    lw  $t9, 44($sp)

    # adjust stack
    addiu $sp, $sp, 112
    
    # return transfer_t from jump
    sw  $a0, ($t0)  # fctx of transfer_t
    sw  $a1, 4($t0) # data of transfer_t
    # pass transfer_t as first arg in context function
    # A0 == fctx, A1 == data
    move  $a1, $a2 

    # jump to context
    jr  $t9
.end jump_fcontext
.size jump_fcontext, .-jump_fcontext
```

可以看到，boost在make_fcontext的时候，先对传入的栈顶做了16字节的对齐，然后保留了112字节的空间，用于保存寄存器数据。

然后再jump切换到新context的时候，恢复了新context所需的寄存器，并把新的sp指针+112，把保留的栈空间给pop了。

```
也就是说，在第一次切换到实际func1函数入口时，这个时候的栈指针指向栈顶的，再往上，已经没有多少空间了（也就只有为了16字节对齐，有可能保留的少部分空间）。

换一句话说，如果传入的stack1的栈顶本身就是16字节对齐的，那么func1的入口处sp指向的就是stack1的栈顶

如果在func1的入口处，有超过stack1栈顶范围的写操作，就有可能会擦掉contexts的数据，因为contexts紧靠着stack1的栈顶位置。
```

那是否会出现这种情况，我们通过反汇编func1的入口处代码，实际看下：

```
.text:00453F04 func1:     
.text:00453F04
.text:00453F04 var_30          = -0x30
.text:00453F04 var_2C          = -0x2C
.text:00453F04 var_28          = -0x28
.text:00453F04 var_20          = -0x20
.text:00453F04 var_18          = -0x18
.text:00453F04 var_14          = -0x14
.text:00453F04 var_10          = -0x10
.text:00453F04 var_8           = -8
.text:00453F04 var_4           = -4
.text:00453F04 arg_0           =  0
.text:00453F04 arg_4           =  4
.text:00453F04
.text:00453F04                 addiu   $sp, -0x40
.text:00453F08                 sw      $ra, 0x40+var_4($sp)
.text:00453F0C                 sw      $fp, 0x40+var_8($sp)
.text:00453F10                 move    $fp, $sp
.text:00453F14                 la      $gp, unk_5706A0
.text:00453F1C                 sw      $gp, 0x40+var_20($sp)
.text:00453F20                 sw      $a0, 0x40+arg_0($fp)    <------------ 此处发生越界，改写了contexts[0] = from.context
.text:00453F24                 sw      $a1, 0x40+arg_4($fp)    <------------ 此处发生越界，改写了contexts[1] = from.data
.text:00453F28                 lw      $v0, 0x40+arg_4($fp)
.text:00453F2C                 sw      $v0, 0x40+var_14($fp)
.text:00453F30                 lw      $v0, 0x40+var_14($fp)
.text:00453F34                 sltu    $v0, $zero, $v0
.text:00453F38                 andi    $v0, 0xFF
.text:00453F3C                 move    $v1, $v0
```

可以看到，确实发生了越界行为，那为什么在函数内部，还会去写当前栈帧外的数据呢，这个要从mips的调用栈布局上说起了。

简单来说，mips在调用某个函数时，会把a0-a3作为参数寄存器，其他参数放置在堆栈中，但是与其他架构有点不同的是：

```
mips还会去为a0-a3这前四个参数，保留栈空间
```

调用栈如下：

```
 ------------
| other args |
|------------|
|   a0-a3    | <- 参数传递使用a0-a3，但是还是会为这四个参数保留栈空间出来
|------------|
|     ra     | <- 返回地址
|------------|
| fp gp s0-7 | <- 保存的一些其他寄存器
|------------|
|   locals   |
 ------------
```

而刚刚在func1内，就是回写了`a0-a3`处保留的栈空间，导致了越界，因为boost的实现在jump后，栈空间已经到栈顶了，空间不够了。。

因此，为了修复这个问题，只需要在`make_fcontext`里面，多保留`a0-a3`这32字节的空间就行了，也就是：

```
.globl make_fcontext

    # reserve space for context-data on context-stack
    # including 48 byte of shadow space (sp % 16 == 0)
#    addiu $v0, $v0, -112
    addiu $v0, $v0, -146
```

而在[tbox](https://github.com/waruqi/tbox)内，除了对此处的额外的栈空间保留，来修复此问题，还对栈数据进行了更加合理的分配利用，不再需要保留146这么多字节数

只需要保留96字节，就够用了，节省了50个字节，如果同时存在1024个协程的话，相当于节省了50K的内存数据。

并且boost的jump实现上，还有其他两处问题，[tbox](https://github.com/waruqi/tbox)里面一并修复了：

```
jump_fcontext:
    # reserve space on stack
    addiu $sp, $sp, -112

    sw  $s0, ($sp)  # save S0
    sw  $s1, 4($sp)  # save S1
    sw  $s2, 8($sp)  # save S2
    sw  $s3, 12($sp)  # save S3
    sw  $s4, 16($sp)  # save S4
    sw  $s5, 20($sp)  # save S5
    sw  $s6, 24($sp)  # save S6
    sw  $s7, 28($sp)  # save S7
    sw  $fp, 32($sp)  # save FP
    sw  $a0, 36($sp)  # save hidden, address of returned transfer_t
    sw  $ra, 40($sp)  # save RA
    sw  $ra, 44($sp)  # save RA as PC
                      <-------------------- 此处boost虽然为gp保留了48($sp)空间，但是确没去保存gp寄存器

    # store SP (pointing to context-data) in A0
    move  $a0, $sp

    # restore SP (pointing to context-data) from A1
    move  $sp, $a1

    lw  $s0, ($sp)  # restore S0
    lw  $s1, 4($sp)  # restore S1
    lw  $s2, 8($sp)  # restore S2
    lw  $s3, 12($sp)  # restore S3
    lw  $s4, 16($sp)  # restore S4
    lw  $s5, 20($sp)  # restore S5
    lw  $s6, 24($sp)  # restore S6
    lw  $s7, 28($sp)  # restore S7
    lw  $fp, 32($sp)  # restore FP
    lw  $t0, 36($sp)  # restore hidden, address of returned transfer_t
    lw  $ra, 40($sp)  # restore RA
                      <-------------------- 此处boost也没去恢复gp寄存器

    # load PC
    lw  $t9, 44($sp)

    # adjust stack
    addiu $sp, $sp, 112
    
    # return transfer_t from jump
    sw  $a0, ($t0)  # fctx of transfer_t
    sw  $a1, 4($t0) # data of transfer_t  <------------- 此处应该使用 a2 而不是 a1 
    # pass transfer_t as first arg in context function
    # A0 == fctx, A1 == data
    move  $a1, $a2 

    # jump to context
    jr  $t9
.end jump_fcontext
```

最后说一下，本文是针对boost 1.62.0 版本做的分析，如有不对之处，欢迎指正哈。。
