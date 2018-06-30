---
layout: post
title: "Computational Interpretations"
date: 2018-02-18 13:30
categories: ['Programming Language Theory', 'Proof Theory'] 
tags: ['Programming Languages', 'Proof Theory', 'Logic', 'Philosophy'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

Here we will talk about computational interpretations by the example of lax logic.
Hope from the example we can have sense of how logic and PL are connected.

<!--more-->

## Lax and Monand

Some notations:

$$
\Gamma\vdash E:A\ lax
$$
means $E$ as a computational evidence might not terminate. It might not give me $A$ at the end. Think of it like a "possibility" that $E$ will give me $A$.

$$
\{E\}
$$
a suspended computation of $E$.

$$
<E/x>F
$$
is a kind of substitution of $E$ for $x$ in $F$. It is an operration on proof/computation. Will talk about it later.

So we have the following __structural rules__ or __judgemental rules__ about $lax$:

1.

$$
\frac{\Gamma\vdash M:A\ true}
{\Gamma\vdash M:A\ lax}
$$

2.

$$
\frac{\Gamma\vdash E:A\ lax,\Gamma x:A\ true\vdash F:C\ lax}
{\Gamma\vdash<E/x>F:C\ lax}
$$

We now introduce a new proposition $\bigcirc A$ Monad:

Introduction rule ($I$):

$$
\frac{\Gamma\vdash E:A\ lax}
{\Gamma\vdash \{E\}:\bigcirc A\ true}
$$

Elimination rules ($E$):

$$
\frac{\Gamma\vdash M:\bigcirc A\ true,\Gamma x:A\ true\vdash F:C\ lax}
{\Gamma\vdash \underline{let} \{x\}=M\underline{in} F:C\ lax}
$$

Summarize __local reduction__ and __local expansion__:

$$
\underline{let} \{x\}=\{E\}\underline{in} F\Longrightarrow_R<E/x>F
$$

$$
M:\bigcirc A\Longrightarrow_E\{\underline{let}\{x\} =M\underline{in} x\}
$$

So because $E$ is type of $A\ lax$, according to the second __structural rules__ about $lax$:
$$
\frac{\Gamma\vdash E:A\ lax,\Gamma x:A\ true\vdash F:C\ lax}
{\Gamma\vdash<E/x>F:C\ lax}
$$,
it could be comming from two places:
1. The first __structural rules__ about $lax$:
$$
\frac{\Gamma\vdash M:A\ true}
{\Gamma\vdash M:A\ lax}
$$.
So $E$ is $M$.

2. The elimination rules of $\bigcirc A$:
$$
\frac{\Gamma\vdash M:\bigcirc A\ true,\Gamma x:A\ true\vdash F:C\ lax}
{\Gamma\vdash \underline{let} \{x\}=M\underline{in} F:C\ lax}
$$. (Note: Here $F$ and $C$ could be anything).
So $E$ is $$\underline{let} \{x\}=M\underline{in} F$$

So we write:
$$
E=M|\underline{let} \{x\}=M\underline{in} F
$$

For the elimination rule case, we can see $\Gamma\vdash M:\bigcirc A\ true$.
For something have type $\bigcirc A$, according to the Introduction rule of $\bigcirc A$,
it could be that $M=\{E\}$

Therefore, $M$ is everything as before plus one possibility:

We write:
$$
M=\ldots\{E\}
$$

Then we can define $<E/x>F$:

$$
<E/x>F=\\
<M/x>F=[M/x]F\\
or\\
<\underline{let} \{y\}=M\underline{in} E'/x>F=
\underline{let} \{y\}=M\underline{in} <E'/x>F
$$

## Let's Write Some Proofs/Programs

For
$$
(A\supset(B\supset C))\supset((A\wedge B)\supset C)
$$
which is _uncurrying_, we have the proof:
$$
\lambda f.\lambda p.f(first\ p)(second\ p)
$$

For
$$
((A\wedge B)\supset C)\supset (A\supset (B\supset C))
$$
which is _currying_, we have the proof:
$$
\lambda g.\lambda x.\lambda y.g<x,y>
$$

For monad in functional programming we have two requirements to satisfy:

$$
return:A\supset\bigcirc A\\
bind:\bigcirc A\supset(A\supset \bigcirc B)\supset \bigcirc B
$$

such that

$$
bind(return\ z)f=fz
$$

To proof $return$:

$$A\supset \bigcirc A$$

we have:

$$\lambda x.\{x\}$$

To proof $bind$:

$$\bigcirc A\supset (A\supset \bigcirc B)\supset \bigcirc B$$

we have:

$$
\lambda x.\lambda f.\{\underline{let}\{x'\}=x\underline{in}\ \underline{let}\{y\}=fx'\underline{in}\ y\}
$$

To proof

$$
bind(return\ x)f=fx
$$

we have:

$$
\begin{align}
(\lambda x.\lambda f.\{\underline{let}\{x'\}=x\ \underline{in}\ \underline{let}\{y\}=fx'\ \underline{in}\ y\})((\lambda x.\{x\})z)f\\
& = \{\underline{let}\{x'\}=(\lambda x.\{x\})z\ \underline{in}\ \underline{let}\{y\}=fx'\ \underline{in}\ y\}\\
& = \{\underline{let}\{x'\}=\{z\}\ \underline{in}\ \underline{let}\{y\}=fx'\ \underline{in}\ y\}\\
& = \{\underline{let}\{y\}=fz\ \underline{in}\ y\}\\
& = fz
\end{align}
$$
