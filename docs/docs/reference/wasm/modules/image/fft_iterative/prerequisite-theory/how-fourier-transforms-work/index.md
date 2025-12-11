---
id: how-fourier-transforms-work
title: How Fourier Transforms Work
sidebar_position: 6
---

import styles from './index.module.css';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To understand how Fourier transforms work “under the hood”, we must start by
recognising the similarities between the Continuous Fourier Transform (CFT)
and the Discrete Fourier Transform (DFT). They serve the same purpose—mapping
a time-domain signal into its frequency-domain representation—but operate on
different types of signals:

- **CFT → continuous-time signals**
- **DFT → discrete-time, finite-length signals**

Despite these differences, their mathematics is closely related. Below are the
core equations and a breakdown of their similarities and differences.

## Continuous Fourier Transform (CFT) vs Discrete Fourier Transform (DFT)

<Tabs>
<TabItem value="list-format" label="List" default>

### Definition
- **CFT:**  
  $X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t}\, dt$
- **DFT:**  
  $X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j \frac{2\pi}{N} k n}$

**Similarity:** Both use complex exponentials to express the signal’s frequency content.

### Domain of Input
- **CFT:** Continuous signal $x(t)$
- **DFT:** Discrete sequence $x[n]$ of length $N$

**Similarity:** Both operate on time-domain signals (continuous or sampled).

### Domain of Output
- **CFT:** Continuous function $X(f)$
- **DFT:** Discrete frequency bins $X[k]$

**Similarity:** Both output complex-valued frequency components.

### Exponential Kernel
- **CFT:** $e^{-j 2\pi f t}$
- **DFT:** $e^{-j \frac{2\pi}{N} k n}$

**Similarity:** Both use complex exponentials (phasors) as basis functions.

### Inverse Transform
- **CFT:**  
  $x(t) = \int_{-\infty}^{\infty} X(f)\, e^{j 2\pi f t}\, df$
- **DFT:**  
  $x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k]\, e^{j \frac{2\pi}{N} k n}$

**Similarity:** Both perfectly reconstruct the original signal (given correct conditions).

### Linearity
Both transforms are linear.

### Parseval’s Theorem
Energy is preserved between time and frequency domains (with appropriate normalization).

### Purpose
Both analyse the frequency content of signals.

### Periodicity (Key Concept)
- **DFT:** Assumes that $x[n]$ is *periodically extended* with period $N$.
- **CFT:** No periodicity assumption.

This is why windowing and spectral leakage matter in the discrete case.

</TabItem>

<TabItem value="table-format" label="Table">
<span class={styles.noWrapKatexChildren}>

| Aspect                 | Continuous Fourier Transform (CFT)                                | Discrete Fourier Transform (DFT)                                     | Similarities                                                                                               |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Definition**         | $X(f)=\int_{-\infty}^{\infty}x(t)e^{-j2\pi f t}dt$                | $X[k]=\sum_{n=0}^{N-1}x[n]e^{-j\frac{2\pi}{N}kn}$                   | Both use complex exponentials to analyse frequency content.                                                |
| **Input Domain**       | Continuous-time signal $x(t)$                                      | Finite-length discrete sequence $x[n]$                               | Both work with time-domain signals.                                                                        |
| **Output Domain**      | Continuous $X(f)$                                                  | Discrete $X[k]$                                                      | Both output complex spectra.                                                                               |
| **Kernel**             | $e^{-j2\pi f t}$                                                    | $e^{-j \frac{2\pi}{N}kn}$                                            | Both use phasors as basis functions.                                                                       |
| **Inverse Transform**  | Integral                                                            | Summation with $1/N$ factor                                          | Both perfectly reconstruct the signal (given conditions).                                                  |
| **Linearity**          | Linear operator                                                    | Linear operator                                                      | Both obey superposition.                                                                                   |
| **Parseval**           | Energy preserved                                                   | Energy preserved (within normalization)                             | Both conserve signal energy.                                                                               |
| **Periodicity**        | No implicit periodicity                                            | Assumes periodic extension with period $N$                           | —                                                                                                          |
| **Purpose**            | Analyse continuous spectra                                         | Analyse discrete/finite spectra                                      | Both decompose signals into frequency components.                                                          |

</span>
</TabItem>
</Tabs>

## Exponential Kernels in Fourier Transforms

Both the CFT and DFT use **complex exponentials** of the form:

- $e^{-j 2\pi f t}$ for continuous signals  
- $e^{-j \frac{2\pi}{N} k n}$ for discrete signals  

Even though these look different, the DFT kernel is simply the CFT kernel
**sampled at discrete times and discrete frequencies**.

## Deriving the relation $ft = \frac{kn}{N}$

If:

- sampling interval is $T_s$
- sample index is $n$, so $t = n T_s$
- total duration is $T = N T_s$
- frequency samples are multiples of the fundamental frequency  
  $f_0 = \frac{1}{T}$

then:

$$
f = k f_0 = \frac{k}{N T_s}
$$

Substituting into $ft$:

$$
ft = \frac{k}{N T_s} (n T_s) = \frac{kn}{N}
$$

Thus the discrete kernel:

$$
e^{-j 2\pi f t}
\quad\longrightarrow\quad
e^{-j 2\pi \frac{kn}{N}}
$$

This shows **how** the DFT kernel arises from the CFT kernel by sampling.

## Why Do Fourier Transforms Use Complex Exponentials?

Fourier transforms break a signal into sinusoidal components.  
Using Euler’s formula:

$$
e^{j\theta} = \cos\theta + j\sin\theta
$$

a complex exponential represents:

- a cosine (real part)
- a sine (imaginary part)

in a single compact expression.

### 1. Sinusoids become phasors

A sinusoid can be written as:

$$
A \cos(\theta + \phi) = \Re\{A e^{j(\theta + \phi)}\}
$$

This makes Fourier analysis algebraically simple because phasors rotate in the complex plane.

### 2. Polar form of complex numbers

A complex exponential $e^{j\theta}$ lies on the **unit circle** in the complex plane.  
Fourier coefficients naturally contain:

- **magnitude** (amplitude of sinusoid)  
- **phase** (angle)  

which match perfectly with polar form.

### 3. Mathematical convenience

Using exponentials:

- differentiation ↔ multiplication by $j2\pi f$
- convolution ↔ multiplication
- modulation ↔ frequency shifting

These properties make Fourier analysis powerful and computationally efficient.

## Conclusion

- The CFT and DFT are built on the same idea:  
  **represent a signal as a sum of complex exponential components.**
- The DFT kernel is the CFT kernel evaluated at discrete times and discrete frequencies.
- The DFT assumes periodicity; the CFT does not.
- Euler’s formula converts sinusoids into complex exponentials, making Fourier transforms elegant and powerful.

This forms the foundation of how Fourier transforms work internally and why they appear everywhere in engineering, signal processing, and physics.
