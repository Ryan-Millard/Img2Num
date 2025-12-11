---
id: discrete-fourier-transform
title: Discrete-time signals and the DFT
sidebar_position: 5
---

# Discrete-Time Signals and the Discrete Fourier Transform (DFT)

When we sample a continuous-time signal at a sampling rate $f_s$ (in Hz), or when we work with inherently discrete data (such as digital audio or images),
the resulting signal is represented as a **sequence**:

$$
x[n], \quad n = 0, \dots, N-1 \quad \text{where $N$ is the number of samples in the sequence}
$$

## The Discrete Fourier Transform (DFT)

The **DFT** converts a discrete-time sequence $x[n]$ into its frequency-domain representation $X[k]$,
which shows how much of each frequency component is present in the signal:

$$
\begin{align*}
X[k] = \sum_{n=0}^{N-1} x[n] e^{-j 2 \pi \frac{k n}{N}}, \quad &k = 0, \dots, N-1\\
&X[k] \in \mathbb{C}
\end{align*}
$$

* $k$ is the **bin index** corresponding to a discrete frequency.
* $X[k]$ is generally **complex-valued**, representing both amplitude and phase of the frequency component.

## Inverse DFT

The **inverse DFT (IDFT)** reconstructs the time-domain sequence from its frequency-domain representation:

$$
\begin{align*}
x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] e^{j 2 \pi \frac{k n}{N}} \quad &n = 0, \dots, N-1\\
&X[k] \in \mathbb{C}
\end{align*}
$$

:::important
Notice the sign of the exponent is reversed compared to the DFT, and we divide by $N$ to normalize.

This repository follows the **engineering / FFT convention**, where the forward FFT has a negative exponent
and the inverse FFT has a positive exponent. In other paradigms, it is conventional for the forward FFT to
have a positive exponent and the inverse FFT to have a negative exponent.

The sign does not matter as long as the sum of the forward FFT's exponent and the inverse FFT's exponent $=0$
:::

## Frequency Bins

Each DFT output (X[k]) corresponds to a **discrete frequency**:

$$
f_k = k \frac{f_s}{N} \quad k = 0, 1, \dots, N-1
$$

* Frequencies above $\frac{f_s}{2}$ correspond to **negative frequencies** (aliases):

$$
f_k - f_s \quad k > \frac{N}{2}
$$

* For **real-valued signals**, the DFT is **conjugate symmetric**:

$$
X[N-k] = \overline{X[k]} \quad (\text{complex conjugate symmetry})
$$

This means we only need to examine the first half of the spectrum for amplitude information.

:::tip Important Notes
1. The DFT **assumes periodicity**: it treats the finite sequence $x[n]$ as one period of an infinitely repeating discrete signal.
This is why windowing and zero-padding are important — they reduce artifacts caused by discontinuities at the boundaries.
2. The **frequency resolution** depends on the number of samples and sampling rate: $\Delta f = \frac{f_s}{N}$.
This is the spacing between adjacent frequency bins.
3. The DFT and IDFT differ in **exponential sign** (rotation direction) and a **normalization factor**, which ensures perfect reconstruction.
:::
