---
id: prerequisite-theory
title: Prerequisite Theory
sidebar_position: 1
---

:::info Prerequisites

This section assumes familiarity with the below:
- `Complex numbers` (including Euler’s formula)
- Basic `trigonometry and calculus`
- Introductory concepts in `signals`
- Systems such as `periodicity and sampling`

No advanced math beyond these basics is required, but some intuition for time and frequency domains will be helpful.

:::

The list of prerequisites and helpful resources can be found below.

## Quick study path (suggested)

| Topic                                                                         | Suggested Time on Topic (in hours) |
| ----------------------------------------------------------------------------- | ---------------------------------- |
| [Complex numbers & trigonometry](#foundations--complex-numbers--trigonometry) | 4-8                                |
| [Basic calculus (integrals / limits)](#basic-calculus--prerequisite-math)     | 4-8                                |
| [Linear Algebra (vectors, basis)](#linear-algebra-optional-but-helpful)       | 4-8                                |
| [Signals & sampling (Nyquist, aliasing)](#signals--systems--sampling-theory)  | 6-10                               |
| [Practical DFT/FFT & coding (NumPy/Scipy)](#dft--fft-practicals-and-coding)   | 4-8                                |

**Total**: = 22-42 hours

## Helpful resources

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
