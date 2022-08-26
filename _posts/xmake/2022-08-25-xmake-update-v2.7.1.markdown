---
layout: post
title: "Xmake v2.7.1 Released, Better C++ Modules Support"
tags: xmake lua C/C++ remote ccache C++20 Modules headerunits fs-watcher
categories: xmake
---

[Xmake](https://github.com/xmake-io/xmake) is a lightweight cross-platform build utility based on Lua.

It is very lightweight and has no dependencies because it has a built-in Lua runtime.

It uses xmake.lua to maintain project builds and its configuration syntax is very simple and readable.

We can use it to build project directly like Make/Ninja, or generate project files like CMake/Meson, and it also has a built-in package management system to help users solve the integrated use of C/C++ dependent libraries.

```
Xmake = Build backend + Project Generator + Package Manager + [Remote|Distributed] Build + Cache
```

Although not very precise, we can still understand Xmake in the following way:

```
Xmake ~= Make/Ninja + CMake/Meson + Vcpkg/Conan + distcc + ccache/sccache
```

* [Github](https://github.com/xmake-io/xmake)
* [Document](https://xmake.io/)

## Introduction of new features

In this release, we have refactored and improved the C++20 Modules implementation, improved the dependency graph parsing of module files, added support for STL and User HeaderUnits, and made the CMakelists/compile_commands generator support C++ Modules.

In addition, we've added an `xmake watch` plugin that can monitor current project file updates in real time, automatically trigger incremental builds, or run some custom commands.

<img src="/static/img/xmake/xmake-watch.gif" width="60%" />






### C++ Modules improvements

### Project file monitoring and automatic build

### Mac Catalyst support

### Improvements to remote compilation

#### Pull remote build files

#### Real-time echo output

### Improved distributed build scheduling algorithm

### More flexible cmake package lookup

### armcc/armclang/rc incremental compilation support

## Changelog

### New features

* [#2555](https://github.com/xmake-io/xmake/issues/2555): Add fwatcher module and `xmake watch` plugin command
* Add `xmake service --pull 'build/**' outputdir` to pull the given files in remote server
* [#2641](https://github.com/xmake-io/xmake/pull/2641): Improve C++20 modules, support headerunits and project generators
* [#2679](https://github.com/xmake-io/xmake/issues/2679): Support Mac Catalyst

### Changes

* [#2576](https://github.com/xmake-io/xmake/issues/2576): More flexible package fetching from cmake
* [#2577](https://github.com/xmake-io/xmake/issues/2577): Improve add_headerfiles(), add `{install = false}` support
* [#2603](https://github.com/xmake-io/xmake/issues/2603): Disable `-fdirectives-only` for ccache by default
* [#2580](https://github.com/xmake-io/xmake/issues/2580): Set stdout to line buffering
* [#2571](https://github.com/xmake-io/xmake/issues/2571): Improve task scheduling for parallel and distributed compilation based on memory/cpu usage
* [#2410](https://github.com/xmake-io/xmake/issues/2410): Improve cmakelists generator
* [#2690](https://github.com/xmake-io/xmake/issues/2690): Improve to pass toolchains to packages
* [#2686](https://github.com/xmake-io/xmake/issues/2686): Support for incremental compilation and parse header file deps for keil/armcc/armclang
* [#2562](https://github.com/xmake-io/xmake/issues/2562): Improve include deps for rc.exe
* Improve the default parallel building jobs number

### Bugs fixed

* [#2614](https://github.com/xmake-io/xmake/issues/2614): Fix building submodules2 tests for msvc
* [#2620](https://github.com/xmake-io/xmake/issues/2620): Fix build cache for incremental compilation
* [#2177](https://github.com/xmake-io/xmake/issues/2177): Fix python.library segmentation fault for macosx
* [#2708](https://github.com/xmake-io/xmake/issues/2708): Fix link error for mode.coverage rule
* Fix rpath for macos/iphoneos frameworks and application
