---
layout: post
title: "Condition Variables"
date: 2017-06-08 13:31
categories: ['Operating System']
tags: Thread
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Introduction -- The Bounded Buffer Problem

It is possible to use locks (pthread_mutex_lock in pthreads) to implement different forms of synchronization, but often it is cumbersome to do so. In particular, there are cases when it is necessary to have one thread wait for something to be computed by another and then only to make progress when that computation has been completed. In the examples we have studied so far, the thread that logically waits is created by the thread that is logically producing the computation upon which that thread is waiting.

That is, if thread 1 produces a variable value that will be used by thread 2 (as in the average example in the IntroThreads lecture), thread 1 performs the computation, stores the value, and spawns the threads that then use this computation.

This form of parallelism is often called "producer-consumer" parallelism and it occurs in operating systems frequently. In this example, thread 1 "produces" a value that thread 2 consumes (presumably to compute something else).

Perhaps more germane to the class at hand, this problem is also called the **bounded buffer** problem since the buffer used to speed-match the producers and consumers has a fixed length. In an operating systems context, these types of synchronization problems occur frequently. There are cases where threads and/or devices need to communicate, their speeds differ or vary, and the OS must allocate a fixed memory footprint to enable efficient producer-consumer parallelism.

While it is logically possible to spawn a new thread that runs every time a new value is produced and to have that thread terminate after it has consumed the value, the overhead of all of the create and join calls would be large. Instead, pthreads includes a way for one thread to wait for a signal from another before proceeding. It is called a **condition variable** and it is used to implement producer-consumer style parallelism without the constant need to spawn and join threads.

Condition variables are a feature of a syncronization primitive called a [monitor](http://en.wikipedia.org/wiki/Monitor_(synchronization)) which is similar to the way in which operating systems kernels work. We won't discuss them formally at this juncture but their use will become clear as the class progresses. For pthreads, however, condition variables are used to

*   implement test under lock
*   implement wait and signal

which as we will see are more or less equivalent usages.

<!--more-->

## The Client/Trader Example

To make the concepts clearer, consider the following hypothetical example. Imagine that you are to write a simple trading program that allows "clients" to send stock orders to "traders" who are responsible for executing them in a market. Orders should be presented to the traders in first-come, first-served order, but the traders then execute the orders as fast as possible. Further, once a trader has executed an order, it needs to send a signal back to the client that initiated the order indicating that the order has been fulfilled.

Thus clients

*   create an order
*   place it on a queue shared by all traders and clients
*   wait for the order to be fulfilled
*   repeat

    and traders

*   take an order from the queue
*   execute it (buy or sell)
*   tell the client who initiated the that the order is fulfilled
*   repeat

Simple enough?

First, let's start with a picture. Often the easiest way to begin to understand these types of syncronization problems is with a picture.

![]({{site.url}}/assets/Condition-Variables-fig1.png)

This will be a simplified example that we'll implement using pthreads. In it, clients use the queue to send their orders to traders, the traders interact via a single shared "market" and then send responses directly back to clients.

## Example Solutions

We'll go through several solutions that are based on the same code base. They differ only in the way that they syncronize the clients and traders. To understand the effects of these difference it is best to first understand the code that is common to all of them.

There four main data structures:

*   **order**: specifying a stock, a quantity, an action (BUY/SELL), and a flag indicating when the order has been fulfilled
*   **order_que**: a one-dimensional array of pointers to orders that is managed as a FIFO using a head and tail index
*   **stock**: a counter indicating the quantity of a stock that is currently available for sale
*   **market**: a one-dimensional array of stocks indexed by stock ID

Here are the C structure definitions for these data structures:

```c
struct order
{
    int stock_id;
    int quantity;
    int action; /* buy or sell */
    int fulfilled;  
};

struct order_que
{
    struct order **orders;
    int size;
    int head;
    int tail;
    pthread_mutex_t lock;
};

struct market
{
    pthread_mutex_t lock;
    int *stocks;
    int count;
};
```

Notice that the _struct market_ structure just uses an array of integers to represent the array of possible stocks. Each stock is named by an integer that is passed from client to trader in the _int stock_id_ field of the order.

The _struct order_que_ has a pointer to an array of pointers to orders, a head and tail pointer to use for the FIFO, and a size indicating how many elements there are in the array of pointers to orders. Thus each element in the queue points to an order that has been dynamically allocated. The size of that queue of pointers is also used to dynamically allocate the array itself. To see how this works, it is helpful to study the constructor function for a _struct order_que_

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
        oq->orders = (struct order **)malloc(oq->size*sizeof(struct order *));
        if(oq->orders == NULL) {
                free(oq);
                return(NULL);
        }
        memset(oq->orders,0,size*sizeof(struct order *));

        pthread_mutex_init(&oq->lock,NULL);

        return(oq);
}
```

Notice that the _size_ parameter is used to _malloc()_ an array of pointers to _struct order_ data types. If you don't understand this use of _malloc()_ and pointers, stop here and review. It will be important since dynamic memory allocation, arrays, structures, and pointers are **essential** to success in this class.

### Clients

Each solution is a simulation of the client-trader interaction. In it, clients, create orders for stocks that consist of

*   a randomly selected stock among all possible stocks
*   a random quantity for the transaction for that stock
*   a BUY or SELL action, again selected randomly

Notice that price doesn't factor into the simulation. It is possible to introduce a notion of price but it requires a third type of actor (the market maker) to adjust prices based on supply and demand. To keep it simple, we'll assume that each client "knows" that she wants to trade at what ever the current price is (which isn't represented in the simulation).

Clients create a _struct order_ data type, fill it it with their randomly generated order information, and queue it on an order queue (of which there will only be one in these examples). Then the client waits for the _int fulfilled_ flag to indicate that the order has been fulfilled by a trader (which will set the flag to _1_).

### Traders

Traders each dequeue and order from the order queue and execute the trade with a market (of which there will only be one in these examples). To do so, they use the _int stock_id_ in the _struct order_ as an index into the _struct market_ and then either decrement the value in the _int *stocks_ array if the action is a BUY, or they increment it if the action is a SELL. For simplicity, the value in an element of the _int *stocks_ array is never allowed to go negative. Then, after an order has been fulfilled, the trader sets the _int fulfilled_ flag in the order to _1_.

The client has to retain a pointer to the order so that it ca "see" when the order has been fulfilled, deallocate the order, and loop around to create a new one.

### Exectuting the Examples

Each example uses the same argument list

*   -c client_count: specifies the number of client threads
*   -t trader_count: specifies the number of trader thread
*   -o order_count: specifies the total number of orders each client will issue before finishing
*   -s stock_count: specifies the number of stocks in the market
*   -q queue_size: specifies the size of the queue to use between clients and traders
*   -V: sets the verbose flag on so that the simulation prints out internal information (slows the execution down)

Thus, for example, the first solution discussed as

```bash
./market1 -c 10 -t 10 -s 100 -q 5 -o 1000
```

says to runs the simulation with 10 clients, 10 traders, 100 stocks, a queue size of 5, and each client will issues and wait for 1000 orders to complete.

Without the _-V_ each simulation prints out the transaction rate. That is, the number of orders/second the entire simulation was able to achieve using the parameters specified.

### Understanding the Examples

In these lecture notes, we'll focus on specific aspects of the code that have to do with the way in which the clients and traders (each represented by a thread) must synchronize. We won't cover possible useful details like the way in which the arguments are parsed. That information, however, is available to you in the source code itself and you are encouraged to study it. It is also helpful if you make copies of these examples, build them, and run them as you may find yourself wanting to use parts of these programs for your own assignments.

All of the examples and a makefile are available from [http://www.cs.ucsb.edu/~rich/class/cs170/notes/CondVar/example](http://www.cs.ucsb.edu/~rich/class/cs170/notes/CondVar/example)

## Solution 1: Synchronization using Mutexes Only

In the first attempted solution we'll look at how the syncronization works if you used only the pthread mutex data type. The [market1]({{ site.url }}/assets/market1.c).

First look at the arguments passed to the client thread:

```c
struct client_arg
{
        int id;
        int order_count;
        struct order_que *order_que;
        int max_stock_id;
        int max_quantity;
        int verbose;
};
```

The clients need to know the address of the order queue (_struct order_que *)_), how many orders to place (_int order count_), the maximum ID to use when choosing a stock (_int max_stock_id_), the maximum quantity to use when choosing a quantity (_max_quantity_) an id for printing and the verbose flag.

Note that the pointer the order queue will be the same for all clients so that they share the same queue.

Next look at the body of the client thread code

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
    int queued;
    double now;

    for(i=0; i < ca->order_count; i++) {
        /*
         * create an order for a random stock
         */
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
         /*
           queue it for the traders
         */
        queued = 0;
        while(queued == 0) {
            pthread_mutex_lock(&(ca->order_que->lock));
            next = (ca->order_que->head + 1) % ca->order_que->size;
            /*
             * is the queue full?
             */
            if(next == ca->order_que->tail) {
                pthread_mutex_unlock(&(ca->order_que->lock));
                continue;
            }** 
            /*
             * there is space in the queue, add the order and bump
             * the head
             */
            if(ca->verbose == 1) {
                now = CTimer();
                printf("%10.0f client %d: ",now,ca->id);
                printf("queued stock %d, for %d, %s\n",
                    order->stock_id,
                    order->quantity,
                    (order->action ? "SELL" : "BUY")); 
            }
             **ca->order_que->orders[next] = order;
            ca->order_que->head = next;
            queued = 1;
            pthread_mutex_unlock(&(ca->order_que->lock));

            /*
             * spin waiting until the order is fulfilled
             */
            while(order->fulfilled == 0);** 
            /*
             * done, free the order and repeat
             */
            FreeOrder(order);
        }
    }

    return(NULL);
}
```

In this code segment the lines where the client is synchronizing are in bold face. Notice that the head and tail pointers for the share order queue must be managed as a critical section. Each client must add an order and update the head and tail pointers atomically.

To do this using _pthread_mutex_t_ is a little tricky. Why? Because when the client must test to make sure the queue isn't full before it updates the head and tail pointers (or an order will be lost). If the queue is full, the client must wait, but it can't stop and wait holding the lock or a deadlock will occur. Thus, when the queue is full, the client must drop its lock (so that a trader can get into the critical section to dequeue an order thereby opening a slot) and loop back around to try again.

This type of syncronization is called "polling" since the client "polls" the full condition and loops while the condition polls as true.

Notice also that the client comes out of the polling loop holding the lock so that it adds the order to the queue and moves the head pointer atomically. Only after it has successfully added the order to the queue does the client drop its lock.

The other tricky business here is in the code where the client waits for the trader to fulfill the order

```                        c
// spin waiting until the order is fulfilled
while(order->fulfilled == 0);
```

Why is there no lock? Notice that the lock for the order has been dropped. Should there be a lock here?

Well, if there is, it can't be the same lock as the one for the order queue or the trader (which will also use this lock to test the empty condition) won't be able to get into the critical section to dequeue an order. It is possible to have added a _pthread_mutex_t lock_ to the order structure but the syncronization of the fulfillment of a single order is between a single client and a single trader. That is, the client and trader are not racing. Rather, the trader needs to send a signal to the client that the trade is done and the client needs to wait for that signal. Since there is only going to be one client waiting and one trader sending the signal, the client can simply "spin" polling the value of the _int fulfilled_ flag until the trader sets it to _1_. This method of syncronization works _only_ if the memory system of the processor guarantees that memory reads and writes are atomic (which the x86 architecture does).

Thus the while loop shown above simply spins until the value in the order structure gets set to 1, thereby "holding" the client until the trade completes.

The trader thread code is as follows:

```c
void *TraderThread(void *arg)
{
    struct trader_arg *ta = (struct trader_arg *)arg;
    int dequeued;
    struct order *order;
    int tail;
    double now;
    int next;

    while(1) {
         **dequeued = 0;
        while(dequeued == 0) {
            pthread_mutex_lock(&(ta->order_que->lock));
            /*
             * is the queue empty?
             */
            if(ta->order_que->head == ta->order_que->tail) {
                pthread_mutex_unlock(&(ta->order_que->lock));
                /*
                 * if the queue is empty, are we done?
                 */
                if(*(ta->done) == 1) {
                    pthread_exit(NULL);
                }
                continue;
            }** 
            /*
             * get the next order
             */
            next = (ta->order_que->tail + 1) % ta->order_que->size;
            order = ta->order_que->orders[next];
            ta->order_que->tail = next;
             **pthread_mutex_unlock(&(ta->order_que->lock));** 
            dequeued = 1;
        }
        /*
         * have an order to process
         */
         **pthread_mutex_lock(&(ta->market->lock));
        if(order->action == 1) { /* BUY */
            ta->market->stocks[order->stock_id] -= order->quantity;
            if(ta->market->stocks[order->stock_id] < 0) {
                ta->market->stocks[order->stock_id] = 0;
            }
        } else {
            ta->market->stocks[order->stock_id] += order->quantity;
        }
        pthread_mutex_unlock(&(ta->market->lock));** 
        if(ta->verbose == 1) {
            now = CTimer();
            printf("%10.0f trader: %d ",now,ta->id);
            printf("fulfilled stock %d for %d\n",
                order->stock_id,
                order->quantity);
        }
        /*
         * tell the client the order is done
         */
         **order->fulfilled = 1;** 
    }

    return(NULL);
}
```

In the trader thread there are three synchronization events (which I have tried to boldface).

*   synchronizing on the empty condition and head/tail pointers of the order queue
*   synchronizing with other traders on the stock record in the market
*   setting the fulfilled flag in the order structure to tell the client the order is completed

Like with the client, the trader takes a lock, then tests the condition of the queue only this time it is looking to make sure the queue is not empty (while the client is worried about the queue being full). If the queue is empty, the trader must drop the lock and loop around until there is work. It then comes out of the loop holding the lock so it can dequeue the order and move the head and tail pointer atomically.

The trader includes an additional wrinkle for shutting down the entire simulation. In the case of the client, the main loop runs for as many orders as there are going to be for each client. The traders, however, don't know when the clients are done. To tell the traders, the trader argument structure

```c
struct trader_arg
{
        int id;
        struct order_que *order_que;
        struct market *market;
        int *done;
        int verbose;
};
```

includes a pointer to an integer (_int *done_) which will be set to _1_ by the main thread once it has joined with all of the clients. That is, the main thread will try and join will all clients (which will each finish once their set of orders is processed), set the done flag, and then join with all traders. Take a look at the _main()_ function in [the source code]({{ site.url}}/assets/market1.c) to see the details. However, in the spin loop where the trader is waiting for the queue not to be empty, it must also test to see if the main thread has signaled that the simulation is done.

Note also that the traders must synchronize when accessing the market since each BUY or SELL order must be processed atomically. That is, there is a race condition with respect to updating the stock balance that the traders must avoid by accessing the market atomically.

Finally, once an order has been successfully executed, the trader sets the _int fulfilled_ flag to tell the client that it can continue.

### Speed of Solution 1

On the machine I used (my laptop which is a Mac with a 2.8Hz i7 having 2 cores and hyperthreading), I get the following outputs:

```bash
MossPiglet% ./market1 -c 1 -t 1 -q 1 -s 1 -o 100000
160194.266347 transactions / sec

MossPiglet% ./market1 -c 1 -t 1 -q 10000 -s 1 -o 100000
178848.307204 transactions / sec

MossPiglet% ./market1 -c 1 -t 2 -q 1 -s 1 -o 100000
69281.818970 transactions / sec

MossPiglet% ./market1 -c 1 -t 2 -q 10000 -s 1 -o 100000
67015.364164 transactions / sec

MossPiglet% ./market1 -c 2 -t 2 -q 1 -s 1 -o 100000
116164.790273 transactions / sec

MossPiglet% ./market1 -c 2 -t 2 -q 10000 -s 1 -o 100000
116390.389026 transactions / sec

MossPiglet% ./market1 -c 100 -t 100 -q 100 -s 1 -o 10
425.016132 transactions / sec
```

Stare at these results for a minute. Hilarious, no? What do they say, and then (more importantly) what do they mean?

First, on my Mac, the best performance is when there is 1 client, 1 trader, and a good sized queue between them to speed match. With 2 physical cores and only two threads you'd expect pretty good performance (especially if the i7 and OSX keeps the threads pinned to cores).

You can also see that hyperthreading isn't doing you much good. Intel says it gives you almost two additional "virtual cores" but when we run this code with 2 clients and 2 traders, the performance goes down by about a third. So much for virtual cores (at least under OSX -- try this on Linux and see if it is any better).

The size of the queue seems to matter sometimes, but not others (that's curious). And the performance is **abysmal** when there are 100 clients and 100 traders.

### The Effects of Polling

Clearly there are interesting and (perhaps) bizarre interactions taking place between the implementation of pthreads that is available for OSX and the Intel i7\. However one thing is certain from the code: **polling wastes CPU time slices**. That is, when a thread is looping it is entitled to do so for its entire time slice. For the duration of that time slice (technically speaking -- will discuss the exception in a minute) the thread is guaranteed _not_ to be descheduled for another thread. Time slices are in the 50ms to 100ms range these days.

However, to see this effect, think of an extreme example where the time slice is 1 second. That is, when a thread is given the CPU, it will use it for 1 second **unless** it tries to do an I/O (print to the screen, etc.). Imagine that there is one processor (no hyperthreading), 1 client thread, and 1 trader thread. What is the maximum transaction rate? It should be about 0.5 transactions / second since in every second, there is a 50% chance that a client thread or trader thread is assigned the processor and during that second it simply spins waiting. Thus in half of the second, no work gets done while the CPU allows the spinning thread to run out its time slice.

It turns out that OSX (and Linux) is likely smarter than I've indicated in this simple thought experiment. Both of these systems "know" that the client and trader threads are calling _pthread_mutex_lock()_ in their spin loops. The lock call generates a system call and there are [really tricky locking features](https://software.intel.com/en-us/node/506266) that can be employed. However in the client while loop where it waits for the _int fulfilled_ flag and there is no lock, the OS has no choice but to let the thread spin out its time slice.

## Solution 2: Synchronizing the Order Queue using Condition Variables

Here is [the source code for a solution that uses condition variables to synchronize the order queue]({{ site.url }}/assets/market2.c). Notice a change to the order queue structure:

```c
struct order_que
{
        struct order **orders;
        int size;
        int head;
        int tail;
        pthread_mutex_t lock;
        pthread_cond_t full;
        pthread_cond_t empty;** 
};
```

in which two condition variables (for the full and empty conditions) have been added. In the client thread, the queue synchronization becomes

```c
while(queued == 0) {
     **pthread_mutex_lock(&(ca->order_que->lock));** 
    next = (ca->order_que->head + 1) % ca->order_que->size;
    /*
     * is the queue full?
     */
    while(next == ca->order_que->tail) {
         **pthread_cond_wait(&(ca->order_que->full),
                  &(ca->order_que->lock));** 
        next = (ca->order_que->head + 1) % ca->order_que->size;
    }
```

Notice how this works. Like before, the client must take a mutex lock. However, the _pthread_cond_wait()_ primitive allows the client to "sleep" until it has been signaled and to **automatically drop the lock** just before going to sleep. The client will sleep (not spinning on the CPU) until some other thread calls _pthread_cond_signal()_ on the same condition variable that was specified as the first argument to _pthread_cond_wait()_. To be able to drop the lock on behalf of the client, the call to _pthread_cond_wait()_ must also take (as its second argument) the address of the lock to drop.

The _pthread_cond_wait()_ primitive also has another important property. When the client is awoken by some call to _pthread_cond_signal()_ it will be allowed to try and acquire the lock _before_ the call to _pthread_cond_wait()_ completes. Thus, when the wait is over, the client "wakes up" holding the lock.

### Test under Lock

This features is called test-under-lock because it allows the caller of "wait" to hold a lock, conduct a condition test, and sleep all as a single atomic operation. It also, then, gives the caller the lock back once the wait completes. Note that you can't easily implement test-under-lock with mutexes and sleep. For example, if you were to write

```c
pthread_mutex_lock(&lock);
while(queue->full == 1) {
    pthread_mutex_unlock(&lock);
    /*
     * whoops -- what if it goes to not full here?
     */
    sleep();
}
```

There is a moment in time right between the call to _pthread_mutex_unlock()_ and _sleep()_ where the queue status could change from full to not full. However, the thread will have already decided to go to sleep and, thus, will never wake up.

The _pthread_cond_wait()_ call is specially coded to avoid this race condition.

Now take a look at the trader thread just after the thread has determined that there is work to do:

```   c
    //get the next order
    next = (ta->order_que->tail + 1) % ta->order_que->size;
    order = ta->order_que->orders[next];
    ta->order_que->tail = next;
     **pthread_cond_signal(&(ta->order_que->full));
    pthread_mutex_unlock(&(ta->order_que->lock));** 
    dequeued = 1;
```

The trader thread must call _pthread_cond_signal()_ on the same condition variable that the client threads are using to wait for the queue to no longer be full.

Similarly, the trader thread (before it processes an order) must ensure that there is work in the queue. That is, it cannot proceed until the queue is no longer empty. Its code is

```c
dequeued = 0;
while(dequeued == 0) {
    pthread_mutex_lock(&(ta->order_que->lock));
    /*
     * is the queue empty?
     */
    while(ta->order_que->head == ta->order_que->tail) {
        /*
         * if the queue is empty, are we done?
         */
        if(*(ta->done) == 1) {
            pthread_cond_signal(&(ta->order_que->empty));
            pthread_mutex_unlock(&(ta->order_que->lock));
            pthread_exit(NULL);
        }
         **pthread_cond_wait(&(ta->order_que->empty),
                  &(ta->order_que->lock));** 
    }
```

Here the trader thread is waiting while the queue is empty. Thus, the client thread must signal a waiting trader (if there is one) once it has successfully queued an order. In the client thread

```c
    ca->order_que->orders[next] = order;
    ca->order_que->head = next;
    queued = 1;
     **pthread_cond_signal(&(ca->order_que->empty));** 
    pthread_mutex_unlock(&(ca->order_que->lock));
```

### Summarizing pthread_cond_wait() and pthread_cond_signal()

In this example, there are two condition variables in _struct order_que_:

*   empty: which is signaled by a client when the queue is not empty
*   full: which is signaled by a trader when the queue is no longer full

Clients must call _pthread_cond_wait()_ on the _full_ variable when the detect that the queue is full. Traders must call _pthread_cond_wait()_ on the _empty_ variable when they detect that the queue is empty.

The API for condition variables is

*   **int pthread_cond_init(pthread_cond_t *variable, pthread_cond_attr_t *attr)**: initializes a condition variable (second argument NULL says to use pthreads defaults)
*   **int pthread_cond_wait(pthread_cond_t *variable, pthread_mutex_t *lock)**: sleep until a signal is sent to the condition variable passed in the first argument and will reacquire the lock (passed as the second variable) before the wait completes.
*   **int pthread_cond_signal(pthread_cond_t *variable)**: signals at least one thread blocked on the condition variable passed as its first argument.

There are several interesting caveats to understand about the pthread specification with respect to condition variables. First, a signal sent to a variable where no thread is waiting is just a noop (i.e. it does nothing). Notice that in Solution 2, the clients and traders _always_ call _pthread_cond_signal()_ regardless of whether there is a thread waiting or not. Signals that come in when no threads are waiting are just lost.

Thus, in this example, the calls to _pthread_cond_signal()_ occur under the same lock that is being used to control the wait. That way, the signaler "knows" it is in the critical section and hence no other thread is in its critical section so there is no race condition that could cause a lost signal.

Another, more subtle point, is that a thread that has been signaled is not _guaranteed_ to acquire the lock _immediately_. Notice that in the example, each thread retests the condition in a loop when it calls _pthread_cond_wait()_. That's because between the time it is signaled and the time it reacquires the lock, another thread might have "snuck in" grabbed the lock, changed the condition, and released the lock.

Most implementations try and give priority to a thread that has just awoken from a call to _pthread_cond_wait()_ but that is for performance and not correctness reasons. To be completely safe, the threads must retest after a wait since the immediate lock acquisition is not strictly guaranteed by the specification.

Lastly, the specification does not say which thread (among more than one that are waiting on a condition variable) should be awakened. Again, good implementations try and choose threads to wake up in FIFO order as a default, but that isn't guaranteed (and may not be desirable in all situations). You should never count on the implementation of wait/signal in pthreads being "fair" to the threads that are waiting.

### Speed of Solution 2

Here are the performance results for the same set of tests as for Solution 1:

```bash
MossPiglet% ./market2 -c 1 -t 1 -q 1 -s 1 -o 100000
291456.104778 transactions / sec

MossPiglet% ./market2 -c 1 -t 1 -q 10000 -s 1 -o 100000
283434.731280 transactions / sec

MossPiglet% ./market2 -c 1 -t 2 -q 1 -s 1 -o 100000
294681.020728 transactions / sec

MossPiglet% ./market2 -c 1 -t 2 -q 10000 -s 1 -o 100000
293809.091170 transactions / sec

MossPiglet% ./market2 -c 2 -t 2 -q 1 -s 1 -o 100000
105729.484982 transactions / sec

MossPiglet% ./market2 -c 2 -t 2 -q 10000 -s 1 -o 100000
102448.573029 transactions / sec

MossPiglet% ./market2 -c 100 -t 100 -q 100 -s 1 -o 10
369.965854 transactions / sec
```

Yee haw! Not bad, eh? The best Solution 1 could do was about 178K transactions per second and Solution 2 goes like 295K transactions per second. Hyperthreading does even worse relative to non-hyperthreading in Solution 2, but it is still 40% faster than its Solution 1 counterpart. However, the test with a bunch of threads still really performs badly. Let's fix that.

## Solution 3: Using a condition variable to signal order fulfillment

The problem here with the last test is that all of the clever scheduling tricks that the pthreads implementation is using are failing for the spin loop in the client where it waits for the order to be fulfilled. The pthreads code doesn't "know" a spin is taking place so it can't tell the OS to deprioritize the clients while they wait. When there are a lot of clients there is a lot of useless spinning. However we now know how to fix this problem: use a condition variable to implement a wait and signal. [Here is the complete source code for Solution 3]({{ site.url }}/assets/market3.c).

First, we add a condition variable to _struct order_

```c
struct order
{
        int stock_id;
        int quantity;
        int action;     /* buy or sell */
        int fulfilled;
 **pthread_mutex_t lock;
        pthread_cond_t finish;** 
};
```

Notice that we had to add a lock as well. Condition variables implement "test under lock" which means we need to "test" the fulfilled condition under a lock or there will be a race condition.

Next, in the client thread, we lock the order, test its condition (in case the trader thread has already fulfilled the order) and wait if it hasn't:

```c
    //wait using condition variable until
    //order is fulfilled
     
    pthread_mutex_lock(&order->lock);
    while(order->fulfilled == 0) {
        pthread_cond_wait(&order->finish,&order->lock);
    }
    pthread_mutex_unlock(&order->lock);
```

Then, in the trader thread, instead of just setting the fulfilled flag

```c
    //tell the client the order is done

    pthread_mutex_lock(&order->lock);
    order->fulfilled = 1;
    pthread_cond_signal(&order->finish);
    pthread_mutex_unlock(&order->lock);
```

Notice that the flag must be set inside a critical section observed by both the client and the trader threads. Otherwise, bad timing might allow the trader thread to sneak in, set the value, and send a signal that is lost in between the time the client tests the flag and calls _pthread_cond_wait()_. Think about this possibility for a minute. What happens if we remove the call to _pthread_mutext_lock()_ and _pthread_mutex_unlock()_ in the trader thread. Can you guarantee that the code won't deadlock?

### Speed of Solution 3

Here are the same runs as before:

```bash
MossPiglet% ./market3 -c 1 -t 1 -q 1 -s 1 -o 100000
156951.367687 transactions / sec

MossPiglet% ./market3 -c 1 -t 1 -q 10000 -s 1 -o 100000
151438.489162 transactions / sec

MossPiglet% ./market3 -c 1 -t 2 -q 1 -s 1 -o 100000
150724.983497 transactions / sec

MossPiglet% ./market3 -c 1 -t 2 -q 10000 -s 1 -o 100000
146666.960399 transactions / sec

MossPiglet% ./market3 -c 2 -t 2 -q 1 -s 1 -o 100000
91147.153955 transactions / sec

MossPiglet% ./market3 -c 2 -t 2 -q 10000 -s 1 -o 100000
90862.384876 transactions / sec

MossPiglet% ./market3 -c 100 -t 100 -q 100 -s 1 -o 10
75545.821326 transactions / sec
```

Um -- yeah. For all but the last case with 200 total threads, _the speed is slower_. However, look at the last run. It is _MUCH_ faster than the same runs for Solution 1 and Solution 2.

This exercise illustrates an important point in performance debugging. What might be fast at a small scale is really slow at a larger scale. Similarly, optimizations for the large scale may make things worse at a small scale. You have been warned.

In this case, however, the likely situation is that you have many more clients than traders. Let's see how they compare in that case.

```bash
MossPiglet% ./market3 -c 1000 -t 10 -q 10000 -s 1 -o 10
68965.526313 transactions / sec

./market2 -c 1000 -t 10 -q 10000 -s 1 -o 10
```

That's right, market2 doesn't finish. In fact, it pretty much kills my laptop. I'm afraid to try market1\. Seriously.

## For your Personal Enjoyment

So far, in these examples, we haven't focuses on the number of stocks in the market. That is, in each case, I've tested the system with only one stock that clients and traders manipulate (the _-s_ parameter is _1_). It could be that there is additional performance to be gained by using a lock for each stock instead of a global lock on the whole market. [Here is the full source code for a solution that uses a separate lock per stock]({{ site.url }}/assets/market4.c).

We'll leave the analysis of this code to you as an exercise that might prove both helpful and informative (especially as you prepare for the midterm and final in this class). Does it make the code even faster?

## A brief word about monitors

Condition variables were originally proposed as part of an operating system concept called a **monitor**. The concept is a little like mutual exclusion, but with some important differences. Specifically:

*   at most one thread can be in the monitor at a time (like a critical section)
*   while in the monitor it is possible for a thread to determine that it must wait for some condition to occur, in which case it leaves the monitor and goes on a queue waiting to get back in
*   when a thread in the monitor satisfies a condition upon which other threads may be waiting, it signals one of those threads to unblock and _attempt_ to re-enter the monitor
*   when a thread leaves the monitor (either because it has finished its work in the monitor or because it is waiting), if there are threads waiting to enter (either from the beginning or because they have been signaled) the monitor selects one and admits it.

This idea is an old one and there have been many variations (more than one thread allowed in the monitor, threads signaled are given priority over those trying to get in, the signaler leaves and waits to come back in, etc.) but these don't change its essential functionality.

To see why condition variables in threads correspond to monitors, consider the way in which the client and trader threads syncronize in the examples.

A client thread, for example, tries to enter "the monitor" when it attempts to take the mutex lock. Either it is blocked (because some other client or trader thread is in the monitor) or it is allowed to proceed. If the queue is full, the client thread leaves the monitor but waits (on some kind of hidden queue maintained by pthreads) for the full condition to clear.

When a trader thread clears the full condition, it must be in the monitor (it has the queue locked) and it signals the condition variable. The pthreads implementation selects a thread from the hidden queue attached to that variable and allows it to try and re-enter the monitor by re-locking the lock.

Now, hopefully, it becomes clearer as to why the codes must retest once they have been awoken from a wait. Pthreads lets a thread that has been signaled try and retake the mutex lock that is passed to the wake call. For a monitor, this lock controls entry into the monitor and there may be other threads waiting on this lock to enter for the first time. If the lock protocol is FIFO, then one of these other threads may enter before the thread that has been awoken (it remains blocked). Eventually, though, it will be allowed to take the lock (it will get to the head of the lock's FIFO) but by that time, the condition may have changed.

This subtlety trips up many a pthreads programmer. Once you understand it in terms of a monitor with one shared mutex and several conditions that use the mutex, it makes more sense (at least to me).
