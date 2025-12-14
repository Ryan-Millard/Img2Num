/**
 * Prints an SVG element in a new tab.
 * @param {SVGElement|string} svg - The SVG element or its string.
 * @param {Object} options
 * @param {boolean} options.lineArt - If true, removes fills and makes strokes black.
 */
export function printSVG(svg, options = { lineArt: false }) {
  let svgString =
    svg instanceof SVGElement
      ? new XMLSerializer().serializeToString(svg)
      : svg;

  // If lineArt mode is enabled, modify the SVG string
  if (options.lineArt) {
    // Remove fill attributes and make all strokes black
    svgString = svgString.replace(
      /fill="[^"]*"/gi,
      'fill="none"'
    ).replace(
      /stroke="[^"]*"/gi,
      'stroke="black"'
    );
  }

  const w = window.open('', '_blank');

  if (!w) {
    alert('Popup blocked');
    return;
  }

  w.document.write(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Print SVG</title>
    <style>
      @page { margin: 0; }
      html, body { width: 100%; height: 100%; margin: 0; }
      body { display: flex; align-items: center; justify-content: center; }
      svg {
        max-width: 100vw;
        max-height: 100vh;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    ${svgString}
    <script>
      window.onload = () => {
        window.focus();
        window.print();
        window.onafterprint = () => window.close();
      };
    </script>
  </body>
</html>
  `);

  w.document.close();
}
