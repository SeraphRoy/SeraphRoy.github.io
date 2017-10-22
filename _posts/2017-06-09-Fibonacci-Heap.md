---
layout: post
title: "Fibonacci Heap"
date: 2017-06-09 10:05
categories: Algorithm
tags: Algorithm
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Some Notes about Fibonacci Heaps

### Operations:
- `make_heap` Return an empty heap
- `insert(i,h)` Add item $i$ to heap $h$.
- `find_min(h)` Return the smallest item in heap $h$
- `delete_min(h)` Delete min from heap $h$ and return it
- `meld(h1, h2)` Return the heap formed by putting all elements in $h_1$ with all the elements in $h_2$. $h_1$ and $h_2$ are destroyed.
- `decrease_key(delta, i, h)` Assume that position of $i$ is known. Decrease the value of item $i$ of delta (delta > 0)
- `delete(i, h)` Assume that position of $i$ is known. Delete $i$ from heap

![]({{site.url}}/assets/Fibonacci-Heap-Fig3.png)
![]({{site.url}}/assets/Fibonacci-Heap-Fig5.png)

<!--more-->

### Amortized Time Complexity
- `delete_min(h)` and `delete(i, h)` takes $O(\log n)$ time
- Other operations take $O(1)$ time

### Structure
- __Heap Ordered Trees__: Rooted tree containing a set of item, 1 item / node, with items arranged in heap order
- __Heap Order__: Key of item $x$ is no less than the key of the item in its parent $p(x)$, provided $x$ has a parent.
- __Linking__: Combine two item-disjoint trees into one. (Make one root (bigger) a child of the other (smaller))
- __Fibonacci heap (F-heap)__: Collection item disjoint heap ordered trees. (the algorithms impose an additinoal constraint).
- __rank__ $r(x)$: Number of children of node $x$. It turns out that if $x$ has $n$ descendants, the number of children is at most $\log n$.
- Nodes will be marked or unmarked.

### Representation of F-Heap
- Each node contains pointer to its parent (or to $null$ if it doesn't have one).
- Each node has a pointer to one of its children (or to $null$ if it doesn't have any).
- The children of each node are in a doubly linked circular list.
- Node has its rank $r(x)$ and a bit indicating its mark.
- All the roots of the (sub)heaps are in a circular list.
- There is a pointer to a root containing an item of minimum key ($minimum\ node$ of the F-heap).


### Definitions
- $S$: Collection of Heaps.
- $\Phi(S)$: Potential of $S$.
- $m$ operations with times $t_1,t_2,\cdots,t_m$
- $a_i$ amortized time for operation $i$.
- $\Phi_i$: Potential after operation $i$.
- $\Phi_0$: Initial potential.
- $\sum t_i=\sum(a_i-\Phi_i+\Phi_{i-1})=\Phi_0-\Phi_m+\sum a_i$
- $\Phi_0$ is initially zero.
- $\Phi_i$ is non-negative.

### Idea
- Potential of a collection of heaps: The total number of trees they contain.
- Initial potential is zero
- `make_heap`, `find_min`, `insert`, and `meld` take $O(1)$ time.
- Insertion increases the number of trees by one. And other operations do not affect the number of trees
- `delete_min`: Amorzied time $O(\log n)$ where $n$ is the number of items in the heap. Increases the number of trees by at most $\log n$.
- Linking Step: Decreases the number of trees by one.

### Implementation of Operations
- `make_heap` Just retur $null$
- `find_min(h)` Return the minimum node of $h$
- `insert(i, h)` Create a heap of only node $i$ and replace $h$ by meld of $h$ and the new heap
- `meld(h1, h2)` Combine the root lists of $h_1$ and $h_2$ into one list and set the minimum node to the appropriate new minimum node.

#### `delete_min(h)`
- Remove the minimum node ($x$) from $h$
- Concatenate the list of children of $x$ with the list of roots of $h$ (other than $x$)
- Repeat the following Linking Step until it no longer applies
    - Find any two trees whose roots have the same rank and link them (the new root has rank +1)
- Form a list of the remaining roots.
- Find the item of minimum key.

_Note_: Implementation (use an array indexed by ranks).

#### `decrease_key(delta, i, h)`
- Key of item $i$ is decreased by delta
- Cut out the node $x$ containing item $i$ from its parent
- $x$ and its descendants is added as a new tree of $h$.
- The appropriate update operations are performed

#### `delete(i, h)`
- Find node $x$ containing item $i$.
- Cut out the node $x$ containing item $i$ from its parent.
- Form a new list of roots by concatenating the list of children of $x$ with the original list of roots.
- The appropriate update operations are performed.
- `delete` takes $O(1)$, except when the minimum element is deleted.

### Additional Details (Cascade Cut)
- When node $x$ has been made a child of another node by a linking step and it loses 2 of its children through cuts, we cut the edge joining $x$ and its parent and we make $x$ ad new root (as in `decrease_key`)
- A `decrease_key` or `delete` operation my casue a possibly large number of cascading cuts.

![]({{site.url}}/assets/Fibonacci-Heap-Fig6.png)

### Marking Nodes
- Purpose: Keep track of where to make cascade cuts.
- Unmark $x$: When making a root node $x$ a child of another node in a linking step
- When curring edge joining $x$ and its parent $(p(x))$, we decrease the rank of $p(x)$ and check it $p(x)$ is a root
    - if $p(x)$ is not a root, we mark it if it is unmarked and cut the edge to its parent it it is marked. (latter cut my be cascading)
- Each cut takes $O(1)$.

### Crucial Properties
1. Each tree in an F-heap has a size at lease exponential in the rank of its root. i.e. the number of children is at most $\log n$.
2. The number of cascading cutus that take place during a sequence of heap operations is bounded by the number of decrease key and delete operations.

### Observations
- The purpose of cascade cuts in to preserve property 1.
- Loss of two children rule limits the frequency of cascade cuts.

__Lemma 1__: Let $x$ be any node in a F-heap. Arrange the children of $x$ in the order they were linked to $x$, from earliest to latest. Then the $i^{th}$ child of $x$ has rank of at least $i-2$.

__Corollary 1__: A node of rank $k$ in an F-heap has at least $F_{k+2}\geq\phi^k$ descendants, including itself, where $F_k$ is the $k^{th}$ Fibonacci number and $\phi$ is the golden ratio.

![]({{site.url}}/assets/Fibonacci-Heap-Fig7.png)

### Redefinition
- Potential: Total numbere of trees plus twice the number of marked nonroot nodes.
- The bounds of $O(1)$ for `make_heap`, `find_min`, `insert`, and `meld` remain valid, as does not $O(\log n)$ bound for `delete_min`.
- `delete_min(h)`: increases the potential by at most $1.4404\log n$ minus the number of linking steps, since, if the minimum node has rank $k$, then $\phi_k\leq n$ and thus

$$
k\leq\log n/\log\phi\leq1.4404\log n
$$

### Revist `decrease_key`
- Causes potential to increase by at most three mins the number of cascading cuts, since
    - the first cut converts a possible unmarked nonroot node into a root
    - each cascading cut converts a marked nonroot node into a root
    - the last cut can convert a nonroot node from unmarked to marked
- It follows that decrease key has an $O(1)$ amortized time bound.

### Revist `delete`
Just combine the analysis of `decrease_key` with `delete_min`

### Summary
If we begin with no F-heaps and perform an arbitrary sequence of F-heap operations, then the total time is at most the total amortized time, where the amortized time is $O(\log n)$ for each `delete_min` or `delete`, and $O(1)$ for each other operations.
