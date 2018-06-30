---
layout: post
title: "Basic Dependent Type Theory"
date: 2018-02-20 20:00
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

Loosely speaking, dependent types are similar to the type of an indexed family of sets.

# Family of Types

Family of types is a generalization of the concept of a predicate/relation.

Formally, given a type $A:U$ in a universe of types $U$, one may havea __family of types__
$B:A\rightarrow U$, which assigns to each term $a:A$ a type $B(a):U$. We say that the
type $B(a)$ varies with $a$.

e.g.

the following proposition

$$
x:\mathbb{N}\vdash even(x)
$$

is a predicate / propositional function / a family of types (indexed by $$\mathbb{N}$$) / fibration.
We can rewrite it as

$$
\{even(x)\ prop/type\}_{x:\mathbb{N}}
$$

The idea is that we are exhibiting a family of types/proofs in that if you give me any
particular choice of number, it's going to give me back a proposition, which may or maynot
be inhabitied, but they are all types.

For example, $$even(3)$$ will be uninhabited, and $$even(2)$$ will be inhabitited.

<!--more-->

## Some Notations

$$ \Gamma\ ctx $$

means $\Gamma$ being a context.

$$\Gamma\equiv\Delta$$

means definitionally equivalent context.

$$\Gamma\vdash A\ type$$

means we have a family of types named $A$ indexed by elements of $\Gamma$

$$ x:A\vdash B_x\ type $$

means we have a family of types named $B$ indexed by $x$, which are elements of type $A$
(sometimes subscript $x$ might be omitted)

$$\Gamma\vdash A\equiv B\ type$$

means definitionally equivalent families of types.

$$\Gamma\vdash M:A$$

means we have an element of the type

$$\Gamma\vdash M\equiv N:A$$

means definitionally equivalent elements of that type

## Functionality / Respect for Equality

Here is the basic idea:

$$
x:A\vdash B_x\ type
$$

$$
\frac{M:A}
{[M/x]B_x\ type}
$$

Some important points:

$$
\frac{\Gamma\vdash M:A,\Gamma\vdash A\equiv B\ type}
{\Gamma\vdash M:B}
$$

Functionality condition says more:

$$
\frac{x:A\vdash B\ type,M\equiv N:A}
{[M/x]B\equiv[N/x]B\ type}
$$

In other words, if I give you definitionally equal instances, they they are going to be
definitionally equal types.

## $\Pi$ and $\Sigma$ Types

$\Pi$ and $\Sigma$ types are both families of types.

$\Pi$ types are a list of types, where each type is a function mapping from one type to another type.

Formation of $\Pi$ ($\Pi-F$):

$$
\frac{\Gamma\vdash A\ type\ \ \ \Gamma x:A\vdash B\ type}
{\Gamma\vdash\Pi_xA.B\ type}
$$

Introduction rule ($\Pi-I$):

$$
\frac{\Gamma x:A\vdash M_x:B_x}
{\Gamma\vdash (\lambda_{x:A}.M_x):\Pi_xA.B}
$$

Elimination rule ($\Pi-E$):

$$
\frac{\Gamma\vdash M:\Pi_xA.B\ \ \ \Gamma\vdash N:A}
{\Gamma\vdash MN:[N/x]B}
$$

$\Pi$ Computation / Equivalence rule ($\Pi-C$):

$$
\frac{\Gamma\vdash A\ type\ \ \ \Gamma x:A\vdash M_x:B\ \ \ \Gamma\vdash N:A}
{\Gamma\vdash(\lambda_{x:A}.M_x)N\equiv[N/x]M:[N/x]B}
$$

$\Sigma$ types are a list of indexed pair, where the first term is any type,
and the second term is a function of the first term.

Formation of $\Sigma$ ($\Sigma-F$):

$$
\frac{\Gamma\vdash A\ type\ \ \ \Gamma x:A\vdash B_x\ type}
{\Gamma\vdash\Sigma_xA.B\ type}
$$

Introduction rule ($\Sigma-I$):

$$
\frac{\Gamma\vdash M:A\ \ \ \Gamma\vdash N:[M/x]B}
{\Gamma\vdash<M,N>:\Sigma_xA.B}
$$

Elimination rule ($\Sigma-E$):

$$
\frac{\Gamma\vdash M:\Sigma_xA.B}
{\Gamma\vdash\Pi_1(M):A}
$$

$$
\frac{\Gamma\vdash M:\Sigma_xA.B}
{\Gamma\vdash\Pi_2(M):[\Pi_1(M)/x]B}
$$

Equivalence rule:

$$
\Pi_1<M,N>\equiv M
$$

$$
\Pi_2<M,N>\equiv N
$$

<!--more-->

# "Axiom" (Theorm) of Choice

Every total binary relation contains a funtion, where a total relation means:

$$
\forall x:A,\exists y:B,s.t.\ R(x,y)
$$

So the axiom of choice in set theory, where $f$ is the choice function:

$$
(\forall x:A,\exists y:B,R(x,y))\supset\exists f:A\rightarrow B\forall x:A,R(x,fx)
$$

In type theory, it is actually a therom:

$$
(\Pi_xA.(\Sigma_yB.R(x,y)))\longrightarrow(\Sigma_fA\rightarrow B.(\Pi_xA.R(x,fx)))
$$

We can write the proof:

$$
\lambda(t:(\Pi_xA.(\Sigma_yB.R(x,y)))).<\lambda(x:A).\Pi_1(tx),\lambda(x:A).\Pi_2(tx)>
$$

Explanation: first it's clear that what we want to proof is a map from left to right.
Let's explain what's the types left and right and what should be the instance of those types.

Left: the outer most is a $\Pi$ type of $A$ and something else, and we have $t$ the instance of left type.
So $t$ must be a function mapping from $A$ to something. So we go one level deeper, it's a $\Sigma$ type.
An instance of it must be a tuple, where the first term is type $B$, the second term
is a mapping from $B$ to $R$. So $t$ is a mapping from $A$ to a tuple.

Right: the outer most is a $\Sigma$ type, so an instance of it is a tuple.
The first term is a mapping from $A$ to $B$, the second term is an instance $\Pi$ type.
So it should be a function mapping from $A$ to $R$.

Therefore, our outer most $\lambda$ should return a tuple, and each term of it should
be a function mapping from $A$ to something. If we apply $t$ to $x$, we get a tuple, or
an instance of $\Sigma$ type. We can now apply elimination rules to it. $\Pi_1$ would
give us type $B$, and $\Pi_1$ would give us $[\Pi_1(tx)/y]R(x,y)$, which is what we want.

# Natural Numbers $$\mathbb{N}$$

Introduction rules:

($$\mathbb{N}-I_0$$):

$$
\frac{}
{\Gamma\vdash 0:\mathbb{N}}
$$

($$\mathbb{N}-I_s$$):

$$
\frac{\Gamma\vdash M:\mathbb{N}}
{\Gamma\vdash s(M):\mathbb{N}}
$$

Elimination rules:

- Computational/non-dependent "Godel's T"

$$
\frac{\Gamma\vdash M:\mathbb{N},\Gamma\vdash C\ type,\Gamma\vdash N_0:C,\Gamma x:C\vdash N_s:C}
{\Gamma\vdash rec(M;N_0;x.N_s):C}
$$

where $rec$ has the following definition:

$$
rec(0;N_0;x.N_s)\equiv N_0\\
rec(s(M);N_0;x.N_s)\equiv[rec(M;N_0;x.N_s)/x]N_s
$$

- Proof by induction / dependent

$$
\frac{\Gamma\vdash M:\mathbb{N},\Gamma x:\mathbb{N}\vdash C\ type,\Gamma\vdash N_0:[0/x]C,\Gamma x:\mathbb{N}\ y:C\vdash N_s:[s(x)/x]C}
{\Gamma\vdash rec(M;N_0;x,y.N_s):[M/x]C}
$$

or

$$
\frac{\Gamma x:\mathbb{N}\vdash C\ type,\Gamma\vdash N_0:[0/x]C,\Gamma x:\mathbb{N}\ y:C\vdash N_s:[s(x)/x]C}
{\Gamma\ u:\mathbb{N}\vdash rec(u;N_0;x,y.N_s):[u/x]C}
$$

where $rec$ has the following definition:

$$
rec(0;N_0;x,y.N_s)\equiv N_0\\
rec(s(M);N_0;x,y.N_s)\equiv[M,rec(M;N_0;x,y.N_s)/x,y]N_s
$$

# Identity Type

Identity formation ($Id_A-F$):

$$
\frac{\Gamma\vdash A\ type,\Gamma\vdash M:A,\Gamma\vdash N:A}
{\Gamma\vdash Id_A(M,N)\ type}
$$

It is a type of proofs that $M$ and $N$ are equal(?) elements of type $A$.

($Id_A-I$):

$$
\frac{\Gamma\vdash M:A}
{\Gamma\vdash refl_A(M):Id_A(M,M)}
$$

It is the least reflexive relation, meaning that that's the only rule we have for identiy,
$refl$ is the only thing we can have eventually.

Elimination rule:

$$
\frac{\Gamma\vdash P:Id_A(M,N),\Gamma x:A\ y:A\ z:Id_A(x,y)\vdash C_{x,y,z}\ type,\Gamma x:A\vdash Q:[x,x,refl(x)/x,y,z]C}
{\Gamma\vdash J_{x,y,z.C}(P;x.Q):[M,N,P/x,y,z]C}
$$

Side Note: $$\Gamma x:A,y:A,z:Id_A(x,y)\vdash C_{x,y,z}\ type$$ and any others that
"construct" the "$C\ type$" like things is also called __motive__.

Computation rule:

$$
J(refl(M);x.Q)\equiv[M/x]Q
$$

- Equality is Symmetric

define $sym$ such that ($sym(x)$ can also be written as $x^{-1}$):

$$
x:Id_A(M,N)\vdash sym(x):Id_A(N,M)
$$

Proof:

We use the motive: $$ u,v,\_,Id_A(v,u) $$ for $J$, corresponding to $x,y,z,C$ in the above elimination rule motive:

$$
y:A\vdash refl_A(y):Id_A(y,y)\\
sym(x):=J(x;y.refl_A(y)):[M,N/u,v]Id_A(v,u)=Id_A(N,M)
$$

- Equality is Transitive

find $$trans(x,y)$$ such that $$x:Id_A(M,N),y:Id_A(N,P)\vdash trans(x,y):Id_A(M,P)$$
where $trans(x,y)$ is just like composition $y\cdot x$.

Proof:

We use the motive: $$ u,v,\_,Id_A(v,P)\rightarrow Id_A(u,P) $$ for $J$,
corresponding to $x,y,z,C$ in the above elimination rule motive:

$$
z:A\vdash Q:Id_A(v,P)\rightarrow Id_A(u,P)\\
J(x;Q):[M,N/u,v]Id_A(v,P)\rightarrow Id_A(u,P)=Id_A(N,P)\rightarrow Id_A(M,P)\\
then\\
J(x;Q)(y):Id_A(M,P)
$$

- Substitutivity/Functionality/Transport

$$
\frac{\Gamma x:A\vdash B\ type,\Gamma\vdash P:Id_A(M,N),\Gamma\vdash Q:[M/x]B}
{\Gamma\vdash subst(P,Q):[N/x]B}
$$

Proof:

We use the motive: $$ u,v,\_,[u/x]B\rightarrow[v/x]B $$ for $J$,
corresponding to $x,y,z,C$ in the above elimination rule motive:

- Respect

$$
\frac{\Gamma x:A\vdash Q:B,\Gamma\vdash P:Id_A(M,N)}
{\Gamma\vdash resp(Q;P):Id_B([M/x]Q,[N/x]Q)}
$$

## Therom[Martin-Lof]

If $P:Id_A(M,N)$ (closed), then $M\equiv N:A$ (definitionally). Which means $Id_A$
internalizes definitional equality.

Fact(1): There is a $P$ such that $$x:\mathbb{N},y:\mathbb{N}\vdash P:Id_{\mathbb{N}}(x+y,y+x)$$

But! The type $$Id_{\mathbb{N}\rightarrow\mathbb{N}\rightarrow\mathbb{N}}(\lambda_x\lambda_y.x+y,\lambda_x\lambda_y.y+x)$$
has no proof (not inhabited).

# Function Extensionality / Principle of Extensionality

$$
\frac{x:A\vdash P_x:Id_{B_x}(Mx,Nx)}
{\vdash ext(P):Id_{\Pi_xA.B}(M,N)}
$$

It is not derivable in __Intentional Type Theory__ (ITT). But it is inter-derivable from:

$\eta$:

$$
\frac{\Gamma\vdash M:\Pi_xA.B}
{\Gamma\vdash\eta:Id_{\Pi_xA.B}(M,\lambda_x.A:M_x)}
$$

$\xi$ (weak extensionality):

$$
\frac{\Gamma x:A\vdash P:Id_B(M,N)}
{\Gamma\vdash\xi(P):Id_{\Pi_xA.B}(\lambda_x.M,\lambda_x.N)}
$$

So it is not derivable in the type theory we developed before, so what do we do about it?
There are a few options. One is to justify that there is another form of type theory,
so that we can derive the above rule from the new form of type theory.

One is called __Extensional Type Theory__ (ETT) or __(Homotopy) Set Theory__.

## Extensional Type Theory (ETT) / (Homotopy) Set Theory

We replace $Id-E$ with the following rules:

reflection:

$$
\frac{\Gamma\vdash P:Id_A(M,N)}
{\Gamma\vdash M=N:A}
$$

Note: it is judgemental equlity, not definitional equality.

uniqueness of identity proofs (UIP) / __Discreteness__:

$$
\frac{\Gamma\vdash P:Id_A(M,N)}
{\Gamma\vdash P=refl(M):Id_A(M,N)}
$$

In ETT, Fact(1) means that: $x,y:\mathbb{N}\vdash x+y=y+x:\mathbb{N}$, and so it follows as a corollary that:
$\lambda_x\lambda_y.x+y=\lambda_x\lambda_y.y+x:\mathbb{N}\rightarrow\mathbb{N}\rightarrow\mathbb{N}$,
then we will have a proof $refl:Id_{\mathbb{N}\rightarrow\mathbb{N}\rightarrow\mathbb{N}}(...,...)$

In ETT, if we think of type $A$ as a space, it is _discrete_ in the sense that the
only paths of elements of $A$ are the paths between elements and themselves. There is
no path between two different points. We say that as a _Homotopically discrete_ space, which
is called a _set_, which is totally different from mathematic's set theory.

Besides ETT, we can justify another form of type theory, called __Observational Type Theory__ (OTT).

## Observational Type Theory

It is another attempt at dealing with the idea that types are homotopically discrete.

Define: $$ Id_A $$ by induction on the structure of $A$:

$$
Id_{\Pi_xA.B}(M,N):=\Pi_{x:A}Id_B(Mx,Nx)\\
refl_{\Pi_xA.B}(M):=\lambda_{x:A}.refl_B(Mx)
$$

So that the function extensionality can be proof here in OTT
