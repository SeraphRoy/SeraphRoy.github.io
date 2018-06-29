---
layout: post
title: "Type Theory Foundations"
date: 2018-02-19 23:00
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

We can think of Type Theory as being a catalog of a variety of notions of computation.
The type structure determines the "programming language features". For example,
whether you have higher order functions amounts to saying "do you have exponential types";
whether you have structs or tuples amounts to saying "do you have Cartesian product types";
whether you have choices or multiple classes of data corresponds to
"whether you have sum types". A programming language is really just a collection of types.
So type theory is just a theory of construction. From that point of view, logic is
just an application of type theory, because there are particular constructions which
correspond to proofs. Other constructions like natural numbers or geometric objects
don't correspond to proofs of particular propositions. They are just mathematical
constructions. What type theory is intersted in is the general concept of what is
a mathematical construction. That's why intuitionistic logic is also called constructive
logic. From this point of view, we can say that logic is just a corner of mathematics,
and mathematics is just a corner of computer science ;)

# Intuitionistic Logic/Constructive Logic

"Logic as if people matters". We are talking about communication of knowledge.
We treat proofs as mathematical objects, or programs. We claim
that $A$ is true, we actually mean that we have a proof of $A$. $M:A$ means that
$M$ is a proof of $A$, or $M$ is of type $A$, they are the same thing. There are
many strong connections among proof theory, type theory, and category theory.

<!--more-->

Some connections between Intuitionisitc Propositional logic:proof theory ($\vdash$) and __Heyting Algebra__:category theory(Cartesian closed pre-order, which follows __Reflexivity__ and __Transitivity__) ($\leq$)

| $$A\ true\vdash T\ true$$ | $$A\leq T$$ |
| $$A\wedge B\ true\vdash A\ true$$,$$A\wedge B\ true\vdash B\ true$$ | $$A\wedge B\leq A$$,$$A\wedge B\leq B$$ |
| $$\frac{C\ true\vdash A\ true,C\ true\vdash B\ true}{C\ true\vdash A\wedge B\ true}$$| $$\frac{C\leq A,C\leq B}{C\leq A\wedge B}$$ |
| $$\perp\ true\vdash A\ true$$ | $$I\leq A$$ |
| $$A\ true\vdash A\vee B\ true$$,$$A\ true\vdash A\vee B\ true$$ | $$A\leq A\vee B$$,$$B\leq A\vee B$$ |
| $$\frac{A\ true\vdash C\ true,B\ true\vdash C\ true}{A\vee B\ true\vdash C\ true}$$ | $$\frac{A\leq C,B\leq C}{A\vee B\leq C}$$ |
| Introduction rule: $$A\ true,A\supset B\ true\vdash B\ true$$ Elimination rule: $$\frac{C\ true,A\ true\vdash B\ true}{C\ true\vdash A\supset B\ true}$$ | $$A\wedge B\leq C\ iff\ A\leq(B\supset C)$$ or $$A\wedge B\leq C\ iff\ A\leq C^B$$ |

## Sythetic Judgement vs Analytic Judgement

For synthetic judgement, we have something like "$A$ is true", which requires a proof.
It means that we need to do some proof searching.

For analytic judgement, we have "$M:A$", which gives me a proof of $A$ which is $M$.
All we need to do is to check whether $M$ is actually a proof of $A$, which is much
easier than searching a proof. It is also called __self-evident__.

## Equivalence of Proofs

1. Definitional Equality (analytic judgement): equality of sense
$$\Gamma\vdash M\equiv N:A$$

2. Denotational Equality (synthetic judgement): equality of reference
$$\Gamma\vdash M=N:A$$

3. (Homotopy) Equivalence (synthetic judgement)
$$\Gamma\vdash\alpha:M\cong N:A$$, where $\alpha$ is an evidence of equivalence.

Example to distinguish 1 and 2:

Define addition as follows:

$$
a+0\equiv a\\
a+succ(b)\equiv succ(a+b)
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
true:x,y\in\mathbb{N}\vdash x+y=y+x\\
$$

For Denotational Equality, we are suppressing the trivial evidence which is always
reflexivity/identity. But for Equivalence, $\alpha$ can be reflexivity but can also be
something else.

## Negation ($$\urcorner$$) in Heyting Algebra

Introduction rule:

$$
\frac{C\vee A\leq\perp}
{C\leq\urcorner A}
$$

Elimination rule:

$$
A\vee\urcorner A\leq\perp
$$

Note: negation in Heyting algebra is not complement!!!

Namely, we _don't_ have the following:

$$
T\leq A\vee\urcorner A
$$

or in logic, we don't expect

$$
A\vee\urcorner A\ true
$$

__Boolean Algebra__ is __Heyting Algebra__ with negation equals complement, which is also called __law of excluded middle__.

We can define in Heyting Algebra:

$$
A\ decidable\ iff\ (A\vee\urcorner A)\ true
$$

It just means that there are propositions that we neither have a proof nor refutation. Example: $P=NP$.

Note: Failing to affirm the decidability of every proposition is _not the same_ as refuting the decidability of every proposition.

We have the following theorm in intuitionistic logic:

$$
\urcorner(\urcorner(A\vee\urcorner A))
$$

To put it in human language, it says: intuitionistic logic does not refute the law of excluded middle. It does not affirm it, but it does not refute it also.

The importance is: __we can always heuristically assume a proposition is decidable even if we don't have a proof. The apparent limitations of intuitionistic logic are the very source of its strength/expressiveness.__

So far we have some elementry constructions:

$$
0,1,A\times B,A+B,A\rightarrow B
$$

or to write it in logic

$$
\perp,T,A\wedge B,A\vee B, A\supset B
$$
