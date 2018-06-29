---
layout: post
title: "Matrix Game Theory"
date: 2017-09-10 15:23
categories: ['Game Theory']
tags: ['Game Theory', 'Math']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

__Matrix Game__: Two players, each makes a choice secretly and play simutaneously. And there is payoff.

# Zero Sum Game

## Saddle Point

$(X,Y)$ is a saddle point if entry $x$ is the largest value in column $X$ and smallest value in its row.

__Thm__: All saddle points has the same value and appears as corners of a rectangle.

## 2$\times$2 Game

All examples below are between two players Colin and Ros. Because it is a _zero sum game_, we only write __Rose's__ payoff, and Colin's payoff is just the inverse.

__Example__: 

| | A | B |
| A | 2 | -3 |
| B | -1 | 3 |

If Colin plays $\frac{2}{3}A,\frac{1}{3}B$:
Rose A average payout is $2\times\frac{2}{3}-3\times\frac{1}{3}=\frac{1}{3}$
Rose A average payout is $-1\times\frac{2}{3}+3\times\frac{1}{3}=\frac{1}{3}$

For Colin playing $\frac{2}{3}A,\frac{1}{3}B$ minimizes Rose's maximum average payout; similarly Rose wants to maximize her minimum average payout. So:

$$
max_{y\in[0,1]}\{min\{(2y-1(1-y), -3y+3(1-y))\}\}
$$

So she wants:

$$
2y-1(1-y)=-3y+3(1-y)\\
y=\frac{4}{9}
$$

So the average payout is $2y-(1-y)=\frac{1}{3}$

__Note__: If there is a saddle point in the game, then it can't be solved.

For

| a | b |
| c | d |

with no dominant row/column:

$$
a>c\iff b\leq d\\
a\leq c \iff b>d
$$

So for Colin whose payout is $x$:

$$
ax+b(1-x)=cx+d(1-x)\\
(a-b-c+d)x = d-b\\
x=\frac{d-b}{a-c+d-b}
$$

<!--more-->

## $m\times n$ Zero Sum Game

__Von Neumann's Minimax Thm__: Every $m\times n$ game has a solution. Each player has a distribution of their choices such that Rose's average minimum payout is maximized, and Colin's maximum average payout is minimized, and two payouts are the same.

The proof is omitted not because I am lazy but for exercise (fact!). ¯\_(ツ)_/¯

### Some Other Lemma and Prop

Let $A$ be a $m\times n$ matrix. $P$ is the payout vector for Rose, and $q$ is for column

$$
\begin{align}
P &= \begin{bmatrix}
p_{1} \\
p_{2} \\
\vdots \\
p_{m}
\end{bmatrix}
\end{align}
\in[0,1]^m\ s.t.\ \sum_{i=1}^mp_i=1\\
P^TA=[p^TA_1,p^TA_2,\dots,p^TA_n]\ s.t.\ i^{th}\ entry\ is\ Rose's\ average\ payoff\ when\ Colin\ plays\ i^{th}\ strategy.\\
$$

$$
\begin{align}
Aq &= \begin{bmatrix}
A_{1}q \\
A_{2}q \\
\vdots \\
A_{m}q
\end{bmatrix}
\end{align}\\
r=maximin=max(min(p^TA_i))\ (for\ Rose)\\
c=minimax=min(max(Aq))\ (for\ Colin)
$$

__Lemma__:

$$
for\ any\ strategy:\ \forall p,q\ s.t.\ p,q\in[0,1]^m,\sum p_i=\sum q_i=q\\
min_{i=1,2,\dots n}((p^TA)_i)\leq p^TAq\\
max_{i=1,2,\dots m}((Aq)_i)\geq p^TAq\\
\implies min(p^TA)\leq max(Aq)\\
\implies max(min(p^TA))\leq min(max(Aq))\\
\implies r\leq c
$$

__Prop__: $p,q$ are strategies for Rose, Colin such that

$$
min(p^TA)=max(Aq)=V\\
Then\\
If\ p_i>0\implies(Aq)_i=V\\
If\ q_i>0\implies(p^TA)_i=V
$$

So how do we find the minimax\maximin? Use linear programming, which is not interesting at all so we will just skip that.

# Non-zero Sum Game

All examples below are between two players Colin and Rose, where Colin's payoff is the column one and Rose's payoff is the row; i.e. for $(X,Y)$, Colin has $X$ and Rose has $Y$. 

Let start with a simple example

| (-1,-1) | (-10, 0) |
| (0, -10) | (-5, -5) |

Obviously, the point (-5, -5) is the pure Nash equilibrium.

## Mix Strategy

A mix strategy is just a vector of probability of strategy.

If $q$ is a mix strategy for Colin, a best response for Rose is any $p$ with $p_i=0$ if $(Rq)$ is not a max entry.

A __Nash Equilibrium__ is a pair $(p,q)$ of mix strategy such that each is a best response for the other.

__Thm__: for $2\times2$ game, $(p,q)$ is a Nash Eq if $p^TC$ and $Rq$ have equal entries.

## Definitions, Axioms, and Nash's Theorm

We know that Nash equilibrium is not necessary global optimal. For the example above, they could have picked (-1, -1), which is better than (-5, -5), but they end up with the worse one. Therefore, we might want someone to pick a position for them, instead of letting them come up with a solution themselves.

Given a game, the God selects a position for R and C that is a "fair". To be a "fair" decision $$(x*,y*)$$ the outcome should be:
- __Pareto Optimal__: No $(x,y)$ with $$(x,y)\geq(x*,y*)$$
- $$(x*,y*)$$ should be at least their maximin strategy with repsect to their own game (or they will just pick the maximin strategy)

We call the numbers in the matrix __utility__, because it is not necessarily be money.

Also, we can map the matrix geometrically, where each payoff is just a point. I won't show it here, because it should be obvious. After placing all the points, we can draw a polygon by connecting those points. So the boundary on the North-East direction of the convex hull is pareto optimal. If the maximin solution point is inside the convex hull, then the boundary of the convex hull on the North-East direction of the _maximin solution_ (which is a point) is called __negotiation set__.

Then we have the following axioms: Any "fair" decision should be:
1. In negotiation set.
2. If either player's utilities, say Roses', is tranformed by $g(x)=mx+n,m>0$, then $$(g(x*),y*)$$ is a fair decision in the new game.
3. If the payoff polygon is symmetric about the line $x=y$, then $$(x*,y*)$$ is on this line.
4. Suppose $P$ is a payoff polygon, and a fixed "status quo" point, which could be the maximin or other "fall back" point, $SQ$ is given. Suppose $Q$ is another polygon contained in $P$ where $SQ$, $$(x*,y*)\in Q$$, then $$(x*,y*)$$ is the fair decision for $Q$.

### Nash's Theorm

__Nash's Thm__:

There is _only one_ point $$(x*,y*)$$ that satisfies all of the above axioms.

If $SQ=(x_0,y_0)$, then $$(x*,y*)$$ maximizes $(x-x_0)(y-y_0)$, or $$(x*,y*)=(x_0,y_0)$$

The proof is omitted not because I am lazy but for exercise (fact!). ¯\_(ツ)_/¯
