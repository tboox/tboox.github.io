---
layout: post.cn
title:  "多进程等待的跨平台实现"
tags: xmake lua tbox windows 协程 进程等待 跨平台
categories: xmake
---

最近在[xmake](http://www.xmake.io)中，用lua的协程实现了多任务编译，效果还是不错的，不过后来发现一个问题：

如果所有编译进程都在处理编译，没有退出的时候，xmake的lua主进程会不断地在这些任务间，不停的切换轮询进程的状态，但是有没有机会执行其他任务，导致cpu过高，抢占了编译进程的cpu时间。。

那如果在等不到完成的进程时候，加入sleep等待呢，又会导致编译速度变慢，没法合理利用cpu。。


因此，为了解决这个问题，我打算扩展下lua的接口，实现了一个跨平台的多进程等待接口: `process.waitlist` 实现多个未完成进程的同时等待，让出xmake主进程的cpu时间，给其他编译进程充分利用

xmake中的lua代码如下：

```lua
        -- wait processes
        local tasks_finished = {}
        local procs_count = #procs
        if procs_count > 0 then

            -- wait them
            local procinfos = process.waitlist(procs, ifelse(procs_count < jobs, 0, -1))
            for _, procinfo in ipairs(procinfos) do
                
                -- the process info
                local proc      = procinfo[1]
                local procid    = procinfo[2]
                local status    = procinfo[3]

                -- check
                assert(procs[procid] == proc)

                -- resume this task
                local job_task = tasks[procid]
                local job_proc = coroutine.resume(job_task, 1, status)

                -- the other process is pending for this task?
                if coroutine.status(job_task) ~= "dead" then

                    -- check
                    assert(job_proc)

                    -- update the pending process
                    procs[procid] = job_proc

                -- this task has been finised?
                else

                    -- mark this task as finised
                    tasks_finished[procid] = true
                end
            end
        end
```

在`os.exec`运行进程的接口实现中，如果当前进程没有立即退出，就通过协程切换出去，知道上面的多进程等待，获取到实际的退出进程后，直接定向切换到退出进程的`os.exec`中，继续完成后续操作，这样就不会有冗余切换问题：

```lua
-- execute shell 
function os.exec(cmd, outfile, errfile)

    -- open command
    local ok = -1
    local proc = process.open(cmd, outfile, errfile)
    if proc ~= nil then

        -- wait process
        local waitok = -1
        local status = -1 
        if coroutine.running() then

            -- save the current directory
            local curdir = os.curdir()

            -- wait it
            repeat
                -- poll it
                waitok, status = process.wait(proc, 0)
                if waitok == 0 then
                    -- 外面的多进程等待到实际的状态值后，直接进行处理
                    waitok, status = coroutine.yield(proc)
                end
            until waitok ~= 0

            -- resume the current directory
            os.cd(curdir)
        else
            waitok, status = process.wait(proc, -1)
        end

        -- get status
        if waitok > 0 then
            ok = status
        end

        -- close process
        process.close(proc)
    end

    -- ok?
    return ok
end
```

lua的上层调用有了，那怎么去实现这个跨平台的多进程等待呢？

在windows上我们能想到就是`WaitForMultipleObjects`这个接口了，我把它封装到了[tbox](https://github.com/waruqi/tbox)里面具体实现如下：

```c
tb_long_t tb_process_waitlist(tb_process_ref_t const* processes, tb_process_waitinfo_ref_t infolist, tb_size_t infomaxn, tb_long_t timeout)
{
    // check
    tb_assert_and_check_return_val(processes && infolist && infomaxn, -1);

    // make the process list
    tb_size_t               procsize = 0;
    HANDLE                  proclist[256] = {0};
    tb_process_t const**    pprocess = (tb_process_t const**)processes;
    for (; *pprocess && procsize < tb_arrayn(proclist); pprocess++, procsize++)
        proclist[procsize] = (*pprocess)->pi.hProcess;
    tb_assertf(procsize < tb_arrayn(proclist), "too much waited processes!");


    // wait processes
    DWORD       exitcode = 0;
    tb_long_t   infosize = 0;
    DWORD result = tb_kernel32()->WaitForMultipleObjects(procsize, proclist, FALSE, timeout < 0? INFINITE : (DWORD)timeout);
    switch (result)
    {
    case WAIT_TIMEOUT:
        break;
    case WAIT_FAILED:
        return -1;
    default:
        {
            // the process index
            DWORD index = result - WAIT_OBJECT_0;

            // the process
            tb_process_t* process = (tb_process_t*)processes[index];
            tb_assert_and_check_return_val(process, -1);

            // save process info
            infolist[infosize].index    = index;
            infolist[infosize].process  = (tb_process_ref_t)process;
            infolist[infosize].status   = tb_kernel32()->GetExitCodeProcess(process->pi.hProcess, &exitcode)? (tb_long_t)exitcode : -1;  
            infosize++;

            // close thread handle
            tb_kernel32()->CloseHandle(process->pi.hThread);
            process->pi.hThread = INVALID_HANDLE_VALUE;

            // close process
            tb_kernel32()->CloseHandle(process->pi.hProcess);
            process->pi.hProcess = INVALID_HANDLE_VALUE;

            // next index
            index++;
            while (index < procsize)
            {
                // attempt to wait next process
                result = tb_kernel32()->WaitForMultipleObjects(procsize - index, proclist + index, FALSE, 0);
                switch (result)
                {
                case WAIT_TIMEOUT:
                    // no more, exit loop
                    index = procsize;
                    break;
                case WAIT_FAILED:
                    return -1;
                default:
                    {
                        // the process index
                        index += result - WAIT_OBJECT_0;

                        // the process
                        process = (tb_process_t*)processes[index];
                        tb_assert_and_check_return_val(process, -1);

                        // save process info
                        infolist[infosize].index    = index;
                        infolist[infosize].process  = (tb_process_ref_t)process;
                        infolist[infosize].status   = tb_kernel32()->GetExitCodeProcess(process->pi.hProcess, &exitcode)? (tb_long_t)exitcode : -1;  
                        infosize++;

                        // close thread handle
                        tb_kernel32()->CloseHandle(process->pi.hThread);
                        process->pi.hThread = INVALID_HANDLE_VALUE;

                        // close process
                        tb_kernel32()->CloseHandle(process->pi.hProcess);
                        process->pi.hProcess = INVALID_HANDLE_VALUE;

                        // next index
                        index++;
                    }
                    break;
                }
            }
        }
        break;
    }

    // ok?
    return infosize;
}
```

如果在linux以及其他posix系统上，可以使用`wait`或者`waitpid` 接口，其实`wait`也就是相当于调用了 `waitpid(-1, &status, ..)`，所以我这里就直接使用`waitpid`来实现了。。

它跟windows的`WaitForMultipleObjects`有些不同，不能传递指定需要等待哪些进程句柄，想要等待多个进程，只能传递-1，表示等待所有子进程

不过我们在封装接口的时候，可以还是传入多个要等待的子进程列表，如果获取到的子进程不在这个列表里面，就直接忽略掉，有的话就返回出来，这样的话，行为上就跟windows的差不多了。。

```c
tb_long_t tb_process_waitlist(tb_process_ref_t const* processes, tb_process_waitinfo_ref_t infolist, tb_size_t infomaxn, tb_long_t timeout)
{
    // check
    tb_assert_and_check_return_val(processes && infolist && infomaxn, -1);

    // done
    tb_long_t infosize = 0;
    tb_hong_t time = tb_mclock();
    do
    {
        // wait it
        tb_int_t    status = -1;
        tb_long_t   result = waitpid(-1, &status, timeout < 0? 0 : WNOHANG | WUNTRACED);
        tb_check_return_val(result != -1, -1);

        // exited?
        if (result != 0)
        {
            // find this process 
            tb_process_t const** pprocess = (tb_process_t const**)processes;
            for (; *pprocess && (*pprocess)->pid != result; pprocess++) ;

            // found?
            if (*pprocess)
            {
                // save process info
                infolist[infosize].index = (tb_process_ref_t const*)pprocess - processes;
                infolist[infosize].process = (tb_process_ref_t)*pprocess;
                infolist[infosize].status = WIFEXITED(status)? WEXITSTATUS(status) : -1;
                infosize++;

                // attempt to wait other processes
                while (infosize < infomaxn)
                {
                    // attempt to wait it
                    status = -1;
                    result = waitpid(-1, &status, WNOHANG | WUNTRACED);

                    // error or timeout? end
                    tb_check_break(result != 0);

                    // find this process 
                    tb_process_t const** pprocess = (tb_process_t const**)processes;
                    for (; *pprocess && (*pprocess)->pid != result; pprocess++) ;

                    // found?
                    if (*pprocess)
                    {
                        // save process info
                        infolist[infosize].index = (tb_process_ref_t const*)pprocess - processes;
                        infolist[infosize].process = (tb_process_ref_t)*pprocess;
                        infolist[infosize].status = WIFEXITED(status)? WEXITSTATUS(status) : -1;
                        infosize++;
                    }
                    else break;
                }

                // end
                break;
            }
        }

        // wait some time
        if (timeout > 0) tb_msleep(tb_min(timeout, 60));

    } while (timeout > 0 && tb_mclock() - time < (tb_hong_t)timeout);

    // ok?
    return infosize;
}
```

最后贴下这个跨平台接口的是如何使用的，这里给了一个比较完整的demo

```c
    // init processes
    tb_size_t        count1 = 0;
    tb_process_ref_t processes1[5] = {0};
    tb_process_ref_t processes2[5] = {0};
    for (; count1 < 4; count1++)
    {
        processes1[count1] = tb_process_init(argv[1], (tb_char_t const**)(argv + 1), tb_null);
        tb_assert_and_check_break(processes1[count1]);
    }

    // ok?
    while (count1)
    {
        // trace
        tb_trace_i("waiting: %ld", count1);

        // wait processes
        tb_long_t               infosize = -1;
        tb_process_waitinfo_t   infolist[4];
        if ((infosize = tb_process_waitlist(processes1, infolist, tb_arrayn(infolist), -1)) > 0)
        {
            tb_size_t i = 0;
            for (i = 0; i < infosize; i++)
            {
                // trace
                tb_trace_i("process(%ld:%p) exited: %ld", infolist[i].index, infolist[i].process, infolist[i].status);

                // exit process
                if (infolist[i].process) tb_process_exit(infolist[i].process);

                // remove this process
                processes1[infolist[i].index] = tb_null;
            }

            // update processes
            tb_size_t count2 = 0;
            for (i = 0; i < count1; i++) 
            {
                if (processes1[i]) processes2[count2++] = processes1[i];
            }
            tb_memcpy(processes1, processes2, count2 * sizeof(tb_process_ref_t));
            processes1[count2] = tb_null;
            count1 = count2;
        }
    }
```

