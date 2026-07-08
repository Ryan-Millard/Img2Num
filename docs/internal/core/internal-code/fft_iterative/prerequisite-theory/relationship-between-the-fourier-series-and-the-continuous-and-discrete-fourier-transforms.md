# Relationship Between the Fourier Series and the Continuous and Discrete Fourier Transforms

URL: https://img2num.dev/docs/internal/core/internal-code/fft_iterative/prerequisite-theory/relationship-between-the-fourier-series-and-the-continuous-and-discrete-fourier-transforms

- **Fourier series** : discrete frequencies for periodic continuous signals
- **CFT** : continuous frequency spectrum for general continuous signals (limit of the series as period → ∞ \text{period } \to\infty period→ ∞ )
- **DFT** : discrete frequency samples for finite, sampled signals — effectively the Fourier series of one period of a sampled sequence
:::tip Takeaways

- Sampling a continuous-time signal maps the continuous-time transform into a discrete-frequency / periodic structure (aliasing phenomena).
- Computing a DFT on N N N samples produces N N N complex frequency bins; applying the inverse DFT with the same bins reconstructs the original N N N samples (assuming no frequency-domain modifications that break perfect reconstruction).
:::
