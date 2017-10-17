---
layout: post.cn
title:  "xmake-vscode v1.0.1正式版本发布"
tags: xmake lua 版本更新 
categories: xmake
---

[xmake-vscode](https://github.com/tboox/xmake-vscode)插件深度集成了[xmake](https://github.com/tboox/xmake)和vscode，提供方便快速的跨平台c/c++构建。

此版本为第一个正式版本，相比之前发布的体验版，新增了两大新特性：

## 快速宏记录和回放

<img src="/static/img/xmake/xmake-vscode-record.gif" width="60%" />

## 编译错误解析和问题列表

<img src="/static/img/xmake/xmake-vscode-problem.gif" width="60%" />

注：使用此插件，需要先安装xmake，更多关于xmake的使用说明，请阅读：[文档手册](http://xmake.io/#/zh/)，项目源码：[Github](https://github.com/tboox/xmake)。

关于xmake-vscode的更多特性介绍，请见下文，关于xmake-vscode插件的详细过程，请参考文章：[xmake-vscode插件开发过程记录](/cn/2017/10/11/xmake-vscode/)

## 特性

* 语法色彩高亮
* API输入自动提示和补全
* 状态栏快捷工具
* 完整的命令列表
* 快速配置支持
* 构建和安装
* 运行和调试
* 快速宏记录和回放
* 编译错误解析和问题列表







## 语法色彩高亮和自动提示和补全

<img src="/static/img/xmake/xmake-vscode-completion.gif" width="60%" />

## 状态栏快捷工具

![statusbar](/static/img/xmake/xmake-vscode-statusbar.png)
 
## 完整的命令列表

<img src="/static/img/xmake/xmake-vscode-commands.png" width="60%" />
 
## 快速配置支持

<img src="/static/img/xmake/xmake-vscode-configure.gif" width="60%" />
 
## 构建和安装

<img src="/static/img/xmake/xmake-vscode-build.gif" width="60%" />
  
## 运行和调试

<img src="/static/img/xmake/xmake-vscode-debug.gif" width="60%" />
 
## 快速宏记录和回放

<img src="/static/img/xmake/xmake-vscode-record.gif" width="60%" />

## 编译错误解析和问题列表

<img src="/static/img/xmake/xmake-vscode-problem.gif" width="60%" />

## 全局配置

```json
{
    "configuration": {
        "type": "object",
        "title": "XMake configuration",
        "properties": {
            "xmake.logLevel": {
                "type": "string",
                "default": "normal",
                "description": "The Log Level: normal/verbose/minimal",
                "enum": [
                    "verbose",
                    "normal",
                    "minimal"
                ]
            },
            "xmake.buildLevel": {
                "type": "string",
                "default": "normal",
                "description": "The Build Output Level: normal/verbose/warning/debug",
                "enum": [
                    "verbose",
                    "normal",
                    "warning",
                    "debug"
                ]
            },
            "xmake.buildDirectory": {
                "type": "string",
                "default": "${workspaceRoot}/build",
                "description": "The Build Output Directory"
            },
            "xmake.installDirectory": {
                "type": "string",
                "default": "",
                "description": "The Install Output Directory"
            },
            "xmake.packageDirectory": {
                "type": "string",
                "default": "",
                "description": "The Package Output Directory"
            },
            "xmake.workingDirectory": {
                "type": "string",
                "default": "${workspaceRoot}",
                "description": "The Project Working Directory with the root xmake.lua"
            },
            "xmake.androidNDKDirectory": {
                "type": "string",
                "default": "",
                "description": "The Android NDK Directory"
            }
        }
    }
}
```
