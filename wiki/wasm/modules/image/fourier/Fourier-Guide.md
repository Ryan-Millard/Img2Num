# Fourier primer — Fourier Series → Continuous FT → Discrete FT

> [!NOTE]
> **Prerequisites:**
>
> This document assumes familiarity with complex numbers (including Euler’s formula), basic trigonometry and calculus, and introductory concepts in signals and systems such as periodicity and sampling. No advanced math beyond these basics is required, but some intuition for time and frequency domains will be helpful.
>
> The list of prerequisites and helpful resources can be found under [Resources — catch-up for the prerequisites](#resources--catch-up-for-the-prerequisites)

# Table of Contents

## Table of Contents

1. [Motivation (plain English)](#1-motivation-plain-english)
2. [Fourier Series — the bridge (periodic signals)](#2-fourier-series--the-bridge-periodic-signals)
3. [Continuous Fourier Transform (non-periodic, continuous-time)](#3-continuous-fourier-transform-non-periodic-continuous-time)
4. [Discrete-time signals and the Discrete Fourier Transform](#4-discrete-time-signals-and-the-discrete-fourier-transform)
5. [How Fourier Transforms Work](#5-how-fourier-transforms-work)
6. [Sign of the Exponent in the Fourier Kernel and Its Relationship to Rotational Direction](#6-sign-of-the-exponent-in-the-fourier-kernel-and-its-relationship-to-rotational-direction)
7. [How these three relate (intuitively)](#7-how-these-three-relate-intuitively)
8. [Why this project uses the DFT (practical justification)](#8-why-this-project-uses-the-dft-practical-justification)
9. [Resources — catch-up for the prerequisites](#resources--catch-up-for-the-prerequisites)

# Keywords

- **FT:** Fourier Transform
- **CFT:** Continuous Fourier Transform
- **DFT:** Discrete Fourier Transform
- **FFT:** Fast Fourier Transform (based on the DFT)

# Conventions Used in This Repository (engineering / FFT)

- CFT (engineering convention):
  - Forward: $X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t}\, dt$
  - Inverse: $x(t) = \int_{-\infty}^{\infty} X(f)\, e^{+j 2\pi f t}\, df$

- DFT (N-point, engineering / FFT convention):
  - Forward: $X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j \frac{2\pi}{N} k n}, \qquad k = 0,\dots,N-1$
  - Inverse: $x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k]\, e^{+j \frac{2\pi}{N} k n}, \qquad n = 0,\dots,N-1$

- Note: in this repo we use the engineering/FFT convention — the forward transform uses the negative exponent and the inverse includes the $\frac{1}{N}$ normalization. When using numerical libraries (e.g. NumPy), confirm their normalization/sign conventions match this (NumPy's `fft`/`ifft` pair follows this engineering convention).

# 1. Motivation (plain English)

Fourier techniques let us express a signal as a sum of sinusoids (frequencies). Think about how graphs can be represented as functions of time or frequency, where we start off in the time domain. The goal of the FT is to convert between the time domain and the frequency domain.

### Figure 1: Continuous sinusoid plotted in time and frequency domains

|                       <img width="80%" alt="sinusoid_time_and_frequency" src="https://github.com/user-attachments/assets/7bafedd9-03a6-47b1-9cfd-f0cada438db4" />                       |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| [See the Python script behind this plot](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/fourier-gaussian-blur/wiki/wasm/modules/image/fourier/Fourier-Guide_Figure-1-script.py) |

In this repo we operate on **digital** data (images/arrays), which are sampled, finite, and stored in memory. That makes the **DFT** the natural mathematical tool since we do not have continuous data (our data came from samples taken at intervals - random or constant). The DFT converts a finite (discrete) sequence of samples into a set of frequency-domain coefficients that we can filter, manipulate (e.g. by multiplying by frequency-domain kernels in a Gaussian blur), and then convert back to the time domain.

### Figure 2: Discrete (sampled) sinusoid plotted in time and frequency domains

|                  <img width="80%" alt="discrete_sinusoid_time_and_frequency" src="https://github.com/user-attachments/assets/6b293e89-8dc2-43aa-8b0e-4ee2e71fef9a" />                   |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| [See the Python script behind this plot](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/fourier-gaussian-blur/wiki/wasm/modules/image/fourier/Fourier-Guide_Figure-2-script.py) |

Above, [Figure 2](#figure-2-discrete-sampled-sinusoid-plotted-in-time-and-frequency-domains) is more representative of the data we are likely to encounter since the sensors we use measure data at intervals rather than continuously - it wouldn't be possible to get a continuous reading from them. Hence, DFTs are better suited for the domain conversions in this context.

# 2. Fourier Series — the bridge (periodic signals)

The Fourier series decomposes a periodic signal in the time domain into a sum of harmonics — sinusoidal components at integer multiples of the fundamental frequency. These harmonics represent the signal's building blocks in the frequency domain.

In other words, a periodic time-domain signal can be perfectly represented by adding together these harmonic sinusoids. Conversely, the Fourier series maps the time-domain periodic signal to discrete points in the frequency domain — its harmonic frequencies.

Given [Figure 3.1](#figure-31-sum-continuous-high-resolution-with-actual-jittered-samples-overlaid) below, which shows the original periodic signal plotted over time with discrete sampled points, [Figure 3.2](#figure-32-underlying-harmonics---individual-continuous-harmonic-components) illustrates each underlying harmonic as a continuous sine wave in the time domain. [Figure 3.3](#figure-33-combined-time-domain-harmonics-with-jittered-samples-and-frequency-spectrum) combines these harmonics and shows the signal’s corresponding amplitude peaks at harmonic frequencies in the frequency domain.

### Figure 3.1: Sum Continuous (High-Resolution) with Actual Jittered Samples Overlaid

| <img width="80%" alt="sum_continuous" src="https://github.com/user-attachments/assets/666edc2e-e3c5-4dd1-bdab-18a2e6d866ec" /> |
| :----------------------------------------------------------------------------------------------------------------------------: |

### Figure 3.2: Underlying Harmonics - Individual Continuous Harmonic Components

| <img width="80%" alt="harmonics_combined" src="https://github.com/user-attachments/assets/0cb82ddd-b34f-49da-99c7-cf96b9cc5c2c" /> |
| :--------------------------------------------------------------------------------------------------------------------------------: |

### Figure 3.3: Combined Time-Domain Harmonics with Jittered Samples and Frequency Spectrum

| <img width="80%" alt="main_figure" src="https://github.com/user-attachments/assets/de4ea54d-9767-4891-a347-2afee21e0861" /> |
| :-------------------------------------------------------------------------------------------------------------------------: |

<div align="center">
  
  [See the Python script behind these plots](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/fourier-gaussian-blur/wiki/wasm/modules/image/fourier/Fourier-Guide_Figure-3-script.py)
</div>

_The bottom panel in [Figure 3.1](#figure-31-sum-continuous-high-resolution-with-actual-jittered-samples-overlaid) shows the frequency domain representation of the signal, highlighting discrete peaks at the harmonic frequencies corresponding to the sinusoidal components in the time domain._

## Block equation:

$$
x(t) = \sum_{k=-\infty}^{\infty} X_k \ e^{j 2\pi k f_0 t}
$$

## The above series coefficients (complex amplitudes) are:

$$
X_k = \frac{1}{T} \int_{0}^{T} x(t)\, e^{-j 2\pi k f_0 t}\, dt \quad \text{(equivalently integrate over any interval of length
𝑇
T, i.e. one period)}
$$

- Here $T$ is the period of the sinusoid and $f_0 = 1/T$ is its fundamental frequency.
  > [! Note]
  > The frequency formula is used to convert between the domains: $f = \frac{1}{T}$, but in this context, $f_0 = \frac{1}{T}$
- Intuition: for periodic signals the frequency content is discrete — only a set number of integer multiples (harmonics) of $f_0$ appear.

# 3. Continuous Fourier Transform (non-periodic, continuous-time)

If you take the Fourier series and let the period $T \to \infty$, the discrete harmonic lines become continuous — resulting in the CFT. It represents general, non-periodic continuous-time signals.

### The Continuous Fourier Transform for a continuous sequence is:

$$
X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t} \, dt
$$

### Inverse CFT:

$$
x(t) = \int_{-\infty}^{\infty} X(f)\, e^{j 2\pi f t} \, df
$$

Notes:

- The CFT assumes a continuous-time signal $x(t)$ defined for all $t$.
- Not directly computable on a digital computer because it requires infinite, continuous data.
- The forward and inverse transforms differ in the sign of the complex exponential (which determines rotation direction) and—in discrete implementations—by a normalization factor (e.g. $\frac{1}{N}$ for the inverse DFT in the engineering convention). Both differences are required so the inverse undoes the forward transform.

# 4. Discrete-time signals and the Discrete Fourier Transform

When we sample a continuous signal (sample rate $f_s$) or when our data are inherently discrete (digital images, audio samples), we work with sequences $x[n]$ for $n=0..N-1$.

### The **Discrete Fourier Transform (DFT)** for an $N$-point sequence is:

$$
X[k] = \sum_{n=0}^{N-1} x[n] \, e^{-j \frac{2\pi}{N} k n}, \qquad k = 0,1,\dots,N-2,N-1
$$

### Inverse DFT:

$$
x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] \, e^{j \frac{2\pi}{N} k n}, \qquad n = 0,1,\dots,N-2,N-1
$$

<div align="center">
  
  `Bins`
</div>

$$
\text{Frequency for bin }k:\quad f_k = k\frac{f_s}{N},\quad k=0,\dots,N-1
$$

$$
\text{Bins with }k > N/2\text{ correspond to negative frequencies at } f_k - f_s
$$

$$
\text{For real-valued signals, } X[N-k]=\overline{X[k]} \;(\text{conjugate symmetry})
$$

Important points:

- The DFT assumes the finite sequence $x[n]$ is one period of a periodic discrete-time signal (i.e. the DFT implicitly treats data as periodic). This is why windowing and padding matter.
- The frequency axis becomes discrete — frequency samples (bins) are spaced by $\Delta f = f_s / N$ when a sampling rate $f_s$ is defined.
- The forward and inverse transforms differ in the sign of the complex exponential (which determines rotation direction) and—in discrete implementations—by a normalization factor (e.g. $\frac{1}{N}$ for the inverse DFT in the engineering convention). Both differences are required so the inverse undoes the forward transform.

# 5. How Fourier Transforms Work

To understand how FTs work "under the hood", we must start by understanding the similarities between CFTs and DFTs because they are, in theory, the same. CFTs work for continuous signals and DFTs work for discrete signals - hence their names.

Below are the equations used to calculate both CFTs and DFTs respectively. What are their similarities?

| Aspect                 | Continuous Fourier Transform (CFT)                        | Discrete Fourier Transform (DFT)                                     | Similarities                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**         | $X(f) = \int_{-\infty}^{\infty} x(t) e^{-j 2 \pi f t} dt$ | $X[k] = \sum_{n=0}^{N-1} x[n] e^{-j \frac{2 \pi}{N} k n}$            | Both transform a time-domain signal into frequency domain using Euler's formula (exponential notation): <br /> $r e^{j \theta}$ => $x(t) e^{-j 2 \pi f t}$ <br /> $r e^{j \theta}$ => $x[n] e^{-j \frac{2 \pi}{N} k n}$ <br /> $j \in \mathbb{C}$ |
| **Domain of Input**    | Continuous-time signal, $x(t)$                            | Discrete-time sequence, $x[n]$, length $N$                           | Both work on signals over time (continuous or discrete).                                                                                                                                                                                          |
| **Domain of Output**   | Continuous frequency spectrum, $X(f)$                     | Discrete frequency components, $X[k]$, $k = 0, \dots, N-1$           | Both output complex-valued frequency components.                                                                                                                                                                                                  |
| **Exponential Kernel** | $e^{-j 2 \pi f t}$                                        | $e^{-j \frac{2 \pi}{N} k n}$                                         | Both use complex exponentials as basis functions.                                                                                                                                                                                                 |
| **Inverse Transform**  | $x(t) = \int_{-\infty}^{\infty} X(f) e^{j 2 \pi f t} df$  | $x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] e^{j \frac{2 \pi}{N} k n}$ | Both have inverse formulas recovering the original signal.                                                                                                                                                                                        |
| **Linearity**          | Linear operator                                           | Linear operator                                                      | Both transforms are linear.                                                                                                                                                                                                                       |
| **Parseval’s theorem** | Energy conserved between domains                          | Energy conserved between domains                                     | Both preserve signal energy (with proper normalization).                                                                                                                                                                                          |
| **Purpose**            | Analyze frequency content of continuous signals           | Analyze frequency content of discrete signals                        | Both analyze frequency content of signals.                                                                                                                                                                                                        |

## Exponential Kernels in Fourier Transforms

Based on the table above, it is clear that both CFTs and DFTs use exponential kernels (Euler's formula) to map the time domain signal to its counterpart in the frequency domain.
In the shown notation, the exponential kernel for the CFT appears to differ from that of the DFT since the DFTs notation appears to swap $f t$ with $\frac{k n}{N}$.
However, that is not the case since:

$$
f t = \frac{k n}{N}, \quad \text{where} \quad k, n \in \mathbb{Z}, \quad 0 \leq k \leq N - 1, \quad 0 \leq n \leq N - 1
$$

$$
\begin{aligned}
f: & \text{frequency in cycles per unit time (continuous frequency)} \\
t: & \text{continuous time} \\
k: & \text{discrete frequency index} \\
n: & \text{sample number} \\
N: & \text{total number of samples}
\end{aligned}
$$

### What does that mean?

In the CFT, the basis exponential is: $e^{-j 2 \pi f t}$
In the DFT, we sample time and frequency discretely, so:

- Time is sampled at intervals $T_s$, so: $t = n T_s$
- Frequency samples correspond to multiples of a fundamental frequency $f_0$, so $f = k f_0$
  - Where: $f_0 = \frac{1}{N T_s}$ is the fundamental frequency corresponding to the whole sampled sequence length, $N T_s$

**To get there:**

$$
\text{Let }T = N T_s \text{ be the total duration of the sampled record, and } f_0 = \frac{1}{T} = \frac{1}{N T_s}
$$

$$
\text{For sample index } n \text{ we have } t = n T_s
$$

$$
\text{If } f = k f_0 = \frac{k}{N T_s}, \text{ then }
$$

$$
f t = \left(\frac{k}{N T_s}\right)(n T_s) = \frac{k n}{N}
$$

**Conclusion**

This shows that the continuous-time frequency-time product $f t$ for the discrete sample points corresponds exactly to the normalized discrete indices ratio $\frac{kn}{N}$.

Hence the different, yet equivalent, kernels:

<div align="center">
  
| Continuous Fourier Transform (CFT) | Discrete Fourier Transform (DFT) |
|------------------------------------|----------------------------------|
| $e^{-j 2 \pi f t}$                 | $e^{-j \frac{2 \pi}{N} k n}$     |

</div>

### Where Does Euler's Identity Come From?

Euler's Identity appears in Fourier transforms because it provides an elegant way to represent sinusoids — and therefore **phasors** — as complex exponentials.

**Where it applies:**

$$
\begin{aligned}
\text{Euler's formula:} \quad & e^{j \theta} = \cos \theta + j \sin \theta \\
\text{Fourier kernel:}  \quad & e^{-j 2 \pi f t} = \cos (2 \pi f t) - j \sin (2 \pi f t)
\end{aligned}
$$

$$
\begin{aligned}
\theta = 2 \pi f t & \text{**phase angle** (real number) on the unit circle} \\
e^{j \theta} \ \text{or} \ e^{-j 2 \pi f t} & \text{complex exponential (phasor) representing rotation in the complex plane} \\
r & \text{discrete frequency index} \\
x[n] & \text{discrete signal value; its Fourier coefficient magnitude corresponds to} r \text{ at frequency bin} \ k
\end{aligned}
$$

> Note: The kernels in both CFTs and DFTs have been proven to be the same, so it does not matter that the example above uses the CFT kernel. See the previous heading to verify that.

**Why does this happen?**

<div align="center">
  
  `1. Sinusoids as complex exponentials`
</div>

The Fourier transform breaks a signal down into a sum (discrete case - DFT) or integral (continuous case - CFT) of sinusoids at different frequencies.
Instead of dealing with sine and cosine separately, Euler’s formula lets us combine them into a single **complex exponential (phasor)** term:

$$
\cos \theta = \frac{e^{j \theta} + e^{-j \theta}}{2}, \quad
\sin \theta = \frac{e^{j \theta} - e^{-j \theta}}{2j}
$$

Phasors are these rotating complex exponentials, and the Fourier transform naturally uses $e^{j 2\pi f t}$ terms because they compactly represent oscillations with both magnitude and phase.

<div align="center">
  
  `2. Polar form of complex numbers`
</div>

Euler’s formula connects Cartesian coordinates $(x,y)=(rcosθ,rsinθ)$ to the polar form $r e^{j\theta}$.
A phasor is exactly this polar representation of a sinusoid.
This is crucial because the Fourier transform outputs complex numbers that encode both amplitude (magnitude) and phase (angle) of frequency components.
The phase is naturally represented as an angle $\theta$, which Euler’s formula handles perfectly.

<div align="center">
  
  `3. Mathematical convenience and properties`
</div>

Complex exponentials (phasors) have nice properties:

- They are eigenfunctions of linear time-invariant systems.
- Differentiation and integration become multiplication and division by constants in the exponential form (frequency domain), simlifying analysis - particularly time complexity and logical flow.
- Multiplying exponentials corresponds to adding angles, making frequency shifting and modulation straightforward.

**Conclusion**

Euler’s formula is used in Fourier transforms because it converts trigonometric functions into complex exponentials (phasors), which are easier to manipulate mathematically.
Phasors naturally encode amplitude and phase, aligning perfectly with the Fourier transform’s role of decomposing signals into their frequency-domain components.

# 6. Sign of the Exponent in the Fourier Kernel and Its Relationship to Rotational Direction

In the Fourier transform, the kernel contains a complex exponential of the form:

$$
e^{\pm j 2\pi f t}
$$

The **sign** in the exponent determines the **direction of rotation** of the phasor in the complex plane:

- **Negative sign** $e^{-j 2\pi f t}$ → **Clockwise rotation** (commonly used in the analysis formula of the Fourier transform).
- **Positive sign** $e^{+j 2\pi f t}$ → **Counterclockwise rotation** (commonly used in the synthesis formula to reconstruct the signal).

This follows directly from Euler’s formula:

$$
e^{j\theta} = \cos\theta + j\sin\theta
$$

$$
e^{-j\theta} = \cos\theta - j\sin\theta
$$

In the complex plane:

- Increasing $\theta$ moves the phasor counterclockwise.
- Decreasing $\theta$ (negative exponent) moves it clockwise.

**Why it matters:**

- Positive and negative frequencies in the Fourier transform correspond to these two rotational directions.
- In real-valued signals, the positive and negative frequency components are complex conjugates, ensuring the time-domain signal remains real.

> [!IMPORTANT]
> **The sign choice must be consistent between the forward and inverse transforms**
>
> The sign of the exponent in the Fourier kernel does not matter in isolation — what matters is that:
>
> 1. One transform (forward or inverse) uses the positive exponent.
> 2. The other transform uses the negative exponent.
>
> This ensures that the inverse transform _undoes_ the phasor rotation applied by the forward transform.  
> For example: if the forward FT uses the positive exponent (counterclockwise rotation), the inverse FT must use the negative exponent (clockwise rotation) to reverse that rotation and return to the original time-domain signal.

> [!CAUTION]
> **Common pitfalls**
>
> Rotational direction conventions differ between mathematics (typically counterclockwise as positive) and many science/engineering contexts (often clockwise as positive).  
> This means that:
>
> - Mathematical treatments often use $e^{+j 2\pi f t}$ (counterclockwise) in the forward FT.
> - Engineering treatments often use $e^{-j 2\pi f t}$ (clockwise) in the forward FT.
>
> Both are correct as long as the forward and inverse transforms use opposite signs.

**Conclusion**

The sign of the exponent in the Fourier kernel is not arbitrary — it encodes the phasor’s rotational direction. This links the algebra of Euler’s formula to the geometry of the complex plane and to the symmetry between positive and negative frequencies in the spectrum.

# 7. How these three relate (intuitively)

- **Fourier series**: discrete frequencies for periodic continuous signals
- **CFT**: continuous frequency spectrum for general continuous signals (limit of the series as period $\to\infty$)
- **DFT**: discrete frequency samples for finite, sampled signals — effectively the Fourier series of one period of a sampled sequence

### Takeaways:

- Sampling a continuous-time signal maps the continuous-time transform into a discrete-frequency / periodic structure (aliasing phenomena).
- Computing a DFT on $N$ samples produces $N$ complex frequency bins; applying the inverse DFT with the same bins reconstructs the original $N$ samples (assuming no frequency-domain modifications that break perfect reconstruction).

# 8. Why this project uses the DFT (practical justification)

1. **Inputs are digital** — images and arrays are sampled and finite; the DFT exactly models the transform we can compute on them.
2. **Finite memory** — continuous transforms need infinite support; DFT works with finite-length vectors held in RAM.
3. **Efficient algorithms exist** — the FFT computes the DFT quickly ($O(N\log N)$ rather than $O(N^2)$).
4. **Discrete manipulations match implementation** — convolution via multiplication in frequency domain, frequency-domain filters (Gaussian, high/low-pass) operate on bins.
5. **Compatibility with image processing conventions** — 2D DFT is separable: apply 1D DFT across rows then columns (or vice versa); per-channel processing is straightforward.

Practical consequences to document in the repo:

- Zero-padding to reduce circular convolution effects.
- Windowing to reduce spectral leakage.
- `fft shift` / `ifft shift` to center the zero frequency for visualization.
- Explain per-channel transforms for multi-channel images (RGB).

---

# Resources — catch-up for the prerequisites

## Quick study path (suggested)

| Topic                                    | Suggested Time on Topic (in hours) |
| ---------------------------------------- | ---------------------------------- |
| Complex numbers & trigonometry           | 4-8                                |
| Basic calculus (integrals / limits)      | 4-8                                |
| Linear Algebra (vectors, basis )         | 4-8                                |
| Signals & sampling (Nyquist, aliasing)   | 6-10                               |
| Practical DFT/FFT & coding (NumPy/Scipy) | 4-8                                |

## Recommended resources

### Foundations — Complex numbers & trigonometry

- **Khan Academy — Complex numbers & Trigonometry**
  - Good interactive exercises for Euler’s formula, magnitude/phase, unit circle.
  - [Euler's formula & Euler's identity | Series | AP Calculus BC | Khan Academy](https://www.youtube.com/watch?v=mgNtPOgFje0)

- **3Blue1Brown — Visual intuition (unit circle / phasors)**
  - Excellent visual intuition for complex exponentials and rotating phasors.
  - [Complex number fundamentals | Ep. 3 Lockdown live math](https://www.youtube.com/watch?v=5PcpBw5Hbwo)

### Basic calculus / prerequisite math

- **Khan Academy — Single variable calculus (integrals & limits)**
  - Clear, bite-sized lessons on definite integrals and limits (essential for the CFT section).
  - [Khan Academy's _Calculus_ playlist](https://www.youtube.com/playlist?list=PL19E79A0638C8D449)

- **Paul’s Online Math Notes — Calculus I / II**
  - Concise reference notes and worked examples for integrals and series.
  - [Calculus I](https://tutorial.math.lamar.edu/classes/calci/calci.aspx)
  - [Calculus II](https://tutorial.math.lamar.edu/classes/calcII/calcII.aspx)

### Linear algebra (optional but helpful)

- **Gilbert Strang’s MIT OCW lectures / book** — _Introduction to Linear Algebra_
  - Focus on vectors, inner products and basis functions (signals as vectors).
  - [Downloadable lectures](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/download/)

- **3Blue1Brown — Essence of linear algebra (playlist)**
  - Visual, intuitive take on basis and projections.
  - [Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)

### Signals & systems / sampling theory

- **Intro Signals & Systems (textbook or course)**
  - Read the introductory chapters on continuous vs discrete signals, linearity, and sampling.
  - [Oppenheim & Willsky - _Signals and Systems - 2nd Edition_](https://www.cedric-richard.fr/assets/files/Signals_and_Systems_2nd_Edition_by_Oppen.pdf)
  - [MIT OCW - _Signals and Systems_](http://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/pages/introduction/)

- **Nyquist, aliasing, and sampling theorem**
  - [West & Jill's _Data Communication and Computer Networks A Business Users Approach, Ninth Edition_](https://share.google/rKocoRm0essVordfR)
    - Chapter 3: Transmission Fundamentals
    - Chapter 4: Analog and Digital Signals
    - Chapter 7: Data Transmission and Encoding

### DFT / FFT practicals and coding

- **NumPy / SciPy docs — `numpy.fft` and `scipy.fft`**
  - Practical examples for computing FFTs, `fftshift`, real-input symmetry, and inverse transforms.
  - [NumPy](https://numpy.org/devdocs/reference/routines.fft.html)
  - [SciPy](https://docs.scipy.org/doc/scipy/tutorial/fft.html)

- **Richard Lyons — _Understanding Digital Signal Processing_ (book)**
  - Very practical, engineering-focused explanations and examples (recommended chapters on DFT/FFT).
  - [Understanding Digital Signal Processing](https://www.mikrocontroller.net/attachment/341426/Understanding_digital_signal_processing.pdf)

* **Small hands-on project**:
  - Load a simple 1-D signal (sine + noise), compute `np.fft.fft`, plot magnitude/phase, then `ifft` to verify reconstruction.
  - Try zero-padding and `fftshift` to see visualization effects.

### Visual / interactive tools

- **Desmos or GeoGebra** — quickly plot complex exponentials, sines/cosines, and see effects of phase/amplitude changes.
- **Online FFT visualizers** — interactively play with windowing, zero-padding and see spectral leakage (search for “FFT visualizer” or “spectral leakage demo”).

# Cheatsheet — Fourier Quick References

## Core identities

### Euler's formula

$$
e^{j\theta} = \cos\theta + j\sin\theta,\qquad
$$

$$
e^{-j\theta} = \cos\theta - j\sin\theta
$$

### Polar / phasor

$$
r e^{j\theta} \quad\text{magnitude } r,\ \text{phase } \theta
$$

## Continuous Fourier Transform (engineering convention)

### Forward

$$
X(f)=\int_{-\infty}^{\infty} x(t)\,e^{-j2\pi f t}\,dt
$$

### Inverse

$$
x(t)=\int_{-\infty}^{\infty} X(f)\,e^{+j2\pi f t}\,df
$$

## Discrete Fourier Transform (N-point, engineering / FFT convention)

### Forward

$$
X[k]=\sum_{n=0}^{N-1} x[n]\,e^{-j\frac{2\pi}{N}kn},\qquad k=0,\dots,N-1
$$

### Inverse

$$
x[n]=\frac{1}{N}\sum_{k=0}^{N-1} X[k]\,e^{+j\frac{2\pi}{N}kn},\qquad n=0,\dots,N-1
$$

### Frequency of bin $k$ (sample rate $f_s$):

$$
f_k = k\frac{f_s}{N},\quad\Delta f=\frac{f_s}{N}
$$

<div align="center">

Bins with $k>N/2$ correspond to negative frequencies at $f_k-f_s$.

</div>

# Useful properties (quick)

### Conjugate symmetry (real input)

$$
x[n]\in\mathbb{R}\ \Rightarrow\ X[N-k]=\overline{X[k]}
$$

### Parseval / energy conservation (DFT)

$$
\sum_{n=0}^{N-1}|x[n]|^2 = \frac{1}{N}\sum_{k=0}^{N-1}|X[k]|^2
$$

<div align="center">

_(depends on chosen normalization — check convention)_

</div>

### Linearity

$$
FT\{a·x + b·y\} = a·FT\{x\} + b·FT\{y\}
$$

### Time shift:

$$
x[n-n_0] \quad ↔ \quad X[k] e^{-j\frac{2\pi}{N}k n_0}
$$

### Frequency shift (modulation):

$$
e^{j\frac{2\pi}{N} m n}x[n] \quad \text{shifts bins}
$$

# Practical tips & gotchas

- **DFT implicitly assumes periodicity** of the finite sequence → circular convolution.
  - Use **zero-padding** to reduce wrap-around / increase frequency resolution.
  - Use **windowing** (Hann, Hamming, Blackman) to reduce spectral leakage for non-periodic segments.
- **Zero-padding**: increases bin count (interpolates spectrum) but does **not** add new information.
- **fftshift / ifftshift**: center the zero-frequency bin for visualization.
- **Normalization conventions vary**:
  - Engineering/FFT: forward has no $\frac{1}{N}$, inverse has $\frac{1}{N}$ (this cheatsheet's default).
  - Other conventions: symmetric $\frac{1}{\sqrt{N}}$ on both transforms, or $\frac{1}{N}$ on forward. Always check library docs.
- **Nyquist / sampling theorem**:
  - To avoid aliasing: $f_s \ge 2 f_{\text{max}}$ (sample at least twice the highest signal frequency).
  - If undersampled, high-frequency content folds into lower frequencies (aliasing).

# Quick NumPy / SciPy commands (examples)

- 1-D FFT / inverse (NumPy / SciPy follow engineering convention)
  - `X = np.fft.fft(x)`
  - `x_rec = np.fft.ifft(X)` _(if `x` real, `x_rec.real` equals original within numerical error)_
- Zero-pad to length M:
  - `x_padded = np.pad(x, (0, M-len(x)))` then `np.fft.fft(x_padded)`
- Shift for plotting:
  - `Xc = np.fft.fftshift(np.fft.fft(x))`
  - Frequency axis: `freqs = np.fft.fftshift(np.fft.fftfreq(N, d=1/f_s))`
- Real-input optimized transforms:
  - `X = np.fft.rfft(x)` and inverse `x = np.fft.irfft(X, n=N)`
- 2-D FFT (images):
  - `F = np.fft.fft2(image)`
  - `Fshift = np.fft.fftshift(F)`
  - `image_rec = np.fft.ifft2(F)`

# Quick visual checklist

- Before taking FFT: detrend / remove DC if needed.
- Use window when analyzing short, non-periodic segments.
- Use zero-padding for smoother spectral plots (visual refinement).
- For filters: remember multiplication in frequency = convolution in time (and vice versa). For linear convolution via DFT, pad signals to length ≥ N1+N2−1.

# Minimal cheat summary (one-liners)

- FT kernel: $e^{-j2\pi f t}$ (analysis), inverse uses opposite sign.
- DFT maps time samples $n$ ↔ bins $k$ with phase factor $e^{-j2\pi kn/N}$.
- Nyquist: $f_s \ge 2 f_{\max}$.
- `np.fft.fft`, `np.fft.ifft`, `np.fft.fftshift` are your go-to tools.
