---
id: fourier-series-the-bridge
title: Fourier Series - the bridge (periodic signals)
sidebar_position: 4
---

import harmonics_individual from './img/harmonics_individual.png';
import sum_jittered from './img/sum_jittered.png';
import time_freq_domain from './img/time_freq_domain.png';
import fourier_coefficient_triangle from './img/fourier_coefficient_triangle.png';

import CodeBlock from '@theme/CodeBlock';
import harmonics_individual_py from '!!raw-loader!./python_scripts/harmonics_individual.py';
import sum_jittered_py from '!!raw-loader!./python_scripts/sum_jittered.py';
import time_freq_domain_py from '!!raw-loader!./python_scripts/time_freq_domain.py';
import fourier_coefficient_triangle_py from '!!raw-loader!./python_scripts/fourier_coefficient_triangle.py';

The Fourier Series **decomposes a periodic signal in the time domain into a sum of harmonics** -
sinusoidal components at integer multiples of the fundamental frequency.
These harmonics represent the signal's building blocks in the frequency domain.

In other words, a periodic time-domain signal can be perfectly represented by adding together these harmonic sinusoids.
Conversely, the Fourier series maps the time-domain periodic signal to discrete points in the frequency domain — its harmonic frequencies.

#### Figure 1: Sum Continuous (High-Resolution) with Actual Jittered Samples Overlaid

<img alt="Jittered sum" src={sum_jittered} />
<details>
  <summary>View Figure 1's Code</summary>
  <CodeBlock language="python">{sum_jittered_py}</CodeBlock>
</details>

[Figure 1](#figure-1-sum-continuous-high-resolution-with-actual-jittered-samples-overlaid)
(above) shows a periodic signal plotted over time with discretely sampled points.

[Figure 2](#figure-2-underlying-harmonics---individual-continuous-harmonic-components)
(below) illustrates each underlying harmonic as a continuous sine wave in the time domain.

#### Figure 2: Underlying Harmonics - Individual Continuous Harmonic Components

<img alt="Individual Harmonics" src={harmonics_individual} />
<details>
  <summary>View Figure 2's Code</summary>
  <CodeBlock language="python">{harmonics_individual_py}</CodeBlock>
</details>

#### Figure 3: Combined Time-Domain Harmonics with Jittered Samples and Frequency Spectrum

<img alt="Harmonic comparison in time and frequency domain" src={time_freq_domain} />
<details>
  <summary>View Figure 3's Code</summary>
  <CodeBlock language="python">{time_freq_domain_py}</CodeBlock>
</details>

[Figure 3](#figure-3-combined-time-domain-harmonics-with-jittered-samples-and-frequency-spectrum)
(above) combines these harmonics (from figures
[1](#figure-1-sum-continuous-high-resolution-with-actual-jittered-samples-overlaid) &
[2](#figure-2-underlying-harmonics---individual-continuous-harmonic-components))
and shows the signal’s corresponding amplitude peaks at harmonic frequencies in the frequency domain.

_The bottom panel in
[Figure 3](#figure-3-combined-time-domain-harmonics-with-jittered-samples-and-frequency-spectrum) shows the frequency domain representation of the signal,
highlighting discrete peaks at the harmonic frequencies corresponding to the sinusoidal components in the time domain._

## Block Equation (Fourier Series)

A periodic signal $x(t)$ with period $T$ can be expressed as a sum of complex exponentials (or equivalently, sinusoids)
at integer multiples of the fundamental frequency $f_0 = \frac{1}{T}$:

$$
x(t) = \sum_{k=-\infty}^{\infty} X_k e^{j 2 \pi k f_0 t},
\quad \text{where } k \in \mathbb{Z} \text{, } X_k \in \mathbb{C}
$$

- $k$ indexes the harmonics
  - e.g., $k=1$ is the first harmonic $(f_0)$, $k=2$ is the second harmonic $(2f_0)$, etc.
    - Hence $k f_0$ inside the exponent
      :::note
      $k=0$ corresponds to the DC component ($0 \text{ Hz}$), which is not considered a harmonic.

    $k < 0$ corresponds to negative frequency components (complex conjugates), which is important for understanding FFT symmetry.
    :::

- $X_k$ are the **complex Fourier coefficients** representing the amplitude and phase of each harmonic.
  - To interpret them:
    - Write $X_k = a + jb$ with $a = \Re(X_k)$ and $b = \Im(X_k), \quad \Re\text{: Real, } \Im\text{: Imaginary}$
    - **Amplitude (magnitude)**: $|X_k| = \sqrt{a^2 + b^2} \quad \text{(Pythagoras)}$
    - **Phase (angle)**: $\arg(X_k) = \tan^{-1}\left(\frac{b}{a}\right)$
  - This means the **real part measures how much cosine of that frequency is present**,
    the **imaginary part measures how much sine**, and together they define the sinusoid's amplitude and phase.

<details>
  <summary>Understanding Magnitude and Phase of Fourier Coefficients</summary>

When you see a Fourier coefficient $X_k = a + jb$, it's easy to forget what the real and imaginary parts mean. Here's a clear way to visualize it:

Using **Euler's formula** ($e^{i \theta} = \cos\theta + i \sin\theta$), we know that:

- **Real part ($a = \Re(X_k)$)** → corresponds to the **cosine** component
- **Imag part ($b = \Im(X_k)$)** → corresponds to the **sine** component

Think of $X_k$ as a **vector in the complex plane**:

<img alt="Complex Fourier Coefficient Triangle" src={fourier_coefficient_triangle} />
<details>
  <summary>View the above image's code</summary>
  <CodeBlock language="python">{fourier_coefficient_triangle_py}</CodeBlock>
</details>

### Key points:

1. **Amplitude (magnitude)**:
   $$
   |X_k| = \sqrt{a^2 + b^2}
   $$
   This is the hypotenuse of the triangle and gives the overall **strength** of the sinusoid.
2. **Phase (angle)**:
   $$
   \arg(X_k) = \theta = \tan^{-1}\left(\frac{b}{a}\right)
   $$
   This is the angle that the vector makes with the real axis — the **phase shift** of the sinusoid.
3. **Trigonometric intuition**:
   Using SOH CAH TOA:
   - Opposite side → $b$ (imaginary / sine)
   - Adjacent side → $a$ (real / cosine)
   - $\tan\theta = \frac{b}{a}$ → angle of the vector

### Why this matters:

The real and imaginary parts tell you **how much cosine and sine** of that frequency are in the signal.
Combining them using Pythagoras gives the **amplitude**, and the angle gives the **phase**, which shifts the waveform in time.
This is exactly how $X_k$ encodes both **strength** and **timing** of each harmonic.

</details>

- $f_0 = 1/T$ is the **fundamental frequency**, the lowest frequency of the periodic signal.

:::note Intuition
Every periodic signal can be “built” by adding together these harmonics. The series tells us exactly how much of each harmonic is present.
:::

### Real Fourier Series Form

The Fourier series can also be expressed using **only real-valued sine and cosine functions**:

$$
x(t) = a_0 + \sum_{k=1}^{\infty} [ a_k \cos(2 \pi k f_0 t) + b_k \sin(2 \pi k f_0 t) ]
$$

- $a_0$ is the **DC component** (average value of the signal).
- $a_k$ and $b_k$ are the **real Fourier coefficients** representing the amplitudes of cosine and sine components at the $k^\text{th}$ harmonic.
- This form is equivalent to the complex exponential form:
  $$
  X_k = \frac{1}{2}(a_k - j b_k), \quad X_{-k} = \frac{1}{2}(a_k + j b_k)
  $$
  so the information about amplitude and phase is fully captured.

## Fourier Coefficients (Complex Amplitudes)

The coefficients $X_k$ quantify the contribution of each harmonic $k$ in the signal:

$$
X_k = \frac{1}{T} \int_{0}^{T} x(t) \cdot e^{-j 2 \pi k f_0 t} dt
$$

- This integral measures **how much of the frequency $k f_0$** exists in the signal.
- You can integrate over **any interval of length $T$**, because the signal is periodic.
- In practice:
  - $|X_k|$ gives the amplitude of the $k^\text{th}$ harmonic.
  - $\arg(X_k)$ gives its phase (how much it’s shifted in time).

:::tip Visual analogy
Imagine projecting your signal onto each sine/cosine component — the integral tells you the “shadow” of the signal along that harmonic.
:::

:::tip
$a_k$ and $b_k$ can be converted to amplitude and phase using:

$$
\begin{align*}
A_k &= \sqrt{a_k^2 + b_k^2}\\
\phi_k &= \tan^{-1}(\frac{ b_k }{ a_k })
\end{align*}
$$

:::
