---
id: continuous-fourier-transform
title: Continuous Fourier Transform
sidebar_position: 5
---

import cft_gaussian from './img/cft_gaussian.png';

import CodeBlock from '@theme/CodeBlock';
import cft_gaussian_py from '!!raw-loader!./python_scripts/cft_gaussian.py';

# Continuous Fourier Transform (non-periodic, continuous-time)

If you take the Fourier series and let the period $T \to \infty$, the discrete harmonic lines become continuous — resulting in the **Continuous Fourier Transform (CFT)**.
It represents general, non-periodic continuous-time signals.

## CFT for a continuous sequence
$$
X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t} \, dt
$$

## Inverse CFT for a continuous sequence
$$
x(t) = \int_{-\infty}^{\infty} X(f)\, e^{j 2\pi f t} \, df
$$

:::note
- The CFT assumes a continuous-time signal $x(t)$ defined for all $t$.
- Not directly computable on a digital computer because it requires infinite, continuous data.
- The forward and inverse transforms differ in the sign of the complex exponential (which determines rotation direction) and—in discrete implementations—by a normalization factor (e.g. $\frac{1}{N}$ for the inverse DFT in the engineering convention). Both differences are required so the inverse undoes the forward transform.
:::

---

## Example: Gaussian pulse

A Gaussian pulse is a common non-periodic signal. Its CFT is also a Gaussian (frequency-domain spread inversely proportional to time-domain width).
Note how the time-domain Gaussian width inversely affects the spread in the frequency domain in
[Figure 1](#figure-1-gaussian-pulse-in-time-domain-top-and-magnitude-of-its-cft-bottom).

In practice, we compute approximate transforms digitally using the DFT/FFT, which discretizes both time and frequency.

#### Figure 1: Gaussian pulse in time domain (top) and magnitude of its CFT (bottom)
<img alt="Gaussian pulse CFT" src={cft_gaussian} />

:::danger You may have missed this
In previous sections, frequency-domain graphs showed the magnitude on the y-axis. Here, |X(f)| represents the same concept: the amplitude of each frequency component.

$|X(f)|$ is the same as what we referred to as **"magnitude"** in the previous sections.
:::

<details>
  <summary>View Figure 1's code</summary>
  <CodeBlock language="python">{cft_gaussian_py}</CodeBlock>
</details>
