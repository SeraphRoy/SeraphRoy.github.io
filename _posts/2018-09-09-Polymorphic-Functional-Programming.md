---
layout: post
title: "Polymorphic Functional Programming"
date: 2018-09-09 17:25
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

# An example to start off

First we have the following two examples of recursive functions

```
func toStrings(L: int list) string list = 
   case l of
      [] => []
      | x::xs =>
         IntToString(x)::toStrings(xs)
```

```
func add(l: int list, a: int) int list = 
   case l of
      [] => []
      | x::xs => (a+x)::add(xs,a)
```

We can have a more general function as the following

```
map: for all a and b, (a->b)->a list -> b list
fun map f l = 
   case l of
      [] => []
      | x::xs => f(x)::map[a][b](xs)
```

It is called _polymorphism generality_.

To achieve these, we need variables in type: we have the following judgement

$$
\Delta\vdash\tau\ type
$$
where $\Delta$ means $t_1\ type,...,t_n\ type$

Take the `map` function as an example:

$$
a\ type,b\ type\vdash(a\rightarrow b)\rightarrow a\ list\rightarrow b\ list\ type
$$

It reads as: $(a\rightarrow b)\rightarrow a\ list\rightarrow b\ list$ is a type
assuming that $a$ is a type and $b$ is a type.

The inference rule for that

$$
\frac{\Delta\vdash\tau\ type;\Delta\vdash\sigma\ type}{\Delta\vdash\tau\rightarrow\sigma\ type}
$$

$$
\frac{\Delta,t\ type\vdash\tau\ type}{\Delta\vdash\forall\ t.\tau\ type}
$$

# System F (Girard|Reynolds)

The idea is: allow $\lambda$ and application for _type_ variables

$$
\frac{\Delta,t\ type;\Gamma\vdash e:\tau}{\Delta,\Gamma\Lambda t.e:\forall t.\tau}
$$

(With function $\rightarrow$)

Application rule:

$$
\frac{\Delta,\Gamma\vdash e:\forall t.\tau;\Delta\vdash\sigma\ type}{\Delta,\Gamma\vdash e[\sigma]:[\sigma/t]\tau}
$$

(We use capital lambda $\Lambda$ as oppose to $\lambda$ just to distinguish the fact
that this is a type variable but not a term variable)

Then `map` function would become

$$
map=\Lambda a\Lambda b.\lambda f:(a\rightarrow b).\lambda x:a\ list
$$

The Dynamics:

$$
\frac{e\mapsto e'}{e[\sigma]\mapsto e'[\sigma]}
$$

$$
\frac{}{(\Lambda.e)[\sigma]\mapsto[\sigma/t]e}
$$

Substitution rules:

$$
If\ \Delta,t\ type\vdash\tau\ type\\
and\ \Delta,t\ type;\Gamma\vdash e:\tau\\
and\ \Delta\vdash\sigma\ type\\
then\ \Delta,\Gamma\vdash[\sigma/t]e:[\sigma/t]\tau
$$

# Polymorphism

There are actually two kinds of _polymorphism_: __Intensional__, and __Parametric__

__Intensional__: Different code at different types (e.g. some case switch in the code says:
if type is int do this, if type is double do that, ...) (more programs)

__Parametric__: Same code at many types (e.g. `map` function above) (more theorems)

## Parametric Polymorphism

We can infer more just from the types if something is parametric polymorphic.

Take some examples to see what can we say about _any_ function of the type

### Some examples

$\forall a\forall b, (a\rightarrow b)\rightarrow a\ list \rightarrow b\ list$

Every element of the result list must be $f(x)$ for some $x:a$) in the input list!!!

$r:\forall a\forall b, a\ list\rightarrow a\ list$

All a's in output must come from input!!!

Note: if we are writing a specific function of specific type $int\ list\rightarrow int\ list$,
it could include something in the output that's not in the input.

From the above $r$ function with it's type, and the `map` function definition above (not just the type!),
for any $f:\tau\rightarrow\sigma$, and any $l:\tau\ list$:

$$
map\ f(r[\tau]l)=r[\sigma](map\ fl)
$$

# Existential Type

This adds nothing to System F, though it can actually be derived from System F

$$
\frac{\Delta,t\ type\vdash\tau\ type}{\Delta\vdash\exists t.\tau\ type}
$$

$$
\frac{\Delta\vdash\sigma\ type;\Delta,\Gamma\vdash e:[\sigma/t]\tau}
{\Delta,\Gamma\vdash pack[\sigma]e:\exists t:\tau}
$$

Application:

$$
\frac{\Delta,\Gamma\vdash\sigma\ type;\Delta,\Gamma\vdash e_1:\exists t.\tau;\Delta,t\ type,\Gamma,x:\tau\vdash e:\sigma}
{\Delta,\Gamma\vdash open(t,x)=e_1\ in\ e:\sigma}
$$

It corresponds to modules/abstract/private/hidden types. We want to draw boundaries
between the implementation and the clients that use it, via some abstract types.
i.e. interface!

## A Example

$\underline{Counter}$:

$$
\exists t:<zero \hookrightarrow t,Incr\hookrightarrow t\rightarrow t,value\hookrightarrow t\rightarrow nat>
$$

We can have two implementations of this:

(1) Take $t$ to be $nat$ (unary)

$$
zero=0\\
Incr(x)=s(x)\\
value(x)=x
$$

in which case

$$
pack[nat]\\
<zero\hookrightarrow 0,Incr\hookrightarrow\lambda x.s(x),value\hookrightarrow\lambda x.x>
$$

(2) Take $t$ to be $list(bit)$ (binary)

$$
pack[list(bit)]\\
<zero\hookrightarrow[0],\\
Incr\hookrightarrow func\ incr\ []=[1]|incr(0::bs)=1::bs|incr(1::bs)=0::incr(bs)\\
value\hookrightarrow\lambda bs.\Sigma 2^i*nth\ bs\ i>
$$

Now we have two kinds of implementation of the same interface!

A client of $\underline{Counter}$ looks like:

$open(c,<zero,incr,value>)=$

some impl (unary/binary) in some code that uses $zero:c,incr:c\rightarrow c,value:c\rightarrow\ nat$

Note: the abstract type doesn't escape the $open$

Note: the unary counter(UC) impl should be _observational equivalent_ to the binary counter(BC),
which means no client can distinguish between them, if

1. client only uses exposed operations
2. implementation are obs eqv. (i.e. they behave the same)

_Key idea_: choose a "simulation" relation between UCs and BCs that is preserved by the operations

1. UC zero is related to BC zero
2. UC incr is related to BC inc
3. UC value is related to BC value
