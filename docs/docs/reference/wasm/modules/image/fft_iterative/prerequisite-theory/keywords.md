---
id: keywords-and-conventions
title: Keywords & Conventions
sidebar_position: 2
---

## Keywords

- **CFT**: Continuous Fourier Transform
- **DFT**: Discrete Fourier Transform
- **FFT**: Fast Fourier Transform (based on the DFT)
- **FT**: Fourier Transform
- $f_0$ (Fundamental Frequency): The lowest frequency component in a periodic signal.  
  Every other frequency component (harmonics) can be expressed as an integer multiple of $f_0$:
  $$
  \begin{align*}
  f_k = k \cdot f_0, \quad &\text{where } k > 0 \text{ is the order (index) of the harmonic,}\\
  &\text{and } f_k \text{ is the frequency of the } k^{th}\text{ harmonic.}
  \end{align*}
  $$
    :::note
    $k=0$ corresponds to the DC component ($0 \text{ Hz}$), which is not considered a harmonic.
    :::
- **Harmonics**: Sinusoids at integer multiples of the fundamental frequency (i.e., frequencies $f_k=k f_0$).
                  Constituent/Underlying frequencies of a signal.

## Conventions Used in This Repository (engineering / FFT)

- `CFT` (engineering convention):
  - **Forward**: $X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t}\, dt$

  - **Inverse**: $x(t) = \int_{-\infty}^{\infty} X(f)\, e^{+j 2\pi f t}\, df$

- `DFT` (N-point, engineering / FFT convention):
  - **Forward**: $X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j \frac{2\pi}{N} k n}, \qquad k = 0,\dots,N-1$

  - **Inverse**: $x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k]\, e^{+j \frac{2\pi}{N} k n}, \qquad n = 0,\dots,N-1$

:::note
In this repo we use the engineering/FFT convention -
the forward transform uses the negative exponent ($-j \frac{2\pi}{N} k n$) and the inverse includes the $\frac{1}{N}$ normalization.

When using numerical libraries (e.g. NumPy), confirm their normalization/sign conventions match this
(NumPy's `fft`/`ifft` pair follows this engineering convention).
:::
