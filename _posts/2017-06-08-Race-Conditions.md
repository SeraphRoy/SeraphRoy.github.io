---
layout: post
title: "Race Conditions"
date: 2017-06-08 12:40
categories: ['Operating System']
tags: Thread
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Race conditions and mutexes

Okay -- we are ready for our second operating systems concept. Operating systems must be able to protect shared state from **<font color="red">race conditions</font>**. Rather than giving you a formal definition for a race condition (which I will provide later), we will start with a very simple example.

The first thing to understand is that it is possible to run more than one thread on each CPU. Try running the [avg-manythread.c]({{ site.url }}/assets/avg-manythread.c) on 50 threads or so. The machines you can access have at most _8_ processors. How could they run 50 threads?

### Pre-emption and Context Switching

The answer is that the OS and threading system to arrange to multiplex the threads on the CPUs. Each thread is given a turn on some CPU. When it goes to do I/O, or a fixed amount of time has expired, the OS pauses the thread (saving off all of its machine state), and selects another thread to run. It then loads the saved machine state from the new thread onto the CPU and starts that thread at the spot where it last left off (or at the beginning if it was just created).

The process of pausing one thread to run another is called **pre-emption** and the second thread is said to pre-empt the first. The process of switching to a new thread (as a result of a pre-emption event) is called **context switching** and the saved machine state that is necessary to get a thread running again after a pause is often called a **context**.

<!--more-->

## An Example

Consider the use of an ATM at a bank. Somewhere, in bowels of your bank's computer system, is a variable called "account balance" that stores your current balance. When you withdraw \$200, there is a piece of assembly language code that runs on some machine that does the following calculation:

```
ld  r1,@richs_balance
sub r1,$200
st  r1,@richs_balance
```

which says (in a fictitious assembly language) "load the contents of rich's account_balance" into register r1, subtract 200 from it and leave the result in r1, and store the contents of r1 back to the variable rich's account_balance." The code is executed sequentially, in the order shown.

So far, so good.

Your bank is a busy place, though, and there are potentially millions of ATM transactions all at the same time, but each to a different account variable. So when Bob withdraws money, the machine executes

```
ld  r2,@bobs_balance
sub r2,$200
st  r2,@bobs_balance
```

and Fred's transactions look like

```
ld      r3,@freds_balance
sub     r3,$200
st      r3,@freds_balance
```

In each case, the register and the variable are different.

Now, let's assume that the bank wants to use threads as a programming convenience, and that the programmer has chosen preemptive threads as we have been discussing. Each set of instructions goes in its own thread

```
thread_0                thread_1                thread_2
-------                 --------                --------
ld r1,@richs_balance    ld r2,@bobs_balance ld  r3,@freds_balance
sub r1,$200             sub r2,$200             sub r3,$200
st r1,@richs_balance    st r2,@bobs_balance     st r3,@freds_balance
```

The thing about preemptive threads is **<font color="red">you don't know when pre-emption will take place</font>**. For example, thread_0 could start, execute two instructions, and suddenly be preempted for thread_1 which could be preempted for thread_2, and so on

```
    ld      r1,@richs_balance ;; thread_0
    sub     r1,$200           ;; thread_0
    **** pre-empt! ****
    ld      r2,@bobs_balance  ;; thread_1
    sub     r2,$200           ;; thread_1
    **** pre-empt! ****
    ld      r3,@freds_balance ;; thread_2
    sub     r3,$200           ;; thread_2
    **** pre-empt! ****
    st      r1,@richs_balance ;; thread_0
    **** pre-empt! ****
    st      r2,@bobs_balance  ;; thread_1
    **** pre-empt! ****
    st      r3,@freds_balance ;; thread_2
```

In fact (and this is the part to get)

**<font color="green">any interleaving of instructions that preserves the sequential order of each individual thread is legal and may occur.</font>**

The system cannot choose to rearrange the instructions within a thread but because threads can be preempted **at any time** all interleavings of the instructions are possible.

Again, in this example, there is no real problem (yet). It doesn't matter where you put the preempts or whether you leave them out -- the ATM system will function properly.

Now let's say you've thought about this for a good long while and you come up with a scheme. You get a good friend, you give them your ATM PIN number and a GPS synchronized watch, and you say "at exactly 12:00, withdraw $$200." 12:00 rolls around and you and your friend both go to separate ATMs and simultaneously withdraw \$200\. Let's say, further, that you are lucky, your account contains \$1000 to begin with, and that the bank's computers makes two threads:

```
thread_0                thread_1
-------                 --------
ld r1,@richs_balance    ld r2,@richs_balance
sub r1,$200             sub r2,$200
st r1,@richs_balance    st r2,@richs_balance
```

Because you are lucky and you've gotten the bank to launch both threads at the same time, the following interleaving takes place

```
ld r1,@richs_balance ;; thread_0
*** pre-empt ***
ld r2,@richs_balance ;; thread_1
*** pre-empt ***
sub r1,$200          ;; thread_0
*** pre-empt ***
sub r2,$200          ;; thread_1
*** pre-empt ***
st r1,@richs_balance ;; thread_0
*** pre-empt ***
st r2,@richs_balance ;; thread_1
```

**<font color="green">What is the contents of richs_balance when both threads finish?</font>**

It should be $$600, right? Both you and your friend withdrew \$200 each from your \$1000 balance. If this were the way things worked at your bank, however, richs_balance would be \$800\.

Why?

Look at what happens step by step. The first **ld** loads 1000 into r1\. thread_0 gets preempted and thread_1 starts. It loads 1000 into r2\. Then it gets preempted and thread_0 runs again. r1 (which contains 1000) is decremented by 200 so it now contains 800\. Then thread_1 pre-empts thread_0 again, and r2 (which contains 1000 from the last load of r2) gets decremented by 200 leaving 800\. Then thread_0 runs again and stores 800 into richs_balance. Then thread_1 runs again and stores 800 into richs_balance and the final value is 800.

This problem is called a **<font color="red">race condition</font>**. It occurs when there is a legal ordering of instructions within threads that can make the desired outcome incorrect. Notice that there are lots of ways thread_0 and thread_1 could have interleaved in which the final value of richs_balance would have been $$600 (the correct value). It is just that you are lucky (or you tried this trick enough so that the law of averages eventually worked out for you) to cause one of the \$200 withdrawals to disappear.

Note also that the problem is worse if the bank has a machine with at least 2 CPUs. In this case, thread_0 and thread_1 run _at the same time_ which means that they both execute the fist subtraction at the same time. How does a race condition occur in this case? Turns out that the memory system for multi-processors implements memory write operations one-at-a-time (multiple simultaneous reads are possible from cache). Thus when they both go to store the balance of $$800, one will write its value first and the other will over write that value with the same \$800\. The outcome is the same as the profitable interleaving shown above with preemption.

## Critical Sections, Atomic Execution, and Mutual Exclusion

It may be obvious, but the way to ensure that the bank balance is always computed correctly is to ensure that _at most_ one thread is allowed to execution the load-substract-store sequence at a time. As long as those three instructions are executed, in order, without any other threads interleaving themselves, the balance will be computed correctly.

A segment of code that must be executed sequentially without the potential interleaving of other threads is called a **<font color="green">Critical Section</font>**. We will sometime refer to the notion that all instructions within a critical section will be executed without being interleaved as **<font color="green">Atomic Execution</font>** as in the sentence

**The instructions within a critical section are executed atomically.**

meaning that they will not be interleaved with instructions executed by other threads executing in the same section of code.

The process of ensuring that _at most_ one thread can be executing in a critical section is often termed **<font color="green">mutual exclusion</font>** to distinguish it from other forms of synchronization. Those other forms will become clear as the course progress. For now, the important concept to grasp is that we need a way to make sure, no matter what the circumstances, at most one thread can be executing is specific code segments where a race condition due to interleaving could produce an unwanted computation.

As the following example attempts to illustrate, mutual exclusion is typically implemented with some form of "lock." A lock has the following semantics:

*   a lock is initially in the state "unlocked"
*   there is a primitive that allows a thread to attempt to "lock" the lock
*   there is a primitive that allows a thread to "unlock" a lock that is locked
*   any attempt to lock a lock that is already locked, blocks the thread and puts it on a list of threads waiting for the lock to be unlocked
*   when a lock is unlocked by the thread that is holding the lock, if there are threads waiting (because they tried to lock before), _one_ is selected by the system, given the lock, and allowed to proceed.This sounds a bit like Dr. Seuss, but is is pretty simple. Think of it as a lock on a door to a room. When one person enters and locks the door, any other attempts to entry will be blocked. In the cases we'll study, the threads that try to get into the room (the critical section) while someone (another thread) is in it will wait patiently just outside the door. Then, when a thread that is in the room leaves, it will pick one of the waiting threads (and only one) and allow it to enter the room and lock the door behind it.

### In Through the Out Door

Mutual exclusion has some interesting properties. First, it is important that any thread that enters a critical section by locking it, leave it by unlocking it. In the room example, if a person enters the room, locks the door, and then climbs out a window without unlocking the door, no one else will ever be able to get in. In a program, leaving a critical section without calling the unlock primitive is like climbing out the window of the room. Worse, (and don't think of this as being morbid) if the person in the room dies (or your thread exits due to a fault or because you have returned) the door never gets unlocked and threads waiting will wait forever.

The other thing to understand is that even when your threads correctly enter and leave critical sections, the size of the section influences the amount of concurrency your program will have. For example, if every ATM in the US had to lock the entire bank to implement a transaction, ATM response time would probably be pretty slow.

Thus, you typically try and keep the length of each critical section as small as possible, both to maximize the amount of concurrency and also to minimize the possibility of having a bug cause a thread to die to exit the section accidentally without calling unlock.

## A Code Example

Look at [race1.c]({{ site.url }}/assets/race1.c). Its usage is

```
race1 nthreads stringsize iterations
```

This is a pretty simple program. The command line arguments call for the user to specify the number of threads, a string size and a number of iterations. Then the program does the following. It allocates an array of **stringsize+1** characters (the **+1** accounts for the null terminator). Then it forks off **nthreads** threads, passing each thread its id, the number of iterations, and the character array. Here is the output if we call it with the arguments 4, 4, 1.

```bash
./race1 4 40 1
Thread 3: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 2: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
Thread 1: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Thread 0: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Looks fine, doesn't it? Try again with more threads and iterations:

```bash
./race1 10 40 2
Thread 1: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 1: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Thread 2: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Thread 2: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
Thread 3: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
Thread 3: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 0: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 0: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thread 4: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thread 4: EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
Thread 6: EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
Thread 6: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
Thread 7: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
Thread 7: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
Thread 8: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
Thread 8: IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
Thread 9: IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
Thread 9: JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ
Thread 5: JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ
Thread 5: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
```

Does this look right? Not exactly. In the main loop of each thread

```c
 for (j = 0; j < t->size-1; j++) {
    t->s[j] = 'A'+t->id;
 }
```

the thread should put its own letter (defined as the thread's ID + 'A') in the buffer. Thus, for example, Thread 1 should always print 'B' and not any other character.

Notice that all 4 threads share the same buffer _s_ in the program. Consider the output from [race2.c]({{ site.url }}/assets/race2.c)

```bash
./race2 4 40 2
Thread 2: AAAAAAAAAAAAAAAAABBBCCCCCCCCCCCCCCCCCCCC
Thread 3: CCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAABBBBBDDD
Thread 1: DDDDDDDDDDDDDDDDDDDDAAAAAAAAAAAABBBBBDBB
Thread 0: BBBBBBBBBBBBBBBBBBDDAAAAAAAAAAAAAAAAAAAA
Thread 3: AAAAAAAAAAAAABBBBCCCDDDDDDDDDDDDDDDDDDDD
Thread 2: AAAAAAAAAAAAAABBBCBBBBBBBBBBBBCCCCCCCCCC
Thread 1: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCCC
Thread 0: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

The code is **exactly the same** as [race1.c]({{ site.url }}/assets/race1.c) but with a delay loop scheduled in the main write loop to allow a greater chance for preemption. The reason you don't see this problem in the first execution is because the machine is too fast and Linux is too smart. That is, without the delay loop sometimes the speed of the machine and the Linux thread schedule "get it right" and you get the answer you are expecting. However, if you ran this program over and over, eventually you'd see an output that you didn't expect. Don't care? Well you should because things like airplanes which rely on many such calculations per second need to get the right answer **every** time. Race conditions are difficult to debug because they often manifest only rarely. Thus be forewarned:

**Just because your program runs and doesn't appear to have a race condition doesn't mean it is free from race conditions.**

In this example, we can fix the race condition by enforcing the condition that no thread can be interrupted by another thread when it is modifying and printing **s**. This can be done with a **mutex** (which is short for **mutual exclusion**), sometimes called a "lock." There are three procedures for dealing with mutexes in pthreads:

```c
pthread_mutex_init(pthread_mutex_t *mutex, NULL);
pthread_mutex_lock(pthread_mutex_t *mutex);
pthread_mutex_unlock(pthread_mutex_t *mutex);
```

You create a mutex with **pthread_mutex_init()**. Then any thread may lock or unlock the mutex. When a thread locks the mutex, no other thread may lock it. If they call **pthread_mutex_lock()** while the thread is locked, then they will block until the thread is unlocked. Only one thread may lock the mutex at a time.

So, we fix the **race** program with [race3.c]({{ site.url }}/assets/race3.c). You'll notice that a thread locks the mutex just before modifying **s** and it unlocks the mutex just after printing **s**. This fixes the program so that the output makes sense:

```bash
./race3 10 40 2
Thread 0: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thread 0: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Thread 2: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
Thread 2: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
Thread 6: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
Thread 6: GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
Thread 4: EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
Thread 4: EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
Thread 8: IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
Thread 8: IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
Thread 1: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Thread 1: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
Thread 7: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
Thread 7: HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
Thread 9: JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ
Thread 9: JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ
Thread 3: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 3: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
Thread 5: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
Thread 5: FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
```

Are these outputs correct? Yes. Each thread prints a full buffer full if its specific letter. Notice that the order in which the threads is not controlled. That is, Linux is still free to schedule Thread 2 before Thread 1 even though the code called **pthread_create()** for Thread 1 before Thread 2\. However, the lock ensures that each thread completely fills the buffer and prints it without being preempted by another thread.

* * *

### Formal Definition of Race Conditions

Now we'll try for a formal definition.

**_<font color="green">Race condition:</font>_** the possibility in a program consisting of concurrent threads that all legal instruction orderings do not result in exactly the same output.

Notice that under this definition of **race condition** the program [race3.c]({{ site.url }}/assets/race3.c) still has a race condition -- just a different one than the one we fixed with a mutex lock. Technically, because the threads can run in any order, different outputs from the same execution are possible. The question of whether a race condition is a bug or not has to do with what the programmer intended. If any thread ordering is fine but we want each thread to fill and print its buffer, than this version of the code is correct even though it has a race condition.

### Terse advice on mutexes

Race conditions exist, and mutexes and condition variables (see next lecture) are needed when ever preemptive threads **update** a shared data structure. There is no problem is the threads only read what is there. If updates take place, however, thread access must be synchronized. That is the key. In all of these examples, some shared variable is being updates. If you are using pre-emption, and you see updates to shared state, think "race condition."

### Race Condition Thought Question

Consider the code in [race_ABC.c]({{ site.url }}/assets/race_ABC.c) What does it do? Does it contain a race condition?
