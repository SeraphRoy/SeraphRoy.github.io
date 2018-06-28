---
layout: post
title: "Python Global Interpreter Lock (GIL)"
date: 2018-06-28 14:30
categories: ['Interpreter']
tags: ['Interpreter', GIL]
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Introduction

In CPython, the global interpreter lock, or GIL is a mutex that prevents multiple threads from executing Python bytecodes at once. The lock is necessary mainly because CPython's memory management is not thread-safe.

# A Performance Experiment

```python
  0 import time
  1 import threading
  2 import multiprocessing
  3
  4 NUM = 10000000
  5
  6 def count(n):
  7    while n > 0:
  8    ¦  n -= 1
  9
 10 t1 = threading.Thread(target=count, args=(NUM,))
 11 t2 = threading.Thread(target=count, args=(NUM,))
 12 start = time.time()
 13 t1.start()
 14 t2.start()
 15 t1.join()
 16 t2.join()
 17 print "multithread:"
 18 print time.time() - start
 19
 20 start = time.time()
 21 count(NUM)
 22 count(NUM)
 23 print "single thread:"
 24 print time.time() - start
 25
 26 p1 = multiprocessing.Process(target=count, args=(NUM,))
 27 p2 = multiprocessing.Process(target=count, args=(NUM,))
 28 start = time.time()
 29 p1.start()
 30 p2.start()
 31 p1.join()
 32 p2.join()
 33 print "multi process:"
 34 print time.time() - start

```

Here's the output:

```bash
multithread:
1.70929884911
single thread:
1.03298616409
multi process:
0.507339954376
```

Why do I get those performance results?

<!--more-->

# About Python Threads

Python threads are _real_ system threads (pthreads or Windows threads). They are fully managed by host OS including all scheduling/thread switching. Here's what happens on thread creation
   - Python creates a small data structure containing some interpreter state
   - A new thread (pthread) is launched
   - The thread calls PyEval_CallObject, which is justa C function call that runs whatever Python callable was specified

Each thread has its own interpreter specific data structure (PyThreadState):
- Current stack frame (for python code)
- Current recursion depth
- Thread ID
- Some per-thread exception information
- Optional tracing/profiling/debugging hooks
- It's just a small C struct

The interpreter has a _global variable_ that simply points to the ThreadState struct of the currently running thread

```c
PyThreadState *_PyThreadState_Current = NULL;
```

So that operations in the interpreter implicitly depend this variable to know what thread they're currently working with

# GIL Behavior

Threads hold the GIL when running; however they release it when blocking for I/O

![]({{site.url}}/assets/GIL-IO.png)

Basically any time a thread is forced to wait other "ready" threads get their chance to run.

But for CPU-bound threads that never perform any I/O, the interpreter periodically performs a "check". By default, every 100 interpreter "__ticks__" it does a check.

![]({{site.url}}/assets/GIL-CPU.png)

The check interval is a global counter that is completely independent of thread scheduling. See `sys.setcheckinterval()` and `sys.getcheckinterval`

![]({{site.url}}/assets/GIL-Check.png)

What happens during the periodic check?
- In the __main thread only__, signal handlers will execute if there are any pending signals
- Release and reacquire the GIL so that multiple CPU-bound threads get to run by briefly releasing the GIL, and other threads get a chance to run.

A __Tick__ loosely map to interpreter instruction(s)

![]({{site.url}}/assets/GIL-Tick.png)

Noted that:
- Ticks are __not__ time-based
- In fact long operations can block everything
- ticks are uninterruptible

## Singal Handling

A very common problem encountered with Python thread programming is that threaded programs can no longer be killed with the keyboard interrupt so you have to use `kill -9` in a separate window. Why???

If a signal arrives, the interpreter runs the "check" __after every tick__ until the main thread runs. Since signal handlers can only run in the main thread, the interpreter quickly acquires/releases the GIL after every tick until it gets scheduled. Because Python has no control over scheduling so it just attempts to thread swithc as fast as possible with the hope that main will run.

![]({{site.url}}/assets/GIL-Signal.png)

The reason Ctrl-C doesn't work with threaded programs is that the main thread is opten blocked on an uninterruptible thread-join or lock. Since it's blocked, it __never gets scheduled__ to run any kind of signal handler for it. And as an extra bonus, the interpreter is left in a state where it tries to thread-switch after every tick, so not only can you not interrupt the program, it runs slow as hell!!!

# GIL Implementation

It is either a POSIX semaphore or a pthreads condition variable. So all interpreter locking is based on _signaling_.

# Back to the Performance Experiment

As we saw earlier CPU-bound threads have terrible performances, and two threads is even worse than single thread. The question is: what is the source of that overhead?

Answer: Signaling: After every 100 ticks, the interpreter locks a mutex, signals on a conditional variable/semaphore where another thread is __always__ waiting. And because another thread is waiting, extra pthreads processing and system calls get triggered to deliver the signal.

![]({{site.url}}/assets/GIL-Measure-1.png)
![]({{site.url}}/assets/GIL-Measure-2.png)
![]({{site.url}}/assets/GIL-Battle.png)

What's happening above is a battle between two competing and incompatible goals:
- Python - only wants to run single-threaded but doesn't want anything to do with thread scheduling (up to OS)
- OS - "Oooh. Multiple cores." Freely schedules processes/threads to take advantage of as many cores as possible

# Multicore GIL Contention

Even 1 CPU-bound thread causes problems: it degrades response time of I/O-bound threads

![]({{site.url}}/assets/Multicore-GIL-1.png)
![]({{site.url}}/assets/Multicore-GIL-2.png)

This scenario is a bizarre sort of "priority inversion" problem: A CPU-bound thread (low priority) is blocking the execution of an I/O-bound thread (high priority). It occurs because the I/O thread can't wake up fast enough to acquire the GIL before the CPU-bound thread reacquires it. ANd it only happens on multicore...
