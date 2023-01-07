---
title: Gradual Typing 1
date: 2019-01-27 19:45:00 Z
categories:
- Programming Language Theory
- Type Theory
tags:
- Programming Languages
- Type Theory
layout: post
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

From wikipedia:

> Gradual typing is a type system in which some variables and expressions may be
> given types and the correctness of the typing is checked at compile-time
> (which is static typing) and some expressions may be left untyped and eventual;
> type errors are reported at run-time (which is dynamic typing). Gradual typing
> allows software developers to choose either type paradigm as appropriate, from
> within a single language.[1] In many cases gradual typing is added to an existing
> dynamic language, creating a derived language allowing but not requiring static
> typing to be used. In some cases a language uses gradual typing from the start.

# Boolean Arithmetic Language (BA)

## Statics

### Program Statics Syntax

$$
t\in TERM,n\in\mathbb{N},b\in\mathbb{B},p\in PGM=TERM
$$

$$
t(term)::=true|false|if\ t\ then\ t\ else\ t|n|succ(t)|pred(t)|zero?(t)\\
b::=true|false\\
p(program)::=t
$$

### Program Runtime Syntax

$$
E\in Execution\ Context(ECTXT),v\in VALUE,r\in REDEX\subseteq PGM,err\in ERROR,
c\in CONFIG,o\in OBS
$$

$$
v(value)::=b|n\\
E(evaluation\ context)::=[]|if\ E\ then\ p\ else\ p|succ(E)|pred(E)|zero?(E)\\
r::=if\ n\ then\ p\ else\ p|pred(v)|succ(v)|zero?(v)\\
f(falty\ program)::=if\ v\ then\ p\ else\ p|pred(b)|succ(b)|zero?(b)\\
c(program\ configuration)::=p|err\\
o(observable)::=v|err\\
err::=mismatch|underflow
$$

## Dynamics

### Notions of Reduction

$$
\leadsto\subseteq REDEX\times PGM
$$

$$
if\ true\ p_2\ else\ p_3\leadsto\ p_2\\
if\ false\ p_2\ else\ p_3\leadsto\ p_3\\
pred(n+1)\leadsto\ n\\
zero?(0)\leadsto true\\
zero(n+1)\leadsto false\\
succ(n)\leadsto n+1
$$

### Reductions

$$
\rightarrow\subseteq PGM\times CONFIG\\
eval:PGM\rightharpoonup OBS\\
\rightarrow^*\subseteq CONFIG\times CONFIG\\
$$

(Note that $\rightharpoonup$ is a partial function, which means not every $PGM$
can be mapped to a $OBS$)

$$
\frac{r\leadsto p}{E[r]\rightarrow E[p]}
$$

$$
\frac{}{E[f]\rightarrow mismatch}
$$

$$
\frac{}{E[pred(0)]\rightarrow underflow}
$$

$$
eval(p)=o\ iff\ p\rightarrow^*o
$$

# Typed Boolean Arithmetic Language (TBA)

## Statics

Note that the following rules will omit the same parts between $BA$ and $TBA$.

$$
\vdash\cdot:\cdot\subseteq TERM\times TYPE\\
T\in TYPE\\
p\in PGM=\{t\in TERM\ s.t.\ \exists T\in TYPE\ s.t.\ \vdash t:T\}
$$

$$
\frac{}{\vdash b:Bool}
$$

$$
\frac{\vdash t_1:Bool;\vdash t_2:T;\vdash t_3:T}
{\vdash if\ t_1\ then\ t_2\ else\ t_3:T}
$$

$$
\frac{}{\vdash n:Nat}
$$

$$
\frac{\vdash t:Nat}{\vdash zero?(t):Bool}
$$

$$
\frac{\vdash t:Nat}{\vdash succ(t):Nat}
$$

$$
\frac{\vdash t:Nat}{\vdash pred(t):Nat}
$$

Note that with the rule for types, we don't need the rules for faulty programs $f$,
and neither does for rules of mismatch, because the statics of $TBA$ disallows that.
This captures the idea that why dynamically typed languages (or uni-typed languages)
will have to do a bunch of `if typeof a == ...` but typed languages don't. Untyped
languages like $BA$ has more programs than it's sister languages like $TBA$, not
only more faulty programs but also workable programs, such that
$eval_{TBA}(TBA)=eval_{BA}(TBA)$. We don't need those mismatch rules in $TBA$ which
saves us from a bunch of runtime type checking codes, by restricting us to only
well-type programs.
