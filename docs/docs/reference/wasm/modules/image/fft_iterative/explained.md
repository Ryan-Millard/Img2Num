---
id: explained
title: Implementation Explained
sidebar_position: 6
---

# FFT — Iterative Implementation Explained

This section explains the inner workings of the **iterative FFT** used in this project. It assumes you already understand Fourier theory, the DFT,
and complex numbers (if not, see the [prerequisite theory](../prerequisite-theory)).
Here we focus on **how the code works**, why each step is necessary, and why it was implemented in the way it was.

## Overview

The **iterative FFT** is an implementation of the Cooley–Tukey FFT algorithm that:

- Avoids recursion (unlike classic divide-and-conquer recursive FFT).
- Computes an $N$-point DFT in $O(N \log N)$ time.
- Uses in-place updates to minimize memory allocations.

**High-level steps:**

1. Reorder input array using **bit-reversal permutation**.
2. Iteratively apply **butterfly operations** across $\log_2(N)$ stages.
3. Multiply by **twiddle factors** ($e^{\pm \frac{2\pi i k}{N}}$) to combine sub-DFTs.
4. Normalize for the inverse FFT.

## Iterative FFT vs Recursive FFT

| Feature                   | Recursive FFT                        | Iterative FFT                     | Winner        | Reason                              |
| ------------------------- | ------------------------------------ | --------------------------------- | ------------- | ----------------------------------- |
| **Memory usage**          | $O(N \cdot log(N))$ call stack       | $O(N)$ in-place                   | Iterative FFT | Faster                              |
| **Function calls**        | Recursive function calls             | Simple loop over stages           | Iterative FFT | Simpler Stack Management            |
| **Performance**           | Extra overhead due to recursion      | Slightly faster, cache-friendly   | Iterative FFT | One function call, so less overhead |
| **Ease of understanding** | Conceptually simple                  | Slightly more complex indexing    | Recursive FFT | No need to understand many loops    |
| **Flexibility**           | Easy to visualize divide-and-conquer | Better for repeated or large FFTs | Tie           | Pros & Cons to both                 |

The iterative approach is chosen here for **performance and low memory overhead**, especially important when processing on devices with limited resources.
An example: a cellphone from 2013.

## Bit-Reversal Permutation

### Purpose

Before applying the iterative butterfly operations, the input array must be **reordered so that the indices correspond to the bit-reversed order**
of their original index.

- **Example:** For $N=8$, binary indices:

  | Original Index (decimal) | Original Index (binary) | Bit-Reversed Index (binary) | Bit-Reversed Index (decimal) |
  | ------------------------ | ----------------------- | --------------------------- | ---------------------------- |
  | 0                        | 000                     | 000                         | 0                            |
  | 1                        | 001                     | 100                         | 4                            |
  | 2                        | 010                     | 010                         | 2                            |
  | 3                        | 011                     | 110                         | 6                            |
  | 4                        | 100                     | 001                         | 1                            |
  | 5                        | 101                     | 101                         | 5                            |
  | 6                        | 110                     | 011                         | 3                            |
  | 7                        | 111                     | 111                         | 7                            |

- Reordering ensures that the iterative algorithm can **process butterflies in a linear pass** without recursion.
- Each butterfly stage combines elements separated by certain distances; bit-reversal guarantees that the data for each stage are contiguous in memory.

### Why it matters

Without bit-reversal, iterative FFT cannot correctly combine the sub-transforms, and the resulting frequency spectrum would be scrambled.

:::note
Bit-reversal effectively separates and reorders the data in a way similar to the even/odd splitting in the recursive DFT,
allowing the iterative FFT to combine sub-transforms efficiently.
:::

## Butterfly Operations

:::important
A **butterfly** is the core computation of the FFT.
:::

Given two inputs $u$ and $v$:

$$
\begin{align*}
y_0 &= u + w \cdot v \quad \text{where $w$ is a twiddle factor } (e^{\pm \frac{2\pi i k}{N}}) \\
y_1 &= u - w \cdot v
\end{align*}
$$

### Explanation

- Each butterfly combines two elements from a smaller DFT to form part of a larger DFT.
- At stage $s$ of the FFT:
  - Each group has size $m = 2^s$.
  - Half of the elements are combined with the other half using the corresponding twiddle factor.

### Visualization

```mermaid
%% N=8 FFT Butterfly Diagram (Textbook-Accurate, Domain-Neutral)
flowchart LR

%% Stage 0: Bit-reversed input
subgraph Stage0 ["Stage 0: Bit-Reversed Input (m=1)"]
pad0[ ]:::invisible
    x0["x₀"]
    x1["x₄"]
    x2["x₂"]
    x3["x₆"]
    x4["x₁"]
    x5["x₅"]
    x6["x₃"]
    x7["x₇"]
end

%% Stage 1: First butterflies (m=2)
subgraph Stage1 ["Stage 1: Butterfly Stage (m=2)"]
pad1[ ]:::invisible
    x0 --> s0["y₀ = u + v"]
    x1 --> s1["y₁ = u − v"]
    x2 --> s2["y₂ = u + v"]
    x3 --> s3["y₃ = u − v"]
    x4 --> s4["y₄ = u + v"]
    x5 --> s5["y₅ = u − v"]
    x6 --> s6["y₆ = u + v"]
    x7 --> s7["y₇ = u − v"]
end

%% Stage 2: Second butterflies with correct twiddle factors (m=4)
subgraph Stage2 ["Stage 2: Butterfly Stage (m=4)"]
pad2[ ]:::invisible
    s0 --> t0["z₀ = y₀ + w₈⁰·y₂"]
    s2 --> t2["z₂ = y₀ − w₈⁰·y₂"]
    s1 --> t1["z₁ = y₁ + w₈²·y₃"]
    s3 --> t3["z₃ = y₁ − w₈²·y₃"]
    s4 --> t4["z₄ = y₄ + w₈⁰·y₆"]
    s6 --> t6["z₆ = y₄ − w₈⁰·y₆"]
    s5 --> t5["z₅ = y₅ + w₈²·y₇"]
    s7 --> t7["z₇ = y₅ − w₈²·y₇"]
end

%% Stage 3: Final butterflies with twiddle factors (m=8)
subgraph Stage3 ["Stage 3: Final Output (m=8) - alternate domain"]
pad3[ ]:::invisible
    t0 --> X0["X₀ = z₀ + w₈⁰·z₄"]
    t4 --> X4["X₄ = z₀ − w₈⁰·z₄"]
    t1 --> X1["X₁ = z₁ + w₈¹·z₅"]
    t5 --> X5["X₅ = z₁ − w₈¹·z₅"]
    t2 --> X2["X₂ = z₂ + w₈²·z₆"]
    t6 --> X6["X₆ = z₂ − w₈²·z₆"]
    t3 --> X3["X₃ = z₃ + w₈³·z₇"]
    t7 --> X7["X₇ = z₃ − w₈³·z₇"]
end

classDef invisible fill:none,stroke:none;

class Stage0,Stage1,Stage2,Stage3 invisible;
```
