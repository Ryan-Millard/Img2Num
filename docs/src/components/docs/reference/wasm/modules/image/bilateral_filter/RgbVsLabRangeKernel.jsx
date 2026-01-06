const RgbVsLabRangeKernel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <svg
      style={{ width: '100%', maxWidth: '500px' }}
      viewBox="0 0 430 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="0" y="0" width="100%" height="100%" fill="#fff" />

      {/* RGB LUT area */}
      <path
        d={(() => {
          const points = Array.from({ length: 101 }, (_, i) => {
            const dx = 10 + i * 3;
            const weight = Math.exp(-(i*i)/(2*20*20)); // sigma_range = 20
            const dy = 60 - weight * 50;
            return `${dx},${dy}`;
          });
          return `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(" ") + ` L310,60 L10,60 Z`;
        })()}
        fill="rgba(255,107,107,0.3)"
        stroke="#ff6b6b"
        strokeWidth="2"
      />

      {/* CIELAB on-the-fly area */}
      <path
        d={(() => {
          const points = Array.from({ length: 101 }, (_, i) => {
            const dx = 10 + i * 3;
            const weight = Math.exp(-(i*i)/(2*15*15)); // sigma_range = 15
            const dy = 120 - weight * 50;
            return `${dx},${dy}`;
          });
          return `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(" ") + ` L310,120 L10,120 Z`;
        })()}
        fill="rgba(77,171,247,0.2)"
        stroke="#4dabf7"
        strokeWidth="2"
      />

      {/* Labels */}
      <text x="200" y="50" fontSize="12" fill="#ff6b6b">RGB LUT</text>
      <text x="200" y="110" fontSize="12" fill="#4dabf7">CIELAB (on-the-fly)</text>

      {/* Axes */}
      <line x1="10" y1="60" x2="310" y2="60" stroke="#000" strokeWidth="0.5" />
      <line x1="10" y1="120" x2="310" y2="120" stroke="#000" strokeWidth="0.5" />
      <text x="320" y="65" fontSize="10">Color difference &Delta;RGB</text>
      <text x="320" y="125" fontSize="10">Color difference &Delta;LAB</text>
    </svg>

    <sub>
      Above, σ<sub>r</sub> = 20 for RGB and σ<sub>r</sub> = 15 for CIELAB.
    </sub>
  </div>
);

export default RgbVsLabRangeKernel;
