import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
f0 = 5          # Frequency of the sinusoid in Hertz (cycles per second)
fs = 100        # Sampling frequency in Hertz (how many samples per second)
duration = 1    # Duration of the signal in seconds

# === Time vector and signal ===
# Create an array 't' of evenly spaced time points from 0 up to (but not including) 1 second.
# The total number of points = fs * duration = 100 samples.
t = np.linspace(0, duration, int(fs * duration), endpoint=False)

# Generate the sinusoidal signal:
# x(t) = sin(2 * π * f0 * t)
# Explanation:
# - '2 * π * f0' converts frequency in Hz to angular frequency in radians per second.
# - 'sin()' takes the angle in radians.
x = np.sin(2 * np.pi * f0 * t)

# === Fourier Transform ===
# Compute the Fast Fourier Transform (FFT) of the signal to get its frequency components.
X = np.fft.fft(x)

# Get the corresponding frequencies for each FFT bin.
# The 'fftfreq' function returns frequencies from 0 up to positive Nyquist frequency,
# then negative frequencies after that.
freqs = np.fft.fftfreq(len(X), 1 / fs)

# We only need the positive half of the frequencies and magnitudes since
# the FFT of a real-valued signal is symmetric.
positive_freqs = freqs[:len(freqs) // 2]

# Magnitude of the FFT (absolute value) normalized by half the length of X.
# This scaling ensures the amplitude matches the original sinusoid amplitude.
magnitude = np.abs(X)[:len(freqs) // 2] / (len(X) / 2)

# === Plotting ===
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6))

# Time domain plot: signal amplitude vs time
ax1.plot(t, x)
ax1.set_title("Time Domain")
ax1.set_xlabel("Time [seconds]")
ax1.set_ylabel("Amplitude")
ax1.grid(True)

# Frequency domain plot: magnitude of frequency components vs frequency
ax2.stem(positive_freqs, magnitude, basefmt=" ")
ax2.set_title("Frequency Domain")
ax2.set_xlabel("Frequency [Hz]")
ax2.set_ylabel("Magnitude")
ax2.grid(True)

plt.tight_layout()

# Uncomment this line to save the figure as a PNG image file:
# plt.savefig("sinusoid_time_and_frequency.png", dpi=300)

plt.show()
