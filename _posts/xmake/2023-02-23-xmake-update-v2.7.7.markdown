---
layout: post
title: "Xmake v2.7.7 released, Support Haiku, Improve API check and C++ Modules"
Tags: xmake lua C/C++ package module Haiku c++modules
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
Xmake ≈ Make/Ninja + CMake/Meson + Vcpkg/Conan + distcc + ccache/sccache
```

* [Github](https://github.com/xmake-io/xmake)
* [Document](https://xmake.io/)

<img src="https://github.com/xmake-io/xmake-docs/raw/master/assets/img/index/package.gif" width="650px" />

## Introduction of new features

### Haiku support

Xmake is now fully operational on [Haiku systems](https://www.haiku-os.org/) and we have added a haiku compilation platform to Xmake for compiling code on Haiku systems.

The result is as follows:

<img src="/static/img/xmake/haiku.jpeg" width="650px" />




### Improve C++20 Modules support

The latest build of clang-17 has made a number of improvements to C++20 Modules, so we have targeted them in Xmake to make them better and to fix some std modules related issues.

A full project example of C++ Modules can be found at [C++ Modules Examples](https://github.com/xmake-io/xmake/tree/master/tests/projects/c%2B%2B/modules).

There are also a number of actual C++ Modules projects that have been built using Xmake, e.g.

- [async_simple](https://github.com/alibaba/async_simple)
- [StormKit](https://github.com/TapzCrew/StormKit)

### Check API configuration

Previous versions of xmake.lua were weak at detecting the validity of pass-throughs to the configuration API, and only tested a few APIs such as `add_includedirs`, `add_files` and so on.

In the new version, we have added an `xmake check` plugin for checking APIs and code to better check the user's configuration and to avoid the problem of incorrect configuration values due to unfamiliarity with Xmake.

In addition to manually running the `xmake check` command to trigger the check, Xmake also automatically triggers some routine checks at various stages of compilation, compilation failure, etc.
Not all users are aware of the existence of the `xmake check` command.

#### Check all api values in xmake.lua by default

```lua
set_lanuages("c91") -- typo
```

```console
$ xmake check
./xmake.lua:15: warning: unknown language value 'c91', it may be 'c90'
0 notes, 1 warnings, 0 errors
```

we can also run a given group

```console
$ xmake check api
$ xmake check api.target
```

#### Verbose output

```console
$ xmake check -v
./xmake.lua:15: warning: unknown language value 'cxx91', it may be 'cxx98'
./src/tbox/xmake.lua:43: note: unknown package value 'mbedtls'
./src/tbox/xmake.lua:43: note: unknown package value 'polarssl'
./src/tbox/xmake.lua:43: note: unknown package value 'openssl'
./src/tbox/xmake.lua:43: note: unknown package value 'pcre2'
./src/tbox/xmake.lua:43: note: unknown package value 'pcre'
./src/tbox/xmake.lua:43: note: unknown package value 'zlib'
./src/tbox/xmake.lua:43: note: unknown package value 'mysql'
./src/tbox/xmake.lua:43: note: unknown package value 'sqlite3'
8 notes, 1 warnings, 0 errors
```

#### Check the given api

```console
$ xmake check api.target.languages
./xmake.lua:15: warning: unknown language value 'cxx91', it may be 'cxx98'
0 notes, 1 warnings, 0 errors
```

#### Check compiler flags

```console
$ xmake check
./xmake.lua:10: warning: clang: unknown c compiler flag '-Ox'
0 notes, 1 warnings, 0 errors
```

#### Check includedirs


```console
$ xmake check
./xmake.lua:11: warning: includedir 'xxx' not found
0 notes, 1 warnings, 0 errors
```

### Check project code (clang-tidy)

#### List clang-tidy checks

```console
$ xmake check clang.tidy --list
Enabled checks:
    clang-analyzer-apiModeling.StdCLibraryFunctions
    clang-analyzer-apiModeling.TrustNonnull
    clang-analyzer-apiModeling.google.GTest
    clang-analyzer-apiModeling.llvm.CastValue
    clang-analyzer-apiModeling.llvm.ReturnValue
    ...
```

#### Check source code in targets

```console
$ xmake check clang.tidy
1 error generated.
Error while processing /private/tmp/test2/src/main.cpp.
/tmp/test2/src/main.cpp:1:10: error: 'iostr' file not found [clang-diagnostic-error]
#include <iostr>
         ^~~~~~~
Found compiler error(s).
error: execv(/usr/local/opt/llvm/bin/clang-tidy -p compile_commands.json /private/tmp/test2/src
/main.cpp) failed(1)
```

#### Check code with the given checks

```console
$ xmake check clang.tidy --checks="*"
6 warnings and 1 error generated.
Error while processing /private/tmp/test2/src/main.cpp.
/tmp/test2/src/main.cpp:1:10: error: 'iostr' file not found [clang-diagnostic-error]
#include <iostr>
         ^~~~~~~
/tmp/test2/src/main.cpp:3:1: warning: do not use namespace using-directives; use using-declarat
ions instead [google-build-using-namespace]
using namespace std;
^
/tmp/test2/src/main.cpp:3:17: warning: declaration must be declared within the '__llvm_libc' na
mespace [llvmlibc-implementation-in-namespace]
using namespace std;
                ^
/tmp/test2/src/main.cpp:5:5: warning: declaration must be declared within the '__llvm_libc' nam
espace [llvmlibc-implementation-in-namespace]
int main(int argc, char **argv) {
    ^
/tmp/test2/src/main.cpp:5:5: warning: use a trailing return type for this function [modernize-u
se-trailing-return-type]
int main(int argc, char **argv) {
~~~ ^
auto                            -> int
/tmp/test2/src/main.cpp:5:14: warning: parameter 'argc' is unused [misc-unused-parameters]
int main(int argc, char **argv) {
             ^~~~
              /*argc*/
/tmp/test2/src/main.cpp:5:27: warning: parameter 'argv' is unused [misc-unused-parameters]
int main(int argc, char **argv) {
                          ^~~~
                           /*argv*/
Found compiler error(s).
error: execv(/usr/local/opt/llvm/bin/clang-tidy --checks=* -p compile_commands.json /private/tm
p/test2/src/main.cpp) failed(1)
```

#### Check code with the given target name

```console
$ xmake check clang.tidy [targetname]
```

#### Check code with the given source files

```console
$ xmake check clang.tidy -f src/main.c
$ xmake check clang.tidy -f 'src/*.c:src/**.cpp'
```

#### Set the given .clang-tidy config file

```console
$ xmake check clang.tidy --configfile=/tmp/.clang-tidy
```

#### Create a new .clang-tidy config file

```console
$ xmake check clang.tidy --checks="*" --create
$ cat .clang-tidy
---
Checks:          'clang-diagnostic-*,clang-analyzer-*,*'
WarningsAsErrors: ''
HeaderFilterRegex: ''
AnalyzeTemporaryDtors: false
FormatStyle:     none
User:            ruki
CheckOptions:
  - key:             readability-suspicious-call-argument.PrefixSimilarAbove
    value:           '30'
  - key:             cppcoreguidelines-no-malloc.Reallocations
    value:           '::realloc'

```

### Improve target configuration source analysis

We have improved the presentation of target information in the `xmake show -t target` command by adding a new configuration source analysis and streamlining some of the relatively redundant information.

We can use it to better troubleshoot where some of the flags we configure actually come from.

The display looks like this.

```bash
$ xmake show -t tbox
The information of target(tbox):
    at: /Users/ruki/projects/personal/tbox/src/tbox/xmake.lua
    kind: static
    targetfile: build/macosx/x86_64/release/libtbox.a
    rules:
      -> mode.release -> ./xmake.lua:26
      -> mode.debug -> ./xmake.lua:26
      -> utils.install.cmake_importfiles -> ./src/tbox/xmake.lua:15
      -> utils.install.pkgconfig_importfiles -> ./src/tbox/xmake.lua:16
    options:
      -> object -> ./src/tbox/xmake.lua:53
      -> charset -> ./src/tbox/xmake.lua:53
      -> database -> ./src/tbox/xmake.lua:53
    packages:
      -> mysql -> ./src/tbox/xmake.lua:43
      -> sqlite3 -> ./src/tbox/xmake.lua:43
    links:
      -> pthread -> option(__keyword_thread_local) -> @programdir/includes/check_csnippets.lua:100
    syslinks:
      -> pthread -> ./xmake.lua:71
      -> dl -> ./xmake.lua:71
      -> m -> ./xmake.lua:71
      -> c -> ./xmake.lua:71
    defines:
      -> __tb_small__ -> ./xmake.lua:42
      -> __tb_prefix__="tbox" -> ./src/tbox/xmake.lua:19
      -> _GNU_SOURCE=1 -> option(__systemv_semget) -> @programdir/includes/check_cfuncs.lua:104
    cxflags:
      -> -Wno-error=deprecated-declarations -> ./xmake.lua:22
      -> -fno-strict-aliasing -> ./xmake.lua:22
      -> -Wno-error=expansion-to-defined -> ./xmake.lua:22
      -> -fno-stack-protector -> ./xmake.lua:51
    frameworks:
      -> CoreFoundation -> ./src/tbox/xmake.lua:38
      -> CoreServices -> ./src/tbox/xmake.lua:38
    mxflags:
      -> -Wno-error=deprecated-declarations -> ./xmake.lua:23
      -> -fno-strict-aliasing -> ./xmake.lua:23
      -> -Wno-error=expansion-to-defined -> ./xmake.lua:23
    includedirs:
      -> src -> ./src/tbox/xmake.lua:26
      -> build/macosx/x86_64/release -> ./src/tbox/xmake.lua:27
    headerfiles:
      -> src/(tbox/**.h)|**/impl/**.h -> ./src/tbox/xmake.lua:30
      -> src/(tbox/prefix/**/prefix.S) -> ./src/tbox/xmake.lua:31
      -> build/macosx/x86_64/release/tbox.config.h -> ./src/tbox/xmake.lua:34
    files:
      -> src/tbox/*.c -> ./src/tbox/xmake.lua:56
      -> src/tbox/hash/bkdr.c -> ./src/tbox/xmake.lua:57
      -> src/tbox/hash/fnv32.c -> ./src/tbox/xmake.lua:57
    compiler (cc): /usr/bin/xcrun -sdk macosx clang
      -> -Qunused-arguments -target x86_64-apple-macos12.6 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX13.0.sdk
    linker (ar): /usr/bin/xcrun -sdk macosx ar
      -> -cr
    compflags (cc):
      -> -Qunused-arguments -target x86_64-apple-macos12.6 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX13.0.sdk -Wall -Werror -Oz -std=c99 -Isrc -Ibuild/macosx/x86_64/release -D__tb_small__ -D__tb_prefix__=\"tbox\" -D_GNU_SOURCE=1 -framework CoreFoundation -framework CoreServices -Wno-error=deprecated-declarations -fno-strict-aliasing -Wno-error=expansion-to-defined -fno-stack-protector
    linkflags (ar):
      -> -cr
```

### Improve package download configuration

If there are packages whose url downloads require specific http headers to be set to authenticate them before they can be downloaded, this policy can be specified.

This is often used for the maintenance of private repository packages within some companies.

```lua
package("xxx")
    set_policy("package.download.http_headers", "TEST1: foo", "TEST2: bar")
```

We can also set the http headers for the specified urls: ```

```lua
package("zlib")
    add_urls("https://github.com/madler/zlib/archive/$(version).tar.gz", {
        http_headers = {"TEST1: foo", "TEST2: bar"}
    })
```

### Improve dlang toolchain support

In previous versions, Xmake only provided a toolchain for dlang, which automatically looked up dmd, ldc2, gdc to adapt to the dlang compiler that was available to compile the project.

However, this approach does not allow the user more flexibility in selecting a specific compiler, and if both dmd and ldc2 are installed, Xmake will always use dmd as the compiler for dlang.

Therefore, in this new version, xmake provides three separate toolchains to select the required dlang compiler.

For example, you can quickly switch to the ldc2 compiler to compile your project by running the following command

```bash
$ xmake f --toolchain=ldc
$ xmake
```

In addition to the ldc toolchain, two other toolchains, dmd, and gdc, can be used separately.

And we have also improved the configuration of the dmd/ldc2 build optimisation options to make the production dlang binaries even smaller and faster.

### Support for external working directory configuration

#### The default build directory mode

Xmake currently provides a build directory model that is a built-in build directory, which means that if we run the xmake command in the root of the current project, the build directory is automatically generated and .xmake is used to store some configuration cache.

```
- projectdir (workdir)
  - build (generated)
  - .xmake (generated)
  - src
  - xmake.lua
```

```bash
$ cd projectdir
$ xmake
```

Of course, we can configure the build directory with `xmake f -o . /build` to configure the build directory, but the .xmake directory will still be in the project source directory.

```bash
$ cd projectdir
$ xmake f -o ... /build
```

This may not be to the liking of some users who like their complete code directories to remain intact and clean.

#### The new external build directory mode

Therefore, with this new version, Xmake offers an alternative way of configuring build directories, namely external directory builds (similar to CMake).

For example, we would like to use a directory structure like the following to build a project, always keeping the source directory clean.

```
- workdir
  - build (generated)
  - .xmake (generated)
- projectdir
  - projectdir
  - xmake.lua
```

We just need to go into the working directory where we need to store the build/.xmake directory and then use the ``xmake f -P [projectdir]` configuration command to specify the source root directory.

```bash
$ cd workdir
$ xmake f -P ... /projectdir
$ xmake
```

Once the configuration is complete, the source code root is completely remembered and there is no need to set it up again for any subsequent build commands.

For example, the commands to build, rebuild, run or install are exactly the same as before and the user will not feel any difference.

```bash
$ xmake
$ xmake run
$ xmake --rebuild
$ xmake clean
$ xmake install
```

We can also use the `-o/--buildir` argument to set the build directory separately to another location, for example to the following structure.

```
- build (generated)
- workdir
  - .xmake (generated)
- projectdir
  - src
  - xmake.lua
```

```bash
$ cd workdir
$ xmake f -P ... /projectdir -o ... /build
```
## Changelog

### New features

* Add Haiku support
* [#3326](https://github.com/xmake-io/xmake/issues/3326): Add `xmake check` to check project code (clang-tidy) and configuration
* [#3332](https://github.com/xmake-io/xmake/pull/3332): add custom http headers when downloading packages

### Changes

* [#3318](https://github.com/xmake-io/xmake/pull/3318): Improve dlang toolchains
* [#2591](https://github.com/xmake-io/xmake/issues/2591): Improve target analysis
* [#3342](https://github.com/xmake-io/xmake/issues/3342): Improve to configure working and build directories
* [#3373](https://github.com/xmake-io/xmake/issues/3373): Improve std modules support for clang-17
* Improve to strip/optimization for dmd/ldc2

### Bugs fixed

* [#3317](https://github.com/xmake-io/xmake/pull/3317): Fix languages for qt project.
* [#3321](https://github.com/xmake-io/xmake/issues/3321): Fix dependfile when generating configiles
* [#3296](https://github.com/xmake-io/xmake/issues/3296): Fix build error on macOS arm64
