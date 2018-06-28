---
layout: post
title:  "xmake-vscode v1.10 released, Support breakpoint debugging"
tags: xmake lua update
categories: xmake
---

[xmake-vscode](https://github.com/tboox/xmake-vscode) plugin is a xmake integration in Visual Studio Code.

It is deeply integrated with [xmake](https://github.com/tboox/xmake) and vscode to provide a convenient and fast cross-platform c/c++ development and building.

This version is mainly updated as follows:

* Support breakpoint debugging, need [vscode-cpptools](https://github.com/Microsoft/vscode-cpptools) plugin
* Support multi-project workspaces
* Improve mingw platform

## Breakpoint Debugging







<img src="/static/img/xmake/xmake-vscode-debug.gif" width="60%" />

## Multi-project workspaces

![](/static/img/xmake/xmake-vscode-projects.jpg)

## MinGW configuration

We need only add `--sdk=` option to additional configuration in vscode.

```json
"xmake.additionalConfigArguments": {
    "type": "string",
    "default": "--sdk=\"c:\xxx\mingwsdk\"",
    "description": "The Additional Config Arguments, .e.g --cc=gcc --cxflags=\"-DDEBUG\""
}
```

