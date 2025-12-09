---
id: introduction
title: Introduction
sidebar_position: 3
---

import figOne from './img/continuous-sinusoid.png';
import figTwo from './img/discrete-sinusoid.png';

import CodeBlock from '@theme/CodeBlock';
import continuousSinusoid from '!!raw-loader!./python_scripts/continuous-sinusoid.py';
import discreteSinusoid from '!!raw-loader!./python_scripts/discrete-sinusoid.py';

Fourier techniques let us express a signal as a **sum of sinusoids** (frequencies).
Think about how graphs can be represented as functions of time or frequency.
The goal of the FT is to convert between the time domain and the frequency domain.

## Continuous Sinusoids
Below, [Figure 1](#figure-1) shows the exact same sinusoid plotted in both the time and frequency domain:
Notice how the time domain graph looks like the typical wave shape of a sine graph that you are likely familiar with,
whereas the frequency domain graph contains only *one non-zero point*, $(5, 1)$.

<img alt="sinusoid_time_and_frequency" src={figOne} />
**Figure 1: Continuous sinusoid plotted in time and frequency domains**
<details>
  <summary>View Figure 1's Code</summary>
  <CodeBlock language="python">{continuousSinusoid}</CodeBlock>
</details>

## Discrete Sinusoids
In this repo we operate on **digital** data (images/arrays), which are sampled, finite, and stored in memory.
That makes the **DFT** the natural mathematical tool since we do not have continuous data
(our data came from samples taken at intervals - random or constant).
The DFT converts a finite (discrete) sequence of samples into a set of frequency-domain coefficients that we can filter,
manipulate (e.g. by multiplying by frequency-domain kernels in a Gaussian blur), and then convert back to the time domain.

<img alt="discrete_sinusoid_time_and_frequency" src={figTwo} />
**Figure 2: Discrete sinusoid plotted in time and frequency domains**
<details>
  <summary>View Figure 2's Code</summary>
  <CodeBlock language="python">{discreteSinusoid}</CodeBlock>
</details>

Above, Figure 2 is more representative of the data we are likely to encounter since the sensors we use measure data at intervals rather than continuously - it wouldn't be possible to get a continuous reading from them. Hence, DFTs are better suited for the domain conversions in this context.
