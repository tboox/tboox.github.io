---
layout: post.cn
title:  "通过流进行解压缩文件"
tags: tbox stream 流 解压缩
categories: tbox
---

这里为了使代码更加简洁，直接用了transfer来挂接两路流的传输操作。

```c
    // 初始化文件输入流
    tb_stream_ref_t istream = tb_stream_init_from_url("/home/file.txt");

    // 初始化文件输出流
    tb_stream_ref_t ostream = tb_stream_init_from_file("/home/file.gz", TB_FILE_MODE_RW | TB_FILE_MODE_CREAT | TB_FILE_MODE_BINARY | TB_FILE_MODE_TRUNC);

    // 初始化解压缩流，以istream作为输入
    tb_stream_ref_t fstream = tb_stream_init_filter_from_zip(istream, TB_ZIP_ALGO_GZIP, TB_ZIP_ACTION_INFLATE);

    // 初始化压缩流，以istream作为输入
    //tb_stream_ref_t fstream = tb_stream_init_filter_from_zip(istream, TB_ZIP_ALGO_GZIP, TB_ZIP_ACTION_DEFLATE);    

    // 进行流传输，并且通过 fstream进行中间外挂解压、压缩
    if (istream && ostream && fstream) 
    {
        /* 保存流数据，如果每个流都还没有调用tb_stream_open打开过
         * 这里会自动帮你打开，这样上层接口使用上，看上去更加简洁明了
         * 
         * 后面三个参数主要用于：限速、进度信息回调，这些之后再详细说明
         * 现在只需要传空就行了
         *
         * save 是 实际传输的数据大小，失败返回：-1
         */
        tb_hong_t save = tb_transfer_done(fstream, ostream, 0, tb_null, tb_null);
    }

    // 释放流数据
    if (fstream) tb_stream_exit(fstream);
    if (istream) tb_stream_exit(istream);
    if (ostream) tb_stream_exit(ostream);
```
