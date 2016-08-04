---
layout: post.cn
title:  "tbox新增hash库模块"
tags: tbox hash 算法
categories: tbox
---

最近稍微整理了下tbox的utils模块，发现里面有很多都是一些，之前放置的hash算法，例如：md5, sha1, crc32, adler32啊什么，比较凌乱。

因此我抽时间整理下这些hash算法，打算单独建立个hash算法模块，来放置各种大大小小的hash算法。

顺便把tbox里面用到的一些字符串hash算法，也做了些整理，一并归并到这个新模块中，例如比较常用的一些字符串哈希：

```
bkdr, fnv, fnv-1a, aphash, rshash, djb2, murmur, sdbm, blizzard ...
```

其中 bkdr 的效果比较好，因此目前作为tbox里面主要的string哈希来用，其他的hash虽然实现了很多，但是大部分tbox都没怎么去用。。

现在也只有[bloomfilter算法](/cn/2016/02/03/bloom-filter/)模块，会用到其他多个hash的情况。




此外，这次整理抽取了散落在tbox代码各处的hash代码后，如果配置`xmake f --smallest=y`最小化编译，库会更小些。

因为现在新增了一个 `xmake f --hash=[y|n]` 的配置选项，来禁用和启用hash模块，smallest模式下，会禁用它，也就是不会去编译这些hash代码，如果用不到的话。。

我还新增了一个benchmark的测试demo，可以测试各个hash的执行性能，因为目前只有adler32, crc32是稍微优化过的，其他的暂时没怎么去优化，所以测试结果仅作参考。

如果想要运行demo，可以执行：

```bash
$ xmake r demo hash_benchmark
```

我这边的结果如下（仅供参考）：

```
[demo]: [hash(1K)]: fnv32   : cae7edac 1431 ms
[demo]: [hash(1K)]: fnv32-1a: 42041cc2 1419 ms
[demo]: [hash(1K)]: rs      : 449e09d7 1614 ms
[demo]: [hash(1K)]: ap      : 743c6a7d 2181 ms
[demo]: [hash(1K)]: djb2    : c5fdc8ca 1450 ms
[demo]: [hash(1K)]: sdbm    : 3a7175d1 1462 ms
[demo]: [hash(1K)]: adler32 : 95feffd4 105 ms
[demo]: [hash(1K)]: crc32   : a846383f 2658 ms
[demo]: [hash(1K)]: crc32-le: 69de964b 2658 ms
[demo]: [hash(1K)]: bkdr    : 01466ac5 1513 ms
[demo]: [hash(1K)]: murmur  : cf826c7d 2463 ms
[demo]: [hash(1K)]: blizzard: 3a7175d1 1638 ms
[demo]: 
[demo]: [hash(1M)]: fnv32   : 240670f1 1520 ms
[demo]: [hash(1M)]: fnv32-1a: 49f2b159 1517 ms
[demo]: [hash(1M)]: rs      : db1cd2ca 1510 ms
[demo]: [hash(1M)]: ap      : 9ee66044 2167 ms
[demo]: [hash(1M)]: djb2    : 683d1cd5 1525 ms
[demo]: [hash(1M)]: sdbm    : 6cf0e47c 1538 ms
[demo]: [hash(1M)]: adler32 : 93b3e9c2 102 ms
[demo]: [hash(1M)]: crc32   : 42175630 2725 ms
[demo]: [hash(1M)]: crc32-le: def09f36 2788 ms
[demo]: [hash(1M)]: bkdr    : 2d447f50 1614 ms
[demo]: [hash(1M)]: murmur  : 4d041d9c 2365 ms
[demo]: [hash(1M)]: blizzard: 6cf0e47c 1580 ms
```

对这个有兴趣的同学，可以尝试帮忙优化下各个hash的实现，并且欢迎贡献一些其他hash算法的实现。。：）

对于如何使用这个hash接口，这边就拿crc32为例：

```c
/*! make crc32 (IEEE)
 *
 * @param data      the input data
 * @param size      the input size
 * @param seed      uses this seed if be non-zero
 *
 * @return          the crc value
 */
tb_uint32_t         tb_crc32_make(tb_byte_t const* data, tb_size_t size, tb_uint32_t seed);

/*! make crc32 (IEEE) for cstr
 *
 * @param cstr      the input cstr
 * @param seed      uses this seed if be non-zero
 *
 * @return          the crc value
 */
tb_uint32_t         tb_crc32_make_from_cstr(tb_char_t const* cstr, tb_uint32_t seed);
```

上面的接口，一个是对数据buffer进行计算，一个是对字符串数据进行计算，最后的seed值，就是初始化值，一般默认传0。。

计算字符串crc32如下：

```c
tb_trace_i("[crc32]: %x", tb_crc32_make_from_cstr("hello tbox", 0));
```

另外这回，还加了个uuid生成的接口：

```c
/*! make an uuid
 *
 * @param uuid      the uuid output buffer
 * @param name      we only generate it using a simple hashing function for speed if name is supplied 
 *
 * @return          tb_true or tb_false
 */
tb_bool_t           tb_uuid_make(tb_byte_t uuid[16], tb_char_t const* name);

/*! make an uuid string
 *
 * @param uuid_cstr the uuid output c-string
 * @param name      we only generate it using a simple hashing function for speed if name is supplied 
 *
 * @return          the uuid c-string or tb_null
 */
tb_char_t const*    tb_uuid_make_cstr(tb_char_t uuid_cstr[37], tb_char_t const* name);
```

对于windows，内部直接调用的 `CocCreateGuid` 接口来生成，其他平台上，目前仅仅只是通过随机数来生成了个唯一的id而已

但是并不符合 RFC 4122 4.3 的规范，即需要满足如下要求：

```
o  The UUIDs generated at different times from the same name in the
      same namespace MUST be equal.

o  The UUIDs generated from two different names in the same namespace
  should be different (with very high probability).

o  The UUIDs generated from the same name in two different namespaces
  should be different with (very high probability).

o  If two UUIDs that were generated from names are equal, then they
  were generated from the same name in the same namespace (with very
  high probability).
```

我目前主要是用uuid来为生成vs的工程文件做准备，只要保证唯一性就行了，等以后需要实现完整版了，我再去实现的更好些。。

目前的生成结果已经满足日常所需了，就暂时不去花太多精力到这上了，毕竟个人时间有限。

使用uuid的接口也很简单：

```c
tb_char_t uuid[37];
tb_trace_i("[uuid]: %s", tb_uuid_make_cstr(uuid, tb_null));
```

输出结果如下：

```
[demo]: [uuid]: 37DD735D-27FE-EC7D-520F-4189312D10E2
```

如果有时候，上层已经有过key能够保证唯一性了，那么我们可以直接通过这个key来产生一个唯一的uuid，没必要再去按rfc的生成规则来运算

这样效率会更快些，例如（通过指定唯一的key: `hello tbox`来生成）：

```c
tb_char_t uuid[37];
tb_trace_i("[uuid]: %s", tb_uuid_make_cstr(uuid, "hello tbox"));
```

目前tbox内部对于uuid的key哈希算法用的是bkdr，这个算法的综合效果不错，散列性也很好，基本上大部分库都默认首选这个hash算法。。

这边贴下tbox里面的实现，我暂时没时间去优化它，毕竟对字符串作为key的输入一般都很小，暂时没需求去优化它：

```c
tb_size_t tb_bkdr_make(tb_byte_t const* data, tb_size_t size, tb_size_t seed)
{
    // check
    tb_assert_and_check_return_val(data && size, 0);

    // init value
    tb_size_t value = 0;  
    if (seed) value = value * 131313 + seed;

    // generate it
    while (size--) value = (value * 131313) + (*data++);  
    return value;
}
```

其他的hash实现，可参考tbox下`src/tbox/hash`目录，这里就不一一介绍了。。。
