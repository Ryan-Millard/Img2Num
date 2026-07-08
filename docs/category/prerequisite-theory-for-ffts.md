# Documentation Page

URL: https://img2num.dev/docs/category/prerequisite-theory-for-ffts

## 📄️ Prerequisite Theory

This section assumes familiarity with the below:

## 📄️ Keywords & Conventions

Keywords

## 📄️ Introduction

Fourier techniques let us express any signal as a sum of its constituent "pure" sinusoids (frequencies), meaning:

## 📄️ Fourier Series - the bridge (periodic signals)

The Fourier Series decomposes a periodic signal in the time domain into a sum of harmonics -

## 📄️ Continuous Fourier Transform

If you take the Fourier series and let the period $T \to \infty$, the discrete harmonic lines become continuous — resulting in the Continuous Fourier Transform (CFT).

## 📄️ Discrete-time signals and the DFT

When we sample a continuous-time signal at a sampling rate $f_s$ (in Hz), or when we work with inherently discrete data (such as digital audio or images),

## 📄️ How Fourier Transforms Work

To understand how Fourier transforms work "under the hood", we must start by

## 📄️ Sign of the Exponent in the Fourier Kernel and Its Relationship to Rotational Direction

In the Fourier transform, the kernel contains a complex exponential of the form:

## 📄️ Relationship Between the Fourier Series and the Continuous and Discrete Fourier Transforms

- Fourier series: discrete frequencies for periodic continuous signals

## 📄️ Why Img2Num Uses the DFT

1. Inputs are digital — images and arrays are sampled and finite; the DFT exactly models the transform we can compute on them.

## 📄️ Fourier Cheat Sheet

Core identities
