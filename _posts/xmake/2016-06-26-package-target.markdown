---
layout: post
title:  "Package target"
tags: xmake lua package 
categories: xmake
---

Packages all targets for the current platform:

    xmake p
    xmake package

Packages the target test to the output directory: /tmp

    xmake p -o /tmp test
    xmake p --output=/tmp test

Packages targets for the iphoneos platform.

    xmake f -p iphoneos
    xmake p 

We can uses the macro plugin to package all architectures of the given platform.

    # packages targets for all architectures of the current platform
    xmake macro package 

    # packages targets for all architectures of the iphoneos platform
    xmake m package -p iphoneos

    # packages targets with debug version for all architectures of the iphoneos platform and output to the directory: /tmp/output
    xmake m package -p iphoneos -f "-m debug" -o /tmp/output
