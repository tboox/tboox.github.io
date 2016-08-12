---
layout: post.cn
title:  "tbox数据位操作接口的使用"
tags: tbox 位运算 stream 数据流 静态流 bits
categories: tbox
---

tbox对于数据文件的解析提供了完善的支持，可以对各种二进制数据，文件数据流，网络数据流等进行各种解析操作

并且提供了一整套字节解析、比特位解析的接口，来支持各种流模式：

#### stream

通用数据流，提供对流式数据的读写和解析，支持多层流嵌套以及各种协议（http, socket, file, data ...）

对于如何使用stream，这里暂时不详细介绍了，之后会单独重点介绍下，这里主要是为了描述，如何使用stream来处理字节数据的解析

例如，我要从数据流中，读取一个大端的16bits数值，很简单，只要：

```c
tb_uint16_t value;
if (tb_stream_bread_u16_be(stream, &value))
{
    tb_trace_i("%x", value);
}
```

其中后缀`_be`, `_le`以及`_ne` 分别表示，大端读取、小端读取、本地端读取

如果需要读取32位、64位数据，只需要将`u16`改成`u32`或者`u64`就行了，是不是很方便啊，并且stream还可以支持浮点、双精度数值的各端读取。。

这里我就不一一介绍了，具体的接口列表，可以参看本文最后的接口列表。





#### static_stream

static_stream的接口跟stream是类似的，用法就不重复描述了，这里主要说明下这个流跟stream的区别：

* stream主要适用于通用数据流协议，功能强大，并且内置缓存，但是比较重量级
* static_stream仅用于维护静态的数据buffer，以及读写、解析操作，比较轻量，效率也更高

下面给个简单的例子：

```c
// 读取sint64的数值，本地端读取
tb_sint64_t value;
if (tb_static_stream_read_s64_ne(stream, &value))
{
    tb_trace_i("%llx", value);
}
```

#### bits

tbox还提供了更加原始、更加底层的位数据操作接口，例如直接对某个数据指针的位读取操作，可以使用utils库的`tb_bits_get_xxx`和`tb_bits_set_xxx`系列接口， 这个更加的轻量：

```c
    // p指向某个数据地址
    tb_byte_t* p = data;

    // 按大端读取16位数据
    tb_uint16_t u16_be = tb_bits_get_u16_be(p);

    // 按小端读取24位数据
    tb_uint32_t u24_le = tb_bits_get_u24_le(p);

    // 按本地端读取32位数据
    tb_uint32_t u32_ne = tb_bits_get_u32_ne(p);

    // 按大端读取64位数据
    tb_uint64_t u64_be = tb_bits_get_u64_be(p);

    // 读取从第1位开始的后续5位无符号数据
    tb_uint32_t u5 = tb_bits_get_ubits32(p, 1, 5);

    // 按大端读取浮点值
    tb_float_t float_be = tb_bits_get_float_be(p);

    // 按浮点大端、字小端读取双精度浮点值
    tb_double_t double_ble = tb_bits_get_double_ble(p);

    // 按浮点本地端、字本地端读取双精度浮点值
    tb_double_t double_nne = tb_bits_get_double_nne(p);

    // 交换无符号16位数值
    u16 = tb_bits_swap_u16(u16);

    // 交换无符号32位数值
    u32 = tb_bits_swap_u32(u32);

    // 交换无符号64位数值
    u64 = tb_bits_swap_u64(u64);

    // 将本地端的u32数值转为大端u32数值
    u32_be = tb_bits_ne_to_be_u32(u32_ne);

    // 将小端的u64值转为大端u64数值
    u64_be = tb_bits_ne_to_be_u32(u64_le);

    // 按大端顺序获取u32的前导0的位数
    count = tb_bits_cl0_u32_be(val);

    // 按小端顺序获取u64的前导1的位数
    count = tb_bits_cl1_u64_le(val);

    // 按大端顺序获取u32的第一个位0的索引位置
    index = tb_bits_fl0_u32_be(val);

    // 按小端顺序获取u64的第一个位1的索引位置
    index = tb_bits_fl1_u64_le(val);

    // 获取u32的位0的总数
    count = tb_bits_cb0_u32(val);

    // 获取u63的位1的总数
    count = tb_bits_cb1_u64(val);
```

其中此处的大部分接口，都进行过大量的优化，相当高效。

因此，如果能够充分利用tbox的stream, static_stream, bits的各种解析特性，去处理和解析各种二进制文件，是非常方便的，并且也非常高效。

而且也是跨平台支持，我们不需要关心某些平台是否能够处理地址非对齐时候的数值提取，这些tbox内部都会自动一最优的方式处理

tbox也会利用一些编译器特性、cpu架构上的特性，针对不同架构进行各种优化，已达到较为满意的解析效率。

如果解析的数据量非常大，stream内置的自动cache读写，可以充分优化io读写性能，在大量数值解析时候，减少频繁的文件读写操作。。


#### 附加stream数值读写接口列表

```c
/*! block read uint8 integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u8(tb_stream_ref_t stream, tb_uint8_t* pvalue);

/*! block read sint8 integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s8(tb_stream_ref_t stream, tb_sint8_t* pvalue);

/*! block read uint16-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u16_le(tb_stream_ref_t stream, tb_uint16_t* pvalue);

/*! block read sint16-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s16_le(tb_stream_ref_t stream, tb_sint16_t* pvalue);

/*! block read uint24-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u24_le(tb_stream_ref_t stream, tb_uint32_t* pvalue);

/*! block read sint24-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s24_le(tb_stream_ref_t stream, tb_sint32_t* pvalue);

/*! block read uint32-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u32_le(tb_stream_ref_t stream, tb_uint32_t* pvalue);

/*! block read sint32-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s32_le(tb_stream_ref_t stream, tb_sint32_t* pvalue);

/*! block read uint64-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u64_le(tb_stream_ref_t stream, tb_uint64_t* pvalue);

/*! block read sint64-le integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s64_le(tb_stream_ref_t stream, tb_sint64_t* pvalue);

/*! block read uint16-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u16_be(tb_stream_ref_t stream, tb_uint16_t* pvalue);

/*! block read sint16-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s16_be(tb_stream_ref_t stream, tb_sint16_t* pvalue);

/*! block read uint24-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u24_be(tb_stream_ref_t stream, tb_uint32_t* pvalue);

/*! block read sint24-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s24_be(tb_stream_ref_t stream, tb_sint32_t* pvalue);

/*! block read uint32-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u32_be(tb_stream_ref_t stream, tb_uint32_t* pvalue);

/*! block read sint32-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s32_be(tb_stream_ref_t stream, tb_sint32_t* pvalue);

/*! block read uint64-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_u64_be(tb_stream_ref_t stream, tb_uint64_t* pvalue);

/*! block read sint64-be integer
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_s64_be(tb_stream_ref_t stream, tb_sint64_t* pvalue);

/*! block writ uint8 integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u8(tb_stream_ref_t stream, tb_uint8_t value);

/*! block writ sint8 integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s8(tb_stream_ref_t stream, tb_sint8_t value);

/*! block writ uint16-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u16_le(tb_stream_ref_t stream, tb_uint16_t value);

/*! block writ sint16-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s16_le(tb_stream_ref_t stream, tb_sint16_t value);

/*! block writ uint24-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u24_le(tb_stream_ref_t stream, tb_uint32_t value);

/*! block writ sint24-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s24_le(tb_stream_ref_t stream, tb_sint32_t value);

/*! block writ uint32-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u32_le(tb_stream_ref_t stream, tb_uint32_t value);

/*! block writ sint32-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s32_le(tb_stream_ref_t stream, tb_sint32_t value);

/*! block writ uint64-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u64_le(tb_stream_ref_t stream, tb_uint64_t value);

/*! block writ sint64-le integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s64_le(tb_stream_ref_t stream, tb_sint64_t value);

/*! block writ uint16-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u16_be(tb_stream_ref_t stream, tb_uint16_t value);

/*! block writ sint16-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s16_be(tb_stream_ref_t stream, tb_sint16_t value);

/*! block writ uint24-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u24_be(tb_stream_ref_t stream, tb_uint32_t value);

/*! block writ sint24-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s24_be(tb_stream_ref_t stream, tb_sint32_t value);

/*! block writ uint32-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u32_be(tb_stream_ref_t stream, tb_uint32_t value);

/*! block writ sint32-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s32_be(tb_stream_ref_t stream, tb_sint32_t value);

/*! block writ uint64-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_u64_be(tb_stream_ref_t stream, tb_uint64_t value);

/*! block writ sint64-be integer
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_s64_be(tb_stream_ref_t stream, tb_sint64_t value);

#ifdef TB_CONFIG_TYPE_HAVE_FLOAT

/*! read float-le number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_float_le(tb_stream_ref_t stream, tb_float_t* pvalue);

/*! read float-be number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_float_be(tb_stream_ref_t stream, tb_float_t* pvalue);

/*! read double-ble number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_double_ble(tb_stream_ref_t stream, tb_double_t* pvalue);

/*! read double-bbe number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_double_bbe(tb_stream_ref_t stream, tb_double_t* pvalue);

/*! read double-lle number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_double_lle(tb_stream_ref_t stream, tb_double_t* pvalue);

/*! read double-lbe number
 *
 * @param stream        the stream
 * @param pvalue        the value pointer
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bread_double_lbe(tb_stream_ref_t stream, tb_double_t* pvalue);

/*! writ float-le number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_float_le(tb_stream_ref_t stream, tb_float_t value);

/*! writ float-be number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_float_be(tb_stream_ref_t stream, tb_float_t value);

/*! writ double-ble number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_double_ble(tb_stream_ref_t stream, tb_double_t value);

/*! writ double-bbe number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_double_bbe(tb_stream_ref_t stream, tb_double_t value);

/*! writ double-lle number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_double_lle(tb_stream_ref_t stream, tb_double_t value);

/*! writ double-lbe number
 *
 * @param stream        the stream
 * @param value         the value
 *
 * @return              tb_true or tb_false
 */
tb_bool_t               tb_stream_bwrit_double_lbe(tb_stream_ref_t stream, tb_double_t value);

#endif
```
