import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
f0 = 5
T = 1.0
Fs = 30
amplitudes = [1, 0.6, 0.35, 0.2]

# Colors for harmonics
colors = ['C0', 'C1', 'C2', 'C3']  # matplotlib default color cycle

# Time vectors
t_cont = np.linspace(0, T, 1000, endpoint=False)
t_disc = np.linspace(0, T, int(Fs*T), endpoint=False)
t_disc_jittered = t_disc + (np.random.rand(len(t_disc)) - 0.5) * (1/Fs) * 0.5

# Harmonics and sums
harmonics = [A * np.sin(2*np.pi*(i+1)*f0*t_cont) for i, A in enumerate(amplitudes)]
sum_cont = np.sum(harmonics, axis=0)
sum_disc_jittered = np.sum([A * np.sin(2*np.pi*(i+1)*f0*t_disc_jittered)
                            for i, A in enumerate(amplitudes)], axis=0)

# Frequencies for Fourier peaks
freqs = np.array([f0*(i+1) for i in range(len(amplitudes))])

# --- Combined figure with subplots ---
fig, axs = plt.subplots(2, 1, figsize=(12, 8))

# Time domain plot
for i, harmonic in enumerate(harmonics):
    axs[0].plot(t_cont, harmonic, color=colors[i], label=f"Harmonic {i+1}")
axs[0].plot(t_cont, sum_cont, 'k--', label="Sum (continuous)")
axs[0].plot(t_disc_jittered, sum_disc_jittered, 'ko', label="Sum (samples, jittered)")
axs[0].set_title("Time Domain – Harmonics (continuous) and Sampled Sum (discrete, jittered)")
axs[0].set_xlabel("Time [seconds]")
axs[0].set_ylabel("Amplitude")
axs[0].grid(True)
axs[0].legend(loc='center left', bbox_to_anchor=(1, 0.5))  # legend outside the plot

# Frequency domain plot (colored)
lines = []
labels = []
for i, (freq, amp) in enumerate(zip(freqs, amplitudes)):
    markerline, stemlines, baseline = axs[1].stem([freq], [amp], linefmt=colors[i], markerfmt=f'{colors[i]}o', basefmt=" ")
    lines.append(markerline)
    labels.append(f"Harmonic {i+1}")

axs[1].set_title("Frequency Domain – Peaks at Harmonic Frequencies (colored to match harmonics)")
axs[1].set_xlabel("Frequency [Hz]")
axs[1].set_ylabel("Magnitude")
axs[1].grid(True)
axs[1].legend(lines, labels, loc='center left', bbox_to_anchor=(1, 0.5))  # legend outside the plot

plt.tight_layout()
plt.show()
