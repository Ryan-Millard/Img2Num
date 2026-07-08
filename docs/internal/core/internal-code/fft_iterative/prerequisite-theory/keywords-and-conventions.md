# Keywords & Conventions

URL: https://img2num.dev/docs/internal/core/internal-code/fft_iterative/prerequisite-theory/keywords-and-conventions

## Keywords

- **Aliasing** : High-frequency components above the Nyquist frequency fold into lower frequencies when sampled.
- **Angular frequency** ( ω \omega ω ): ω = 2 π f \omega = 2\pi f ω= 2 π f radians per second.
- **Circular Convolution** : Convolution implied by the DFT due to assumed periodicity.
- **CFT** : Continuous Fourier Transform
- **Complex Exponential / Phasor** : e j θ e^{j\theta} e j θ , compact representation of sinusoids.
- **DC Component** : k = 0 k=0 k= 0 term; represents the average value of the signal.
- **DFT** : Discrete Fourier Transform
- **FFT** : Fast Fourier Transform (efficient algorithm for computing the DFT)
- **Frequency-domain signal** : X ( f ) X(f) X ( f ) (continuous) or X [ k ] X[k] X [ k ] (discrete)
- **Fundamental Frequency** ( f 0 f_0 f 0 ): The lowest frequency component of a periodic signal. Every other frequency component (harmonics) is an integer multiple of f 0 f_0 f 0 :f k = k ⋅ f 0 ,k = 1 , 2 , 3 , … f_k = k \cdot f_0, \quad k = 1,2,3,\dots f k= k⋅ f 0 ,k= 1 ,2 ,3 ,…:::note Note: Fundamental Frequency k = 0 k=0 k= 0 corresponds to the DC component ( 0 Hz 0 \text{ Hz} 0 Hz ), which is not considered a harmonic. :::
- **Harmonics / Overtones** : Sinusoids at integer multiples of the fundamental frequency.
- **Magnitude Spectrum** : ∣ X [ k ] ∣ |X[k]| ∣ X [ k ] ∣ , amplitude of each frequency component.
- **Nyquist Frequency** : f Nyq = f s / 2 f_\text{Nyq} = f_s / 2 f Nyq= f s /2 , the highest frequency that can be represented without aliasing.
- **Phase Spectrum** : ∠ X [ k ] \angle X[k] ∠ X [ k ] , the angle of each frequency component.
- **rFFT** : Real-input FFT — optimized DFT for real-valued signals
- **Sampling Rate / Frequency** ( f s f_s f s ): Number of samples per second in discrete signals.
- **Spectral Leakage** : Smearing of energy across multiple bins due to non-periodicity of the signal segment.
- **Time-domain signal** : x ( t ) x(t) x ( t ) (continuous) or x [ n ] x[n] x [ n ] (discrete)
- **Windowing** : Multiplying a finite segment by a window (Hann, Hamming, Blackman) to reduce spectral leakage.
- **fftshift / ifftshift** : Functions to center zero-frequency bin for visualization.
- **FT** : Fourier Transform — transforms a time-domain signal into the frequency domain.

## Conventions Used in This Repository (engineering / FFT)

:::warning Don't mix / confuse conventions The conventions mentioned below are **not interchangeable** - once one is chosen, it absolutely must be used otherwise the Fourier Transform won't provide good outputs.

Img2Num follows the engineering convention for all FFT and DFT calculations. If you intend to contribute to this area of the project's code, please make sure to familiarise yourself with it before making any changes. :::

- Engineering - Science

### Engineering Convention (used by Img2Num)

- Forward transform uses **negative exponent** , inverse includes **1 / N 1/N 1/ N normalization** .
- Common in **signal processing, numerical libraries (NumPy, MATLAB)** .

#### Continuous Fourier Transform (CFT)

- **Forward:**X ( f ) = ∫ − ∞ ∞ x ( t )e − j 2 π f td t X(f) = \int_{-\infty}^{\infty} x(t) \, e^{-j 2\pi f t} \, dt X ( f )= ∫ − ∞ ∞x ( t )e − j 2 π f td t
- **Inverse:**x ( t ) = ∫ − ∞ ∞ X ( f )e + j 2 π f td f x(t) = \int_{-\infty}^{\infty} X(f) \, e^{+j 2\pi f t} \, df x ( t )= ∫ − ∞ ∞X ( f )e + j 2 π f tdf

#### Discrete Fourier Transform (N-point DFT)

- **Forward:**X [ k ] = ∑ n = 0 N − 1 x [ n ]e − j 2 π N k n ,k = 0 , … , N − 1 X[k] = \sum_{n=0}^{N-1} x[n] \, e^{-j \frac{2\pi}{N} k n}, \quad k=0,\dots,N-1 X [ k ]= n = 0 ∑ N − 1x [ n ]e − j N2 π k n ,k= 0 ,…,N− 1
- **Inverse:**x [ n ] = 1 N ∑ k = 0 N − 1 X [ k ]e + j 2 π N k n ,n = 0 , … , N − 1 x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] \, e^{+j \frac{2\pi}{N} k n}, \quad n=0,\dots,N-1 x [ n ]= N1k = 0 ∑ N − 1X [ k ]e + j N2 π k n ,n= 0 ,…,N− 1
note
This is the most commonly used convention, so you might see it more frequently. Img2Num, NumPy, and MATLAB use the engineering convention.

### Science / Physics Convention

- Forward transform uses **positive exponent** , inverse may include **1 / 2 π 1/2\pi 1/2 π factor** .
- Often seen in **physics, math textbooks** , and continuous analysis.

#### Continuous Fourier Transform (CFT)

- **Forward:**X ( f ) = ∫ − ∞ ∞ x ( t )e + j 2 π f td t X(f) = \int_{-\infty}^{\infty} x(t) \, e^{+j 2\pi f t} \, dt X ( f )= ∫ − ∞ ∞x ( t )e + j 2 π f td t
- **Inverse:**x ( t ) = ∫ − ∞ ∞ X ( f )e − j 2 π f td f x(t) = \int_{-\infty}^{\infty} X(f) \, e^{-j 2\pi f t} \, df x ( t )= ∫ − ∞ ∞X ( f )e − j 2 π f tdf

#### Discrete Fourier Transform (N-point DFT)

- **Forward:**X [ k ] = ∑ n = 0 N − 1 x [ n ]e + j 2 π N k n ,k = 0 , … , N − 1 X[k] = \sum_{n=0}^{N-1} x[n] \, e^{+j \frac{2\pi}{N} k n}, \quad k=0,\dots,N-1 X [ k ]= n = 0 ∑ N − 1x [ n ]e + j N2 π k n ,k= 0 ,…,N− 1
- **Inverse:**x [ n ] = 1 N ∑ k = 0 N − 1 X [ k ]e − j 2 π N k n ,n = 0 , … , N − 1 x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k] \, e^{-j \frac{2\pi}{N} k n}, \quad n=0,\dots,N-1 x [ n ]= N1k = 0 ∑ N − 1X [ k ]e − j N2 π k n ,n= 0 ,…,N− 1
note
Science convention flips the sign of the exponent in forward/inverse transforms compared to the engineering convention. Some libraries (scientific computing) may follow this.

:::danger Don't get confused Both are simply *conventions* . It does not matter which one you follow (unless the convention is already established wherever you are working) because they both achieve the same outcomes. :::
