---
layout: post.cn
title:  "利用正则实现匹配和替换"
tags: tbox 正则表达式 替换 匹配
categories: tbox
---

tbox里面针对三个正则库（pcre/pcre2/posix）进行了封装，实现接口统一和跨平台处理，只要xmake在编译配置的时候自动检测到其中一种库，就可以使用了，一般会优先使用pcre2。

如果你不想过多的依赖第三方库，可以切换到posix的正则，调用 `xmake f --pcre=false --pcre2=false` 把pcre的库禁用了就行了。

首先给个最简单的匹配单个子串的例子：

```c
    // 执行简单匹配，第二个参数是匹配模式，默认传0就行了
    tb_vector_ref_t results = tb_regex_match_done_simple("(\\w+)\\s+?(\\w+)", 0, "hello world");
    if (results)
    {
        // 遍历匹配到的结果
        tb_for_all_if (tb_regex_match_ref_t, entry, results, entry)
        {
            // 打印匹配到的子串的起始偏移、长度、和内容
            tb_trace_i("[%lu, %lu]: %s", entry->start, entry->size, entry->cstr);
        }
        
        // 销毁匹配到的结果数据
        tb_vector_exit(results);
    }
```

输出结果如下：

```
[0, 11]: hello world 
[0, 5]: hello
[6, 5]: world
```




第一个匹配结果，是针对整个匹配子串的，后面两个结果，是针对()里面的分组匹配。。

如果不想进行遍历，只像提取其中第一个分组匹配的结果，可以这么使用：

```c
    // 执行简单匹配，第二个参数是匹配模式，默认传0就行了
    tb_vector_ref_t results = tb_regex_match_done_simple("(\\w+)\\s+?(\\w+)", 0, "hello world");
    if (results && tb_vector_size(results) > 1)
    {
        // 获取第一个分组结果，也就是索引1的子串
        tb_regex_match_ref_t entry = (tb_regex_match_ref_t)tb_iterator_item(results, 1);
        if (entry)
        {
            // 打印匹配到的子串的起始偏移、长度、和内容
            tb_trace_i("[%lu, %lu]: %s", entry->start, entry->size, entry->cstr);
        }
        
        // 销毁匹配到的结果数据
        tb_vector_exit(results);
    }
```

上面只能匹配全文中的第一个字串，如果想要进行全局匹配，可以这么来：

```c

    // 初始化一个正则对象，采用默认匹配模式
    tb_regex_ref_t regex = tb_regex_init("\\w+", 0);
    if (regex)
    {
        // 循环匹配全部子串
        tb_long_t       start = 0;
        tb_size_t       length = 0;
        tb_vector_ref_t results = tb_null;
        while ((start = tb_regex_match_cstr(regex, content, start + length, &length, &results)) >= 0 && results)
        {
            // 整个子串的起始偏移和长度（不是分组子串，是整个匹配串）
            tb_trace_i("[%lu, %lu]: ", start, length);

            // 遍历显示这个匹配子串的所有分组，第一项是整个子串
            tb_for_all_if (tb_regex_match_ref_t, entry, results, entry)
            {
                // trace
                tb_trace_i("    [%lu, %lu]: %s", entry->start, entry->size, entry->cstr);
            }
        }

        // 销毁正则对象
        tb_regex_exit(regex);
    }

```

用 `tb_regex_init` 创建一个正则对象的方式，针对匹配次数频繁的操作，进行了优化，因为它会提前预编译正则表达式

如果只是进行单一子串匹配，那么使用`tb_regex_match_done_simple`就够用了，毕竟接口更加简单易用

需要注意的是，用 `tb_regex_init` 进行的所有匹配结果和替换结果，是不需要手动销毁释放的，在调用`tb_regex_exit`，会去自动释放他们

前面传递的匹配模式，只传了0，使用默认匹配规则，tbox目前可以支持以下模式：

```c
    TB_REGEX_MODE_NONE              = 0     //!< 默认匹配模式
,   TB_REGEX_MODE_CASELESS          = 1     //!< 忽略大小写匹配
,   TB_REGEX_MODE_MULTILINE         = 2     //!< ^ 和 $ 匹配新行，实现多行匹配
,   TB_REGEX_MODE_GLOBAL            = 4     //!< 执行全局替换

```

替换子串更加方便，如果替换单次子串，只需要：

```c
    // 执行单次替换
    tb_char_t const* results = tb_regex_replace_done_simple("\\w+", 0, "hello world", "hi");
    if (results)
    {
        // trace
        tb_trace_i(": %s", results);

        // 销毁结果字串
        tb_free(results);
    }
```

输出结果如下：

```
hi world
```

如果要进行多次全局替换，只需修改匹配模式：

```c
    // 设置TB_REGEX_MODE_GLOBAL全局替换模式，执行多次替换
    tb_char_t const* results = tb_regex_replace_done_simple("\\w+", TB_REGEX_MODE_GLOBAL, "hello world", "hi");
    if (results)
    {
        // trace
        tb_trace_i(": %s", results);

        // 销毁结果字串
        tb_free(results);
    }
```

输出结果如下：

```
hi hi
```

当然如果同一个正则替换不同文本的操作很频繁，那么先用 `tb_regex_init("\\w+", TB_REGEX_MODE_GLOBAL)` 创建个正则对象来替换，这样效率会高很多，这个就看具体实际需要了。。

