---
layout: post
title: "Garbage Collection"
date: 2017-11-18 17:30
categories: ['Garbage Collection']
tags: ['Garbage Collection', 'Slides']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Variable Storage and Lifetime

We need to talk about memory first before talking about GC. So where can variables be stored?
- Static (compile-time or load time)
- Stack (runtime) - aka user/runtime/system stack
- Heap (runtime)

For primitive variables, there are 3 categories (given different lifetimes)
- Globals (static storage)
  - Variables declared outside of any function or class (outermost scope)
  - Scope: accessible to all statements in all functions in the file
  - Lifetime: from start ofprogram (loading) to end (unloading)
  - Good practice: use sparingly, make constant as often as possible
  - Stored in read-only or read-write segments of the process virtual memory space - allocated/fixed before prograrm starts
    - Read-only segment holds translated/native code as well if any
- Locals (stack storage)
  - __Parameters and variables__ declared within a function
  - Scope: accessible to all statements in the function they are defined
  - Lifetime: from start to end of the function invocation
  - Stored in User/Runtime stack in process virtual memory space
    - Allocated/deallocated with functino invocations and returns
- Dynamic variables, aka pointer variables (heap storage)
  - Pointer variables that point to variables that are allocated _explicitly_
  - Scope: global or local depending on where they are declared
  - Lifetime: from program point at which they are allocated with `new` to the one that at which they are deallocated with `delete`
  - Pointer variables (the address) are either globals or locals
  - The data they point to is stored in the heap.

Here is a graph of a process memory:

![]({{site.url}}/assets/Garbage-Collection-process.png)

As we all know, we only do garbage collection on the heap for implicit memory allocation.

<!--more-->

# Terminology

- Collector
  - Part of the runtime that implements memory management
- Mutator
  - User program - change (mutate) program data structures
- Stop-the-world collector - all mutators stop during GC
- Values that a program can manipulate directly
  - In processor registers
  - On the program stack (includes locals/temporaries)
  - In global variables (e.g., array of statics)
- __Root set__ of the computation
  - References to heap data held in these locations
  - Dynamically allocated data __only__ accessible via roots
  - A program should not access random locations in heap

## Roots, Liveness, and Reachability

- Individually allocated pieces of data in the heap are
  - Nodes, cells, objects (interchangeably)
  - Commonly have header that indicates the type (and thus can be used to identify any references within the object)
    - AKA boxed
- Live objects on the heap
  - _Graph of objects that can be "reached" from roots_
    - Objects that cannot be reached are garbage
  - An object in the heap is __live__ if
    - Its address is held in a root, or
    - There is a pointer to it held in another live heap object

## Liveness of Allocated Objects

- Determined _indirectly_ or _directly_
- Indirectly
  - Most common method: __tracing__
  - Regenerate the set of live nodes whenever a request by the user program for more memory fails
  - Start from each root and visit all reachable nodes (via pointers)
  - Any node not visited is reclaimed
- Directly
  - A record is associated with each node in the heap and all references to that node from other heap nodes or roots
  - Most common method: __reference counting__
  - Must be kept up to date as the mutator alters the connectivity of the heap graph

# Classic GC Algorithms

There are mainly three classic GC algorithms

- Reference counting
- Mark & Sweep
- Copying

For the first two method, we need a thing called _Free List_ which keeps 1+ lists of free chunks that we then fill or break off pieces of to allocated an object

![]({{site.url}}/assets/Garbage-Collection-free-list.png)

## Reference Counting GC

- Each obejct has an additional atomic field in header that holds the humber of pointers to that cell from roots or other objects
- All cells placed in free list initially with count of 0
- `freeList` points to the head of the free list

- Each time a _pointer is set_ to refer to this cell, the count is incremented
- Each time a reference is removed, count is decremented
  - If the count goes to 0
    - There is no way for the program to access this cell
  - The cell is returned to the free list
- When a new cell is allocated
  - Reference count is set to 1
  - Removed from free list
    - Assume, for now, that all cells are the same size and each has 3 fields left and right which are references

![]({{site.url}}/assets/Garbage-Collection-ref-counting.png)

### Strengths

- Memory management overheads are distributed throughout the computation
  - Management of active and garbage cells is interleaved with execution
  - _Incremental_
  - Smoother response time
- Locality of reference
  - Things related are accessed together (for memory hierarchy performance)
  - No worse than program itself
- Short-lived cells can be reused as soon as they are reclaimed
  - We don't have to wait until memory is exhausted to free cells
  - Immediate reuse generates fewer page faults for virtual memory
  - Update in place is possible

### Weaknesses

- High processing cost for each pointer update
  - When a pointer is overwritten the reference count for _both_ the old and new target cells must be adjusted
  - May cause poor memory performance
  - Hence, it is not used much in real systems
- Extra space in each cell to store count (normally `sizeof(int)`)
- __Cyclic data structures can't be reclaimed__ (e.g. doubly linked lists)

## Mark & Sweep GC

- Tracing collector
  - mark-sweep, mark-scan
  - use reachability (indirection) to find live objects
- Object are __not reclaimed__ immediately when they become garbage
  - Remain unreachable and undetected until storage is exhausted
- When reclamation happens the program is paused
  - _Sweep_ all currently unused cells back into the freeList
  - GC performs a global traversal of all live objects to determine which cells are reachable (_live or active_)
    - Trace, starting from roots, marking them as reachable
    - Free all unmarked cells
- Each cell contains 1 bit (markBit) of extra info
- Cells in freeList have markBit set to 0
- No `Update(...)` routine necessary

![]({{site.url}}/assets/Garbage-Collection-mark-sweep.png)

### Strengths

- Cycles are handled quite normally
- no overhead placed on pointer manipulations
- Better than (incremental) reference counting

### Weaknesses

- Start-stop algorithm (aka stop-the-world)
  - Computation is halted while GC happens
  - Not practical for real-time systems
- Asymptotic complexity is proportional to the size of the heap not just the live objects for sweep
- Fragments memory (scatters free cells across memory)
  - Loss of memory performace (caching/paging)
  - Allocation is complicated (need to find a set of cells for the right size)
- __Residency__ - heap ocupancy
  - As this increases, the need for garbage collection will become more frequent
  - Taking processing cycles away from the applicatino
  - Allocation and program performance degrades as residency increases

## Copying Collector

- Tracing, stop-the-world collector
  - Divide the heap into two __semispaces__
    - One with current data
    - The other with obsolete data
  - The roles of the two semispaces is continuously __flipped__
  - Collector copies live data from the old semispace
    - `FromSpace`
    - To the new semispace (`ToSpace`) when visited
    - Pointers to objects in `ToSpace` are updated
    - Program is restarted
  - _Scavengers_
    - `FromSpace` is not reclaimed, just abandoned

![]({{site.url}}/assets/Garbage-Collection-copying-1.png)
![]({{site.url}}/assets/Garbage-Collection-copying-2.png)

### Strengths

- Have lead to its widespread adoption
- Active data is compact (not fragmented as in mark-sweep)
  - More efficient allocation, just grab the next group of cells that fits
  - The check for space remaining is simply a pointer comparison
- Handles variabl-sized objects naturally
- No overhead on pointer updates
- Allocation is a simple free-space pointer increment
- Fragmentation is eliminated
  - Compaction offers improved memory hierarchy performance of the user program

### Weaknesses
- Required address space is doubled compared with non-copying collectors
  - Primary drawback is the need to divide memory into two
  - Performance derades as residency increases (twice as quickly as mark&sweep because half the space)
- Touches every page (VM) of the heap regardless of residency of the user program
  - Unless both semispaces can be held in memory simultaneously

# The Principle of Locality

- A good GC should not only reclaim memory but improve the locality of the system on the whole
  - _Principle of locality_ programs access a relatively small portion of their address space at any particular time (temperal and spacial locality)
  - GC should ensure that locality is exploited to improve performance wherever possible
  - memory hierarchy was developed to exploit the natural principle of locality in programs
    - Different levels of memory each with different speeds/sizes/cost
    - Registers, cache, memory, virtual memory

# Generational GC

- Observations with previous GCs
  - Long-lived objects are hard to deal with
  - Young objects (recently allocated) die young
    - __weak-generational hypothesis__: most are young (80-90%)
  - Large heaps (that can't be held in memory) degrade performance

Goal: Make large heaps more efficient by concentrating effort where the reatest payoff is

- Segregate objects by age into two or more heap regions
  - Generations
    - Keep the young generation separate
  - Collected at different frequencies
    - The younger the more often
    - The oldest, possible never
- Can be implemented as an incremental scheme or as a stop-the-world scheme
  - Using different algorithms on the different regions
- Promotion
  - Move object to older generation if its survives long enough
- Concentrate on youngest generation for reclamation
  - This is where most of the recyclable space will be found
  - Make this region small so that its collection can be more frequent but with shorter interruption
- A younger generation can be collected without collecting an older generation
- The pause time to collect a younger generation is shorter than if a colection of the heap is performed
- Young objs that survive _minor_ collections are _promoted_
  - Minor collections reclaim shortlived objects
- __Tenured garbage__: garbage in older generations
- Allocation always from minor
  - Except perhaps for large or known-to-be-old objects
- Minor frequent, major very infrequent
- Major/minor collections can be any type
  - Mark/sweep, copying, mark/compact, __hybrid__
  - Promotion is copying
- Can have more than 2 generations
  - Each requiring collection of those lower/younger

![]({{site.url}}/assets/Garbage-Collection-nursery-1.png)
![]({{site.url}}/assets/Garbage-Collection-nursery-2.png)
![]({{site.url}}/assets/Garbage-Collection-nursery-3.png)
![]({{site.url}}/assets/Garbage-Collection-nursery-4.png)
![]({{site.url}}/assets/Garbage-Collection-nursery-5.png)

- Minor Collection must be __independent__ of major
  - need to remember old-to-young references
  - Usually not too many - mutations to old objects are infrequent

![]({{site.url}}/assets/Garbage-Collection-generation-1.png)

- _What about young-to-old?_
  - We don't need to worry about them if we always collect the young each time we collect the old (__major collection__)
- Write barriers
  - Catching old-to-young pointers
  - Code that puts old-generation object into a remembered set
    - Traversed as art of root set
    - All field assignments aka POINTER UPDATES IN YOUR CODE!
- Alternative to write barriers
  - Check all old objeccts to see if they point to a nursery object
  - Will negate any benefit we get from generational GC

# Links

[Garbage Collection]({{site.url}}}/assets/Garbage-Collection-Slides-gc.pdf)

[(YouTube: Part 1/3)](https://www.youtube.com/watch?v=aBehbABx52g&feature=youtu.be)

[(YouTube: Part 2/3)](https://www.youtube.com/watch?v=knMeCv8M9ZE&feature=youtu.be)

[(YouTube: Part 3/3)](https://www.youtube.com/watch?v=qeE7fJTWCew&feature=youtu.be)
