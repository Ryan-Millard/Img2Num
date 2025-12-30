export default function ColorSwatch({ color, size = 24 }) {
  // size in px by default
  return (
    <span
      title={color}
      style={{
        display: 'inline-block',
        width: size + 'px',
        height: size + 'px',
        background: color,
        border: '1px solid #ccc',
        borderRadius: '4px',
        verticalAlign: 'middle',
      }}
    />
  );
}

