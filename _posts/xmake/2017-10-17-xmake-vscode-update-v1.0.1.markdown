---
layout: post
title:  "xmake-vscode v1.0.1 released, a xmake integration in vscode"
tags: xmake lua update
categories: xmake
---

[xmake-vscode](https://github.com/xmake-io/xmake-vscode) plugin is a xmake integration in Visual Studio Code.

It is deeply integrated with [xmake](https://github.com/xmake-io/xmake) and vscode to provide a convenient and fast cross-platform c/c++ development and building.

## Features

* Colorization
* Completion Lists
* StatusBar
* Commands
* Configuration
* Build
* Run and Debug
* Record and Playback
* Problem

## Colorization and Completion Lists

<img src="/static/img/xmake/xmake-vscode-completion.gif" width="60%" />








## StatusBar

![statusbar](/static/img/xmake/xmake-vscode-statusbar.png)

## Commands

<img src="/static/img/xmake/xmake-vscode-commands.png" width="60%" />
 
## Configuration

<img src="/static/img/xmake/xmake-vscode-configure.gif" width="60%" />
 
## Build

<img src="/static/img/xmake/xmake-vscode-build.gif" width="60%" />
  
## Run and Debug

<img src="/static/img/xmake/xmake-vscode-debug.gif" width="60%" />
 
## Record and Playback

<img src="/static/img/xmake/xmake-vscode-record.gif" width="60%" />

## Problem

<img src="/static/img/xmake/xmake-vscode-problem.gif" width="60%" />

## Global Configuration

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
