# How Fourier Transforms Work

URL: https://img2num.dev/docs/internal/core/internal-code/fft_iterative/prerequisite-theory/how-fourier-transforms-work

To understand how Fourier transforms work "under the hood", we must start by recognising the similarities between the Continuous Fourier Transform (CFT) and the Discrete Fourier Transform (DFT). They serve the same purpose—mapping a time-domain signal into its frequency-domain representation—but operate on different types of signals:

- **CFTcontinuous-time signals**
- **DFTdiscrete-time, finite-length signals**
Despite these differences, their mathematics is closely related. Below are the core equations and a breakdown of their similarities and differences.

## Continuous Fourier Transform (CFT) vs Discrete Fourier Transform (DFT)

- List - Table

### Definition

- **CFT:**
X ( f ) = ∫ − ∞ ∞ x ( t )e − j 2 π f td t X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-j 2\pi f t}\, dt X ( f )= ∫ − ∞ ∞x ( t )e − j 2 π f td t
- **DFT:**
X [ k ] = ∑ n = 0 N − 1 x [ n ]e − j 2 π N k n X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j \frac{2\pi}{N} k n} X [ k ]= ∑ n = 0 N − 1x [ n ]e − j N2 π k n
**Similarity:** Both use complex exponentials to express the signal's frequency content.
### Domain of Input

- **CFT:** Continuous signal x ( t ) x(t) x ( t )
- **DFT:** Discrete sequence x [ n ] x[n] x [ n ] of length N N N
**Similarity:** Both operate on time-domain signals (continuous or sampled).
### Domain of Output

- **CFT:** Continuous function X ( f ) X(f) X ( f )
- **DFT:** Discrete frequency bins X [ k ] X[k] X [ k ]
**Similarity:** Both output complex-valued frequency components.
### Exponential Kernel

- **CFT:**e − j 2 π f t e^{-j 2\pi f t} e − j 2 π f t
- **DFT:**e − j 2 π N k n e^{-j \frac{2\pi}{N} k n} e − j N2 π k n
**Similarity:** Both use complex exponentials (phasors) as basis functions.
### Inverse Transform

- **CFT:**
x ( t ) = ∫ − ∞ ∞ X ( f )e j 2 π f td f x(t) = \int_{-\infty}^{\infty} X(f)\, e^{j 2\pi f t}\, df x ( t )= ∫ − ∞ ∞X ( f )e j 2 π f tdf
- **DFT:**
x [ n ] = 1 N ∑ k = 0 N − 1 X [ k ]e j 2 π N k n x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k]\, e^{j \frac{2\pi}{N} k n} x [ n ]= N1∑ k = 0 N − 1X [ k ]e j N2 π k n
**Similarity:** Both perfectly reconstruct the original signal (given correct conditions).
### Linearity

Both transforms are linear.
### Parseval's Theorem

Energy is preserved between time and frequency domains (with appropriate normalization).
### Purpose

Both analyse the frequency content of signals.
### Periodicity (Key Concept)

- **DFT:** Assumes that x [ n ] x[n] x [ n ] is *periodically extended* with period N N N .
- **CFT:** No periodicity assumption.
This is why windowing and spectral leakage matter in the discrete case.

| Aspect | Continuous Fourier Transform (CFT) | Discrete Fourier Transform (DFT) | Similarities | **Definition** | X ( f ) = ∫ − ∞ ∞ x ( t ) e − j 2 π f t d t X(f)=\int_{-\infty}^{\infty}x(t)e^{-j2\pi f t}dt X ( f )= ∫ − ∞ ∞x ( t ) e − j 2 π f t d t | X [ k ] = ∑ n = 0 N − 1 x [ n ] e − j 2 π N k n X[k]=\sum_{n=0}^{N-1}x[n]e^{-j\frac{2\pi}{N}kn} X [ k ]= ∑ n = 0 N − 1x [ n ] e − j N2 π k n | Both use complex exponentials to analyse frequency content. | **Input Domain** | Continuous-time signal x ( t ) x(t) x ( t ) | Finite-length discrete sequence x [ n ] x[n] x [ n ] | Both work with time-domain signals. | **Output Domain** | Continuous X ( f ) X(f) X ( f ) | Discrete X [ k ] X[k] X [ k ] | Both output complex spectra. | **Kernel** | e − j 2 π f t e^{-j2\pi f t} e − j 2 π f t | e − j 2 π N k n e^{-j \frac{2\pi}{N}kn} e − j N2 π k n | Both use phasors as basis functions. | **Inverse Transform** | Integral | Summation with 1 / N 1/N 1/ N factor | Both perfectly reconstruct the signal (given conditions). | **Linearity** | Linear operator | Linear operator | Both obey superposition. | **Parseval** | Energy preserved | Energy preserved (within normalization) | Both conserve signal energy. | **Periodicity** | No implicit periodicity | Assumes periodic extension with period N N N | — | **Purpose** | Analyse continuous spectra | Analyse discrete/finite spectra | Both decompose signals into frequency components. 

## Exponential Kernels in Fourier Transforms

Both the CFT and DFT use **complex exponentials** of the form:

- e − j 2 π f t e^{-j 2\pi f t} e − j 2 π f t for continuous signals
- e − j 2 π N k n e^{-j \frac{2\pi}{N} k n} e − j N2 π k n for discrete signals
Even though these look different, the DFT kernel is simply the CFT kernel **sampled at discrete times and discrete frequencies** .

## Deriving the relation f t = k n N ft = \frac{kn}{N} f t= Nk n

If:

- sampling interval is T s T_s T s
- sample index is n n n , so t = n T s t = n T_s t= n T s
- total duration is T = N T s T = N T_s T= N T s
- frequency samples are multiples of the fundamental frequency
f 0 = 1 T f_0 = \frac{1}{T} f 0= T1
then:

f = k f 0 = k N T s f = k f_0 = \frac{k}{N T_s} f= k f 0= N T skSubstituting into f t ft f t :

f t = k N T s ( n T s ) = k n N ft = \frac{k}{N T_s} (n T_s) = \frac{kn}{N} f t= N T sk ( n T s )= Nk nThus the discrete kernel:

e − j 2 π f t⟶e − j 2 π k n N e^{-j 2\pi f t} \quad\longrightarrow\quad e^{-j 2\pi \frac{kn}{N}} e − j 2 π f t⟶ e − j 2 π Nk nThis shows **how** the DFT kernel arises from the CFT kernel by sampling.

## Why Do Fourier Transforms Use Complex Exponentials?

Fourier transforms break a signal into sinusoidal components.
Using Euler's formula:

e j θ = cos ⁡ θ + j sin ⁡ θ e^{j\theta} = \cos\theta + j\sin\theta e j θ= cosθ+ jsinθa complex exponential represents:

- a cosine (real part)
- a sine (imaginary part)
in a single compact expression.

### 1. Sinusoids become phasors

A sinusoid can be written as:

A cos ⁡ ( θ + ϕ ) = ℜ { A e j ( θ + ϕ ) } A \cos(\theta + \phi) = \Re\{A e^{j(\theta + \phi)}\} Acos ( θ+ ϕ )= ℜ { A e j ( θ + ϕ ) }This makes Fourier analysis algebraically simple because phasors rotate in the complex plane.

### 2. Polar form of complex numbers

A complex exponential e j θ e^{j\theta} e j θ lies on the **unit circle** in the complex plane.
Fourier coefficients naturally contain:

- **magnitude** (amplitude of sinusoid)
- **phase** (angle)
which match perfectly with polar form.

### 3. Mathematical convenience

Using exponentials:

- differentiation ↔ multiplication by j 2 π f j2\pi f j 2 π f
- convolution ↔ multiplication
- modulation ↔ frequency shifting
These properties make Fourier analysis powerful and computationally efficient.

## Conclusion

- The CFT and DFT are built on the same idea:
**represent a signal as a sum of complex exponential components.**
- The DFT kernel is the CFT kernel evaluated at discrete times and discrete frequencies.
- The DFT assumes periodicity; the CFT does not.
- Euler's formula converts sinusoids into complex exponentials, making Fourier transforms elegant and powerful.
This forms the foundation of how Fourier transforms work internally and why they appear everywhere in engineering, signal processing, and physics.
