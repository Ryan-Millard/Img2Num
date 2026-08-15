const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const originalImg = document.getElementById("originalImg");
const previewImg = document.getElementById("previewImg");
const spinner = document.getElementById("spinner");

let latestRequest = 0;

async function processImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const request = ++latestRequest;

  if (originalImg.src.startsWith("blob:")) {
    URL.revokeObjectURL(originalImg.src);
  }
  originalImg.src = URL.createObjectURL(file);
  previewImg.removeAttribute("src");
  spinner.style.display = "block";

  try {
    const { pixels, width, height } = await imageToUint8ClampedArray(file);
    const { svg } = await imageToSvg({ pixels, width, height });
    if (request !== latestRequest) return;
    previewImg.src = "data:image/svg+xml;base64," + btoa(svg);
  } catch (error) {
    console.error("Failed to convert image:", error);
    if (request === latestRequest) {
      alert("An error occurred.\nCheck the developer console for details.");
    }
  } finally {
    if (request === latestRequest) spinner.style.display = "none";
    // Note: terminateWasmModule() is deliberately NOT called here. It frees
    // the WASM resources, which would force a full re-initialization on the
    // next conversion. Cleanup happens automatically on page teardown.
  }
}

// File picker
fileInput.addEventListener("change", (e) => processImage(e.target.files[0]));

// Paste (Ctrl+V)
document.addEventListener("paste", (e) => {
  const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
  if (item) processImage(item.getAsFile());
});

// Drag & drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dropzone--active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dropzone--active");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dropzone--active");
  const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
  if (file) processImage(file);
});

// Keyboard (Enter/Space on the focused drop zone)
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});
