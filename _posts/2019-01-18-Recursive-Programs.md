---
title: Recursive Programs
date: 2019-01-18 22:25:00 Z
categories:
- Programming Language Theory
- Type Theory
tags:
- Programming Languages
- Type Theory
mathjax: true
---

# Partial Functions

System $T$, $F$ are total languages.

PCF (Programming Language for Computable Functions) (By Gordon Plotkin) - E. col. of partial languages.

Idea: Extending the theory of computability to _HIGHER TYPE_. Standard computability
courses only talk about computation over $\mathbb{N}$, but nothing beyond that.

e.g. $gcd$ is defined by the following (recursive) equations:

$$
gcd(m,n) = m\ if\ m=n\\
gcd(m,n) = gcd(m-n,n)\ if\ m>n\\
gcd(m,n) = gcd(m,n-m) ow
$$

We can transcribe the above in a real programming language (ML, Haskell) in an evident way.

We call it "Recursive function" in a typical course - it is using recursion.

Then the next typical topic would be about "stack".

_Recursion has nothing to do with the stack_. (One obvious example is flip-flop with two $NOR$ gates.)

Better idea (correct idea): simultaneous equations in the _variable_ gcd. _Solve for gcd!_

We want: $$gcd\ s.t.\ gcd=G(gcd)$$ where $G$ is the function of definition my $gcd$.
We are looking for a __FIXED POINT__.

The equations only make sense (solution exists) with _computable partial functions_.

<!--more-->

# Recursive Programs in Plotkin PCF


($\rightharpoonup$ means _partial functions_)

$$
\tau:=nat|\tau_1\rightharpoonup\tau_2
$$

$$
e:=x|z|s(e)|ifz(e,e_2,x.e_1)|\lambda x:\tau.e|e_1(e_2)|fix\{\tau\}(x.e)(written\ as\ fix\ x\ is\ e)
$$

$$fix$$ is called _general recursion_.

Examples of equations:

$$
gcd(m,n)=gcd(m,n)
$$

$$
gcd(m,n)=1+gcd(m,n)
$$

Both equations have solutions (only in the context of partial function, 2nd won't work
for total setting becuase it's like $x=x+1$): _totally undefined function_!


$$fix\ x\ is\ e$$ is the solution to $x=e_x$

$$\perp_{\tau}=fix\{\tau\}(x.x)$$ ($\perp$ is called _bottom_ (the least element in
a certain pre-order)) (This is _undefined_, which mean it has no value)

Then we can define $$gcd \triangleq fix\{nat\rightarrow nat\}(x.G(x))$$ (Note: There
is not occurrence of $gcd$ on the right hand side! It is solving a fixed point equation!)

## Why do we have partial functions

1. Challenge: Try to define $gcd$ in $Godel's T$ (using products, sums, subtractions, equality/
inequality). This is _hard_! Because you must bake the termination proof into the __code__
(not your head).
2. __Blum Size Theorm__: Fix an expansion factor, say $2^{2^n}$, there is a function
$$f:\mathbb{N}\rightarrow\mathbb{N}$$ whose _shortest_ program in $T$ (or any total language)
is $2^{2^n}$ longer than it's code in $PCF$.

## Statics

$$
\frac{\Gamma,x:\tau\vdash e:\tau}{\Gamma\vdash fix\{\tau\}(x.e):\tau}
$$

(Note: All $\tau$''s are the same! The crucial thing: you assume what you are trying prove!)
In other words, you assume what you are trying to prove, and you are showing that assumption
is tenable (show that nothing contradicts that fact), then it just is the case! I don't
show anything absolutely outright. I just assume what I am trying to prove and consider
that sufficient to be true because I don't care if thing diverges like in partial maps.

## Dynamics

$$
\frac{}{fix\{\tau\}(x.e)\mapsto[fix\{\tau\}(x.e)/x]e}
$$

(It's just "$F\mapsto[F/x]e$") It's called "unrolling recursion".

_There is no stack in the dynamics! :)_

## Equivalence


### Main theorm

$$
If\ e:\tau\ then\ e\sim_{\tau}e
$$

### Fixed point induction

For __admissible relations only__:

To show:

$$
fix(x.e)\sim_\tau fix(x.e')
$$

It's suffice to show:

$$
\forall n\ge 0\ fix^{(n)}(x.e)\sim_\tau fix^{(n)}(x.e')
$$

($$fix^{(n)}$$ means the n-fold unrolling of the fix)
