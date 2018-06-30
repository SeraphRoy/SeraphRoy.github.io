---
layout: post
title: "Equational Reasoning"
date: 2018-02-24 17:25
categories: ['Programming Language Theory'] 
tags: ['Programming Languages']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

The main question is, how do we define two programs are equal, and how do we prove it.

So for setup we have type $int$, and $k$ which is a $int$, and $e_1+e_2$.

<!--more-->

# Observational Equavalence

We say that 2 programs are equal $iff$ you can't tell them apart, which means:

- For 2 _closed_ programs of type $int$, $e\equiv e'\ iff\ \exists k$ such that $$e\mapsto^*k,e'\mapsto^*k$$.
This is called __Kleeve equivalence__.
- For $$e,e':\tau,e=^{obs}_\tau e'\ iff\ \forall o:\tau\vdash P:int,P[e]\equiv P[e']$$,
were $P$ is a program context, defined as an expression: $$o:\tau\vdash P:int$$, where
$o$ can said as a "hole", and $P[e]$ means $[e/o]P$. For example, in $2+(o+1)$, $o$ is type $int$;
in $2+(o7+1)$, $o$ is type $int\rightarrow int$. To rephrase the rule, it means that
two programs are equal if we plug them in a larger program $P$, we get the same result.
This is called __observational equivalence__.

Observational equivalence is characterized by a _universal property_:

- Observatinoal equivalence is the _coarsest consistent congruence_.

_Consistent_: $$e\sim_\tau e'$$ is _consistent_ $iff\ e\sim_{int}e'$ implies $$e\equiv e'$$.
In other words, it means it implies $\equiv$ at $int$.

_Congruence_: if $$e\sim_{\tau_1} e'$$, then $$C[e]\sim_{\tau_2}C[e']$$ for any
context, where context is $$o:\tau_1\vdash C:\tau_2$$.

_Coarsest_: if $$e\sim_\tau e'$$ by any consistent congruence, then $$e=^{obs}_\tau e'$$

Proof:

- Consistent

We want to show $$if\ e=^{obs}_{int}e',then\ e\equiv e'$$, which is obvious by the definition
of $=^{obs}$, just take $P$ to be $o$ itself. (__identity__)

- Congruence

We want to show $$if\ e=^{obs}_{\tau_1} e'then\ C[e]=^{obs}_{\tau_2}C[e']$$.
$$e=^{obs}_{\tau_1} e'$$ means $$\forall P_{o:\tau_1},P[e]\equiv P[e']$$.
$$C[e]=^{obs}_{\tau_2}C[e']$$ means $$\forall P'_{o:\tau_2},P'[C[e]]\equiv P'[C[e']]$$.
We take $P$ to be $P'[C/o]$, so $P[e]$ is just $P'[C[e]]$ (__composition__)

- Coarsest

By _congruence_, we have $$P[e]\sim P[e']$$.

By _consistency_, we have $$P[e]\equiv P[e']$$. So we are done.

So we proved the properties of observational equivalence, by how do we prove
observational equivalence itself in the first place? Afterall, we need to
show the rule holds _for all_ contexts. The idea is to cutdown contexts that
you need to consider using types. We need to introduce a new notion below $$=^{log}$$
to do that, so that we have a rule:

$$
e=^{obs}_\tau e'\ iff\ e^{log}_\tau e'
$$

# Logical Equivalence

It is equivalence defined by _logical relations_.

- $$e=^{log}_{int}e'\ iff\ e\equiv e'$$

- $$e=^{log}_{\tau_1\rightarrow \tau_2}e'\ iff\ \forall e_1,e_1':\tau_1,
if\ e_1=^{log}_{\tau_1}e_1',then\ ee_1=^{log}_{\tau_2}e'e_1'$$

Thm:

$$
e:\tau\ implies\ e=^{obs}_{int}e
$$

Proof $$ e=^{obs}_\tau e'\ iff\ e^{log}_\tau e' $$:

From left to right should be easier because we are coming from $\forall$ to $int$
and $\tau_1\rightarrow \tau_2$, so we are not gonna do it here.

From right to left:

Because observational equivalence is the _coarsest consistent congruence_, so we
only need to show logical equivalence is __a__ _consistent congruence_. Consistency
comes for free, so we only need congruence.

We want to proof: $$\forall o:\tau_1\vdash C:\tau_2,if\ e=^{log}_{\tau_1}e',then\ 
C[e]=^{log}_{\tau_2}C[e']$$. We need a generalized version of $Thm(v3)$ from
[here]({% post_url 2018-02-17-Basic-Programming-Language-Theory %}):

## Foundamental Theorm of Logical Relations

$$
If\ \Gamma\vdash e:\tau,and\ \gamma=^{log}_\Gamma\gamma',
then\ \hat{\gamma}(e)=^{log}_\tau\hat{\gamma'}(e)
$$

## Closure under Converse Evalutaion

Lemma:

$$
If\ e\mapsto e_0,e_0=^{log}_\tau e',
then\ e=^{log}_\tau e'
$$

where $$\mapsto$$ is the transition in dynamics from
[here]({% post_url 2018-02-17-Basic-Programming-Language-Theory %}).

Then we can proof it by the above therom and lemma, we will just skip it here ;)

## Relationship to Hereditary Termination

$$
e=^{obs}_\tau e\ iff\ HT_\tau(e)
$$
