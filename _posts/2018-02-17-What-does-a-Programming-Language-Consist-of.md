---
layout: post
title: "What does a Programming Language Consist of?"
date: 2018-02-17 15:15
categories: ['Programming Languages'] 
tags: ['Programming-Languages'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## What does it mean for a PL to exist?

A PL consists of two parts:
- Statics: What are the programs?
- Dynamics: How do we run them?

Basic criterion: __Coherence__

## Statics

We will talk about _abstract syntax_ and _context-sensitive-conditions on well-formation_. 

Formal = typing is _inductively_ defined.

We only have information about the types but not the elements themselves.

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

How to execute?

We need to specify:
- States of execution $S$
- Transition $S\mapsto S'$
- Initial State and final state

Some rules:

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

Coherence of Dynamics/Statics: Safety:

1. Preservation

$$
\frac{e:\tau\ and\ e\mapsto e'}
{e':\tau}
$$

2. Progress

$$
\frac{e:\tau}
{either\ e\ val\ or\ \exists e'\ e\mapsto e'}
$$

3. Termination

$$
\forall e:\tau\exists unique\ v:\tau,v\ val,e\mapsto^\ast v
$$
