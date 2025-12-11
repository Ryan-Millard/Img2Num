import numpy as np
import matplotlib.pyplot as plt

# === Parameters ===
f0 = 5
T = 1.0
amplitudes = [1, 0.6, 0.35, 0.2]

t_cont = np.linspace(0, T, 1000, endpoint=False)

# Individual harmonics
harmonics = [A * np.sin(2*np.pi*(i+1)*f0*t_cont) for i, A in enumerate(amplitudes)]

# Get the default color cycle from matplotlib
colors = plt.rcParams['axes.prop_cycle'].by_key()['color']

# Plot
fig, axs = plt.subplots(4, 1, figsize=(8, 10))  # 4 rows, 1 column
for i, ax in enumerate(axs):
    ax.plot(t_cont, harmonics[i], color=colors[i % len(colors)])
    ax.set_title(f"Harmonic {i+1} (k={i+1})")
    ax.set_xlabel("Time [s]")
    ax.set_ylabel("Amp")
    ax.grid(True)

plt.tight_layout()
plt.show()
