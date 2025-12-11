---
id: fourier-cheatsheet
title: Fourier Cheat Sheet
sidebar_position: 9
---

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
