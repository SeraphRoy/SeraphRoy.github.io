---
layout: post
title: "Combinatorial Game Theory"
date: 2017-08-26 09:51
categories: ['Game Theory']
tags: ['Game Theory', "Math"]
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Basic Definitions

> Normal play: first player who cannot move loses (and therefore no draws)

Two kinds of normal play:

> Impartial: For every position the moves available doesn't depend on whose turn it is.
> Partisan: Not impartial

Two players are called Louise and Richard. Let $\alpha$ be a position in some normal game:

$$
\alpha=\{\alpha_1,\alpha_2,\dots,\alpha_n\mid\beta_1,\beta_2,\dots,\beta_m\}
$$

where $\alpha_i$ is the position where Louise can move __from__ $\alpha$, and $\beta_j$ is the position where $R$ can move __from__ $\alpha$

# Types of Positions

(L) Louise has a winning strategy regardless of who moves first at $\alpha$
(R) Richard has a winning strategy regardless of who moves first at $\alpha$
(N) Player who moves next has a winning strategy
(P) Player who moves previous has a winning strategy

<!--more-->

# Definitions, Lemma, and Propositions

>__Prop__: If $$\gamma=\{\alpha_1,\alpha_2,\dots,\alpha_n\mid\beta_1,\beta_2,\dots,\beta_m\}$$,then $\gamma$ has type:

|               | Some $\beta_i$ is (R) or (P) | All $\beta_i$ is (L) or (N) |
| Some $\alpha_i$ is (L) or (P) | N | L |
| Some $\alpha_i$ is (R) or (N) | R | P |



>__Def__: Given position $\alpha$,$\beta$, not necessary in the same game, define $\alpha+\beta$ to be a new position where move at $\alpha+\beta$ consists of moves in $\alpha$ or $\beta$

| $\alpha+\beta$ | L | R | P | N |
| L | L | ? | L | ? |
| R | ? | R | R | ? |
| P | L | R | P | N |
| N | ? | ? | N | ? |

>__Def__: If $\forall\gamma$, $\alpha+\gamma=\beta+\gamma$, we say $\alpha\equiv\beta$

>__Lemma__: If $\alpha\equiv\beta$, then $\alpha$ and $\beta$ has same type

>__Prop__:
>(1) $\forall\alpha\equiv\alpha$
>(2) $\alpha\equiv\beta\implies\beta\equiv\alpha$
>(3) $\alpha\equiv\beta,\beta\equiv\gamma\implies\alpha\equiv\gamma$
>(4) $\alpha+\beta\equiv\beta+\alpha$
>(5) $(\alpha+\beta)+\gamma\equiv\alpha+(\beta+\gamma)$

>__Lemma__:If $\alpha\equiv\alpha'$, then $\alpha+\beta\equiv\alpha'+\beta\forall\beta$

>__Lemma__:If $\beta$ is (P), then $\forall\alpha,\alpha+\beta\equiv\alpha$

>__Prop__: If $\alpha,\alpha'$ are (P), then $\alpha\equiv\alpha'$

>__Lemma__: If $\alpha+\beta,\alpha'+\beta$ are both (P), then $\alpha\equiv\alpha'$

# Inverse Element

We have the identity element (P) now, what about the inverse element, namely: $\alpha+(-\alpha)=(P)$?

For impartial games: $\alpha+\alpha=(P)$. The strategy is that the second player just copies the first player's move in other game.

In general normal game:

$$
\alpha=\{\alpha_1,\alpha_2,\dots,\alpha_n\mid\beta_1,\beta_2,\dots,\beta_m\}\\
-\alpha=\{\beta_1,\beta_2,\dots,\beta_m\mid\alpha_1,\alpha_2,\dots,\alpha_n\}\\
\alpha+(-\alpha)=(P)
$$

# Impartial Games

## Nim

Here is the rule and other info about [Nim](https://en.wikipedia.org/wiki/Nim). In short there are multiple heaps of stones. Each turn each player takes out any number(at least one) of stones from one heap.

We define $*a$ as one heap with $a$ stones (Nimber)

>__Def__: $\*a_1+\*a_2+\dots+\*a_k$ is _balanced_ if $\forall k$, $2^k$ in binary appears in even number of $a_i$'s.

We know that no stone at all is _balanced_. Then how do we make unbalanced pile balanced with _one_ move?

Look for the max $2^l$ that appears on odd number of times; take that away, and adjust the lower positions as you like. It is always valie because $2^n-1=2^{n-1}+2^{n-2}+\dots+2+1$

__Note__: $\*a_1+\*a_2+\dots+\*a_n\equiv\*0$ when $\sum\*a_i$ is balanced

__Claim__: Every unbalanced pile is equivalent to $*b$:

$$
\exists b\in\mathbb{Z}\geq0\\
*a_1+\dots+*a_k=*b
$$

__Idea__: $\*a_1+\dots+\*a_k+\*b\equiv\*0$
__Then__: $b=\sum_{i=0}^{\infty}c_i 2^i$ where

$$
c_i=
\left\{ \begin{array}{rcl}
1 & \mbox{if} & 2^i\ appears\ in\ an\ odd\ number\ of\ a_i \\ 
0  & \mbox{if} & otherwise \\
\end{array}\right.
$$

## Sprague–Grundy Theorem

__Sprague-Grundy Theorm__: Every impartial game is equivalent to a nimber.

__Def__: If $S=\{a_1,\dots,a_n\}\subseteq\mathbb{Z}_{\geq0}$, then

$$
mex(S):=smallest\ b\in\mathbb{Z}_{\geq0}\setminus S,\ (mex(S)\geq0)
$$

__Claim__: $$(\alpha=\{*a_1,\dots,*a_n\})+*b$$ is (P) when $b=mex(a_1,\dots,a_n)$ (note that $\alpha$ can be the position an any game, not just nim). We skip the proof here because I am lazy

__Corollary__: if $$\alpha_i\equiv*a_i$$, $i=1,2,\dots,n$, then $$\{\alpha_1,\dots,\alpha_n\}\equiv*b$$, where $$b=mex(a_1,\dots,a_n)$$

# Partisan Games

## Hackenbush

Here is the rule and other info about [Hackenbush](https://en.wikipedia.org/wiki/Hackenbush), and let's have Richard plays Red and Louise plays Black. Since it is a partisan game, we might want to have some kind of definition of "advantage". All the following definitions are from Louise's perspective; namely, Black's advantage is positive and Red's is negative.

We use $\bullet n$ notation to define an advantage of $n$.

### Some Definitions

Only ground and nothing else is $\bullet0$

Ground with one black on it is $\bullet1$, and ground with one red on it is $\bullet(-1)$

Ground with $n$ blacks on it is $\bullet n$, and vice versa for red.

What is advantage of $\frac{1}{2}$?

We want $\alpha+\alpha=\bullet1$, or $\alpha+\alpha+\bullet(-1)=\bullet0$, which is (P)

So we define one black on the ground, and one red on the _black_ is $\bullet\frac{1}{2}$. Similarly, one black on the ground and $k$ red on the _black_ is $\bullet\frac{1}{2^k}$. (It doesn't matter how those reds are put on the black, as long as once we take out the black and they all die)

>__Prop__: $\bullet\frac{1}{2^k}+\bullet\frac{1}{2^k}=\bullet\frac{1}{2^{k-1}}$

### Dyadic Number

Dyadic numbers are rationals of form $\frac{a}{2^k},a,k\in\mathbb{Z}$

#### Construction

$0$ is born on day 0

$-1,1$ are born on day 1

$-2,2,-\frac{1}{2},\frac{1}{2}$ are born on day 2

$\dots$

If $a_0<a_1<\dots<a_n$ are born on days $0,1,\dots,n$, the numbers born on day $n+1$ are: $a_0-1,a_k+1,\frac{a_i+a_{i+1}}{2}\forall i=0,\dots,k-1$

It can be easily known that all dyadic numbers will be born.

>__Lemma__: Every open interval in $\mathbb{R}$ has a unique _oldest_ dyadic number

>__Def__: $\bullet\frac{a}{2^k}=\bullet(\sum_{d\in\mathbb{Z}}2^d):=\sum\bullet2^d$

>__Lemma__: If $a_i=0\ or\ 2^d$, and if $a_1+\dots+a_k=0$, then $\bullet a_1+\bullet a_2+\dots+\bullet a_k=\bullet0$

__Collery__: If $a,b$ are dyadic numbers:

$$
-\bullet a=\bullet-a\\
\bullet a+\bullet b=\bullet(a+b)
$$

If $a$ is dyadic:

$$
a>0\implies\bullet a\ is\ (L)\\
a<0\implies\bullet a\ is\ (R)\\
a=0\implies\bullet a\ is\ (P)
$$

### The Simplicity Principle

>__Theorm__: $$\gamma=\{\alpha_1,\dots,\alpha_m\mid\beta_1,\dots,\beta_n\}$$. Suppose $\alpha_i\equiv\bullet a_i$, $\beta_j\equiv\bullet b_j$ for some dyadic number $a_i,b_j\ \forall i,j$, assuming $a_1<a_2<\dots<a_m$, $b_1<b_2<\dots<b_n$. Then if $a_m<b_1$, then $\gamma\equiv\bullet c$, where $c$ is the unique oldest dyadic number in interval $(a_m,b_1)$

>__Lemma__: Let $c=\frac{a}{2^k},\ a\neq0,k\geq1$. Suppose a player moves $\bullet c$ to $\bullet c'$. 
> If Louise moved, $c'\leq c-\frac{1}{2^k}$ 
> If Richard moved, $c'\leq c+\frac{1}{2^k}$
