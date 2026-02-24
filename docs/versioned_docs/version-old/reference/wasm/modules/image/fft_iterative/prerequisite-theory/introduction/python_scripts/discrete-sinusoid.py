import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
f0 = 5          # Frequency of the sinusoid in Hertz (cycles per second)
fs = 100        # Sampling frequency in Hertz (samples per second)
duration = 1    # Duration of the signal in seconds

# === Discrete time vector and signal ===
# Number of samples = sampling frequency * duration
N = int(fs * duration)

# Create an array 'n' of discrete time indices from 0 to N-1
n = np.arange(N)

# Generate the discrete-time sinusoidal signal:
# x[n] = sin(2 * ╧Ç * f0 * n / fs)
# Explanation:
# - 'n / fs' converts discrete index to actual time in seconds.
# - '2 * ╧Ç * f0' converts frequency in Hz to angular frequency.
x = np.sin(2 * np.pi * f0 * n / fs)

# === Choose a random subset of points for plotting (fewer, but not too few) ===
# num_points: how many dots to show on the time plot
num_points = 40
# Safety clamp in case N < num_points
num_points = min(max(1, num_points), N)

# Randomly pick indices WITHOUT replacement, then sort them so points progress left-to-right
chosen_indices = np.sort(np.random.choice(n, size=num_points, replace=False))
n_down = chosen_indices
x_down = x[n_down]

# Add small random jitter:
# x_jitter_frac: fraction of the sample interval (1/fs). 0.15 => ┬▒15% of sample interval horizontally.
# y_jitter: absolute amplitude jitter (in signal units). Keep small so the waveform is still visible.
x_jitter_frac = 0.15
y_jitter = 0.03

x_jitter = (np.random.rand(len(n_down)) - 0.5) * (1 / fs) * 2 * x_jitter_frac
y_jitter = (np.random.rand(len(n_down)) - 0.5) * 2 * y_jitter

# === Fourier Transform ===
# Compute the Discrete Fourier Transform (DFT) using FFT to get frequency components.
X = np.fft.fft(x)

# Get the corresponding frequencies for each FFT bin.
# The 'fftfreq' function returns frequencies from 0 up to positive Nyquist frequency,
# then negative frequencies after that.
freqs = np.fft.fftfreq(N, 1 / fs)

# We only need the positive half of the frequencies and magnitudes since
# the FFT of a real-valued signal is symmetric.
positive_freqs = freqs[:N // 2]

# Magnitude of the FFT (absolute value) normalized by half the length of X.
# This scaling ensures the amplitude matches the original sinusoid amplitude.
magnitude = np.abs(X)[:N // 2] / (N / 2)

# === Plotting ===
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6))

# Time domain plot: discrete dots (fewer), with jitter, no connecting lines
ax1.scatter(n_down / fs + x_jitter, x_down + y_jitter, marker='o')
ax1.set_title("Discrete Time Domain (random subset with jitter)")
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
# plt.savefig("discrete-sinusoid.png", dpi=300)

plt.show()
