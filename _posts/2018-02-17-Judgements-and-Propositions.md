---
layout: post
title: "Judgements and Propositions"
date: 2018-02-18 09:30
categories: ['Programming Language Theory', 'Proof Theory'] 
tags: ['Programming Languages', 'Proof Theory', 'Logic', 'Philosophy'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

We state "A is true", then "A" is a proposition, and "A is true" as a whole is a judgement.

Some examples of application of logic branches in programming languagues:

| K knows A | epistemic logic | distributed computing |
| A true at time t  | temporal logic | partitial evaluation |
| A is a resource | linear logic | concurrent computing |
| A is possible | lax logic | monad |
| A is valid | modal logic | runtime code generation |

## Defining a Judgement

To define a judgement, we must have __Introduction rules__ ($I$), and __Elimination rules__ ($E$).
They must satisfy __Local Soundness__ (checks elimination rules are not too strong) such that
for every way to apply the elimination rules, we can reduce it to one that already existed.
The process of doing that is called __local reduction__. ($\beta$ rule)
They should also satisfy __Local Completeness__ (checks elimination rules are not too weak) such that
there is someway to apply the elimination rules so that from the pieces we can
re-introduce what the original proposition is. The process of doing that is called __local expansion__. ($\eta$ rule)

Note: $MN$ means $M$ applies to $N$

Some notations:

$$
\Gamma\vdash M:A
$$
means $M$ is a proof of $A$ is $true$, or $M$ is a program of type $A$, where
$$
\Gamma:=\cdot|\Gamma'x:A
$$

$$
[N/x]M
$$
means substitude $N$ for $x$ based on the structure of $M$ (plug in $N$ for $x$)

<!--more-->

### Examples

#### To define $A\wedge B\ true$:

Introduction rule ($I$):

$$
\frac{A\ true,B\ true}
{A\wedge B\ true}
$$

or

$$
\frac{\Gamma\vdash M:A,\Gamma\vdash N:B}
{\Gamma\vdash <M,N>:A\wedge B}
$$

Elimination rules ($E$):

$$
\frac{A\wedge B\ true}
{A\ true}
$$

or

$$
\frac{\Gamma\vdash M:A\wedge B}
{\Gamma\vdash first\ M:A}
$$

$$
\frac{A\wedge B\ true}
{B\ true}
$$

or

$$
\frac{\Gamma\vdash M:A\wedge B}
{\Gamma\vdash second\ M:B}
$$

Check __Local Soundness__ by __local reduction__:

$$
\frac{A\ true,B\ true}
{\frac{A\wedge B\ true}{A\ true}\Longrightarrow_R A\ true}
$$

or

$$
first<M,N>\Longrightarrow_RM
$$

$$
\frac{A\ true,B\ true}
{\frac{A\wedge B\ true}{B\ true}\Longrightarrow_R B\ true}
$$

or

$$
second<M,N>\Longrightarrow_RN
$$

Check __Local Completeness__ by __local expansion__:

$$
A\wedge B\ true\Longrightarrow_E \frac{\frac{A\wedge B\ true}{A\ true}\ \frac{A\wedge B\ true}{B\ true}}
{A\wedge B\ true}
$$

or

$$
M:A\wedge B\Longrightarrow_E<first\ M,second\ M>
$$

#### To define implication($\supset$):

Introduction rule($I^x$) (x means an assumption):

$$
\frac{\overline{A\ true}^x\ B\ true}
{A\supset B\ true}
$$

or

$$
\frac{\Gamma x:A\vdash M:B}
{\vdash\lambda x.M:A\supset B}
$$

Elimination rule($E$):

$$
\frac{A\supset B\ true,A\ true}
{B\ true}
$$

or

$$
\frac{\Gamma\vdash M:A\supset B,\Gamma\vdash N:A}
{\Gamma\vdash MN:B}
$$

__Local reduction__:

$$
(\lambda x.M)N\Longrightarrow_R[N/x]M
$$

__Local expansion__:

$$
M:A\supset B\Longrightarrow_E\lambda x.Mx
$$
