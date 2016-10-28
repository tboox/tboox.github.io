---
layout: post.cn
title:  "协程分析之context上下文切换"
tags: tbox 协程 ucontext boost libtask
categories: tbox
---

协程现在已经不是个新东西了，很多语言都提供了原生支持，也有很多开源的库也提供了协程支持。

最近为了要给[tbox](https://github.com/waruqi/tbox)增加协程，特地研究了下各大开源协程库的实现，例如：libtask, libmill, boost, libco, libgo等等。

他们都属于stackfull协程，每个协程有完整的私有堆栈，里面的核心就是上下文切换(context)，而stackless的协程，比较出名的有protothreads，这个比较另类，有兴趣的同学可以去看下源码，这里就不多说了。

那么现有协程库，是怎么去实现context切换的呢，目前主要有以下几种方式：

1. 使用ucontext系列接口，例如：libtask
2. 使用setjmp/longjmp接口，例如：libmill
3. 使用boost.context，纯汇编实现，内部实现机制跟ucontext完全不同，效率非常高，后面会细讲，tbox最后也是基于此实现
4. 使用windows的GetThreadContext/SetThreadContext接口
5. 使用windows的CreateFiber/ConvertThreadToFiber/SwitchToFiber接口

各个协程协程库的切换效率的基准测试，可以参考：[切换效率基准测试报告](/cn/2016/10/28/benchbox-coroutine/)

#### ucontext接口

要研究ucontext，其实只要看下libtask的实现就行了，非常经典，这套接口其实效率并不是很高，而且很多平台已经标记为废弃接口了（像macosx），目前主要是在linux下使用

libtask里面对不提供此接口的平台，进行了汇编实现，已达到跨平台的目的，

ucontext相关接口，主要有如下四个：

* getcontext：获取当前context
* setcontext：切换到指定context
* makecontext: 用于将一个新函数和堆栈，绑定到指定context中
* swapcontext：保存当前context，并且切换到指定context






下面给个简单的例子：

```c
#include <stdio.h>
#include <ucontext.h>

static ucontext_t ctx[3];

static void func1(void)
{
    // 切换到func2
    swapcontext(&ctx[1], &ctx[2]);

    // 返回后，切换到ctx[1].uc_link，也就是main的swapcontext返回处
}
static void func2(void)
{
    // 切换到func1
    swapcontext(&ctx[2], &ctx[1]);

    // 返回后，切换到ctx[2].uc_link，也就是func1的swapcontext返回处
}

int main (void)
{
    // 初始化context1，绑定函数func1和堆栈stack1
    char stack1[8192];
    getcontext(&ctx[1]);
    ctx[1].uc_stack.ss_sp   = stack1;
    ctx[1].uc_stack.ss_size = sizeof(stack1);
    ctx[1].uc_link = &ctx[0];
    makecontext(&ctx[1], func1, 0);

    // 初始化context2，绑定函数func2和堆栈stack2
    char stack2[8192];
    getcontext(&ctx[2]);
    ctx[2].uc_stack.ss_sp   = stack2;
    ctx[2].uc_stack.ss_size = sizeof(stack1);
    ctx[2].uc_link = &ctx[1];
    makecontext(&ctx[2], func2, 0);

    // 保存当前context，然后切换到context2上去，也就是func2
    swapcontext(&ctx[0], &ctx[2]);
    return 0;
}
```

那这套接口的实现原理是什么呢，我们可以拿libtask的arm汇编实现，来看下，其他平台也类似。

```c

/* get mcontext
 *
 * @param mcontext      r0
 *
 * @return              r0
 */
.globl getmcontext
getmcontext:

    /* 保存所有当前寄存器，包括sp和lr */
    str r1, [r0, #4]        // mcontext.mc_r1 = r1
    str r2, [r0, #8]        // mcontext.mc_r2 = r2
    str r3, [r0, #12]       // mcontext.mc_r3 = r3
    str r4, [r0, #16]       // mcontext.mc_r4 = r4
    str r5, [r0, #20]       // mcontext.mc_r5 = r5
    str r6, [r0, #24]       // mcontext.mc_r6 = r6
    str r7, [r0, #28]       // mcontext.mc_r7 = r7
    str r8, [r0, #32]       // mcontext.mc_r8 = r8
    str r9, [r0, #36]       // mcontext.mc_r9 = r9
    str r10, [r0, #40]      // mcontext.mc_r10 = r10
    str r11, [r0, #44]      // mcontext.mc_fp = r11
    str r12, [r0, #48]      // mcontext.mc_ip = r12
    str r13, [r0, #52]      // mcontext.mc_sp = r13
    str r14, [r0, #56]      // mcontext.mc_lr = r14

    // 设置从setcontext切换回getcontext后，从getcontext返回的值为1
    mov r1, #1              /* mcontext.mc_r0 = 1
                             * 
                             * if (getcontext(ctx) == 0) 
                             *      setcontext(ctx);
                             *
                             * getcontext() will return 1 after calling setcontext()
                             */
    str r1, [r0]

    // 返回0
    mov r0, #0              // return 0
    mov pc, lr

/* set mcontext
 *
 * @param mcontext      r0
 */
.globl setmcontext
setmcontext:

    // 恢复指定context的所有寄存器，包括sp和lr
    ldr r1, [r0, #4]        // r1 = mcontext.mc_r1
    ldr r2, [r0, #8]        // r2 = mcontext.mc_r2
    ldr r3, [r0, #12]       // r3 = mcontext.mc_r3
    ldr r4, [r0, #16]       // r4 = mcontext.mc_r4
    ldr r5, [r0, #20]       // r5 = mcontext.mc_r5
    ldr r6, [r0, #24]       // r6 = mcontext.mc_r6
    ldr r7, [r0, #28]       // r7 = mcontext.mc_r7
    ldr r8, [r0, #32]       // r8 = mcontext.mc_r8
    ldr r9, [r0, #36]       // r9 = mcontext.mc_r9
    ldr r10, [r0, #40]      // r10 = mcontext.mc_r10
    ldr r11, [r0, #44]      // r11 = mcontext.mc_fp
    ldr r12, [r0, #48]      // r12 = mcontext.mc_ip
    ldr r13, [r0, #52]      // r13 = mcontext.mc_sp
    ldr r14, [r0, #56]      // r14 = mcontext.mc_lr

    // 设置getcontext的返回值
    ldr r0, [r0]            // r0 = mcontext.mc_r0

    // 切换到getcontext的返回处，继续执行
    mov pc, lr              // return
```

其实说白了，就是对寄存器进行保存和恢复的过程，切换原理很简单

然后外面只需要用宏包裹下，就行了：

```c
#define setcontext(u)   setmcontext(&(u)->uc_mcontext)
#define getcontext(u)   getmcontext(&(u)->uc_mcontext)
```

而对于makecontext，主要的工作就是设置 函数指针 和 堆栈 到对应context保存的sp和pc寄存器中，这也就是为什么makecontext调用前，必须要先getcontext下的原因。


```c
void makecontext(ucontext_t *uc, void (*fn)(void), int argc, ...)
{
    int i, *sp;
    va_list arg;
    
    // 将函数参数陆续设置到r0, r1，r2 .. 等参数寄存器中
    sp = (int*)uc->uc_stack.ss_sp + uc->uc_stack.ss_size / 4;
    va_start(arg, argc);
    for(i=0; i<4 && i<argc; i++)
        uc->uc_mcontext.gregs[i] = va_arg(arg, uint);
    va_end(arg);

    // 设置堆栈指针到sp寄存器
    uc->uc_mcontext.gregs[13] = (uint)sp;

    // 设置函数指针到lr寄存器，切换时会设置到pc寄存器中进行跳转到fn
    uc->uc_mcontext.gregs[14] = (uint)fn;
}
```

这套接口简单有效，不支持的平台还可以通过汇编实现来支持，看上去已经很完美了，但是确有个问题，就是效率不高，因为每次切换保存和恢复的寄存器太多。

之后可以看下boost.context的实现，就可以对比出来了，下面先简单讲讲setjmp的切换。。


#### setjmp/longjmp接口

libmill里面的切换主要用的就是此套接口，其实应该是sigsetjmp/siglongjmp，不仅保存了寄存器，还保存了signal mask。。

通过[切换效率基准测试报告](/cn/2016/10/28/benchbox-coroutine/)，可以看到libmill在x86_64架构上，切换非常的快

其实是因为针对这个平台，libmill没有使用原生sigsetjmp/siglongjmp接口，而是自己汇编实现了一套，做了些优化，并且去掉了signal mask的保存。

```c
#if defined(__x86_64__)
#if defined(__AVX__)
#define MILL_CLOBBER \
        , "ymm0", "ymm1", "ymm2", "ymm3", "ymm4", "ymm5", "ymm6", "ymm7",\
        "ymm8", "ymm9", "ymm10", "ymm11", "ymm12", "ymm13", "ymm14", "ymm15"
#else
#define MILL_CLOBBER
#endif
#define mill_setjmp_(ctx) ({\
    int ret;\
    asm("lea     LJMPRET%=(%%rip), %%rcx\n\t"\
        "xor     %%rax, %%rax\n\t"\
        "mov     %%rbx, (%%rdx)\n\t"\
        "mov     %%rbp, 8(%%rdx)\n\t"\
        "mov     %%r12, 16(%%rdx)\n\t"\
        "mov     %%rsp, 24(%%rdx)\n\t"\
        "mov     %%r13, 32(%%rdx)\n\t"\
        "mov     %%r14, 40(%%rdx)\n\t"\
        "mov     %%r15, 48(%%rdx)\n\t"\
        "mov     %%rcx, 56(%%rdx)\n\t"\
        "mov     %%rdi, 64(%%rdx)\n\t"\
        "mov     %%rsi, 72(%%rdx)\n\t"\
        "LJMPRET%=:\n\t"\
        : "=a" (ret)\
        : "d" (ctx)\
        : "memory", "rcx", "r8", "r9", "r10", "r11",\
          "xmm0", "xmm1", "xmm2", "xmm3", "xmm4", "xmm5", "xmm6", "xmm7",\
          "xmm8", "xmm9", "xmm10", "xmm11", "xmm12", "xmm13", "xmm14", "xmm15"\
          MILL_CLOBBER\
          );\
    ret;\
})
#define mill_longjmp_(ctx) \
    asm("movq   (%%rax), %%rbx\n\t"\
        "movq   8(%%rax), %%rbp\n\t"\
        "movq   16(%%rax), %%r12\n\t"\
        "movq   24(%%rax), %%rdx\n\t"\
        "movq   32(%%rax), %%r13\n\t"\
        "movq   40(%%rax), %%r14\n\t"\
        "mov    %%rdx, %%rsp\n\t"\
        "movq   48(%%rax), %%r15\n\t"\
        "movq   56(%%rax), %%rdx\n\t"\
        "movq   64(%%rax), %%rdi\n\t"\
        "movq   72(%%rax), %%rsi\n\t"\
        "jmp    *%%rdx\n\t"\
        : : "a" (ctx) : "rdx" \
    )
#else
#define mill_setjmp_(ctx) \
    sigsetjmp(*ctx, 0)
#define mill_longjmp_(ctx) \
    siglongjmp(*ctx, 1)
#endif
```

经过测试分析，其实libc自带的sigsetjmp/siglongjmp在不同平台下，效率上表现差异很大，而且切换也比setjmp/longjmp的慢了不少

所以libmill除了优化过的x86_64平台，在其他arch上切换效果并不是很理想，完全依赖libc的实现效率。。

因此后来再封装tbox的协程库的时候，并没有考虑此方案。


#### windows的GetThreadContext/SetThreadContext接口

这套接口，我之前用来封装setcontext/getcontext的时候，也实现并测试过，效果非常不理想，非常的慢，比用libtask那套纯汇编的实现慢了10倍左右，直接放弃了

不过这套接口用起来还是很方便，跟ucontext类似，完全可以用来模拟封装成ucontext的使用方式，例如：

```c

// getcontext
GetThreadContext(GetCurrentThread(), mcontext);

// setcontext
SetThreadContext(GetCurrentThread(), mcontext);
```

而makecontext，我贴下之前写的一些实现，不过现在已经废弃了，仅供参考：

```c
tb_bool_t makecontext(tb_context_ref_t context, tb_pointer_t stack, tb_size_t stacksize, tb_context_func_t func, tb_cpointer_t priv)
{
    // check
    LPCONTEXT mcontext = (LPCONTEXT)context;
    tb_assert_and_check_return_val(mcontext && stack && stacksize && func, tb_false);

    // make stack address
    tb_long_t* sp = (tb_long_t*)stack + stacksize / sizeof(tb_long_t);

    // push arguments
    tb_uint64_t value = tb_p2u64(priv);
    *--sp = (tb_long_t)(tb_uint32_t)(value);
    *--sp = (tb_long_t)(tb_uint32_t)(value >> 32);

    // push return address(unused, only reverse the stack space)
    *--sp = 0;

    /* save function and stack address
     *
     * sp + 8:  arg2
     * sp + 4:  arg1                         
     * sp:      return address(0)   => esp 
     */
    mcontext->Eip = (tb_long_t)func;
    mcontext->Esp = (tb_long_t)sp;
    tb_assert_static(sizeof(tb_long_t) == 4);

    // save and restore the full machine context 
    mcontext->ContextFlags = CONTEXT_FULL;

    // ok
    return tb_true;
}
```

原理跟libtask的那个类似，就是修改esp和eip寄存器而已，具体实现可以参考我之前的[commit](https://github.com/waruqi/tbox/blob/2e5f3ebab1859e394f45b261afe5dcfbf6a48bfc/src/tbox/platform/windows/context.c)

#### windows的fibers接口

这套接口，目前还没测试过，不过看msdn介绍，使用还是很方便的，不过部分xp系统上，并不提供此接口，需要较高版本的系统支持

因此为了考虑跨平台，tbox暂时没去考虑使用，有兴趣的同学可以研究下。

#### boost.context

其实一开始tbox是参考libtask的ucontext汇编实现，封装了一套context切换，当时其实已经封装的差不多了，但是后来做[benchbox](https://github.com/waruqi/benchbox)的基准测试

把boost的切换一对比，直接就被秒杀了，哎。。然后去看boost的context实现源码，虽然对boost本身并不是太喜欢，但是底层的context是实现，确实非常精妙，不得不佩服。

它主要有两个接口，一个`make_fcontext()`，一个`jump_fcontext()`，我在tbox的平台库里面参考其实现，进行了封装，使用方式跟boost类似，因此直接以tbox的使用为例：

```c
static tb_void_t func1(tb_context_from_t from)
{
    // 获取切换时传入的contexts参数
    tb_context_ref_t* contexts = (tb_context_ref_t*)from.priv;

    // 保存原始context
    contexts[0] = from.context;

    // 切换到func2
    from = tb_context_jump(contexts[2], contexts);

    // 从func2返回后，切换回main
    tb_context_jump(contexts[0], tb_null);
}
static tb_void_t func2(tb_context_from_t from)
{
    // 获取切换时传入的contexts参数
    tb_context_ref_t* contexts = (tb_context_ref_t*)from.priv;

    // 切换到func1
    from = tb_context_jump(from.context, contexts);

    // 从func1返回后，切换回main
    tb_context_jump(contexts[0], tb_null);
}

int main(int argc, char** argv)
{
    // the stacks
    static tb_context_ref_t contexts[3];
    static tb_byte_t        stacks1[8192];
    static tb_byte_t        stacks2[8192];

    // 通过stack1和func1生成context1
    contexts[1] = tb_context_make(stacks1, sizeof(stacks1), func1);

    // 通过stack2和func2生成context2
    contexts[2] = tb_context_make(stacks2, sizeof(stacks2), func2);

    // 切换到func1，并且传入contexts作为参数
    tb_context_jump(contexts[1], contexts);
}
```

其中`tb_context_make`相当于boost的`make_fcontext`, `tb_context_jump`相当于boost的`jump_fcontext`


相比ucontext，boost的切换模式，少了单独对context进行保存(getcontext)和切换(setcontext)过程，而是把两者合并到一起，通过jump_fcontext接口实现直接切换。

这样做有个好处，就是更加容易进行优化，使得整个切换过程更加的紧凑，我们先来看下macosx平台x86_64的实现，这个比较简单易懂些。。

这里我就直接贴tbox的代码了，实现差不多的，只不过多了些注释而已。

```c
/* make context (refer to boost.context)
 *
 *             -------------------------------------------------------------------------------
 * stackdata: |                                                |         context        |||||||
 *             -------------------------------------------------------------------------|-----
 *                                                                             (16-align for macosx)
 *
 *
 *             -------------------------------------------------------------------------------
 * context:   |   r12   |   r13   |   r14   |   r15   |   rbx   |   rbp   |   rip   |   end   | ...
 *             -------------------------------------------------------------------------------
 *            0         8         16        24        32        40        48        56        |
 *                                                                                  |  16-align for macosx
 *                                                                                  |
 *                                                                       esp when jump to function
 *
 * @param stackdata     the stack data (rdi)
 * @param stacksize     the stack size (rsi)
 * @param func          the entry function (rdx)
 *
 * @return              the context pointer (rax)
 */
function(tb_context_make)

    // 保存栈顶指针到rax
    addq %rsi, %rdi
    movq %rdi, %rax

    /* 先对栈指针进行16字节对齐
     *
     *                      
     *             ------------------------------
     * context:   | retaddr |    padding ...     |
     *             ------------------------------
     *            |         | 
     *            |     此处16字节对齐
     *            |
     *  esp到此处时，会进行ret
     *
     * 这么做，主要是因为macosx下，对调用栈布局进行了优化，在保存调用函数返回地址的堆栈处，需要进行16字节对齐，方便利用SIMD进行优化
     */
    movabs $-16, %r8
    andq %r8, %rax

    // 保留context需要的一些空间，因为context和stack是在一起的，stack底指针就是context
    leaq -64(%rax), %rax

    // 保存func函数地址到context.rip
    movq %rdx, 48(%rax)

    /* 保存__end地址到context.end，如果在在func返回时，没有指定jump切换到有效context
     * 那么会继续会执行到此处，程序也就退出了
     */
    leaq __end(%rip), %rcx
    movq %rcx, 56(%rax)

    // 返回rax指向的栈底指针，作为context返回
    ret 

__end:
    // exit(0)
    xorq %rdi, %rdi
#ifdef TB_ARCH_ELF
    call _exit@PLT
#else
    call __exit
#endif
    hlt

endfunc

/* jump context (refer to boost.context)
 *
 * @param context       the to-context (rdi)
 * @param priv          the passed user private data (rsi)
 *
 * @return              the from-context (context: rax, priv: rdx)
 */
function(tb_context_jump)

    // 保存寄存器，并且按布局构造成当前context，包括jump()自身的返回地址retaddr(rip)
    pushq %rbp
    pushq %rbx
    pushq %r15
    pushq %r14
    pushq %r13
    pushq %r12

    // 保存当前栈基址rsp，也就是contex，到rax中
    movq %rsp, %rax

    // 切换到指定的新context上去，也就是切换堆栈
    movq %rdi, %rsp

    // 然后按context上的栈布局依次恢复寄存器
    popq %r12
    popq %r13
    popq %r14
    popq %r15
    popq %rbx
    popq %rbp

    // 获取context.rip，也就是make时候指定的func函数地址，或者是对方context中jump()调用的返回地址
    popq %r8

    // 设置返回值(from.context: rax, from.priv: rdx)，也就是来自对方jump()的context和传递参数
    movq %rsi, %rdx

    // 传递当前(context: rax, priv: rdx)，作为function(from)函数调用的入口参数
    movq %rax, %rdi

    /* 跳转切换到make时候指定的func函数地址，或者是对方context中jump()调用的返回地址
     *
     * 切换过去后，此时的栈布局如下：
     *
     * end是func的返回地址，也就是exit
     *
     *             -------------------------------
     * context: .. |   end   | args | padding ... |
     *             -------------------------------
     *             0             8        
     *             |             |  
     *            rsp   16-align for macosx
     */
    jmp *%r8

endfunc
```

关于apple栈布局16字节对齐优化问题，可以参考：[http://fabiensanglard.net/macosxassembly/index.php](http://fabiensanglard.net/macosxassembly/index.php)

借用下里面的图哈，可以看下：

![macosx_stack](/static/img/tbox/macosx_stack.png)

boost的context和stack是一起的，栈底指针就是context，设计非常巧妙，切换context就是切换stack，一举两得，但是这样每次切换就必须更新context

因为每次切换context后，context地址都会变掉。

```c
// 切换返回时，需要更新from.context的地址
from = tb_context_jump(from.context, contexts);
```

现在可以和getcontext/setcontext对比下，就可以看出，这种切换方式的一些优势：

```
1. 保存和恢复寄存器数据，在一个切换接口中，更加容易进行优化
2. 通过stack基栈作为context，切换栈相当于切换了context，一举两得，指令数更少
3. 通过push/pop操作保存寄存器，比mov等方式指令字节数更少，更加精简
4. 对参数、可变寄存器没去保存，仅保存部分必须的寄存器，进一步减少指令数
```

#### 关于boost macosx i386下的bug

为了实现跨平台，boost下各个架构的实现，我都研究了一遍，发现macosx i386的实现，是有问题的，运行会挂掉，里面直接照搬了linux elf的i386实现版本。

估计macosx i386用的不多，所以没去做测试，后来发现，原来macosx i386下jump()返回from(context, priv)的结构体并不是基于栈的

而是使用eax, edx返回，因此tbox里面针对这个架构，重新调整stack布局，重写了一套自己的实现。

#### 关于boost windows i386下的优化

其实在windows下，返回from(context, priv)的结构体，也是用的eax, edx，而不是像linux elf那样基于栈的，因此实现上效率会高很多。

但是，boost里面，却像elf那个版本一样，还是采用了一个跳板，进行二次跳转后，才切换到context上去，是没有必要的。

在boost里面的跳板代码，类似像这样（摘录自tbox elf i386的实现）：

```c
__entry:
    
    /* pass arguments(context: eax, priv: edx) to the context function
     *
     *              patch __end
     *                  |
     *                  |        old-context
     *              ----|------------------------------------
     * context: .. | retval | context |   priv   |  padding  |  
     *              -----------------------------------------
     *             0        4     arguments 
     *             |        |
     *            esp    16-align
     *           (now)
     */
    movl %eax, (%esp)
    movl %edx, 0x4(%esp)

    // retval = the address of label __end
    pushl %ebp

    /* jump to the context function entry
     *
     * @note need not adjust stack pointer(+4) using 'ret $4' when enter into function first
     */
    jmp *%ebx

```

由于elf i386下，返回from结构体是基于栈的，所以进入function入口的栈，和切换到对方jump()返回处的栈，并不是完全平衡的，因此需要一个跳板区分对待

stack布局上也需要特殊处理，而windows i386的返回，只需要eax/edx就足够，没必要再去使用这个跳板。

因此，tbox里面针对这个平台，进行了优化，重新调整了栈布局，省去跳板操作，直接进行跳转，实测切换效率比boost的实现提升30%左右。
