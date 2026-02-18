import numpy as np
import matplotlib.pyplot as plt

# Time vector
t = np.linspace(-2, 2, 1000)

# Gaussian pulse
sigma = 0.2
x_t = np.exp(-t**2 / (2*sigma**2))

# Frequency vector for plotting
f = np.linspace(-50, 50, 1000)

# Continuous Fourier Transform (analytical for Gaussian)
X_f = sigma * np.sqrt(2*np.pi) * np.exp(- (2*np.pi*f*sigma)**2 / 2)

# Plot
fig, axs = plt.subplots(2, 1, figsize=(8,6))

# Time domain
axs[0].plot(t, x_t)
axs[0].set_title("Gaussian Pulse (Time Domain)")
axs[0].set_xlabel("Time [s]")
axs[0].set_ylabel("Amplitude")
axs[0].grid(True)

# Frequency domain (magnitude)
axs[1].plot(f, np.abs(X_f))
axs[1].set_title("Magnitude of CFT (Frequency Domain)")
axs[1].set_xlabel("Frequency [Hz]")
axs[1].set_ylabel("|X(f)|")
axs[1].grid(True)

plt.tight_layout()
plt.show()
