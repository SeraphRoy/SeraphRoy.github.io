---
layout: post
title: "Basic Programming Language Theory"
date: 2018-02-17 15:15
categories: ['Programming Language Theory'] 
tags: ['Programming Languages'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# Total Programming Language

E.Coli of Total PLs - Godel's T:
It codifies higher order functions and inductive types (nat)

## What does it mean for a PL to exist?

A PL consists of two parts:
- Statics: What are the programs?
- Dynamics: How do we run them?

Basic criterion: __Coherence__

<!--more-->

## Statics

We will talk about _abstract syntax_ and _context-sensitive-conditions on well-formation_. 

Formal = typing is _inductively_ defined.

We only have information about the types but not the elements themselves.

So we only care about two things, higher order functions, and nat.

$$
\tau:=nat|\tau_1\rightarrow\tau_2\\
e:=x|z|s(e)|iter(e_0x.e_1)(e)|\lambda x:\tau.e|e_1(e_2)
$$

So the typing:

$$
\Gamma\vdash e:\tau
$$

is inductively defined by rules, which is the _least_ relation _closed under_ under
some rules

Note: $$\Gamma$$ can be viewed as a "context". It could be written as something like
$$\Gamma=x_1:\tau_1,x_2:\tau_2,\ldots,x_n:\tau_n$$

e.g. [natural number]({{site.baseurl}}{% link _posts/2018-02-20-Basic-Dependent-Type-Theory.md %})

Hypothetical Judgement (Structural):

Note: 1 and 2 are indefeasible. 3, 4, 5 is defeasible (Will be different in substructural type systems).

1. Reflexivity
$$
x:\tau\vdash x:\tau
$$

2. Transitivity
$$
if:\Gamma\vdash e:\tau\ and\ \Gamma,x:\tau\vdash e':\tau' \\
then:\Gamma\vdash[e/x]e':\tau'
$$

3. Weakening
$$
if:\Gamma\vdash e':\tau'\ then\ \Gamma,x:\tau\vdash e':\tau'
$$

4. Contraction
$$
if:\Gamma,x:\tau,y:\tau\vdash e':\tau' \\
then:\Gamma,z:\tau\vdash[z,z/x,y]e':\tau'
$$

5. Exchange
$$
if:\Gamma,x:\tau,y:\tau\vdash e':\tau' \\
then:\Gamma,y:\tau,x:\tau\vdash e':\tau'
$$

## Dynamics

Execute _close_ _code_ (no free variables)

We need to specify:
- $e\ val$
- States of execution $S$
- Transition $S\mapsto S'$
- Initial State and final state

Some rules:

- zero is a value

$$
\frac{}
{z\ val}
$$

- successor is a value

$$
\frac{}
{s(e)\ val}
$$

- function is a value

$$
\frac{}
{\lambda x:\tau.e\ val}
$$

- functions can be executed

$$
\frac{e_2\ val}
{(\lambda x:\tau.e)(e_2)\mapsto[e_2/x]e}
$$

- $$\frac{e_1\mapsto e_1'}{e_1(e_2)\mapsto e_1'(e_2)}$$
- $$\frac{e\mapsto e'}{iter{\tau}(e_0;x.e_1)(e)\mapsto iter{\tau}(e_0;x.e_1)(e')}$$

- Values are stuck/finished

$$
\frac{e\ val}
{\nexists e'\ st\ e\mapsto\ e'}
$$

- Determinism/functional language

$$
\forall e\exists\leq 1\ v\ st\ v\ val\ and\ e\mapsto^\ast v
$$

Note: dynamics doesn't care about types!

__Coherence__ of Dynamics/Statics/__Type Safety__($\infty$):

- Preservation

$$
\frac{e:\tau\ and\ e\mapsto e'}
{e':\tau}
$$

- Progress

$$
\frac{e:\tau}
{either\ e\ val\ or\ \exists e'\ e\mapsto e'}
$$

- Termination

$$
\forall e:\tau\exists unique\ v:\tau,v\ val,e\mapsto^\ast v
$$

Here we proof Termination ($T(e)$ means $e$ terminates). According to Godel, if we proof termination, we are proving
the consistency of the arithmetic, so we need methods that go beyong the arithmetic
(Godel's incompleteness):

1. $e$ itself can't be a variable becasue it is _closed_
2. $$z\mapsto^*z\ val$$
3. $$s(e)\mapsto^*s(e)\ val$$
4. $$\lambda x:\tau.e\mapsto^*\lambda x:\tau.e\ val$$
5. But for $$e_1(e_2)$$, even by inductive hypothesis, we know $$e_1\mapsto^*v_1$$
and $$e_2\mapsto^*v_2$$, and $$e_1:\tau_2\rightarrow \tau,e_2:\tau_2$$, we can only do
$$e_1(e_2)\mapsto^*v_1(e_2)=(\lambda x:\tau_2.e')(e_2)\mapsto[e_2/x]e'$$, but we can't
get any further. We do need more info about $e'$!

Therefor we introduct a strong property called __hereditary termination__: $$HT_\tau(e)$$

- Want: $HT_{nat}(e)$ implies $T(e)$
- Define: $HT_\tau(e)$ by induction on type $\tau$ [Tait's Method]
   - $$HT_{nat}(e)\ iff\ e\mapsto^*z$$ or $$e\mapsto^*s(e')$$ with $$HT_{nat}(e')$$ (it is 
     well-defined because it is the _strongest predicate satisfying these rules_)
   - $$HT_{\tau_1\rightarrow\tau_2}(e)\ iff\ e\mapsto^*\lambda x:\tau_1.e'$$ and
     for every $e_1$ such that $$HT_{\tau_1}(e_1),HT_{\tau_2}([e_1/x]e')$$ (meaning "type goes down").
     To write this in another form,
     $$HT_{\tau_1\rightarrow\tau_2}(e)\ iff\ (if\ HT_{\tau_1}(e_1),then\ HT_{\tau_2}(e(e_1)))$$

And we have $Thm(v2)$:

If $$e:\tau$$ then $$HT_\tau(e)$$, and then therefore $$T_\tau(e)$$

So now for inductive hypothesis, we not only know $$e_1\mapsto^*v_1$$ 15 and $$e_2\mapsto^*v_2$$,
but also $$HT_{\tau_2\rightarrow\tau}(e_1)$$ and $$HT_{\tau_2}(e_2)$$. And because
we know that $e_1$ is a $\lambda$, we now know that $$[e_2/x]e'$$ is $HT$!

BUT! $Thm(v2)$ is only stating about $e$ being _closed_ terms, but for $\lambda$:
$$\frac{x:\tau_1\vdash e_2:\tau_2}{\lambda x:\tau_1.e_2:\tau_1\rightarrow\tau_2}$$,
$e_2$ is an open term, meaning it is a variable, so our theorm doesn't quite work.
We must account for open terms!

$Thm(v3)$[Tait]:

If $$\Gamma\vdash e:\tau$$ and $$HT_\Gamma(\gamma)$$, then $$HT_\tau(\hat{\gamma}(e))$$

So $$HT_\Gamma(\gamma)$$ means that if $$\Gamma=x_1:\tau_1,x_2:\tau_2,\ldots,x_n:\tau_n$$,
then $\gamma=x_1\hookrightarrow e_1,x_2\hookrightarrow e_2,\ldots,x_n\hookrightarrow x_n$ (substitution)
such that $$HT_{\tau_1}(e_1),\ldots,HT_{\tau_n}(e_n)$$, and $$\hat{\gamma}(e)$$ means
to do the substitution. So we are good now!
