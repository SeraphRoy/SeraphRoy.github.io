---
layout: post
title: "Sequent Calculus"
date: 2018-02-18 19:30
categories: ['Programming Language Theory', 'Proof Theory'] 
tags: ['Programming Languages', 'Proof Theory', 'Logic', 'Philosophy'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Verifications

$$
A\uparrow
$$
means $A$ has a __verification__.

$$
A\downarrow
$$
means $A$ ay be used

A conversion rule ($\downarrow\uparrow$):

$$
\frac{P\downarrow}
{P\uparrow}
$$

where $P$ is atomic

### Conjunctions

Introduction rule ($I$):

$$
\frac{A\uparrow,B\uparrow}
{A\wedge B\uparrow} $$

Elimination rules ($E$):

$$
\frac{A\wedge B\downarrow}
{A\downarrow}
$$

$$
\frac{A\wedge B\downarrow}
{B\downarrow}
$$

### Implications

Introduction rule ($I^x$):

$$
\frac{\overline{A\downarrow}^x\ B\uparrow}
{A\supset B\uparrow}
$$

Elimination rules ($E$):

$$
\frac{A\supset B\downarrow A\uparrow}
{B\downarrow}
$$

### Disjunctions

Introduction rule ($I$):

$$
\frac{A\uparrow}
{A\vee B\uparrow}
$$

$$
\frac{B\uparrow}
{A\vee B\uparrow}
$$

Elimination rules ($E$):

$$
\frac{A\vee B\downarrow,\overline{A\downarrow}^x\ C\uparrow,\overline{B\downarrow}^y\ C\uparrow}
{C\uparrow}
$$

Note: We can't use elimination right after introduction, becasue the arrows don't match

## Sequents

So for natural deduction, we have elimination rules and introduction rules.
For sequent calculus, we have _left rules_ and _right rules_, where _left rules_ are
just the inverse of the elimination rules, and _right rules_ are just the same as introduction rules.

The reasoning behind it is that elimination rules always produce down arrows, and introduction rules
always produce up arrows. If we use natural deduction, we will kind of need to work on two
directions, and when they meet, we stop and use the conversion rule ($\downarrow\uparrow$).

To simplify things, we reverse the elimination rules so that it is also pointing upward,
so that we will only need to work in one direction. And we stop at something called __identity rule__.

Basically everything with $uparrow$ should be on the right of $\Rightarrow$, and vice versa.

We use the following notation:

$$
B_1,\ldots,B_n\Rightarrow A
$$

Identity rule:

$$
\frac{}
{P,P\Rightarrow P}
$$

### Conjunctions

Right rules:

$$
\frac{\Gamma\Rightarrow A,\Gamma\Rightarrow b}
{\Gamma\Rightarrow A\wedge B}
$$

Left rules:

$$
\frac{\Gamma,A\wedge B,A\Rightarrow C}
{\Gamma,A\wedge B\Rightarrow C}
$$

$$
\frac{\Gamma,A\wedge B,C\Rightarrow C}
{\Gamma,A\wedge B\Rightarrow C}
$$

### Implications

Right rules:

$$
\frac{\Gamma,A\Rightarrow B}
{\Gamma\Rightarrow A\supset B}
$$

Left rules:

$$
\frac{\Gamma,A\supset B\Rightarrow A\ \ \ \Gamma,A\supset B,B\Rightarrow C}
{\Gamma,A\supset B\Rightarrow C}
$$

### Disjunctions

Right rules:

$$
\frac{\Gamma\Rightarrow A}
{\Gamma\Rightarrow A\vee B}
$$

$$
\frac{\Gamma\Rightarrow B}
{\Gamma\Rightarrow A\vee B}
$$

Left rules:

$$
\frac{\Gamma,A\vee B,A\Rightarrow C\ \ \ \Gamma,A\vee B,B\Rightarrow C}
{\Gamma,A\vee B\Rightarrow C}
$$

### Falsehood

Right rules:

$$
no\ \perp R
$$

Left rules:

$$
\frac{}
{\Gamma,\perp\Rightarrow C}
$$
