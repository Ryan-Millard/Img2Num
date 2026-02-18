import matplotlib.pyplot as plt
import numpy as np

# Fourier coefficient
a = 2.0   # Real part (cosine)
b = 1.5   # Imaginary part (sine)
c = np.sqrt(a**2 + b**2)
theta = np.arctan2(b, a)

# Plot setup
fig, ax = plt.subplots(figsize=(7,7))

# Draw axes with arrows
ax.arrow(0, 0, a*1.8, 0, head_width=0.08, head_length=0.12, fc='black', ec='black')
ax.arrow(0, 0, 0, b*1.8, head_width=0.08, head_length=0.12, fc='black', ec='black')

# Draw vector X_k
ax.arrow(0, 0, a, b, head_width=0.08, head_length=0.12, fc='blue', ec='blue', linewidth=2)

# Draw dashed triangle sides
ax.plot([a, a], [0, b], color='red', linestyle='--', linewidth=1)
ax.plot([0, a], [b, b], color='red', linestyle='--', linewidth=1)

# Annotations - outside the triangle
ax.text(a/2, -0.05, r'$a$', fontsize=12, ha='center', va='top')                     # Real side
ax.text(a + 0.2, b/2, r'$b$', fontsize=12, ha='left', va='center')                   # Imag side

# Phase angle arc
arc = np.linspace(0, theta, 50)
arc_radius = 0.4
ax.plot(arc_radius*np.cos(arc), arc_radius*np.sin(arc), color='green', linewidth=1.5)
ax.text(0.45, 0.05, r'$\theta = \arg(X_k)$', fontsize=12, color='green')

# Vector tip label
ax.plot(a, b, 'o', color='blue')
ax.text(a + 0.15, b + 0.15, r'$X_k$', fontsize=12)
ax.text(a + 0.15, b + -0.15, r'$(\text{Pythag: } |X_k| = \sqrt{a^2 + b^2})$', fontsize=10, color='blue')  # Note

# Axes labels - moved to avoid overlap
ax.text(a, -0.15, 'Real (cosine)', fontsize=12)
ax.text(-0.35, b*1.9, 'Imaginary (sine)', fontsize=12)  # moved up

# Set limits and aspect
ax.set_xlim(-0.5, a*2)
ax.set_ylim(-0.5, b*2)
ax.set_aspect('equal', 'box')

# Remove ticks
ax.set_xticks([])
ax.set_yticks([])

# Title
ax.set_title('Complex Fourier Coefficient Triangle', fontsize=14)

plt.show()
