---
layout: post
title: "Sum and Product Types"
date: 2018-02-17 18:50
categories: ['Programming Language Theory'] 
tags: ['Programming Languages'] 
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Products

For products, we have types $\tau$:

- Binary
$$
\tau_1\times\tau_2
$$
- Nullary
$$
1\ or\ unit
$$

and expressions $e$:

- Ordered pairs
$$
\langle e_1,e_2\rangle
$$

- Projections
$$
e\cdot1 \\
e\cdot2
$$

Statics:

$$
\frac{}
{\Gamma\vdash\langle\rangle:1}
$$

$$
\frac{ \Gamma\vdash e_1:\tau_1,\Gamma\vdash e_2:\tau_2 }
{ \Gamma\vdash\langle e_1,e_2\rangle:\tau_1\times\tau_2}
$$

$$
\frac{ \Gamma\vdash e:\tau_1\times\tau_2 }
{ \Gamma\vdash e\cdot1:\tau_1,e\cdot2:\tau_2}
$$

Dynamics (two cases, lazy or eager):

lazy:

$$
\frac{}
{\langle e_1,e_2\rangle val}
$$

end lazy

eager:

$$
\frac{e_1\mapsto e_1'}
{\langle e_1,e_2\rangle\mapsto \langle e_1',e_2\rangle}
$$

$$
\frac{e_1\ val,e_2\mapsto e_2'}
{\langle e_1,e_2\rangle\mapsto \langle e_1,e_2'\rangle}
$$

$$
\frac{e_1\ val,e_2\ val}
{\langle e_1,e_2\rangle val}
$$

end eager

$$
\frac{e\mapsto e'}
{e\cdot2\mapsto e'\cdot2}
$$

$$
\frac{\langle e_1,e_2\rangle val}
{\langle e_1,e_2\rangle\cdot i\mapsto e_i}
$$

## Sums

For sums, we have types $\tau$:

- Binary Sum/Coproducts
$$
\tau_1+\tau_2
$$
- Nullary
$$
0\ or\ void
$$

and expressions $e$:

- Binary
$$
1\cdot e\\
2\cdot e
$$

$$
\underline{case}_\tau e\{1\cdot x\hookrightarrow e_1 | 2\cdot x\hookrightarrow e_2\}\\
or\\
\underline{case} [\tau](x.e_1;x.e_2)(e)
$$

- Nullary

$$
\underline{case} \{\}\\
or\\
abort[\tau]()
$$

Note: $abort$ doesn't mean to abort!!!!!

Statics:

$$
\frac{\Gamma\vdash e_i:\tau_i}
{\Gamma\vdash i\cdot e_i:\tau_1+\tau_2}
$$

$$
\frac{\Gamma\vdash e:\tau_1+\tau\ and\ \Gamma,x:\tau_1\vdash e_1:\tau\ \Gamma,x:\tau_2\vdash e_2:\tau}
{\Gamma\vdash\underline{case}_\tau e\{1\cdot x\hookrightarrow e_1 | 2\cdot x\hookrightarrow e_2\}:\tau}
$$

$$
\frac{\Gamma\vdash e:0}
{\Gamma\vdash\underline{case} e\{\}:\tau}
$$

Dynamics (two cases, lazy or eager):

lazy:

$$
\frac{}
{i\cdot e_i\ val}
$$

end lazy

eager:

$$
\frac{e_i\mapsto e_i'}
{i\cdot e_i\mapsto i\cdot e_i'}
$$

$$
\frac{e_i\ val}
{i\cdot e_i\ val}
$$

end eager

$$
\frac{e\mapsto e'}
{\underline{case}_\tau e\{...\}\mapsto\underline{case} e'\{...\}}
$$

$$
\frac{i\cdot e_i\ val}
{\underline{case}_\tau i\cdot e_i\{1\cdot x\hookrightarrow e_1' | 2\cdot x\hookrightarrow e_2'\}\mapsto[e_i/x]e_i'}
$$

$$
\frac{e\mapsto e'}
{\underline{case} e\{\}\mapsto\underline{case} e'\{\}}
$$

## Some Type Algebra

$$
\tau\times1\cong\tau\\
\tau_1\times(\tau_2\times\tau_3)\cong(\tau_1\times\tau_2)\times\tau_3\\
\tau_1\times\tau_2\cong\tau_2\times\tau_1\\
\tau+0\cong\tau\\
\tau_1+(\tau_2+\tau_3)\cong(\tau_1+\tau_2)+\tau3\\
\tau_1+\tau_2\cong\tau_2+\tau_1\\
\tau_1\times(\tau_2+\tau_3)\cong(\tau_1\times\tau_2)+(\tau_1\times\tau_3)
$$

Algebra about functions (using the arrow notation):

$$
\tau\rightarrow(\rho_1\times\rho_2)\cong(\tau\rightarrow\rho_1)\times(\tau\rightarrow\rho_2)\\
\tau\rightarrow1\cong1
$$

Functions can also be written by exponential notation:

$$
(\rho_1\times\rho_2)^\tau\cong\rho_1^\tau\times\rho_2^\tau\\
1^\tau\cong1
$$

Something like the dual:

$$
(\tau_1+\tau_2)\rightarrow\rho\cong(\tau_1\rightarrow\rho)\times(\tau_2\rightarrow\rho)\\
0\rightarrow\rho\cong1\\
$$

In exponential notation:

$$
\rho^{\tau_1+\tau_2}\cong\rho^{\tau_1}\times\rho^{\tau_2}\\
\rho^0\cong1
$$
