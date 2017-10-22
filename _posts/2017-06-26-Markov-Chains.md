---
layout: post
title: "Markov Chains"
date: 2017-06-26 16:51
categories: Statistics
tags: Statistics
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## The Setting

There is a system with $n$ possible states/values. At each step, the state changes probabilistically.

Let $X_t$ be the state of the system at time $t$

So the evolution of the system is: $X_0,X_1,X_2,\cdots,X_t,\cdots$ and $X_0$ is the initial state.

The system is __memoryless__: the probability that $X_t$ is in a certain state is determined by the state of $X_{t-1}$:

$$
Pr[X_t=x|X_0=x_0,X_1=x_1,\cdots,X_{t-1}=x_{t-1}]=Pr[X_t=x|X_{t-1}=x_{t-1}]
$$

For simplicity, we assume that:
- Finite number of states
- The underlying graph is strongly connected: for any two states, there is a path from 1 to 2 and a path from 2 to 1

## Mathematical Representation of the Evolution

In general, if the initial probabilistic state is $[p_1\ p_2\ \cdots\ p_n]=\pi_0$, where $p_i$ is the probability of being in state $i$, $\sum p_i=1$, and the transition matrix is $T$, such that:

$$
T[i,j]=Pr[X_1=j|X_0=i]
$$

After $t$ more steps, the probabilistic state is:

$$
[p_1 \ p_2 \ \cdots \ p_n]\centerdot
T^t
$$

And the probability of bing in state $i$ after $t$ steps is:

$$
\pi_t[i]=(\pi_0T^t)[i]
$$

<!--more-->

## Some Properties

1. Suppose the Markov chain is "aperiodic", then as the system evolves, the probabilistic state __converges__ to a limiting probabilistic state:

$$
As\ t\rightarrow\infty\\
[p_1\ p_2\ \cdots\ p_n]\centerdot T^t\rightarrow\pi\\
\pi\centerdot T=\pi
$$

So the resulting $\pi$ is called __stationary/invariant distribution__, which is unique.

2. Let $T_{ij}$ be the time of reaching state $j$ when you start at state $i$, then:

$$
\mathbb{E}[T_{ii}]=\frac{1}{\pi[i]}
$$

This is known as the __Mean Recurrence Theorem__.

## Example: The Connectivity Problem

Given a undirected graph $G=(V,E),\lvert V\rvert=n,\lvert E\rvert=m$, and $s,t\in V$, check if there is a path from $s$ to $t$.

It is easy to do in polynomial time with BFS or DFS, but how about using only $O(\log n)$ space?

Here is a possible randomized algorithm:

```
v = s
for k = 1,2,...,N:
    v = random-neighbor(v)
    if v == t, return YES
return NO
```

For $N=poly(n)$, then this uses $O(\log n)$ space.

But what is the success probability? If $s$ and $t$ are disconnected, we give the correct answer.

What if $s$ and $t$ are connected?

If we have a graph $A$ represented by the following adjacency matrix, and we start at any vertex and randomly walk to a neighbor, how does the transition matrix look like?

$$
A=
\left( \begin{array}{c} 
        0 & 1 & 1 & 1 \\
        1 & 0 & 1 & 0 \\
        1 & 1 & 0 & 1 \\
        1 & 0 & 1 & 0
    \end{array} 
\right)\\
then\\
T=
\left( \begin{array}{c} 
        0 & 1/3 & 1/3 & 1/3 \\
        1/2 & 0 & 1/2 & 0 \\
        1/3 & 1/3 & 0 & 1/3 \\
        1/2 & 0 & 1/2 & 0
    \end{array} 
\right)\\
$$

The stationary distribution is:

$$
\pi=[\frac{deg(1)}{2m},\frac{deg(2)}{2m},\frac{deg(3)}{2m},\cdots,\frac{deg(n)}{2m}]
$$

So

$$
\mathbb{E}[T_{ii}]=\frac{2m}{deg(i)}
$$

What we care is really $\mathbb{E}[T_{ij}]$, where $i$ and $j$ are connected.

We pick a path from $i$ to $j$: $i=i_1,i_2,i_3,\cdots,i_r=j\ (r\leq n)$

$$
\begin{align}
\mathbb{E}[T_{ij}] & \leq\mathbb{E}[T_{i_1i_2}+T_{i_2i_3}+\cdots+T_{i_{r-1}i_r}]\\
& = \mathbb{E}[T_{i_1i_2}]+\mathbb{E}[T_{i_2i_3}]+\cdots+\mathbb{E}[T_{i_{r-1}i_r}]\\
& \leq 2m+2m+\cdots+2m=2mn\leq n^3
\end{align}
$$

Why $\mathbb{E}[T_{uv}]\leq 2m$?

$$
\begin{align}
\mathbb{E}[T_{vv}]&=\frac{2m}{deg(v)}\\
&=\sum_{i=0}^kPr[first\ step\ v\ to\ u_i]\centerdot\mathbb{E}[T_{vv}\lvert first\ step\ v\ to\ u_i]\\
&=\sum_{i=0}^k\frac{1}{deg(v)}\centerdot(1+\mathbb{E}[T_{u_iv}])\\
&\geq\frac{1}{deg(v)}\centerdot(1+E[T_{u_0v}])\\
&\Rightarrow 2m\geq 1+\mathbb{E}[T_{uv}]\\
&\Rightarrow \mathbb{E}[T_{uv}]\leq 2m
\end{align}$$

So if we set N in the algorithm to be $1000n^3$, then:

$$
Pr[error]=Pr[T_{st}>1000n^3]\leq\frac{1}{1000}
$$

by Markov's inequality.
