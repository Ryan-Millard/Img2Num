# Cheatsheet — Fourier Quick References

URL: https://img2num.dev/docs/internal/core/internal-code/fft_iterative/prerequisite-theory/fourier-cheatsheet

## Core identities

### Euler's formula

e j θ = cos ⁡ θ + j sin ⁡ θ , e^{j\theta} = \cos\theta + j\sin\theta,\qquad e j θ= cosθ+ jsinθ ,e − j θ = cos ⁡ θ − j sin ⁡ θ e^{-j\theta} = \cos\theta - j\sin\theta e − j θ= cosθ− jsinθ
### Polar / phasor

r e j θmagnitude r , phase θ r e^{j\theta} \quad\text{magnitude } r,\ \text{phase } \theta r e j θmagnitude r ,phase θ
## Continuous Fourier Transform (engineering convention)

### Forward

X ( f ) = ∫ − ∞ ∞ x ( t )e − j 2 π f td t X(f)=\int_{-\infty}^{\infty} x(t)\,e^{-j2\pi f t}\,dt X ( f )= ∫ − ∞ ∞x ( t )e − j 2 π f td t
### Inverse

x ( t ) = ∫ − ∞ ∞ X ( f )e + j 2 π f td f x(t)=\int_{-\infty}^{\infty} X(f)\,e^{+j2\pi f t}\,df x ( t )= ∫ − ∞ ∞X ( f )e + j 2 π f tdf
## Discrete Fourier Transform (N-point, engineering / FFT convention)

### Forward

X [ k ] = ∑ n = 0 N − 1 x [ n ]e − j 2 π N k n ,k = 0 , … , N − 1 X[k]=\sum_{n=0}^{N-1} x[n]\,e^{-j\frac{2\pi}{N}kn},\qquad k=0,\dots,N-1 X [ k ]= n = 0 ∑ N − 1x [ n ]e − j N2 π k n ,k= 0 ,…,N− 1
### Inverse

x [ n ] = 1 N ∑ k = 0 N − 1 X [ k ]e + j 2 π N k n ,n = 0 , … , N − 1 x[n]=\frac{1}{N}\sum_{k=0}^{N-1} X[k]\,e^{+j\frac{2\pi}{N}kn},\qquad n=0,\dots,N-1 x [ n ]= N1k = 0 ∑ N − 1X [ k ]e + j N2 π k n ,n= 0 ,…,N− 1
### Frequency of bin k k k (sample rate f s f_s f s ):

f k = k f s N ,Δ f = f s N f_k = k\frac{f_s}{N},\quad\Delta f=\frac{f_s}{N} f k= k Nf s ,Δ f= Nf sBins with k > N / 2 k>N/2 k> N /2 correspond to negative frequencies at f k − f s f_k-f_s f k− f s .

# Useful properties (quick)

### Conjugate symmetry (real input)

x [ n ] ∈ R⇒X [ N − k ] = X [ k ] ‾ x[n]\in\mathbb{R}\ \Rightarrow\ X[N-k]=\overline{X[k]} x [ n ]∈ R⇒ X [ N− k ]= X [ k ]
### Parseval / energy conservation (DFT)

∑ n = 0 N − 1 ∣ x [ n ] ∣ 2 = 1 N ∑ k = 0 N − 1 ∣ X [ k ] ∣ 2 \sum_{n=0}^{N-1}|x[n]|^2 = \frac{1}{N}\sum_{k=0}^{N-1}|X[k]|^2 n = 0 ∑ N − 1∣ x [ n ] ∣ 2= N1k = 0 ∑ N − 1∣ X [ k ] ∣ 2*(depends on chosen normalization — check convention)*

### Linearity

F T { a ⋅ x + b ⋅ y } = a ⋅ F T { x } + b ⋅ F T { y } FT\{a·x + b·y\} = a·FT\{x\} + b·FT\{y\} F T { a ⋅x+ b ⋅y }= a ⋅F T { x }+ b ⋅F T { y }
### Time shift:

x [ n − n 0 ]↔X [ k ] e − j 2 π N k n 0 x[n-n_0] \quad ↔ \quad X[k] e^{-j\frac{2\pi}{N}k n_0} x [ n− n 0 ]↔ X [ k ] e − j N2 π k n 0
### Frequency shift (modulation):

e j 2 π N m n x [ n ]shifts bins e^{j\frac{2\pi}{N} m n}x[n] \quad \text{shifts bins} e j N2 π mn x [ n ]shifts bins
# Practical tips & gotchas

- **DFT implicitly assumes periodicity** of the finite sequencecircular convolution.
- Use **zero-padding** to reduce wrap-around / increase frequency resolution.
- Use **windowing** (Hann, Hamming, Blackman) to reduce spectral leakage for non-periodic segments.
- **Zero-padding** : increases bin count (interpolates spectrum) but does **not** add new information.
- **fftshift / ifftshift** : center the zero-frequency bin for visualization.
- **Normalization conventions vary** :
- Engineering/FFT: forward has no 1 N \frac{1}{N} N1 , inverse has 1 N \frac{1}{N} N1 (this cheatsheet's default).
- Other conventions: symmetric 1 N \frac{1}{\sqrt{N}} N1 on both transforms, or 1 N \frac{1}{N} N1 on forward. Always check library docs.
- **Nyquist / sampling theorem** :
- To avoid aliasing: f s ≥ 2 f max f_s \ge 2 f_{\text{max}} f s≥ 2 f max (sample at least twice the highest signal frequency).
- If undersampled, high-frequency content folds into lower frequencies (aliasing).

# Quick NumPy / SciPy commands (examples)

- 1-D FFT / inverse (NumPy / SciPy follow engineering convention)
- `X = np.fft.fft(x)`
- `x_rec = np.fft.ifft(X)`*(if `x` real, `x_rec.real` equals original within numerical error)*
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

- FT kernel: e − j 2 π f t e^{-j2\pi f t} e − j 2 π f t (analysis), inverse uses opposite sign.
- DFT maps time samples n n n ↔ bins k k k with phase factor e − j 2 π k n / N e^{-j2\pi kn/N} e − j 2 π k n / N .
- Nyquist: f s ≥ 2 f max ⁡ f_s \ge 2 f_{\max} f s≥ 2 f m a x .
- `np.fft.fft` , `np.fft.ifft` , `np.fft.fftshift` are your go-to tools.
