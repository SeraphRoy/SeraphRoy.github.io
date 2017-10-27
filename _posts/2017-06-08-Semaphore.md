---
layout: post
title: Semaphore
date: 2017-06-08 14:54
categories: ['Operating System']
tags: Thread
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Synchronization

So far we have discussed mutexes and condition variables as the tools of synchronization and of managing critical sections of code. These are not the only tools that can be used for the job, and you are going to find yourselves very soon doing a lab where mutexes and condition variables are not available to you, but semaphores are. So we need to consider semaphores.

The concept of semaphores as used in computer synchronization is due to the Dutch computer scientist Edsgar Dijkstra. They have the advantages of being very simple, but sufficient to construct just about any other synchronization function you would care to have; we will cover a few of them here. There are several versions of the semaphore idea in common use, and you may run into variants from time to time. The end of these notes briefly describe two of the most common, binary semaphores and the SYSV IPC semaphores.

A semaphore is an integer with a difference. Well, actually a few differences.

*   You set the value of the integer when you create it, but can never access the value directly after that; you must use one of the semaphore functions to adjust it, and you cannot ask for the current value.
*   There are semaphore functions to increment or decrement the value of the integer by one.
*   Decrementing is a (possibly) blocking function. If the resulting semaphore value is negative, the calling thread or process is blocked, and cannot continue until some other thread or process increments it.
*   Incrementing the semaphore when it is negative causes one (and only one) of the threads blocked by this semaphore to become unblocked and runnable.
*   All semaphore operations are atomic.

There are various ways that these operations are named and described, more or less interchangeably. This can be confusing, but such things happen in computer science when we try to use metaphors, especially multiple metaphors, to describe what a program is doing. Here are some:

<dl>

<dt>**Increment**</dt>

<dd>Dijkstra called this function **<font color="green">V()</font>**; it is also called signal, unlock, leave or release.</dd>

<dt>**Decrement**</dt>

<dd>Dijkstra called this function **<font color="green">P()</font>**; it is also called wait, lock, enter, or get.</dd>

</dl>

<!--more-->

## Implementation

The easiest way for me to think of semaphores is, of course, with code. Here is a little pseudo-code that may help.

```c
typedef struct sem {
  int value;
  other_stuff
} *Sem;
```

There are two actions defined on semaphores (we'll go with the classic terminology): **P(Sem s)** and **V(Sem s)**. **P** and **V** are the first letters of two Dutch words _proberen_ (to test) and _verhogen_ (to increment) which, on balance, makes about as much (or as little) sense as any other set of monikers. The inventor of semaphores was [Edsger Dijkstra](http://www.cs.utexas.edu/users/EWD/) who was very Dutch.

*   **P(Sem s)** decrements **s->value**, and if this is less than zero, the thread is blocked, and will remain so until another thread unblocks it. This is all done atomically.
*   **V(Sem s)** increments **s->value**, and if this is less than or equal to zero, then there is at least one other thread that is blocked because of **s**. Exactly one of these threads is chosen and unblocked. The definition of **V()** does not specify how the thread to unblock is chosen, although most uniprocessor thread packages use a FIFO algorithm.

```c
initialize(i)
{
    s->value = i
    return
}

P(Sem s)
{
    s->value--;
    if(s->value < 0)
    block on semaphore
    return
}

V(s)
{
    s->value++;
    if(s->value <= 0)
    unblock one process or thread that is blocked on semaphore
    return
}
```

You should understand these examples to be protected somehow from preemption, so that no other process could execute between the decrementing and testing of the semaphore value in the **P()** call, for instance.

If you consider semaphores carefully, you might decide that they are like mutexes, but they don't "lose" extra signals. This is a good way to look at them, but not the only way.

## Implementing Semaphores Using pthreads

Up to this point, we have discussed semaphores in general terms. That's because you will need to use them in this class in a couple of different contexts where the internal implementation will be different (and possibly hidden). It is critical that you understand the concept of the counting semaphore for this reason. Indeed, on many hardware platforms, there are primitive instructions to make implementation easy and efficient.

The power of semaphores, though, is that they can be implemented relatively simply and (as we'll see) they can be used to solve a wide variety of syncronization problems in a way that many would characterize as elegant.

In pthreads, the implementation of sempahores is pretty simple as long as your pthreads code adheres to basic thread principles. That is, the code uses threads and thread synchronization in a way that conforms to the fork/join model. We'll discuss the full pthreads picture with respect to semaphores as well, but to begin, consider the following code:

```c
typedef struct
{
        pthread_mutex_t lock;
        pthread_cond_t wait;
        int value;
} sema;

void pthread_sema_init(sema *s, int count)
{
        s->value = count;
        pthread_cond_init(&(s->wait),NULL);
        pthread_mutex_init(&(s->lock),NULL);
        return;
}

void pthread_sema_P(sema *s)
{
        pthread_mutex_lock(&(s->lock));
        s->value--;
        if(s->value < 0) {
                pthread_cond_wait(&(s->wait),&(s->lock));
        }
        pthread_mutex_unlock(&(s->lock));
        return;
}

void pthread_sema_V(sema *s)
{

        pthread_mutex_lock(&(s->lock));
        s->value++;
        if(s->value <= 0) {
                pthread_cond_signal(&(s->wait));
        }
        pthread_mutex_unlock(&(s->lock));
}
```

And that's it. You could add error checking (e.g. the initial value should never be negative) but that's the basic implementation.

This basic implementation makes several assumptions about the structure of the code. In particular, it assumes

*   no thread is ever cancelled via _pthread_cancel()_
*   the primitive _pthread_cond_signal()_ wakes up exactly one thread among the threads that are blocked on the condition variable.
*   the threaded program is not using Linux signals for interprocess communication

Of these requirements, the latter is the most troubling since Linux signals can be useful in a threaded program. For example, setting a timer signal as a way of implementing timeouts when the program is using sockets is often convenient.

The problem here is that the POSIX specification has changed over the years to make pthread less compatible with the original fork/join model it was intended to implement. The issue with pthread_cancel() is that it adds a new abstraction (cancellation state) to the API that the programmer must consider. In particular, condition variable synchronization primitives are cancellation points where, depending on the thread cancellation state, a thread might be cancelled. In general, cancelling a thread that is blocked in a synchronization primitive is a bad idea. That thread is almost assuredly part of some state update protocol in the program. When the thread is canceled, all of the state in the state-update protocol must be removed and determining this state precisely can be difficult.

For example, in the semaphore code shown above, a thread block in _pthread_cond_wait()_ that is cancelled has decermented the semaphore counter. Cancel is like the thread never existed so the counter value should be incremented. However the increment must be done in a critical section. The cancelled thread will not run. Instead a cancellation handler runs and that handler must run in the critical section which means it must acquire the lock. Is the lock automatically acquired? Is it dropped when the handler completes? You can look up these details, but the short answer is that you should not use cancel unless you are prepared to make your pthread code substantially more complex.

The second issue is that the current pthread specification says that a call to _pthread_cond_signal()_ will wake at least one thread (but possibly more). The exact reason the specification is written this way is not clear, but there is a reasonable explanation.

The primitive _pthread_cond_signal()_ as described in the lecture on condition variables was really designed to implement operating system monitors. In a monitor, after a thread is awakened, it must re-enter the monitor by acquiring the lock that the monitor uses to assure mutual exclusion. For pthreads, the easiest way to do this is to have threads that wake up as a result of a _pthread_cond_signal()_ then call (inside the _pthread_cond_wait()_ code) _pthread_mutex_lock()_ to reacquire the lock they were holding when then blocked. However, in a monitor, this lock is usually the same lock that is used to implement mutual exclusion. As such, there is no guarantee that the thread coming out of _pthread_cond_wait()_ will get the lock when it calls _pthread_mutex_lock()_ to re-enter the monitor. Instead, it may be that a new thread trying to enter the monitor (not coming out of a wait) is given the lock and allowed to enter the mutual exclusion region. If this thread changes the test predicate state and then leaves the mutual exclusion region and **then** the thread that was awakened re-enters the monitor, the state will not be the state that was present when the thread was signalled.

Thus when calling _pthread_cond_wait()_ in a monitor, the thread must re-test the state of the predicate it used to decide to call _pthread_cond_wait()_. If that state remains unchanged (i.e. the thread should not proceed) it should call _pthread_cond_wait()_ again (say in a _while_ loop).

The problem is that there are ways to use condition variables in the context of a fork/join model that do not suffer from this possibilty. Again, if _pthread_cond_signal()_ wakes exactly one thread (as most threaded programs assume) then the semaphore code shown above is incorrect if the P() primitive uses a while loop. The reason is that the semaphore counter is counting the number of blocked threads and the use of mutual exclusion assures that the counter state and the number of sleeping threads is synchronized if _pthread_cond_signal()_ wakes exactly one thread.

It seems that because the intent was to implement monitors, however, the specification designers took the opportunity to allow _pthread_cond_signal()_ and _pthread_cond_wait()_ to include the possibility that

*   threads can wake up randomly form _pthread_cond_wait()_
*   a call to _pthread_cond_signal()_ will wake one or more threads

This decision making is unfortunate because it introduces considerable complexity into what were relatively simple synchronization primitives. Further, it is unlikely that any truly sane implementation of pthreads will intentinally take advantage of this part of the specification. That is, these strange behaviors will occur when non-thread like events occur (cancel, fork, Linux signals, etc.) Indeed, if _pthread_cond_signal()_ were always to wake 2 threads (which is allowed in the specification) it is almost certainly the case that many programs using condition varaibles would need to be rewritten.

Be that as it may, it is possible to write the semaphore code in a slightly more complex way to work with these unfortunate semantics in the pthreads specification. Consider the following code:

```c
#include < stdlib.h >
#include < unistd.h >
#include < stdio.h >

#include < pthread.h >

typedef struct
{
        pthread_mutex_t lock;
        pthread_cond_t wait;
        int value;
    int waiters;
} sema;

sema *InitSem(int count)
{       
        sema *s;

        s = (sema *)malloc(sizeof(sema));
        if(s == NULL) {
                return(NULL);
        }
        s->value = count;
        s->waiters = 0;
        pthread_cond_init(&(s->wait),NULL);
        pthread_mutex_init(&(s->lock),NULL);

        return(s);
}

void P(sema *s)
{
        pthread_mutex_lock(&(s->lock));

        s->value--;

        while(s->value < 0) {
                /*
                 * maintain semaphore invariant
                 */
                if(s->waiters < (-1 * s->value)) {
                        s->waiters++;
                        pthread_cond_wait(&(s->wait),&(s->lock));
                        s->waiters--;
                } else {
                        break;
                }
        }

        pthread_mutex_unlock(&(s->lock));

        return;
}

void V(sema *s)
{

        pthread_mutex_lock(&(s->lock));

        s->value++;

        if(s->value <= 0)
        {
                pthread_cond_signal(&(s->wait));
        }

        pthread_mutex_unlock(&(s->lock));
}
```

This code relies on the invariant that the absolute value of the semaphore's value must be equal to the number of waiting threads when the value itself is less than zero. The code for _V()_ does not change (it still calls _pthread_cond_signal()_. However, the code for _P()_ now uses a counter (updated inside the critical section) to record how many threads are waiting on the condition variable. If a thread wakes up, it re-tests both the semaphore value and the invariant to determine whether it should proceed or it has been awakened spuriously and need to block again.

To test that this works, try changing the call to _pthread_cond_signal()_ to _pthread_cond_broadcast()_ which wakes up all threads. The semaphore primitive still work correctly (although they are much slower when there are many threads calling _P()_.

## Types of Synchronization Problems

By now, you've see three types of synchronization mechanisms:

*   **locks** (implemented at pthread_mutex_* under pthreads)
*   **condition variables** (implemented as pthread_cond_* under pthreads)
*   **semaphores**

It turns out that that these mechanisms are essentially equivalent in terms of their "power." The _power_ of a a language primitive is usually measured by the number of different programming challenges that a particular primitive can address. In the case of these synchronization mechanisms, each one can be used to implement the others (with some assumptions about how variables are shared and the atomicity of memory read and write instructions).

Much of the research that went into the design of these primitives centered on how "elegantly" they solved different synchronization problems that appear to be common to many asynchronous systems. In addition to the _bounded buffer_ problem, there are a few others.

## The Client-Trader Example Revisited

Take a look at the code for the [Client-Trader simulation written for semaphores]({{site.url}}/assets/market-semaphore.c). Study it for a minute. You should notice two features when comparing it to the [Client-Trader code written for condition variables]({{site.url}}/assets/market4.c) discussed in the [lecture on Condition Variables](http://www.cs.ucsb.edu/~rich/class/cs170/notes/CondVar/index.html).

*   the client thread and trader thread are **MUCH** simpler
*   the initialization of the semaphores in the constructor routines is **REALLY** important

Let's look at these features a little more closely. Here is the client and trader thread code with all of the comments removed to show how compact it is:

```c
void *ClientThread(void *arg)
{
    struct client_arg *ca = (struct client_arg *)arg;
    int i;
    int next;
    struct order *order;
    int stock_id;
    int quantity;
    int action;
    double now;

    for(i=0; i < ca->order_count; i++) {
        stock_id = (int)(RAND() * ca->max_stock_id);
        quantity = (int)(RAND() * ca->max_quantity);
        if(RAND() > 0.5) {
            action = 0; /* 0 => buy */
        } else {
            action = 1; /* 1 => sell */
        }
        order = InitOrder(stock_id,quantity,action);
        if(order == NULL) {
            fprintf(stderr,"no space for order\n");
            exit(1);
        }
         **P(ca->order_que->full);
        P(ca->order_que->mutex);** 
        next = (ca->order_que->head + 1) % ca->order_que->size;
        if(ca->verbose == 1) {
            now = CTimer();
            printf("%10.0f client %d: ",now,ca->id);
            printf("queued stock %d, for %d, %s\n",
                order->stock_id,
                order->quantity,
                (order->action ? "SELL" : "BUY")); 
        }
        ca->order_que->orders[next] = order;
        ca->order_que->head = next;
         **V(ca->order_que->empty);
        V(ca->order_que->mutex);
        P(order->fulfilled);** 
        FreeOrder(order);
    }

    return(NULL);
}

void *TraderThread(void *arg)
{
    struct trader_arg *ta = (struct trader_arg *)arg;
    struct order *order;
    int tail;
    double now;
    int next;
    struct stock *stock;

    while(1) {
         **P(ta->order_que->empty);** 
        if(*(ta->done) == 1) {
             **V(ta->order_que->empty);** 
            return;
        }
         **P(ta->order_que->mutex);** 
        next = (ta->order_que->tail + 1) % ta->order_que->size;
        order = ta->order_que->orders[next];
        ta->order_que->tail = next;
         **V(ta->order_que->full);
        V(ta->order_que->mutex);** 
        stock = &(ta->market->stocks[order->stock_id]);
         **P(stock->mutex);** 
        if(order->action == 1) { /* BUY */
            stock->quantity -= order->quantity;
            if(stock->quantity < 0) {
                stock->quantity = 0;
            }
        } else {
            stock->quantity += order->quantity;
        }
         **V(stock->mutex);** 
        if(ta->verbose == 1) {
            now = CTimer();
            printf("%10.0f trader: %d ",now,ta->id);
            printf("fulfilled stock %d for %d\n",
                order->stock_id,
                order->quantity);
        }
         **V(order->fulfilled);** 
    }

    return(NULL);
}
```

Simpler, no? Notice, also, that there are really three different uses of a sempahore in this code:

*   to implement a critical section around the shared queue head and tail pointers and the individual stock records
*   to count the number of full and empty slots and syncronize the threads based on this count
*   to send a "wake up" signal to a client from a trader when its order has been fulfilled

Before we discuss these three uses (and it is important that you undertand all three), take a moment to marvel at the magic of the counting semaphore. Look at how much that one primitive replaces in the corresponding [pthreads implementation of this code]({{site.url}}/assets/market4.c). Really -- I think the pthreads implementation is nice, but it is just stunning that so much of the mutex this, wait that, loop here and there just melts away with semaphores. So much so that one wonders why the pthreads specification doesn't include them as a first class primitive? Perhaps it is because they are easy to implement, but it is still a bit of a mystery.

Okay -- having enjoyed that reverie for a moment, it is important to understand that the semaphore primitive in this program is doing three different syncronization jobs _entirely alone_. You should notice that there are no other suncronization calls in the code (no calls to pthread_mutex_lock() or pthread_cond_wait()) -- it is only done with the semaphore.

## Implementing Mutual Exclusion

One use is to implement mutual exclusion. In the code, the head and tail pointers in the order queue must be updated atomically within a critical section. To implement a "lock" with a counting semaphore (so that code segments can be implemented atomically) on sets the initial value of the semaphore to _1_. Notice that doing so will allow the first thread that calls _P()_ on the semaphore to proceed but all other calls to _P()_ to block until _V()_ is called. When _V()_ is eventually called, one thread is selected and allowed to proceed.

Notice also that the count in the semaphore records (as a negative number) the number of threads that are blocked. By setting the initial value to _1_, calling _P()_ to get into a critical section and _V()_ to get out, the value only ever goes back to _1_ when a thread leaves the critical section and there are no threads waiting. That's exactly the functionality you'd like for mutual exclusion.

Notice in the code that mutual exclusion is needed both to implement the order queue correctly and also to ensure that updates to the stock totals in the market are atomic. In the constructor functions, then, for the order queue and the market, you'd expect to see a semaphore initialized with a value of _1_:

```c
struct order_que *InitOrderQue(int size)
{
    struct order_que *oq;

    oq = (struct order_que *)malloc(sizeof(struct order_que));
    if(oq == NULL) {
        return(NULL);
    }
    memset(oq,0,sizeof(struct order_que));

    oq->size = size+1; /* empty condition burns a slot */
    oq->orders = (struct order **)malloc(size*sizeof(struct order *));
    if(oq->orders == NULL) {
        free(oq);
        return(NULL);
    }
    memset(oq->orders,0,size*sizeof(struct order *));

     **oq->mutex = InitSem(1);** 
    oq->full = InitSem(size);
    oq->empty = InitSem(0);

    return(oq);
}

struct market *InitMarket(int stock_count, int init_quantity)
{
    struct market *m;
    int i;

    m = (struct market *)malloc(sizeof(struct market));
    if(m == NULL) {
        return(NULL);
    }
    m->count = stock_count;

    m->stocks = (struct stock *)malloc(stock_count*sizeof(struct stock));
    if(m->stocks == NULL) {
        free(m);
        return(NULL);
    }

    for(i=0; i < stock_count; i++) {
        m->stocks[i].quantity = init_quantity;
         **m->stocks[i].mutex = InitSem(1);** 
    }

    return(m);
}
```

Also you should check that the threads always call _P()_ when the try to enter a critical section and _V()_ when they leave. It may see a little confusing becasue _P()_ and _V()_ are also being called for other syncronization reasons. Be sure you can identify which calls are there for mutual exclusion reasons.

## Atomic Update of a Counter

The second use of semaphores in the code is to keep track of how many full and empty slots there are in the queue. In the [code based on condition variables]({{site.url}}/assets/market4.c) the client and trader threads test (under a lock) whether the queue is full or empty as needed. Notice that in the semaphore example, neither the client thread nor the trader thread test the head and tail pointers.

Instead, the code uses the ability of the semaphore to implement a simple integer counter atomically.

Client threads use this capability to make progress when the number of full slots is not equal to the size of the buffer. That is, if the count of full slots in the buffer is ever the same as the buffer's capacity, the client thread should block. Thus, the initial value of the _sema *full_ semaphore in the order queue should be set to the number of available slots. Each time a client thread calls _P()_ on this semaphore, the counter will decremented atomically. If the counter gets decremented to zero, the client thread is put to sleep because there isn't a slot available: the queue is full. To make this work, then, a trader thread must call _V()_ on the full semaphore every time it takes an order from the queue to indicate to the clients that a new slot is available.

Similarly, a trader thread must block until there is work in the queue. Initially, there is no work so the initial value of the _sema *empty_ semaphore must be zero. When a client puts work in the queue, it must call _V()_ on this semaphore to indicate that new work is present. If one or more trader threads are blocked becaus ethey have called _P()_ one will be selected and unblocked so that it can proceed.

Of equal importance, though, is the notion that exactly one thread is released from the semaphore when a _V()_ call is made **and** that the semaphore keeps track of _P()_ and _V()_ calls in its counter.

For example, when ever a client thread enqueues an order it calls _V()_ on the empty semaphore once, per order. Each call will release exactly one thread from being blocked so there is a one-to-one correspondence between orders and trader threads: each order will get a trader thread.

Notice also that it doesn't matter whether the trader threads are blocked or not. If all trader threads are busy and a new order arrives, the semaphore will go positive so the next _P()_ call by a trader will immediately release it without blocking.

Contrast this ability to "remember" that a _V()_ call has happened so that the next _P()_ call can proceed with _pthread_mutex_lock()_ and _pthread_mutex_unlock()_. An unlock does not "store" the notion that an immediate wake up is needed if a lock happens afterwards. Put another way, lock/unlock depends on having a lock happen before an unlock (as in a critical section). Semaphores, however, can be used in cases where it is not possible to guarantee that a _P()_ will always happen before its subsequent _V()_.

In this case, we don't know when the threads will run. Imagine, for example, that there are the same number of client threads as there are slots in the buffer and 1 trader thread. It might be that all client threads run and fill the buffer slots before the trader runs. Because the semaphore value of the empty semaphore will be equal to the number of client threads which is also equal to to the number of buffer queue slots, the trader thread will immediately proceed and start fulfilling orders when it runs and calls _P()_ on the empty semaphore.

## Sending a Signal

The final use of semaphores in this code is to signal a waiting client thread that the order has been fulfilled. Here, the _sema *fulfilled_ semaphore is initialized to zero indicating that the client thread should not proceed until a trader thread has completed the order. Thus, then the client calls _P()_ on the fulfilled semaphore it knows that the order has been fulfilled when the _P()_ call completes as long as the trader thread has called _V()_ on the semaphore after its completion.

Again, you should convince yourself that the thread execution order between client threads and trader threads does not affect the correctness of the result. Specifically, if a client gets to the _P()_ call on the fulfilled semaphore before the order is fulfilled it will wait until the trader thread's _V()_ call indicates that it should proceed. Alternatively, if the trader is faster and gets the order filled, calling _V()_ before the client gets to the _P()_ call the client will proceed immediately.

## Speed of the Solution

Here are the same set of experiments as we discussed in the [lecture on condition variables](../CondVar/index.html).

```bash
MossPiglet% ./market-semaphore -c 1 -t 1 -q 1 -s 1 -o 100000
140849.225016 transactions / sec

MossPiglet% ./market-semaphore -c 1 -t 1 -q 10000 -s 1 -o 100000
143667.854678 transactions / sec

MossPiglet% ./market-semaphore -c 1 -t 2 -q 1 -s 1 -o 100000
142093.914085 transactions / sec

MossPiglet% ./market-semaphore -c 1 -t 2 -q 10000 -s 1 -o 100000
133561.460408 transactions / sec

MossPiglet% ./market-semaphore -c 2 -t 2 -q 1 -s 1 -o 100000
118935.758078 transactions / sec

MossPiglet% ./market-semaphore -c 2 -t 2 -q 10000 -s 1 -o 100000
101221.276261 transactions / sec

MossPiglet% ./market-semaphore -c 100 -t 100 -q 100 -s 1 -o 10
55894.243070 transactions / sec
```

Curiously, the performance is a little slower than that for the [market3]({{site.url}}/assets/market3.c) solution. That's weird since it is basically doing the same kind of computation and synchronization and there are no cases where the code loops back to retest. However, the code is **MUCH** simpler to understand which makes it easier to maintain. The loss of performance (which would need to be verified over many runs) might be okay in exchange for the simplicity of the solution.

## Summarizing

So far, we have studied three types of syncronization problems, all of which are present in the client-trader example: **mutual exclusion**, **atomic counters**, and **signalling**. We've also looked through examples of how these problems may be addressed in pthreads using locks, condition variables, and semaphores. If, at this point, you are unclear on these concepts you should go back and review because they are the basis for most (but not all) of what you may encounter.
