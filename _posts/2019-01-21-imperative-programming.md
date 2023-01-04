---
title: "Imperative Programming - Algol"
date: 2019-01-21 19:58
categories: ['Programming Language Theory', 'Type Theory'] 
tags: ['Programming Languages', 'Type Theory']
mathjax: true
---


__Haskell is a dialect Algol!__

# Modernized Algol (MA) - revised by Robert Harper

MA = PCF with a $modality$ - distinguishes expressions from commands

$$
\tau=things\ in\ PCF|cmd(\tau) \\
expressions\ e=things\ in\ PCF|cmd(m)\\
commands\ m=ret(e)|bnd(e,x.m)|dcl(e,a.m)\ (dcl\ a:=e\ in\ m)|set[a](e)\ (a:=e)|get[a]\ (get\ a)
$$

$a$'s are __assignables__ not variables! $x$'s are variables! Assignables are not a 
form of an expression of it's type. Assignables is a location in memory whose contents
has a type, where we write $a_1\sim\tau_1$ (not $a_1:\tau_1$). Assignables are really
__indices__ to a family of $get$, $set$ operations, they are __not__ values, arguments,
or evaluated. They are just __indices__, and $get$'s and $set$'s are just __capabilities__
to get and set $a$. We can define references, i.e. `&a` in a real programming language,
as a pair $<get_a,set_a>$, which just a thing that gives you access to the capabilities
of getting and setting $a$.

Types and expressions are "pure" - don't depend on memory, whereas commands are "impure".

<!--more-->

## Statics

$$
\Gamma\vdash_\Sigma e:\tau
$$

where $\Sigma$ is tye types of assignables, i.e. $a_1\sim\tau_1,...,a_n\sim\tau_n$.

$$
\Gamma\vdash_\Sigma m\sim:\tau
$$

It means a well-formed command whose return values has type $\tau$

$$
\frac{\Gamma\vdash_\Sigma m\sim:\tau}{\Gamma\vdash_\Sigma cmd(m):cmd(\tau)}
$$

The above is the __Introduction__ rule for $cmd$

$$
\frac{\Gamma\vdash_\Sigma e:cmd(\tau);\Gamma,x:\tau\vdash_\Sigma m'\sim:\tau'}
{\Gamma\vdash_\Sigma bnd(e,x.m')\sim:\tau'}
$$

The above is the __Elimination__ rule for $cmd$

$$
\frac{\Gamma\vdash_\Sigma e:\tau}{\Gamma\vdash_\Sigma ret(e)\sim:\tau}
$$

$$
\frac{\Gamma\vdash_\Sigma e:\tau; \Gamma\vdash_{\Sigma,a\sim\tau}m'\sim:\tau';\tau\ mobile;\tau'\ mobile}
{\Gamma\vdash_\Sigma dcl(e,a.m')\sim:\tau'}
$$

It means I am declaring an assignable: I declare $a$, initialize it to $e$, and
run the command $m'$. A type is $mobile$ if the value of the type can be pulled out
from the scope of the assignable. Example of mobile types: _eager natural numbers_,
_pairs/sums of mobile types_. Example of not mobile types: _functions_ (because
the body of the function can use assignables even if the ultimate return value is $nat$), 
commands. This will be explained in later sections when we talk about the dynamics.

$$
\frac{}{\Gamma\vdash_{\Sigma,a\sim\tau}get[a]\sim:\tau}
$$

$$
\frac{\Gamma\vdash_{\Sigma,a\sim\tau}e:\tau}
{\Gamma\vdash_{\Sigma,a\sim\tau}set[a](e)\sim:\tau}
$$

Exercise: We have the following [Pre-]monad defined:

$$
T(a):type\\
r:a\rightarrow T(a)\\
b:T(a)\rightarrow(a\rightarrow T(b))\rightarrow T(b)
$$

Show that you can define $r$ and $b$ for $T(a)=cmd(a)$.

The important fact is that you __start with the modality__, then they can be formed
into a pre-monad.

## Dynamics

$$
e\ val_\Sigma
$$

$$
e\mapsto_\Sigma e'
$$

$$\mu||m$$
means a command $m$ in memory $$\mu$$. The notation is designed to connecto with concurrency.
The idea is that we have a concurrent composition of a main program $m$ running simultaneously
with threads that govern the contents of each of the location.

$$
\mu||m\ final_\Sigma
$$

$$
\mu||m\mapsto_\Sigma \mu'||m'
$$

$$
\frac{}{cmd(m)\ val_\Sigma}
$$

$$
frac{e\mapsto_\Sigma e'}{\mu||ret(e)\mapsto_\Sigma\mu||ret(e')}
$$

$$
\frac{e\ val_\Sigma}{\mu||ret(e)\ final_\Sigma}
$$

$$
\frac{e\mapsto_\Sigma e'}{\mu||bnd(e,x.m_1)\mapsto_\Sigma\mu||bnd(e',x.m_1)}
$$

$$
\frac{\mu||m\mapsto_\Sigma\mu'||m'}
{\mu||bnd(cmd(m),x.m_1)\mapsto_\Sigma\mu||bnd(cmd(m'),x.m_1)}
$$

$$
\frac{e\ val_\Sigma}{\mu||bnd(cmd(ret(e)),x.m_1)\mapsto\mu||[e/x]m_1}
$$

$$
\frac{}{\mu\otimes a\hookrightarrow e||get[a]\mapsto_{\Sigma,a\sim\tau}\mu\otimes a\hookrightarrow e||ret(e)}
$$

Exercise: define $set$

We have something called _Stack Discipline_ invented by Dijkstra.
The idea is that the assignables in Algol are stack alocated.
When I do a $dcl(e,a.m')$, I declare an assignable in $m'$, I can get it and set it in $m'$.
When $m'$ is finished it's deallocated.

$$
\frac{e\ val_\Sigma;\mu\otimes a\hookrightarrow e||m\mapsto_\Sigma\mu'\otimes a\hookrightarrow e'||m'}
{\mu||dcl(e,a.m)\mapsto_\Sigma\mu'||dcl(e',a.m')}
$$

To rephrase the above in English: Start from lower left: I have a value $e$ which is the initializer of the
assignable $a$ and I want to execute $m$ in the presence of that assignable. What can
I do? I go above the line and do: let's extend the memory $$\mu$$
with $a$ having the content $e$, and I execute $m$, and I will, in the process of
doing that, maybe modify some outer assignables (turn $$\mu$$ to $$\mu'$$), maybe
modify some inner assignables (make $a$ have the content $e'$ instead of $e$ originally)
and get a new command $m'$. Then I update the memory (from $$\mu$$ to $$\mu'$$), and 
reset the world (from $m$ to $m'$). In other words, I take the starting state where
I declare $a$ being initialized to $e$ and execute $m$, once you take a step of execution
of $m$ in the situation of $$\mu\otimes a\hookrightarrow e$$, you might have done a $set$
in $a$ and updated that to $e'$! The resulting state is: I restart your program in the
situation in which the initializer is not what it was ($e$) but what it becomes as result
of the execution step ($e'$) and then proceed from there.

$$
\frac{e,e'\ val_\Sigma}{\mu||dcl(e,a.ret(e'))\mapsto_\Sigma\mu||ret(e')}
$$

To rephrase the above in English: Start from lower left: I declare an assignable
$a$ and assign it to $e$, and I am returning a value $ret(e')$, what do I do next?
The idea of the _stack discipline_ is: when you finish executing the body of $dcl$
then you get out of it!

## Some issues with type safety

In the above formula, in the lower left part, if $e$ has type $\tau$,
then $e'$ has type $\tau'$ in the context of $\Sigma,a\sim\tau$, but in the lower
right part, $e'$ should also have type $\tau'$, but with only $\Sigma$ alone. In
traditional Algol, we can only return $nat$, which means if a numeric value $val$
type checks with an assignable present ($\Sigma,a\sim\tau$), it will type checks
with the assignable absence (only $\Sigma$), __only under some conditions__!

So here is the question: Under what condition is the following statement true?

If $e$ is a value of type $nat$ and type checks with the assignable $a$, it will also
type check in type $nat$ without $a$.

Answer: __Only if the successors are valued eagerly__! if the successors are lazy,
then the arguments of the successors are unevaluated expressions (they are no longer
values $val$)! Algol only makes sense if the constructors of the successors are eager!

Here is an (clever) example of a successor of $$\mathbb{N}$$ doesn't type check if lazy. I want a
successor of something, which is an expression, that uses an assignable $a$. The goal
is it will not type check outside of scope of $a$:

$$
S((\lambda x:nat.z)(cmd(get([a]))))
$$

Explanation: We have a constant function that takes in a $nat$ and return 0 $z$.
And to type check the argument $cmd(get([a]))$ we have to eventually type check $a$,
even though it doesn't matter the ultimate return value of the function because it's
constant!

This is a perfect example of the interactions between language features. We might think
that whatever I do with the PCF level whatever we don't care lazy or eager and the
command level is separated. This is wrong! The hard part of a language design is to make
everything fit in a coherent way. This is way language design is hard!

So traditional Algol they make things work by restricting the return value only $nat$,
and make $nat$ eager. A better idea is that we can demand the result type of $dcl$ $mobile$!
And we also need to restrict that we cannot assign values that aren't $mobile$, because
we can assign the value from a return value. This is the explanation of the
above "This will be explained in later sections".

## MA - Scoped Assignables

### References

We can define $ref(\tau)$ (__immobile__) as we mentioned briefly before in the following ways:

Concretely:

$$
ref(\tau)\triangleq cmd(\tau)\times(\tau\rightarrow cmd(\tau))
$$

Where $cmd(\tau)$ is just the getter and $\tau\rightarrow cmd(\tau)$ is the setter.

Then we can have:

$$
getref(<g,s>)\mapsto g\\
setref(<g,s>)\mapsto s
$$

The problem is, if you look at the type $ref(\tau)$, it only says it has getter and
setters, but it doesn't say the _getter and setter are for the same assignable_! So
you can have a getter for $a$ and a setter for $b$ and you won't know the difference.
So then we can define it in another way:

Abstractly:

The type is still $ref(\tau)$, but we have the following elim rules:

$$
getref(\&a)\mapsto get[a]\\
setref(\&a,e)\mapsto set[a](e)
$$

## MA - (Scope) Free Assignables

__All types are mobile__. Previously because the _stack discipline_ is causing us
trouble about mobility, and we go back to to add some mobility rules in the statics.
But there are other ways to fix this: let's change the statics, make every type mobile,
and we'll make our dynamics fit that. Here are the new dynamics. (Also called
__scope-free__ dynamics, or in other words, assignables are _heap_ allocated.)

$$
\gamma\Sigma\{\mu||m\}\mapsto\gamma\Sigma'\{\mu'||m'\}
$$

Note the above transition is unlabelled.

$$
\frac{e\ val_\Sigma}{\gamma\Sigma\{\mu||dcl[\tau](e,a.m)\}\mapsto
\gamma\Sigma,a\sim\tau\{\mu\otimes a\hookrightarrow e||m\}}
$$

$$
\frac{e\ val}{\gamma\Sigma\{\mu||ret(e)\}\ final}
$$

PCF (FPC with recursive types $rec$) + commands above with free assignables
$\approx$ Haskell :)

# Issues

In Algol, we have a clear distinction between expressions and commands; they are
completely separated. There are many benefits of doing that. But in the "real world",
in doing that, we lose a lot of _benign effects_. For example _efficiency_, we lose:

- laziness/memoization
- splay trees - self-adjusting data structures
- …

While we are condemning benign effects, we do rely on them in real life.
