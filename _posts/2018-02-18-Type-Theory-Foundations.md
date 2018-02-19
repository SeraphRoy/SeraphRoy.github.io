---
layout: post
title: "Type Theory Foundations"
date: 2018-02-18 23:00
categories: ['Programming Languages'] 
tags: ['Programming-Languages']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Intuitionistic Logic

"Logic as if people matters"

Some connections between logic:proof theory ($\vdash$) and algebra:category theory(pre-order) ($\leq$)

| $$A\ true\vdash T\ true$$ | $$A\leq T$$ |
| $$A\wedge B\ true\vdash A\ true$$,$$A\wedge B\ true\vdash B\ true$$ | $$A\wedge B\leq A$$,$$A\wedge B\leq B$$ |
| $$\frac{C\ true\vdash A\ true,C\ true\vdash B\ true}{C\ true\vdash A\wedge B\ true}$$| $$\frac{C\leq A,C\leq B}{C\leq A\wedge B}$$ |
| $$\perp\ true\vdash A\ true$$ | $$I\leq A$$ |
| $$A\ true\vdash A\vee B\ true$$,$$A\ true\vdash A\vee B\ true$$ | $$A\leq A\vee B$$,$$B\leq A\vee B$$ |
| $$\frac{A\ true\vdash C\ true,B\ true\vdash C\ true}{A\vee B\ true\vdash C\ true}$$ | $$\frac{A\leq C,B\leq C}{A\vee B\leq C}$$ |
| $$A\ true,A>B\ true\vdash B\ true$$ | $$A\wedge B\leq C\ iff\ $$ |
| $$\frac{C\ true,A\ true\vdash B\ true}{C\ true\vdash A>B\ true}$$ | $$ $$ |
| $$ $$ | $$ $$ |
| $$ $$ | $$ $$ |
| $$ $$ | $$ $$ |
| $$ $$ | $$ $$ |

### Sythetic Judgement vs Analytic Judgement

For synthetic judgement, we have something like "$A$ is true", which requires a proof.
It means that we need to do some proof searching.

For analytic judgement, we have "$M:A$", which gives me a proof of $A$ which is $M$.
All we need to do is to check whether $M$ is actually a proof of $A$, which is much
easier than searching a proof. It is also called __self-evident__.

### Equivalence of Proofs

1. Definitional Equality (analytic judgement): equality of sense
$$\Gamma\vdash M\equiv N:A$$

2. Denotational Equality (synthetic judgement): equality of reference
$$\Gamma\vdash M=N:A$$

3. (Homotopy) Equivalence (synthetic judgement)

Example to distinguish 1 and 2:

Define addition as follows:

$$
a+0=a\\
a+succ(b)=succ(a+b)
$$

Then we have the following equalities:

$$
true:2+2\equiv4\\
true:x\in\mathbb{N}\vdash x+0\equiv x\\
false:x\in\mathbb{N}\vdash 0+x\equiv x\\
true:x\in\mathbb{N}\vdash 0+x=x\\
true:x\in\mathbb{N}\vdash succ(x)\equiv x+1\\
false:x\in\mathbb{N}\vdash succ(x)\equiv 1+x\\
true:x\in\mathbb{N}\vdash succ(x)=1+x\\
$$
