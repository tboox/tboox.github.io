---
layout: post.cn
title:  "用c实现跨平台异常捕获机制"
comments: true
categories: tbox
---

TBOX封装了一套跨平台的异常捕获实现，来模拟windows的seh异常处理功能，而且是线程安全的。

### 在linux/mac下的实现

* 使用signal 捕获异常信号
* 使用sigsetjmp保存现场寄存器和信号掩码，出现异常后使用 siglongjmp 跳转到异常处理过程，并恢复状态
* 使用线程局部存储维护 sigjmpbuf 寄存器现场状态堆栈，保证多线程安全，并且可以实现多层嵌套捕获处理。

### 在windows下的实现
   
这个就不用多说了，在vs下直接用 __try、__except 关键字就行了，如果在mingw下编译， 通过 setjmp实现也很方便。

### 具体使用

注： 由于使用setjmp 进行寄存器现场保护， 如果使用整型局部变量， 有可能会被编译器优化到寄存器中。
所以try内部的修改，可能会在异常捕获后，被会恢复掉。
最好加上volatile来禁止优化。

    __tb_volatile__ tb_size_t i = 0;
    __tb_try
    {
        i++;
        // 捕获段错误
        *((__tb_volatile__ tb_size_t*)0) = 0;
        // 捕获除0错误
        // __tb_volatile__ tb_size_t a = 0; a /= a;
    }
    __tb_except(1)
    {
        // __tb_except(1): 处理异常
        // __tb_except(0): 路由异常到外层， 支持嵌套处理
    }
    __tb_end



### 注意事项

有些平台异常捕获是被禁用的，所以如果确实想要使用这种异常捕获机制，首先得确保对应平台下的配置文件plat/xxx/config.h

定义了TB_CONFIG_EXCEPTION_ENABLE这个宏，然后重新编译才行。

虽然tbox对异常支持的挺完善了，但是个人还是不建议太过频繁的使用异常捕获。

