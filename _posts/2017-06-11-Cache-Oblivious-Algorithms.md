---
layout: post
title: "Cache Oblivious Algorithms"
date: 2017-06-11 10:41
categories: Algorithm
tags: Algorithm
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Introduction to Cache Oblivious Algorithms

Cache oblivious algorithms are the algorithms that performs well even when they are not aware of the caching model.

## The Cache Model

We assume two level memory: cache and main memory. The block size is $B$. The size of the cache is $M$. The size of main memory is assume infinte. If we want to access some data that is not in the cache, we need to pull the whole block that contains the data to the cache first. And we might kick something else and we need to write it back to memory.
1. Accesses to cache are free, but we still care about the computation time (work) of the algorithm itself.
2. If we have an array, it might not be aligned with the blocks. So it will be some extra things at the beginning and the end that doesn't consume a whole block but we need the extra 2 blocks.
3. Count __block memory transfers__ between cache and main memory. (number of block read/write) Memory Transfer $MT(N)$ is a function of $N$, but $B$, $M$ are parameters and does matter.

## Cache Oblivious Algorithm
- Algorithms don't know $B$ and $M$
- Accessing memory automatically fetch block into memory & kick the block that will be used furthest in the future (idealized model)
- Memory is one big array and is divided into blocks of size $B$

__Note__: if the algorithm is cache oblivious and is efficient in the 2-level model, it will be efficient for k-level model (L1, L2, L3, ... caches)

## Basic Algorithms

- Single Scanning
```
Scanning(A, N)
    for i from 0 to N
        visit A[i]
```
e.g. sum array.

$MT(N)=N/B+2=O(N/B+1)$ For +2, see the second point in the cache model.

- $O(1)$ parallel scans
```
reverse(A,N)
    for i from 0 to N/2
        exchange A[i] with A[N-i+1]
```
Assuming $M/B>=2,\ MT(N)=O(N/B+1)$

- Binary Search
We hope to get $\log_BN=\log N/\log B$, but actually it is $\log(N/B)=\log N-\log B$ (At first each access corresponding to one block. At the very last few search they are in the same block)

## Divide and Conquer
- Algorithm divides problem into $O(1)$ case
- Analysis considers point at which the problem
    - fits in cache ($<=M$)
    - fits in $O(1)$ block ($O(B)$)

## Order Statistics (median finding)
- Conceptually partition the array into $N/5$ 5-tuples
- Compute the medium of each one ($MT(N)=O(N/B+1)$)
- Recursively compute median $x$ of these medians ($MT(N)=O(N/5)$)
- Partition around $x$ ($MT(N)=O(N/B+1)$)
- Recurse in one side ($MT(N)=O(7N/10)\approx O(3N/4)$)
### Analysis
$MT(N)=MT(N/5)+MT(3N/4)+O(N/B+1)$

If we assume $MT(1)=O(1)$, see what we get ($L(N)$ is the number of leaves of recurssion tree):

$$
L(N)=L(N/5)+L(3N/4)\\
L(1)=1\\
Suppose\ it\ is\ N^{\alpha}\\
N^{\alpha}=(N/5)^{\alpha}+(3N/4)^{\alpha}\\
1=(1/5)^{\alpha}+(3/4)^{\alpha}\\
\alpha\approx0.8398\\
L(N)=N^{0.8398}=\omega(N/B)\ if\ B=N^{0.2}
$$

Now we assume $MT(B)=O(1)$, then number of leaves is $(N/B)^{\alpha}=O(N/B)$

## Matrix Multiplication

### Standard, Naive Way

$C=AB$ Assume that $A$ is row-major, $B$ is col-major, $C$ is row-major (best possible memory layout)

$O(N/B)$ to compute $C_{ij}$ so total $O(N^3/B)$

### Black Algorithm

Recursively divide the matrix into 4 parts, each is $N/2\times N/2$

We assume we __store matrices recursively block__. So:

$$
MT(N)=8MT(N/2)+O(N^2/B+1)\\
MT(B)=1\\
MT(c\sqrt{M})=M/B
$$

So we stop the recursion tree at the base case, the number of leaves is $O((N/\sqrt{M})^3)$

So the total is

$$
(N/\sqrt{M})^3\centerdot M/B=N^3/(B\sqrt{M})
$$

## Static Search Tree (Binary Search)
__Goal__: $\log_BN$
