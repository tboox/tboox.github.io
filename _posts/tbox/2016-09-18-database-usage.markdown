---
layout: post
title:  "Access sql database using tbox"
tags: tbox database sqlite3 mysql
categories: tbox
---

tbox supports sqlite3 and mysql databases now(depends on libsqlite3.a and libmysql.a) and provides the unified api to access database.

We only need pass a given url for connecting and accessing it.

A simple example:

```c
    /* init a mysql database
     *
     * mysql database url:
     *
     * - "sql://localhost:3306/?type=mysql&username=xxxx&password=xxxx&database=xxxx"
     *
     * sqlite3 database url:
     *
     * - "sql:///home/file.sqlitedb?type=sqlite3"
     * - "/home/file.sqlite3"
     * - "file:///home/file.sqlitedb"
     * - "C://home/file.sqlite3"
     */
    tb_database_sql_ref_t database = tb_database_sql_init("sql://localhost/?type=mysql&username=xxxx&password=xxxx&database=test");
    if (database)
    {
        // open database
        if (tb_database_sql_open(database))
        {
            // execute sql statement
            if (tb_database_sql_done(database, "select * from test"))
            {
                // load all results only for the select statement
                tb_iterator_ref_t result = tb_database_sql_result_load(database, tb_true);
                if (result)
                {
                    // trace
                    tb_trace_i("row: size: %lu", tb_iterator_size(result));
                    
                    // walk all rows
                    tb_for_all_if (tb_iterator_ref_t, row, result, row)
                    {
                        // trace
                        tb_trace_i("[row: %lu, col: size: %lu]: ", row_itor, tb_iterator_size(row));
                        
                        // walk all values
                        tb_for_all_if (tb_database_sql_value_t*, value, row, value)
                        {
                            // trace
                            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(value), tb_database_sql_value_text(value));
                        }
                    }
                    tb_database_sql_result_exit(database, result);
                }
            }
            else tb_trace_e("done %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
        }
        else tb_trace_e("open failed: %s", tb_state_cstr(tb_database_sql_state(database)));
        
        // exit database
        tb_database_sql_exit(database);
    }
```





We also access binary data using the statement.

```c
    tb_database_sql_statement_ref_t     stmt = tb_null;
    tb_stream_ref_t                     stream = tb_null;
    do
    {
        // init a insert statement
        if (!(stmt = tb_database_sql_statement_init(database, "insert into table2 values(?, ?, ?, ?, ?, ?, ?)")))
        {
            // trace
            tb_trace_e("stmt: init %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
        // init a large image stream
        stream = tb_stream_init_from_url("/tmp/large_image.png");
        tb_assert_and_check_break(stream);
        
        // open stream
        if (!tb_stream_open(stream)) break;
        
        // init argument list
        tb_database_sql_value_t list[7];
        tb_database_sql_value_set_text(&list[0], "hello", 0);
        tb_database_sql_value_set_blob16(&list[1], data, size);
        tb_database_sql_value_set_blob8(&list[2], data, size);
        tb_database_sql_value_set_blob32(&list[3], data, size, tb_null);
        tb_database_sql_value_set_blob32(&list[4], tb_null, 0, stream);
        tb_database_sql_value_set_int32(&list[5], number);
        tb_database_sql_value_set_int16(&list[6], snumber);
        
        // bind argument list
        if (!tb_database_sql_statement_bind(database, stmt, list, tb_arrayn(list)))
        {
            // trace
            tb_trace_e("stmt: bind %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
        // execute this statement
        if (!tb_database_sql_statement_done(database, stmt))
        {
            // trace
            tb_trace_e("stmt: done %s failed, error: %s", sql, tb_state_cstr(tb_database_sql_state(database)));
            break ;
        }
        
    } while (0);

    if (stmt) tb_database_sql_statement_exit(database, stmt);
    if (stream) tb_stream_exit(stream);
```

And we read results:

```c
    tb_iterator_ref_t result = tb_database_sql_result_load(database, tb_false);
    if (result)
    {
        tb_for_all_if (tb_iterator_ref_t, row, result, row)
        {
            tb_database_sql_value_t const* name = tb_iterator_item(row, 0);
            tb_assert_and_check_break(name);
            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(name), tb_database_sql_value_text(name));
            
            tb_database_sql_value_t const* data = tb_iterator_item(row, 1);
            tb_assert_and_check_break(data);
            tb_tracet_i("[%s:%s] ", tb_database_sql_value_name(data), tb_database_sql_value_blob(data));
            
            tb_database_sql_value_t const* ldata = tb_iterator_item(row, 4);
            tb_assert_and_check_break(ldata);
            {
                // attempt to read small data first fastly
                tb_stream_ref_t stream = tb_null;
                if (tb_database_sql_value_blob(ldata))
                {
                    tb_byte_t const*    data = tb_database_sql_value_blob(ldata);
                    tb_size             size = tb_database_sql_value_size(ldata);
                    // ...

                }
                // read large data stream
                else if ((stream = tb_database_sql_value_blob_stream(ldata)))
                {
                    // read data from this stream
                    // ...
                }
            }
            
            tb_database_sql_value_t const* number = tb_iterator_item(row, 5);
            tb_assert_and_check_break(number);
            tb_tracet_i("[%s:%d] ", tb_database_sql_value_name(number), tb_database_sql_value_int32(number));
            
        }
        
        tb_database_sql_result_exit(database, result);
    }
```
