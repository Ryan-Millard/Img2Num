import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
f0 = 5
T = 1.0
Fs = 30
num_harmonics = 4
amplitudes = [1, 0.6, 0.35, 0.2]

# Time vectors
t_cont = np.linspace(0, T, 1000, endpoint=False)
t_disc = np.linspace(0, T, int(Fs*T), endpoint=False)
t_disc_jittered = t_disc + (np.random.rand(len(t_disc)) - 0.5) * (1/Fs) * 0.5

# Continuous sum
sum_cont = np.sum([A * np.sin(2*np.pi*k*f0*t_cont)
                   for k, A in enumerate(amplitudes, start=1)], axis=0)

# Jittered discrete sum
sum_disc_jittered = np.sum([A * np.sin(2*np.pi*k*f0*t_disc_jittered)
                            for k, A in enumerate(amplitudes, start=1)], axis=0)

# Plot
plt.figure(figsize=(10, 4))
plt.plot(t_disc_jittered, sum_disc_jittered, 'ko', label='Sum (samples, jittered)')
plt.plot(t_cont, sum_cont, 'k--', alpha=0.5)
plt.title("Sum (continuous) + jittered discrete samples")
plt.xlabel("Time [seconds]")
plt.ylabel("Amplitude")
plt.grid(True)
plt.legend()
plt.show()
