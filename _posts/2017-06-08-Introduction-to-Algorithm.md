---
layout: post
title: "Introduction to Algorithm"
date: 2017-06-08 19:47
categories: Algorithm
tags: Algorithm
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Some Notes of Introduction to Algorithm

## Fiboniacci Number

$$
\begin{bmatrix}
    F_{n+1} & F_{n} \\
    F_{n} & F_{n-1} \\
\end{bmatrix}
=
\begin{bmatrix}
    1 & 1 \\
    1 & 0 \\
\end{bmatrix}^n
$$

$Running\ Time = \theta(\log_2(n))$

## Order Statistics

Given n elements in an array, find $k^{th}$ smallest element.

- Quick Select
    - Expected running time $\theta(n)$ 
    - Worse case $\theta(n^2)$
- Worse-case linear time order statistics
```
Select(i, n)
1. Divide n elements into [n/5] groups of 5 elements each. Find the median of each
group. O(n)
2. Recurrsively select the medium x of the [n/5] group medians. T(n/5)
3. Partition with x as pivot, let k = rank(x). O(n)
4. if i==k then return x
    if i<k then recurrsively select ith smallest element in left part
    else then recurrsively select (i-k)th smallest element in upper part
```

<!--more-->

## Hash Functions
### Division Method
$h(k) = k\ mod\ m$

pick $m$ to be prime and not too close to power of $2$ or $10$.

### Multiplication Method
$h(k)$ $=$ $A\cdot k$ $mod$ $2^w$ >> $(w - r)$, $A\ odd\land2^{w-1}$ < $A$ < $2^w$

### Universal Hashing
Let $u$ be a universe of keys, and let $H$ be a finite colleciton of hash functions
mapping $U$ to {$0,1,\dots,m-1$}.

$H$ is $universal$ if $\forall x,y\in U,x\ne y$

$$
\lvert\{h\in H;h(x)=h(y)\}\rvert=\lvert H\rvert/m
$$

i.e. if $h$ is chosen randomly from $H$, the probability of collision between $x$
and $y$ is $1/m$.

### Perfect Hashing
Given $n$ keys, construct a static hash table of size $m=O(n)$ such that searching
takes $O(1)$ time in the worst case.

Idea: 2 level scheme with universal hashing at both levels and _NO_ collisions at
level 2.

if $n_i$ items that hashes to level 1 slot $i$, then use $m_i=n_i^2$ slots in
the level 2 table $S_i$.

## Augmented Data Structures
### Dynamic Order Statistics

Supports: `Insert`, `Delete`, `Search(x)`, `Select(i)`, `Rank(x)`.

Idea: use a R-B tree while keeping sizes of the subtree.

$size[x]=size[left(x)]+size[right(x)]+1$
```
Select(root, i):
    k = size[left(x)] + 1 // k = rank(x)
    if i == k then return x
    if i < k then return Select(left(x), i)
    else return Select(right(x), i - k)
```
$Running\ Time = \theta(\log_2(n))$

### Interval Tree

Supports: `Intert`, `Delete`, `Interval-Search`: Find an interval in the set that 
overlaps a given query interval.

Idea: use a R-B tree while keeping the largest value $m$ in the subtree.

$$
m[x]=max\{high[int[x]], m[right(x)], m[left(x)]\}
$$

```
Interval-Search(i) // finds an interval that overlaps i
    x = root
    while x != nil and (low[i] > high[int[x]] or low[int[x]] > high[i]) do // i and int[x] don't overlap
        if left[x] != nil and low[i] <= m[left[x]] then x = left[x]
        else x = right[x]
    return x
```

## Amortized Analysis

### Potential Method
Framework:
- Start with data structure $D_0$
- operation $i$ transforms $D_{i-1} \to D_i$
- cost of the operation is $c_i$
- Define a potential function:

$$
\Phi:\{D_i\}\to\mathbb{R}\ such\ that\ \Phi(D_0)=0\land\Phi(D_i)\geq0\forall i
$$

- Amortized cost $\hat{c_i}$ with respect to $\Phi$ is

$$
\hat{c_i}=c_i+\Phi(D_i)-\Phi(D_{i-1})
$$

- Total amortized cost of n operations is

$$
\begin{align}
\sum_{i=1}^{n}\hat{c_i}&=\sum_{i=1}^{n}(\hat{c_i}+\Phi(D_i)-\Phi(D_{i-1}))\\
&=\sum_{i=1}^{n}\hat{c_i}+\Phi(D_n)-\Phi(D_0)\\
&\geq\sum_{i=1}^{n}c_i
\end{align}
$$

## Competitive Analysis
An online algorithm A is $\alpha$-$competitive$ if $\exists k$ such that for any
sequence of operations $S$,

$$
Cost_A(S)\leq\alpha\cdot C_{opt}(S)+k
$$

where $C_{opt}(S)$ is the optimal, off-line, "God's" algorithm.

## Karp-Rabin Algorihm: Find s in t
Rolling Hash ADT:
- `r.append(c)`: r maintains a string x where $r=h(x)$, add char c to the end of x
- `r.skip()`: delete the first char of x. (assume it is c).

Then just use ADT to "roll over" t to find s. 

_Note_: If their hashes are equal,
there is still a probability $\leq 1/\lvert S\rvert$ that they are actual not the
same string.

To implement ADT: use hash simple hash function $h(k)=k\bmod m$ where $m$ is a random
prime $\geq\lvert S\rvert$

We can treat $x$ as a multidigit number $u$ in base $a$, where $a$ is just the alphabet
size.

So:
- $r()=u\bmod m$
- $r$ stores $u\bmod m$ and $\lvert x\rvert$, (really $a^{\lvert x\rvert}$), not $u$.

```
r.append(c)
    u = u * a + ord(c) mod m 
      = [(u mod p) * a + ord(c)] mod m
      = [r() * a + ord(c)] mod m
```

```
r.skip(c) // assume char c is skipped
    u = [u − ord(c) * (pow(a, |u| - 1) mod p)] mod p
      = [(u mod p) − ord(c) * (pow(a, |u| - 1) mod p)] mod p
      = [r() − ord(c) * (pow(a, |u| - 1) mod p)] mod p
```
