---
layout: post
title: "Recursive Types"
date: 2019-01-20 20:25
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Recap for Product/Sum Types

Brief recap for product and sum to have a consensus on notations.

## Product Types

$$\tau_1\times\tau_2$$

### Introductions

$$
\frac{\Gamma\vdash e_1:\tau_2,\Gamma\vdash e_2:\tau_2}{\Gamma\vdash <e_1,e_2>:\tau_1\times\tau_2}
$$

### Eliminations

$$
\frac{\Gamma\vdash e:\tau_1\times\tau_2}{\Gamma\vdash fst(e):\tau_1}
$$

$$
\frac{\Gamma\vdash e:\tau_1\times\tau_2}{\Gamma\vdash snd(e):\tau_2}
$$

## Sum Types

$$\tau_1+\tau_2$$

### Introduction

$$
\frac{\Gamma\vdash e_1:\tau_1}{\Gamma\vdash inl_{\tau_1,\tau_2}(e_1):\tau_1+\tau_2}
$$

$$
\frac{\Gamma\vdash e_2:\tau_2}{\Gamma\vdash inr_{\tau_1,\tau_2}(e_2):\tau_1+\tau_2}
$$

### Eliminations

$$
\frac{\Gamma\vdash e:\tau_1+\tau_2;\Gamma,x_1:\tau_2\vdash e_1:\sigma;\Gamma,x_2:\tau_2\vdash e_2:\sigma}{\Gamma\vdash case(e)of\{inl(x_1)\hookrightarrow e_1,inr(x_2)\hookrightarrow e_2\}:\sigma}
$$

## Unit

$$
\frac{}{\Gamma\vdash <>:unit}
$$

<!--more-->

# Recursive Types in a Partial Language

## Examples

### Natural Numbers

We can write

$$\mathbb{N}\cong unit+\mathbb{N}$$

where $\cong$ means "type isomorphism"
which means to write functions back and forth that compose to the identity.

From left to right:

$$
\lambda x:\mathbb{N}:=rec\{0\hookrightarrow inl(<>),s(y)\hookrightarrow inr(y)\}
$$

From right to left:

$$
\lambda x:unit+\mathbb{N}:=case(z)of\{inl(\_)\hookrightarrow 0,inr(y)\hookrightarrow s(y)\}
$$

It works because anything is observationally equivalent to $<>$ at type $unit$:

$$
\_\sim_{unit}<>
$$

### Lists

Any list is either the empty list or a cons with the type and another list.

$$
\tau list\cong unit+(\tau\times\tau list)
$$

From left to right:

$$
\lambda l:\tau list:=case(l)of\{[]\hookrightarrow inl(<>),x::xs\hookrightarrow inr(x,xs)\}
$$

## Construction

What we've got here is that: certain types can be characterize as solutions to equations
of the form:

$$
t\cong\sigma(t)
$$

$\mathbb{N}$ solves $t=unit+t$

$\tau list$ solves $t=unit+(\tau\times t)$


$$
\frac{\Delta,t\ type\vdash\tau\ type}{\Delta\vdash rec(t.\tau)\ type}
$$

which is a/the solution to $t\cong \tau(t)$. i.e.

$$
rec(t.\tau)\cong [rec(t.\tau)/t]\tau
$$

## Introductions

$$
\frac{\Gamma\vdash e:[rec(t.\tau)/t]\tau}{\Gamma\vdash fold(e):rec(t.\tau)}
$$

## Eliminations

$$
\frac{\Gamma\vdash e:rec(t.\tau)}{\Gamma\vdash unfold(e):[rec(t.\tau)/t]\tau}
$$

## Dynamics

$$
unfold(fold(e))\mapsto e
$$

## Examples using Recursive Types

$$
\mathbb{N}:=rec(t.unit+t)
$$

$$
z:\mathbb{N}:=fold(inl(<>))
$$

$$
s(e):\mathbb{N}:=fold(inr(e))
$$

# Bridging Recursive Types and Programs

In this language, even though there is no loops, no recursive functions in the terms,
we can still get general recursion just from self-referencial types. Meaning that
__self-referential types will give us self-referential codes__. How to do?

1. Define a type of self-referential programs, and get $fix(x.e)$ from it
2. Define the type of self-referential programs from $rec(t.\tau)$

## Self Types

The following thing is only used as a bridge between $fix$ and $rec$ such that
we can define both $fix$ and $rec$ from it. It's only to help the constructions.

In the following rules, $x$ could be interpreted as `this` in a normal programming language.

$\tau self$ represents a self-referential computation of a $\tau$

### Introductions

$$
\frac{\Gamma,x:\tau self\vdash e:\tau}{\Gamma\vdash self(x.e):\tau self}
$$

### Eliminations

$$
\frac{\Gamma\vdash e:\tau self}{\Gamma\vdash unroll(e):\tau}
$$

### Dynamics

$$
\frac{}{self(x.e)\ value}
$$

$$
\frac{e\mapsto e'}{unroll(e)\mapsto unroll(e')}
$$

$$
unroll(self(x.e))\mapsto[self(x.e)/x]e
$$

## Construct Recursive Programs

Now we have $\tau self$, the above two steps can be rephrased as:

1. We want to get a recursive computation of any type, i.e. $fix(x.e):\tau$, from self types $\tau self$
2. We want to get self types $\tau self$ from recursive types $rec(x.e)$

### From Recursive Computation to Self Types

We have $\tau self$, and we want:

$$
\frac{x:\tau\vdash e:\tau}{fix(x.e):\tau}
$$

$$
\frac{}{fix(x.e)\mapsto[fix(x.e)/x]e}
$$

Solution:

$$
fix(x.e):\tau:=unroll(self(y:\tau self.[unroll(y)/x]e))
$$

### From Self Types to Recursive Types

We want to solve:

$$
\tau self\cong \tau self\rightarrow\tau
$$

Solution:

$$
\tau self:=rec(t.(t\rightarrow\tau))
$$

$$
self(x.e):=fold(\lambda (x:\tau self).(e:\tau))
$$

$$
unroll(e):=(unfold(e):\tau self\rightarrow \tau)(e)
$$
