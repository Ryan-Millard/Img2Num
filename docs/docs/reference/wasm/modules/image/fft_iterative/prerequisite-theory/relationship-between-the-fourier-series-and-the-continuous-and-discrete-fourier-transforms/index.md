---
id: relationship-between-the-fourier-series-and-the-continuous-and-discrete-fourier-transforms
title: Relationship Between the Fourier Series and the Continuous and Discrete Fourier Transforms
sidebar_position: 7
---

- **Fourier series**: discrete frequencies for periodic continuous signals
- **CFT**: continuous frequency spectrum for general continuous signals (limit of the series as $\text{period } \to\infty$)
- **DFT**: discrete frequency samples for finite, sampled signals — effectively the Fourier series of one period of a sampled sequence

:::tip Takeaways

- Sampling a continuous-time signal maps the continuous-time transform into a discrete-frequency / periodic structure (aliasing phenomena).
- Computing a DFT on $N$ samples produces $N$ complex frequency bins; applying the inverse DFT with the same bins reconstructs the original $N$ samples (assuming no frequency-domain modifications that break perfect reconstruction).

:::
