export function loadImageToUint8Array(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height); // RGBA

      resolve({ pixels: data, width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
  });
}
