---
layout: post.cn
title:  "tbox中数据库的使用"
tags: tbox 数据库 sqlite3 mysql
categories: tbox
---

tbox目前支持sqlite3、mysql两种关系型数据库（需要链接对应的libsqlite3.a和libmysql.a），并对其接口进行了封装，使用更加的方便简洁并且只需要换个url，就可以随时切换成其他数据库引擎，而不需要修改接口。

下面先看个简单的例子：

```c
    /* 初始化一个mysql数据库
     *
     * localhost:   主机名，也可以是ip地址
     * type:        数据库的类型，目前支持：mysql 和 sqlite3两种类型
     * username:    数据库用户名
     * password:    数据库用户密码
     * database:    要访问的数据库名称， 如果不设置则自动连接默认的数据库
     *
     * 若果你想指定个端口，可以显示传入：
     * "sql://localhost:3306/?type=mysql&username=xxxx&password=xxxx&database=xxxx"
     *
     * sqlite3的数据库访问url为：
     * "sql:///home/file.sqlitedb?type=sqlite3"
     *
     * 或者直接传文件路径：
     * "/home/file.sqlite3"
     * "file:///home/file.sqlitedb"
     * "C://home/file.sqlite3"
     */
    tb_database_sql_ref_t database = tb_database_sql_init("sql://localhost/?type=mysql&username=xxxx&password=xxxx&database=test");
    if (database)
    {
        // 打开数据库
        if (tb_database_sql_open(database))
        {
            // 执行sql语句，进行查询
            if (tb_database_sql_done(database, "select * from test"))
            {
                /* 加载结果集
                 *
                 * 如果是insert, update等非select语句执行，这个时候返回tb_null， 说明没有结果集
                 *
                 * 这个结果集完全采用迭代器模式，方便快速迭代访问。
                 *
                 * 后面的参数tb_true指示尽量一次性加载所有结果到内存，如果成功
                 * 就可以通过tb_iterator_size(result)获取实际的结果集行数。
                 *
                 * 如果一次性加载失败或者传入的是tb_false， 说明只能通过fetch，一行行的回滚数据行
                 * 这样占用内存的资源较少，但是没法提前获取到实际的行数，这个时候tb_iterator_size(result)
                 * 返回的是一个超大值
                 */
                tb_iterator_ref_t result = tb_database_sql_result_load(database, tb_true);
                if (result)
                {
                    // 如果一次性加载成功，返回实际的结果行数
                    tb_trace_i("row: size: %lu", tb_iterator_size(result));
                    
                    // 遍历所有行
                    tb_for_all_if (tb_iterator_ref_t, row, result, row)
                    {
                        // 显示行的列数
                        tb_trace_i("[row: %lu, col: size: %lu]: ", row_itor, tb_iterator_size(row));
                        
                        // 遍历这一行中的所有值
                        tb_for_all_if (tb_database_sql_value_t*, value, row, value)
                        {
                            /* tb_database_sql_value_name(value): 获取值所对应列名
                             * tb_database_sql_value_text(value)：获取值的文本数据，如果是text类型的话
                             * tb_database_sql_value_type(value)：获取值的类型
                             *
                             * ...
                             */
                            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(value), tb_database_sql_value_text(value));
                        }
                    }
                    
                    // 释放结果集数据
                    tb_database_sql_result_exit(database, result);
                }
            }
            else
            {
                // 执行失败，显示失败状态和原因
                tb_trace_e("done %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            }
        }
        else
        {
            // 打开失败，显示失败状态和原因
            tb_trace_e("open failed: %s", tb_state_cstr(tb_database_sql_state(database)));
        }
        
        // 退出数据库
        tb_database_sql_exit(database);
    }
```






上面的例子没法处理二进制数据，如果要处理二进制数据，比如插入一个图像数据什么的可以使用statement模式，预编译一个sql语句，bind每个参数来实现，这种方式更加的灵活而且对于频繁处理某个sql语句的情况，效率更高，因为省去每次都要解析一遍sql语法的过程。

具体使用过程也很简单，下面先看个insert二进制数据的例子：

```c
    // done
    tb_database_sql_statement_ref_t     stmt = tb_null;
    tb_stream_ref_t                     stream = tb_null;
    do
    {
        // 初始化一个插入语句，需要自定义传入的参数用?代替， 并进行预编译处理
        if (!(stmt = tb_database_sql_statement_init(database, "insert into table2 values(?, ?, ?, ?, ?, ?, ?)")))
        {
            // trace
            tb_trace_e("stmt: init %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
        // 初始化一个超大图像数据流
        stream = tb_stream_init_from_url("/tmp/large_image.png");
        tb_assert_and_check_break(stream);
        
        // 打开流
        if (!tb_stream_open(stream)) break;
        
        // 参数列表
        tb_database_sql_value_t list[7];

        // 绑定一个text类型的参数，sql中对应：text
        tb_database_sql_value_set_text(&list[0], "hello", 0);

        // 绑定一个uint16大小的blob数据参数，由于是小块数据，不用使用stream，sql中对应：blob
        tb_database_sql_value_set_blob16(&list[1], data, size);

        // 绑定一个uint8大小的超小数据块，节省存储空间，sql中对应：tinyblob
        tb_database_sql_value_set_blob8(&list[2], data, size);

        // 绑定一个uint32大小的超大数据块，sql中对应：longblob
        tb_database_sql_value_set_blob32(&list[3], data, size, tb_null);

        // 绑定一个uint32大小的超大数据流，这样比较节省内存，不会一次性加载数据到内存中来处理，sql中对应：longblob
        tb_database_sql_value_set_blob32(&list[4], tb_null, 0, stream);

        // 绑定一个int32整数，sql中对应int
        tb_database_sql_value_set_int32(&list[5], number);

        // 绑定一个int16整数，sql中对应smallint
        tb_database_sql_value_set_int16(&list[6], snumber);
        
        // 绑定参数列表
        if (!tb_database_sql_statement_bind(database, stmt, list, tb_arrayn(list)))
        {
            // trace
            tb_trace_e("stmt: bind %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
        // 执行预编译的sql语句
        if (!tb_database_sql_statement_done(database, stmt))
        {
            // trace
            tb_trace_e("stmt: done %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
    } while (0);

    // 删除sql语句对象
    if (stmt) tb_database_sql_statement_exit(database, stmt);

    // 退出数据流
    if (stream) tb_stream_exit(stream);
```

对于获取对应结果集数据，使用的接口和第一个例子一样，可以直接进行迭代
也可以通过索引直接访问其中某列的数据：

```c
    // 按回滚方式加载结果集
    tb_iterator_ref_t result = tb_database_sql_result_load(database, tb_false);
    if (result)
    {
        // 遍历行
        tb_for_all_if (tb_iterator_ref_t, row, result, row)
        {
            // 获取text数据
            tb_database_sql_value_t const* name = tb_iterator_item(row, 0);
            tb_assert_and_check_break(name);
            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(name), tb_database_sql_value_text(name));
            
            // 获取blob16数据
            tb_database_sql_value_t const* data = tb_iterator_item(row, 1);
            tb_assert_and_check_break(data);
            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(data), tb_database_sql_value_blob(data));
            
            // 获取blob32数据
            tb_database_sql_value_t const* ldata = tb_iterator_item(row, 4);
            tb_assert_and_check_break(ldata);
            {
                /* 优先尝试获取数据buffer，如果存在的话
                 *
                 * 针对小块数据进行了优化，就算是blob32的数据，如果数据大小
                 * 本身不大，会直接存到内存buffer中去，来快速读取
                 */
                tb_stream_ref_t     stream = tb_null;
                if (tb_database_sql_value_blob(ldata))
                {
                    // 获取数据和大小
                    tb_byte_t const*    data = tb_database_sql_value_blob(ldata);
                    tb_size             size = tb_database_sql_value_size(ldata);
                    // ...

                }
                // 如果获取不到数据buffer，说明数据量很大，尝试获取数据流来处理
                else if ((stream = tb_database_sql_value_blob_stream(ldata)))
                {
                    // 进行stream的数据读取，注：这个流不支持写操作，只能用来读
                    // ...

                }
            }
            
            // 获取int32数据，如果是int8, int16 或者float类型的数据，会自动进行强转
            tb_database_sql_value_t const* number = tb_iterator_item(row, 5);
            tb_assert_and_check_break(number);
            tb_tracet_i("[%s:%d] ", tb_database_sql_value_name(number), tb_database_sql_value_int32(number));
            
        }
        
        // 退出结果集
        tb_database_sql_result_exit(database, result);
    }
```
