---
layout: page
---

### Languages

* [中文](/cn)

# The TBOOX Open Source Projects

* [TBOX](#tbox): The Treasure Box Library
* [XMake](#xmake): The Automatic Cross-platform Build Tool

<div id="tbox"></div>

# The Treasure Box Library (TBOX)

## introduction

TBOX is a mutli-platform c library for unix, windows, mac, ios, android, etc.

It is similar to glibc, but simpler and more convenient.
It includes asio, stream, network, container, algorithm, object, memory, database, string, charset, math, regex, libc, libm, utils and other library modules.

* [Documents](https://github.com/waruqi/tbox/wiki/documents)
* [Github](https://github.com/waruqi/tbox)

## features

#### the stream library
- supports file, data, http and socket source
- supports the stream filter for gzip, charset and...
- implements transfer for two stream
- implements transfer pool (asio) for multi-stream
- implements the static buffer stream for parsing data

#### the asynchronous io library
- supports reactor and proactor mode
- using epoll, poll, select, kqueue and iocp os system api

#### the database library
- supports mysql and sqlite3 database and enumerates data using the iterator mode

#### the xml parser library
- supports DOM and SAX mode and supports xpath

#### the serialization and deserialization library. 
- supports xml, json, bplist, xplist, binary formats

#### the memory library
- implements some memory pools for optimizing memory
- supports fast memory error detecting. it can detect the following types of bugs for the debug mode:
  - out-of-bounds accesses to heap and globals
  - use-after-free
  - double-free, invalid free
  - memory leaks

#### the container library
- implements hash table, single list, double list, vector, stack, queue
  and min/max heap. supports iterator mode for algorithm

#### the algorithm library
- using the iterator mode
- implements find, binary find and reverse find algorithm
- implements sort, bubble sort, quick sort, heap sort and insert sort algorithm
- implements count, walk items, reverse walk items, for_all and rfor_all

#### the network library
- implements dns(cached), ssl(openssl and polarssl), http and cookies
- supports asynchronous io mode for dns, ssl and http using the asio and stream library

#### the platform library
- implements timer, fast and low precision timer
- implements atomic and atomic64 operation
- implements spinlock, mutex, event, semaphore, thread and thread pool 
- implements file, socket operation

#### the charset library
- supports utf8, utf16, gbk, gb2312, uc2 and uc4
- supports big endian and little endian mode

#### the zip library
- supports gzip, zlibraw, zlib formats using the zlib library if exists
- implements lzsw, lz77 and rlc algorithm

#### the utils library
- implements base32, base64 encoder and decoder
- implements crc32, adler32, md5 and sha1 hash algorithm
- implements assert and trace output for the debug mode
- implements bits operation for parsing u8, u16, u32, u64 data

#### the math library
- implements random generator
- implements fast fixed-point calculation, supports 6-bits, 16-bits, 30-bits fixed-point number

#### the libc library
- implements lightweight libc library interfaces, the interface name contains tb_xxx prefix for avoiding conflict
- implements strixxx strrxxx wcsixxx wcsrxxx interface extension
- optimizes some frequently-used interface, .e.g. memset, memcpy, strcpy ... 
- implements memset_u16, memset_u32, memset_u64 extension interfaces

#### the libm library
- implements lightweight libm library interfaces, the interface name contains tb_xxx prefix for avoiding conflict
- supports float and double type

#### the regex library
- supports match and replace
- supports global/multiline/caseless mode
- uses pcre, pcre2 and posix regex modules

## projects

some projects using tbox:

* [gbox](https://github.com/waruqi/gbox)
* [itrace](https://github.com/waruqi/itrace)
* [more](https://github.com/waruqi/tbox/wiki/tbox-projects)

## build

please install xmake first: [xmake](https://github.com/waruqi/xmake)

    // build for the host platform
    cd ./tbox
    xmake

    // build for the iphoneos platform
    cd ./tbox
    xmake f -p iphoneos 
    xmake
    
    // build for the android platform
    cd ./tbox
    xmake f -p android --ndk=xxxxx
    xmake

## example

    #include "tbox/tbox.h"

    int main(int argc, char** argv)
    {
        // init tbox
        if (!tb_init(tb_null, tb_null)) return 0;

        // trace
        tb_trace_i("hello tbox");

        // init vector
        tb_vector_ref_t vector = tb_vector_init(0, tb_element_cstr(tb_true));
        if (vector)
        {
            // insert item
            tb_vector_insert_tail(vector, "hello");
            tb_vector_insert_tail(vector, "tbox");

            // dump all items
            tb_for_all (tb_char_t const*, cstr, vector)
            {
                // trace
                tb_trace_i("%s", cstr);
            }

            // exit vector
            tb_vector_exit(vector);
        }

        // init stream
        tb_stream_ref_t stream = tb_stream_init_from_url("http://www.xxx.com/file.txt");
        if (stream)
        {
            // open stream
            if (tb_stream_open(stream))
            {
                // read line
                tb_long_t size = 0;
                tb_char_t line[TB_STREAM_BLOCK_MAXN];
                while ((size = tb_stream_bread_line(stream, line, sizeof(line))) >= 0)
                {
                    // trace
                    tb_trace_i("line: %s", line);
                }
            }

            // exit stream
            tb_stream_exit(stream);
        }

        // wait some time
        getchar();

        // exit tbox
        tb_exit();
        return 0;
    }

<div id="xmake"></div>

# The Automatic Cross-platform Build Tool (XMake)

## introduction

xmake is a cross-platform automatic build tool.

It is similar to cmake, automake, premake, but more convenient and easy to use.

* [Documents](https://github.com/waruqi/xmake/wiki/documents)
* [Github](https://github.com/waruqi/xmake)

## features

1. create projects and supports many project templates
2. support c/c++, objc/c++, swift and assembly language
3. automatically probe the host environment and configure project 
4. build and rebuild project 
5. clean generated target files
6. package the project targets automatically
   - *.ipa for ios(feature)
   - *.apk for android(feature)
   - *.pkg for library
   - *.app for macosx(feature)
   - *.exe for windows
   - others

7. install target
8. run a given target
9. describe the project file using lua script, more flexible and simple

        -- xmake.lua
        add_target("console")

            -- set kind
            set_kind("binary")

            -- add files
            add_files("src/*.c") 

10. custom platforms and toolchains
11. custom rules for package/compiler/linker

## examples

create a c++ console project:

        xmake create -l c++ -t 1 console
     or xmake create --language=c++ --template=1 console

project makefile:xmake.lua

    add_target("console")
        set_kind("binary")
        add_files("src/*.c") 

configure project:

   This is optional, if you compile the targets only for linux, macosx and windows and the default compilation mode is release.

   The configuration arguments will be cached and you need not input all arguments each time.

       xmake f -p iphoneos -m debug
    or xmake f --ldflags="-Lxxx -lxxx"
    or xmake f --plat=macosx --arch=x86_64
    or xmake config --plat=iphoneos --mode=debug
    or xmake config --plat=iphonesimulator
    or xmake config --plat=android --arch=armv7-a --ndk=xxxxx
    or xmake config --cross=i386-mingw32- --toolchains=/xxx/bin
    or xmake config --cxflags="-Dxxx -Ixxx"
    or xmake config --help

compile project:
     
       xmake
    or xmake -r
    or xmake --rebuild

run target:

       xmake r console
    or xmake run console

package all:

       xmake p
    or xmake p --archs="armv7, arm64"
    or xmake package
    or xmake package console
    or xmake package -o /tmp
    or xmake package --output=/tmp

install targets:

       xmake i
    or xmake install
    or xmake install console
    or xmake install -o /tmp
    or xmake install --output=/tmp

If you need known more detailed usage，please refer to [documents](https://github.com/waruqi/xmake/wiki/documents)
or run:

       xmake -h
    or xmake --help
    or xmake config --help
    or xmake package --help
    ...

The simple xmake.lua file:

    -- the debug mode
    if modes("debug") then
        
        -- enable the debug symbols
        set_symbols("debug")

        -- disable optimization
        set_optimize("none")
    end

    -- the release mode
    if modes("release") then

        -- set the symbols visibility: hidden
        set_symbols("hidden")

        -- enable fastest optimization
        set_optimize("fastest")

        -- strip all symbols
        set_strip("all")
    end

    -- add target
    add_target("test")

        -- set kind
        set_kind("static")

        -- add files
        add_files("src/*.c") 

