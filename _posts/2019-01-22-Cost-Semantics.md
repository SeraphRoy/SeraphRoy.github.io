---
layout: post
title: "Cost Semantics for Parallelism"
date: 2019-01-22 20:00
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---


Cost semantics is to discuss: How long do programs run (abstractly)?

The idea of cost semantics for parallelism is that we have the concrete ability
to compute simultaneously.

# Simple Example of Product Types

For sequential computation we have:

$$
\frac{e_1\mapsto_{seq}e_1'}{(e_1,e_2)\mapsto_{seq}(e_1',e_2)}
$$

$$
\frac{e_1\ val;e_2\mapsto_{seq}e_2'}{(e_1,e_2)\mapsto_{seq}(e_1,e_2')}
$$

For parallel computation we have:

$$
\frac{e_1\mapsto_{par}e_1';e_2\mapsto_{par}e_2'}{(e_1,e_2)\mapsto_{par}(e_1',e_2')}
$$

<!--more-->

# Deterministic Parallelism

$$
e\mapsto_{seq}^*v\ iff\ e\Downarrow v\ iff\ e\mapsto_{par}^*v
$$

It means that we are getting the same answer, just (potentially) faster.

Given a closed program $e$, we can count the number of $\mapsto_{seq}$
(or $\mapsto^{w}$ "work") and the number of $\mapsto_{par}$ (or $\mapsto^{s}$ "span")

# Cost Semantics

We annotate $e\Downarrow^{w,s}v$ to keep tract of work and span.

$$
\frac{e_1\Downarrow^{w_1,s_1}v_1;e_2\Downarrow^{w_2,s_2}v_2}
{e_1,e_2)\Downarrow^{w_1+w_2,max(s_1,s_2)}(v_1,v_2)}
$$

$$
\frac{e_1\Downarrow^{w_1,s_1}(v_1,v_2);[v_1/x][v_2/y]e_2\Downarrow^{w_2,s_2}v}
{let(x,y)=e_1\ in\ e_2\Downarrow^{w_1+w_2+1,s_1+s_2+1}v}
$$

$$
If\ e\Downarrow^{w,s}v\ then\ e\mapsto^w_{seq}v\ and\ e\mapsto^s_{par}v
$$

$$
If\ e\mapsto_{seq}^w v\ then \exists s\ e\Downarrow^{w,s}v
$$

$$
If\ e\mapsto_{par}^s v\ then \exists w\ e\Downarrow^{w,s}v
$$

$$
If\ e\Downarrow^{w,s}v\ and\ e\Downarrow^{w',s'}v\ then\ w=w',s=s'
$$

# Brent's Principle

In general, it is a principle about how work and span predict evaluation in
some machine.

For example, for a machine that has $p$ processors:

$$
If\ e\Downarrow^{w,s}v\ then\ e\ can\ be\ run\ to\ v\ in\ time\ O(max(\frac{w}{p},s))
$$

# Machine with States

## Local Transitions

$$
\gamma\Sigma_{a_1,...,a_n}\{a_1\hookrightarrow s_1\otimes...a_n\hookrightarrow s_n\}
$$

$a$'s are names for the tasks, and

$$
s:=e|join[a](x.e)|join[a_1,a_2](x,y.e)
$$

Where $$join[a](x.e)$$ means to "wait for task $a$ to complete,
and then plug it's value in for $x$", and $$join[a_1,a_2](x,y.e)$$ means to wait for
two tasks.

Suppose one of $e_1,e_2$ is not $val$, we have the following, which is also called `fork`:

$$
\gamma a\{a\hookrightarrow(e_1,e_2)\}\mapsto
\gamma a,a_1,a_2\{a_1\hookrightarrow e_1,a_2\hookrightarrow e_2,a\hookrightarrow
join[a_1,a_2](x,y.(x,y))\}
$$

And we have `join`:

$$
\gamma a_1,a_2,a\{a_1\hookrightarrow v_1,a_2\hookrightarrow v_2,a\hookrightarrow
join[a_1,a_2](x_1,x_2.e)\}\mapsto\gamma a\{a\hookrightarrow[v_1/x_2][v_2/x_2]e\}
$$

Similarly for `let`:

$$
\gamma a\{a\hookrightarrow let(x,y)=e_1\ in\ e_2\}\mapsto
\gamma a_1,a\{a_1\hookrightarrow e_1,a\hookrightarrow join[a_1](z.let(x,y)\ in\ e_2)\}
$$

## Global Transitions

- Select $1\leq k\leq p$ tasks to make local transitions
- Step locally
- Each creates or garbage collectos processes (global synchronization by $\alpha-renaming$)

## Scheduling

How to we "Select $1\leq k\leq p$ tasks to make local transitions" e.g DFS, BFS
