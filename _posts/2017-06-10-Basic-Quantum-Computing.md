---
layout: post
title: "Basic Quantum Computing"
date: 2017-06-10 10:05
categories: Algorithm
tags: Algorithm Quantum
author: Yanxi Chen
mathjax: true
---

* content
{:toc}


# Basic Quantum Computing with Least Physics Possible

## Classical Probability Bit

We will start by talking about classical probability bit. Here is the one bit representation $p_0$, $p_1$ are the probability of being $0$, $1$ respectively.

$$
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right)
\\s.t.\ p_0+p_1=1,\ p_0,p_1\in\mathbb{R},\ 0\leq p_0,p_1\leq1
$$

And here is the n-bits representation

$$
\left( \begin{array}{c} 
        p_{0\cdots00} \\ 
        p_{0\cdots01} \\
        p_{0\cdots10} \\
        \vdots \\
        p_{1\cdots11} \end{array} \right)\in\mathbb{R}^{2^n}\\
        s.t.\ \sum p_x=1,\ p_x\in[0,1]\in\mathbb{R},\ x\in\{0,1\}^n
$$

So we can do some transformation to the bit:

$$
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right)
\xrightarrow{I}
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right)
$$

$$
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right)
\xrightarrow{NOT}
\left( \begin{array}{c} p_1 \\ p_0 \end{array} \right)
$$


Or if we have two bits 

$$
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right),
\left( \begin{array}{c} p_0 \\ p_1 \end{array} \right)
$$

and want to do an XOR with two dependent bits

$$
\left( \begin{array}{c} p_{00} \\ p_{01} \\ p_{10} \\ p_{11} \end{array} \right)
\xrightarrow{XOR}
\left( \begin{array}{c} p_0 \\ 0 \\ 0 \\ p_1 \end{array} \right)
$$

But it is not possible (physically) to do something like this, which kind of does XOR with two independent bits:

$$
\left( \begin{array}{c} p_{00} \\ p_{01} \\ p_{10} \\ p_{11} \end{array} \right)
\xrightarrow{XOR'}
\left( \begin{array}{c} p_0\centerdot p_0 \\ p_0\centerdot p_1 \\ 
p_1\centerdot p_0 \\ p_1\centerdot p_1 \end{array} \right)
$$

In other words, physically, in our universe, __we can only do $l_1$ norm linear tranformation__.

<!--more-->

## Quantum Bit (qubit)
For qubit, we are able to do $l_2$ norm. A single qubit is difine as follows:

$$
\left( \begin{array}{c} \alpha \\ \beta \end{array} \right)\in\mathbb{C}^2\\
s.t.\ \lvert\alpha\rvert^2+\lvert\beta\rvert^2=1,\ \lvert\alpha\rvert:=\sqrt{\alpha\centerdot\overline{\alpha}}\\
Prob[m=0]=\lvert\alpha\rvert^2=\left( \begin{array}{c} 1 \\ 0 \end{array} \right)\\
Prob[m=1]=\lvert\beta\rvert^2=\left( \begin{array}{c} 0 \\ 1 \end{array} \right)
$$

Certainly we can do transformation to one qubit. In this case, the transformation we have is $T\in\mathbb{C}^{2\times2}$. Before talking about transformations, we first introduce k-qubits as follows

$$
\left( \begin{array}{c} 
        \alpha_{0\cdots00} \\ 
        \alpha_{0\cdots01} \\
        \alpha_{0\cdots10} \\
        \vdots \\
        \alpha_{1\cdots11} \end{array} \right)\in\mathbb{C}^{2^k}\\
        s.t.\ \sum_{x\in\{0,1\}^k} \lvert\alpha_x\rvert^2=1
$$

and our transformation becomes $T\in\mathbb{C}^{2^k\times2^k}$

## Some Notations

$$
v=
\left( \begin{array}{c} 
        \alpha_1 \\ 
        \alpha_2 \\
        \vdots \\
        \alpha_d \end{array} \right)\in\mathbb{C}^{d}\\
v^{\dagger}=(\bar{\alpha_1},\cdots,\bar{\alpha_d})\\
<v,w>=v^{\dagger}\centerdot w=\overline{<w,v>}=<v|w>\\
v\perp w\Leftrightarrow v^{\dagger}w=0\\
\Vert v\Vert=\sqrt{\sum_{i=1}^{d}\alpha_i \bar{\alpha_i}}=v^{\dagger}v\\
T=
\left( \begin{array}{c} 
        T_{11} & \cdots & T_{1d} \\ 
        \vdots & \ddots & \vdots \\
        T_{d1} & \cdots & T_{dd} \end{array} 
\right)\\
\bar{T}=
\left( \begin{array}{c} 
        \overline{T_{11}} & \cdots & \overline{T_{d1}} \\ 
        \vdots & \ddots & \vdots \\
        \overline{T_{1d}} & \cdots & \overline{T_{dd}} \end{array} 
\right)\\
\left( \begin{array}{c} 
        \alpha_0 \\ 
        \alpha_1 
        \end{array} 
\right)
\otimes
\left( \begin{array}{c} 
        \alpha_0 \\ 
        \alpha_1 \\
        \end{array} 
\right)=
\left( \begin{array}{c} 
        \alpha_0\beta_0 \\ 
        \alpha_0\beta_1 \\
        \alpha_1\beta_0 \\ 
        \alpha_1\beta_1 \\
        \end{array} 
\right)\\
\mathbb{C}^k\otimes\mathbb{C}^l=\mathbb{C}^{kl}\\
if\ |\tilde{\Phi}>=U|\Phi>,|\tilde{\Psi}>=U|\Psi>,then\ <\Phi|\Psi>=<\tilde{\Phi}|\tilde{\Psi}>and\ <\tilde{\Phi}|=<\Phi|U^{\dagger}\\
|0>:=
\left( \begin{array}{c} 
        1 \\ 
        0  \\
    \end{array} 
\right)\\
|1>:=
\left( \begin{array}{c} 
        0 \\ 
        1  \\
    \end{array} 
\right)\\
|+>:=
\left( \begin{array}{c} 
        1/\sqrt{2} \\ 
        1/\sqrt{2}  \\
    \end{array} 
\right)=1/\sqrt{2}(|0>+|1>)\\
|->:=
\left( \begin{array}{c} 
        1/\sqrt{2} \\ 
        -1/\sqrt{2}  \\
    \end{array} 
\right)=1/\sqrt{2}(|0>-|1>)\\
H:=1/\sqrt{2}
\left( \begin{array}{c} 
        1 & 1 \\ 
        1 & -1  \\
    \end{array} 
\right)\\
H|0>=|+>\\
H|1>=|->\\
H|+>=|0>\\
H|->=|1>\\
|X,Y>:=|X>\otimes|Y>\\
if\ f:\{0,1\}^k\rightarrow\{0,1\},then\ |X,Z>\xrightarrow{U_f}|X,Z+f(X)>
$$

## Quantum Transformations
$T$ is a quantum transformation iff
- $T$ is linear: $T\in\mathbb{C}^{d\times d}$
- $T$ is norm preserving $\Leftrightarrow\forall v\in\mathbb{C}^d,\Vert v\Vert^2=\Vert Tv\Vert^2\Rightarrow T\centerdot T^{\dagger}=I$

## Basic Quantum Gates (Between 2/3 qubits)

$$
SWAP:=
\left( \begin{array}{c} 
        1 & 0 & 0 & 0\\ 
        0 & 0 & 1 & 0\\ 
        0 & 1 & 0 & 0\\ 
        0 & 0 & 0 & 1
    \end{array}
\right)\\
i.e.\ 
(X,Y)\xrightarrow{SWAP}(Y,X)\\
CNOT:=
\left( \begin{array}{c} 
        1 & 0 & 0 & 0\\ 
        0 & 1 & 0 & 0\\ 
        0 & 0 & 0 & 1\\ 
        0 & 0 & 1 & 0 
    \end{array}
\right)\\

i.e.\ 
(X,0/1)\xrightarrow{CNOT}
\left\{ \begin{array}{rcl}
(X,0/1) & \mbox{if} & X=0 \\ 
(X,1/0)  & \mbox{if} & X=1 \\
\end{array}\right.\\

CCNOT:=
\left( \begin{array}{c} 
        1 & 0 & 0 & 0 & 0 & 0 & 0 & 0\\ 
        0 & 1 & 0 & 0 & 0 & 0 & 0 & 0\\ 
        0 & 0 & 1 & 0 & 0 & 0 & 0 & 0\\ 
        0 & 0 & 0 & 1 & 0 & 0 & 0 & 0\\ 
        0 & 0 & 0 & 0 & 1 & 0 & 0 & 0\\ 
        0 & 0 & 0 & 0 & 0 & 1 & 0 & 0\\ 
        0 & 0 & 0 & 0 & 0 & 0 & 0 & 1\\ 
        0 & 0 & 0 & 0 & 0 & 0 & 1 & 0\\ 
    \end{array}
\right)\\
i.e.\ 
(X,Y,Z)\xrightarrow{CCNOT}(X,Y,Z\oplus X\wedge Y)\\
(X,Y,0)\xrightarrow{CCNOT}(X,Y,X\wedge Y)\\
$$

__Note__: all transformations are inversible. Specifically, for the above 3 trans., the inverse of them are themselves. Namely, apply it twice and we will be back to the original position.

To implement some classical function $f$, we need the input bits as well as some extra bits for input to have extra space to work with.

## One Small Quantum Algorithm Example

Here we will talk about a small example of quantum algorithms, just to get a feel of how quantum gates works and why it is sometimes more efficient than classical algorithms.

__Deutsch Problem__

Given $$f\:\{0,1\}\rightarrow\{0,1\}$$, we ask if $$f(0)=f(1)$$.
Classically we have to evaluate twice: both $$f(0)$$ and $$f(1)$$.
Quantumly we can solve it with one transformation and evaluate it.

$input:\vert0,1>$
1. $\vert0,1>\xrightarrow{H}\vert+,->$
2. $\vert+,->\xrightarrow{U_f}???$

So

$$
|b,->\xrightarrow{U_f}\cdots\rightarrow|(-1)^{f(b)}b,->\\
And\\
|+,->\xrightarrow{U_f}
1/\sqrt{2}((-1)^{f(0)}\centerdot|0>+(-1)^{f(1)}\centerdot|1>)\otimes|->\rightarrow\\
\left\{ \begin{array}{rcl}
\pm|+> & \mbox{if} & f(0)=f(1) \\ 
\pm|->  & \mbox{if} & f(0)\neq f(1) \\
\end{array}\right.
$$

So if we measure the result, we will see $"0"\ iff\ f(0)=f(1)$, and $"1"\ iff\ f(0)\neq f(1)$
