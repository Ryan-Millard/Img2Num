# Sign of the Exponent in the Fourier Kernel and Its Relationship to Rotational Direction

URL: https://img2num.dev/docs/internal/core/internal-code/fft_iterative/prerequisite-theory/sign-of-the-exponent-in-the-fourier-kernel-and-its-relationship-with-rotational-direction

In the Fourier transform, the kernel contains a complex exponential of the form:

e ± j 2 π f t e^{\pm j 2\pi f t} e ± j 2 π f tThe **sign** in the exponent determines the **direction of rotation** of the phasor in the complex plane:

- **Negative sign**e − j 2 π f t e^{-j 2\pi f t} e − j 2 π f t → **Clockwise rotation** (commonly used in the analysis formula of the Fourier transform).
- **Positive sign**e + j 2 π f t e^{+j 2\pi f t} e + j 2 π f t → **Counterclockwise rotation** (commonly used in the synthesis formula to reconstruct the signal).
This follows directly from Euler's formula:

e j θ = cos ⁡ θ + j sin ⁡ θ e^{j\theta} = \cos\theta + j\sin\theta e j θ= cosθ+ jsinθe − j θ = cos ⁡ θ − j sin ⁡ θ e^{-j\theta} = \cos\theta - j\sin\theta e − j θ= cosθ− jsinθIn the complex plane:

- Increasing θ \theta θ moves the phasor counterclockwise.
- Decreasing θ \theta θ (negative exponent) moves it clockwise.
**Why it matters:**

- Positive and negative frequencies in the Fourier transform correspond to these two rotational directions.
- In real-valued signals, the positive and negative frequency components are complex conjugates, ensuring the time-domain signal remains real.
:::important The sign choice must be consistent between the forward and inverse transforms

The sign of the exponent in the Fourier kernel does not matter in isolation — what matters is that:

1. One transform (forward or inverse) uses the positive exponent.
2. The other transform uses the negative exponent.
This ensures that the inverse transform *undoes* the phasor rotation applied by the forward transform.
For example: if the forward FT uses the positive exponent (counterclockwise rotation), the inverse FT must use the negative exponent (clockwise rotation) to reverse that rotation and return to the original time-domain signal. :::

:::danger Common pitfalls

Rotational direction conventions differ between mathematics (typically counterclockwise as positive) and many science/engineering contexts (often clockwise as positive).
This means that:

- Mathematical treatments often use e + j 2 π f t e^{+j 2\pi f t} e + j 2 π f t (counterclockwise) in the forward FT.
- Engineering treatments often use e − j 2 π f t e^{-j 2\pi f t} e − j 2 π f t (clockwise) in the forward FT.
Both are correct as long as the forward and inverse transforms use opposite signs. :::

**Conclusion**

The sign of the exponent in the Fourier kernel is not arbitrary — it encodes the phasor's rotational direction. This links the algebra of Euler's formula to the geometry of the complex plane and to the symmetry between positive and negative frequencies in the spectrum.
