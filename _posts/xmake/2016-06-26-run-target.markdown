---
layout: post
title:  "Run target"
tags: xmake lua run 
categories: xmake
---


You can use xmake to run the given target and need not know where is the target program.

e.g. 

We define a simple target with named 'test'.

    target("test")
        set_kind("console")
        add_files("*.c")

So, we can run it directly.

    xmake r test
    or xmake run test

xmake will compile it automaticly if the target has not been built.

