---
layout: post
title: "Introduction to Category Theory"
date: 2018-02-24 21:45
categories: ['Category Theory'] 
tags: ['Category Theory', 'Math']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

We can think of category theory as a generalized set theory, where in set theory
we have sets and $\in$, but in category theory we have objects and arrows, where
arrows are just any kinds of mappings.

So we have a kind of composition structure, where ther order of composition doesn't
matter, but the configuration matters.

And rather than reasoning structurally like PL does, it reasons "behaviorally".

# What is a Category ($C$)?

- Data
   - Object collections $C_0$, $$A:C:=A\in C_0$$
   - __Morphisms__: Arrow collection $$C_1$$ or $hom(C)$, $$f::C:=f\in C_1$$
      - We write $$f:a\rightarrow b$$ to say $f$ is __a__ morphism from $a$ to $b$.
      - We write $hom_C(a,b)$ to denote __all__ morphisms from $a$ to $b$, which is also
      called the __hom-class__ of __all__ morphisms from $a$ to $b$.
      - Note that $hom(C)$ is a collection of all $homs$ expanded.
      - Boundary maps. domain: $$\delta^-$$, codomain: $$\delta^+$$,
      $$C(A\rightarrow B):=\{f::C|\delta^-(f)=A\wedge\delta^+(f)=B\}$$
      - Identity morphism: $$id(A):C(A\rightarrow A)$$, which is also called __loop endomorphism__.
      - Composition: $$for\ f:A\rightarrow B,g:B\rightarrow C,we\ have\ f\cdot g=g\circ f:A\rightarrow C$$
- Composition laws
   - Unit laws: $$for\ f:A\rightarrow B,we\ have\ id(A)\cdot f=f=f\cdot id(B)$$
   - Associativity law: $$for\ f:A\rightarrow B,g:B\rightarrow C,h:C\rightarrow D,we\ have\ 
   (f\cdot g)\cdot h=f\cdot(g\cdot h)$$. From $A$ to $B$ to $C$ to $D$ we call it a __path__.
   - If $$\delta^-(f)=\delta^-(g)\&\&\delta^+(f)=\delta^+(g)$$, we say the $f$ and $g$
   arrows are __parallel__.
- Diagram: If we treat objects as vertices and arrows as directed edges, we have a directed graph
   or __diagram__.
   - A __comutative diagram__ is one such that all directed paths with
   the same starting and end points lead to the same result.
   - __Whiskering__: If we have a diagram that commutes, and we add one more arrow into it, we still
   have commuting diagram.
   - __Pasting__: If we two diagrams, both commute, and they have a common path, then we can "stick"
   those two diagrams along that path, and the resulting diagram still commutes.

<!--more-->

# Structured Sets as Categories

We can construct a category from _a_ set.

- __Empty Category__: $0$, which has no obejcts at all.
- __Singleton Category__: $1$, which has only one object, and one morphism, which is the $id$
for the object itself.
- __Discrete Category__: For a set $S'$, we construct a category $S$, where the objects are
just the elements of the set, $S_0:=S'$, and the mophisms are only the $id$ for each object,
$$S_1:=\{id(x)|x\in S'\}$$.
- __Preorder Category__: For a __preordered set__ ($P',\leq$) (a set with a
reflexive and transitive binary relation on it), a category $P$ with

   - objects: $P_0:=P'$

   - arrows:
$$
P(x\rightarrow y):=
\left\{ \begin{array}{rcl}
\{"x\leq y"\} & \mbox{if} & x\leq y \\ 
\emptyset  & \mbox{otherwise} \\
\end{array}\right.
$$

      - identities: $$id(x):=x\leq x$$
      - composition: $$x\leq y\cdot y\leq z:=x\leq z$$
   - So the simplest category satisfying above requirements is call __Interval Category__ ($I$),
where there are only two objects, two $id$ rules, and one arrow from one to the other.

- __Monoid Category__: For a __monoid__ ($$M',*,\varepsilon$$)
(a set $M'$, an associative binary operation $*$,
and a unit for the operation $\varepsilon$), the category $M$ with
   - objects: $$M_0:=\{\star\}$$
   - arrows: $$M(\star\rightarrow\star):=M'$$
      - identity: $$id(\star):=\varepsilon$$
      - composition: $$x\cdot y:=x*y$$
   - An example monoid is ($$\mathbb{N},+,0$$)

# Categories of Structured Sets

Some math background: According to [Russell's Paradox](https://en.wikipedia.org/wiki/Russell%27s_paradox),
we cannot have a set of all sets, but we can have category of _all_ sets. A __class__
is a collection of sets (or other mathematical objects) that can be unambiguously
defined by a property that all its members share. A class that is not a set is
called a __proper class__, and a class that is a set is sometimes called a __small class__.

- Category of sets $SET$, where objects are just sets and arrows are functions
- Category of preordered sets $PREORD$, where objects are the preordered sets,
and arrows are monotone maps (functions that preserve the order).
- Category of monoids $MON$
   - objects: monoids
   - arrows: monoid homomorphisms (structure preserving maps of monoids)

$$
f:MON((M,*,\varepsilon)\rightarrow(N,*',\varepsilon'))\\
is\\
f:SET(M\rightarrow N)\\
such\ that\\
f(x*y)=f(x)*'f(y),f(\varepsilon)=\varepsilon'
$$

# Categories of Types and Terms in Type Theory

- objects: interpretations of types or typing context, $$[\![A]\!]$$ or $$[\![\Gamma]\!]$$
- arrows: $$[\![\Gamma\vdash M:A]\!]:C([\![\Gamma]\!]\rightarrow[\![A]\!])$$
   - identity: $$[\![x:A\vdash x:A]\!]=id([\![A]\!])$$
   - compositionn: $$[\![x:A\vdash [y/M]N:C]\!]=[\![x:A\vdash M:B]\!]\cdot[\![y:B\vdash N:C]\!]$$

- "baby tyep theory" simple example:

$$\begin{align}
          [\![x:A\vdash [x/x]M:C]\!]
          &=[\![x:A\vdash x:A]\!]\cdot[\![x:A\vdash M:B]\!]\\
          &=id([\![A]\!])\cdot[\![x:A\vdash M:B]\!]\\
          &=[\![x:A\vdash M:B]\!]
        \end{align}$$

# Categories of Categories

- What is the morphism of categories? We define __functor__: For categories $C,D$,
functor $F$ from $C$ to $D$ is:
   - a map $$F_0:C_0\rightarrow D_0$$
   - a map $$F_1:C_1\rightarrow D_1$$ such that it
      - respects boundaries: $$for\ f:C(A\rightarrow B),we\ have\ F_1(f):D(F_0(A)\rightarrow F_0(B))$$
      - preserve identity morphisms: $$F(id(x))=id(F(x))\forall x\in C_0$$
      - preserve composition morphisms: $$F(f\cdot g)=F(f)\cdot F(g)\forall f:X\rightarrow Y,g:Y\rightarrow Z\in C_1$$
      - identity functors and functor composition are just as expected

# Size of Categories

Some definitions:

- a collection is either a $proper\ class$, which is $large$, or a $set$, which is $small$.
- $C\ a\ small\ category\ if\ C_1\ is\ small$, meaning $C_1\ is\ a\ set$
(which implies that $C_0\ is\ small$ because of the identity rule: $C_1$ is at
least the same size of $C_0$)
- $CAT$: Category of small categories, note: $CAT\notin CAT_0$
- A category is $locally\ small$ means all homs are $small$: $$\forall a,b\in C_0,hom(a,b)\ is\ small$$

# Representable Functor

A __representable functor__ is a functor of a special form that map a locally small category
into the category of sets, namely $SET$.

For a category $C$, if we fix an object in category $C$, $X:C$, we can define a
functor denoted $F$ or $hom(X\rightarrow -)$:

$$
F:C\rightarrow SET\\
such\ that\\
F_0:=(A:C_0)\rightarrow hom_C(X\rightarrow A)\\
F_1:=(f:C(A\rightarrow B))\rightarrow(C(X\rightarrow f):hom_C(X\rightarrow A)\rightarrow hom_C(X\rightarrow B))\\
where\\
C(X\rightarrow f):=\lambda a.a\cdot f
$$

$X$ is known as the __representitive__ of the representable functor $F$.

To proof $F$ is a functor, we need to proof:

$$
C(X\rightarrow id(A))=id(C(x\rightarrow A))\\
C(X\rightarrow f\cdot g)=C(X\rightarrow f)\cdot C(X\rightarrow g)
$$

Proofs are skipped ;)
