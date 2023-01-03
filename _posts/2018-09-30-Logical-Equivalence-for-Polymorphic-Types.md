---
layout: post
title: "Parametricity - Logical Equivalence for Polymorphic Types"
date: 2018-09-30 17:25
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
author: Yanxi Chen
mathjax: true
---


# Hereditary Termination and Logical Equivalence Recap

Hereditary Termination: 
- $HT_{\tau}(e)$ hereditary termination at type $\tau$
- $HT_{nat}(e)$ $iff $$e\mapsto^\*z$ or $e\mapsto^\*s(e')$ such that $HT_{nat}(e')$ (inductively defined)
- $HT_{\tau_1\rightarrow\tau_2}(e)$ $iff $$if\ HT_{\tau_1}(e_1)\ then\ HT_{\tau_2}(e(e_1))$ (implication)

Logical Equivalence:
- $e\sim_{nat}e'$ $iff $either $e\mapsto^\*n^\*\leftarrow e'$ or $e\mapsto^\*s(e_1),e'\mapsto^\*s(e_1'),e_1\sim_{nat}e_1'$
- $e\sim_{\tau_1\rightarrow\tau_2}e'$ $iff $$if\ e_1\sim_{\tau_1}e_1'\ then\ e(e_1)\sim_{\tau_2}e'(e_1')$

Some theorem:
- $e:\tau\ implies\ e\sim_{nat} e$
- $e\sim_{\tau}e'$ $iff$ $e\simeq_{\tau}e'$
- $e\sim_{\tau}e\ iff\ HT_{\tau}(e)$

<!--more-->

# Extension to Polymorphic Types

## System T - Extend to F

$$
\tau ::= nat|\tau_1\rightarrow\tau_2|\forall t.\tau|t(variable\ type)\\
e ::=x...|\Lambda t.e(type\ abstraction)|e[\tau](type\ application)
$$

Now that we can define Existential Type in system F (client is polymorphic):

$$
\exists t.\tau:=\forall u(\forall t.\tau\rightarrow u)\rightarrow u
$$

# Logical Equivalence of Polymorphic Types

We can do the following:

$$
e\sim_{\forall t.\tau}e'\ iff\ \forall\sigma(small)type,e[\sigma]\sim_{[\sigma/t]\tau}e'[\sigma]
$$

But this is saying type variables range over type expression, which is not what we want.

We want to say type variables range over _all conceivable_ types (not sure the ones
you can write down)

Idea: types are certain relations!

## "Admissible Relation"

1. domain type $\tau_1$
2. range type $\tau_2$
3. binary relations between exp's of those types $R:\tau_1\leftrightarrow\tau_2$

- Exact definition varies with application language
- Demand respect observational equality:

$$
e_1Re_2,e_1\cong e_1',e_2\cong e_2'\ iff\ e_1'Re_2'
$$

Getting back to equiv. of polymorphic types using our admissible relations. The idea
is approximately to say:

$$
e\sim_{\forall t.\tau}e'\ iff\ "\forall R\ admissible\ e\sim_{\tau}e'\ modulo\ t=R"
$$

In order to make this precise we have to define a more general relation which is
heterogeneous.

## Formal Definition

Define:

$$
e\sim_\tau e'[\eta:\delta\leftrightarrow\delta']
$$

idea:

$$
\delta:t_1\mapsto\sigma_1,...,t_n\mapsto\sigma_n \\
\delta:t_1\mapsto\sigma_1',...,t_n\mapsto\sigma_n' \\
\eta:t_1\mapsto R_1\sigma_1\leftrightarrow\sigma_1',...,t_n\mapsto R_n\sigma_n\leftrightarrow\sigma_n' (R\ is\ admissible\ relation)\\
e:\hat{\delta}(\tau),e':\hat{\delta'}(\tau) (e\ and\ e'\ are\ disparate\ types)\\
$$

1. $e\sim_t e'[\eta:\delta\leftrightarrow\delta']\ iff\ e\eta(t)e' (\sigma(t)\leftrightarrow\sigma'(t))$
2. $e\sim_{nat} e'[\eta:\delta\leftrightarrow\delta']\ iff\ (e\mapsto^* z\ and\ e'\mapsto^* z)or(e\mapsto^* s(e_1),e'\mapsto^* s(e_1'),e_1\sim_{nat}e_1'[\eta:\delta\leftrightarrow\delta'])$
3. $e\sim_{\tau_1\rightarrow\tau_2}e'[\eta:\delta\leftrightarrow\delta']\ iff\ e_1\sim_{\tau_1}e_1'[\eta]\supset e(e_1)\sim_{\tau1}e'(e_1')[\eta]$
4. $e\sim_{\forall t.\tau}e'[\eta]\ iff\ \forall\sigma,\sigma'\forall R:\sigma\leftrightarrow\sigma'\ admissible,e[\sigma]\sim_\tau e[\sigma'] [\eta[t\mapsto R]:\delta[t\mapsto\sigma]\leftrightarrow\delta'[t\mapsto\sigma']]$ (Note that $\tau$ in $\sim_\tau$ has free $t$'s in it and $\tau$ is a piece of $\forall t.\tau$!)

# Main Theorm

In system F:

$$
If\ e:\tau,then\ e\sim_\tau e'[\emptyset]
$$

And there is __Identity Extension__:

"If all type variables are interpreted as obs. equiv., then logically related things
are obs. equiv."

# Existential Type

We have existential type of a counter defined as

$$
\exists t:<inc:t\rightarrow t,dec:t\rightarrow t,val:t\rightarrow nat, zero:t>
$$

and we have the client of that as type:

$$
\forall t((t\rightarrow t)\rightarrow(t\rightarrow t)\rightarrow (t\rightarrow nat)\rightarrow t \rightarrow \rho)
$$

We have two implementation of our counter: $I$ and $II$, and their types are related by $R$
$\tau_I R \tau_{II}$ where $R$ means "they represent the same number".

Because the client has that such polymorphic type, it is "uniform accross all possible t's" by
the main theorm:

$$
if\\
inc_I\sim_{t\rightarrow t}inc_{II}[t\mapsto R]\\
dec_I\sim_{t\rightarrow t}dec_{II}[..]\\
val_I\sim_{t\rightarrow nat}val_{II}[..]\\
zero_I\sim_t zero_{II}\\
then\\
client[\tau_I] (inc_I)(dec_I)(val_I)(zero_I)\\
\cong_{obs}\\
client[\tau_{II}] (inc_{II})(dec_{II})(val_{II})(zero_{II})\\
$$
