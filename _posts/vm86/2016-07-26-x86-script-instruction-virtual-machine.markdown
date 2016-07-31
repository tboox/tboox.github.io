---
layout: post
title: "The x86 Script Instruction Virtual Machine"
tags: xmake x86 script assembly virtual machine idapro
categories: vm86
---

## Introduction

This is a very simple and lightweight x86 virtual machine which can load and run the assembly code from ida pro directly.

## Features

* Supports cross-platform and it's able to run the x86 assembly code on linux, windows, maxosx, android and ios ...
* Supports the frequently-used x86 assembly instruction (.e.g logical operations, goto, loop, call, stack operations ...)
* Supports call the third-party library interfaces. (.e.g libc ..)
* We can pass arguments and get the return results after running.
* Supports thread-safe.
* Does not support arm64 and only for 32-bits architecture 

## Example

We get one assemble code from ida pro first and this code will call the libc api: `printf`

```
sub_hello	proc near 
arg_0		= dword	ptr  8 
.data 
        format db \"hello: %x\", 0ah, 0dh, 0 
 
off_5A74B0	dd offset loc_6B2B50	; DATA XREF: sub_589100+1832 
		dd offset loc_58A945	; jump table for switch	statement 
 
.code 
        ; hi
        push	ebp ;hello 
		mov	ebp, esp 
 
    loc_6B2B50:				; CODE XREF: sub_6B2B40+8
        push    eax 
		mov	eax, [ebp+arg_0] 
        push eax 
        mov eax, offset format 
        push eax 
        call printf 
        add esp, 4 
        pop eax 
        
        mov ecx, 1
        jmp ds:off_5A74B0[ecx*4]
 
loc_58A945:
        push    eax 
		mov	eax, [ebp+arg_0] 
        push eax 
        mov eax, offset format 
        push eax 
        call printf 
        add esp, 4 
        pop eax 
        
  end:
        mov	esp, ebp 
		pop	ebp 
        retn 
sub_hello    endp 
```

And we call it in c language first.

```c
sub_hello(31415926);
```




The output results:

```
hello: 31415926
hello: 31415926
```

Nextly, we attempt to load this asm code using our x86 virtual machine.

```c
static tb_void_t vm86_demo_proc_exec_hello(tb_uint32_t value)
{
    // the code
    static tb_char_t const s_code_sub_hello[] = 
    {
"sub_hello	proc near \n\
arg_0		= dword	ptr  8 \n\
.data \n\
        format db \"hello: %x\", 0ah, 0dh, 0 \n\
 \n\
off_5A74B0	dd offset loc_6B2B50	; DATA XREF: sub_589100+1832 \n\
		dd offset loc_58A945	; jump table for switch	statement \n\
 \n\
.code \n\
        ; hi\n\
        push	ebp ;hello \n\
		mov	ebp, esp \n\
 \n\
    loc_6B2B50:				; CODE XREF: sub_6B2B40+8\n\
        push    eax \n\
		mov	eax, [ebp+arg_0] \n\
        push eax \n\
        mov eax, offset format \n\
        push eax \n\
        call printf \n\
        add esp, 4 \n\
        pop eax \n\
        \n\
        mov ecx, 1\n\
        jmp ds:off_5A74B0[ecx*4]\n\
 \n\
loc_58A945:\n\
        push    eax \n\
		mov	eax, [ebp+arg_0] \n\
        push eax \n\
        mov eax, offset format \n\
        push eax \n\
        call printf \n\
        add esp, 4 \n\
        pop eax \n\
        \n\
  end:\n\
        mov	esp, ebp \n\
		pop	ebp \n\
        retn \n\
sub_hello    endp \n\
    "
    };

    // the machine
    vm86_machine_ref_t machine = vm86_machine();
    if (machine)
    {
        // the lock
        tb_spinlock_ref_t lock = vm86_machine_lock(machine);

        // enter
        tb_spinlock_enter(lock);

        // the stack
        vm86_stack_ref_t stack = vm86_machine_stack(machine);

        // compile proc
        vm86_proc_ref_t proc = vm86_text_compile(vm86_machine_text(machine), s_code_sub_hello, sizeof(s_code_sub_hello));
        if (proc)
        {
            // add function
            vm86_machine_function_set(machine, "printf", vm86_demo_proc_func_printf);

            // init arguments
            vm86_stack_push(stack, value);

            // done proc
            vm86_proc_done(proc);

            // restore stack
            vm86_stack_pop(stack, tb_null);

            // trace
            tb_trace_i("sub_hello(%x)", value);
        }

        // leave
        tb_spinlock_leave(lock);
    } 
}

int main(int argc, char** argv)
{
    // call this function: sub_hello(0x31415926)
    vm86_demo_proc_exec_hello(0x31415926);    
}
```

The output results:

```
hello: 31415926
hello: 31415926
```

## Source code

* [Github](https://github.com/waruqi/vm86)
* [More projects](/project/)

## Compilation

Please install [xmake](http://www.xmake.io) first!

### Compile project on macosx 

```bash
$ sudo brew install xmake
$ xmake f -a i386
$ xmake
```

### Compile project on linux 

```bash
$ git clone https://github.com/waruqi/xmake.git
$ cd xmake
$ sudo ./install
$
$ cd vm86
$ xmake f -a i386
$ xmake
```

### Compile project on windows 

Downloads https://github.com/waruqi/xmake/archive/master.zip first.

Extracts it and run install.bat

Lastly, we start compiling vm86 project.

```bash
$ xmake
```

### Compile project for android 

```bash
$ cd vm86
$ xmake f -p android --ndk=/xxx/ndk
$ xmake
```

## Running

```bash
$ xmake r demo
```

## Ida scripts

The script files: `export_function.idc` and `export_data.idc` in the project directory (idc) 
can help us to export the given assembly function and data from the ida pro.


