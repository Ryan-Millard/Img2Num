import { jsPDF } from "jspdf";
import GlassModal from "@components/GlassModal";
import GlassSwitch from "@components/GlassSwitch";
import GlassCard from "@components/GlassCard";
import Tooltip from "@components/Tooltip";
import { useState, useId } from "react";
import { Undo, Redo, Save, Eye, Brush, Printer, Download, Copy, RotateCcw, Share2, FileText, Expand } from "lucide-react";
import styles from "./EditorControls.module.css";

const EditorControls = ({ svg, fileName, isColorMode = false, setIsColorMode = () => {}, onReset = () => {}, onUndo = () => {}, onRedo = () => {}, onFullscreen = () => {} }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const switchId = useId();

  const copySvg = () => {
    navigator.clipboard.writeText(svg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const download = (content, name, type) => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([content], { type })),
      download: name,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const printSvg = () => {
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "absolute", width: "0", height: "0", border: "0" });
    document.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(svg);
    iframe.contentWindow.document.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 100);
  };

  const shareSvg = async () => {
    if (!navigator.canShare || !svg) {
      alert("Sharing not supported on this device.");
      return;
    }
    const file = new File([svg], `${fileName}.svg`, { type: "image/svg+xml" });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName }).catch(console.error);
    } else {
      alert("Sharing this file type is not supported on your device.");
    }
  };

  // Raster export (PNG / JPEG) — no dependencies needed
  const exportRaster = (mimeType) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        const ext = mimeType === "image/jpeg" ? "jpg" : "png";
        download(pngBlob, `${fileName}.${ext}`, mimeType);
        URL.revokeObjectURL(url);
      }, mimeType);
    };
    img.src = url;
  };

  // PDF export — using jsPDF (lightweight, ~200 kB gzipped)
  const exportPDF = () => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h] });
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`${fileName}.pdf`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!svg) return null;

  return (
    <>
      <div aria-live="polite" className={styles.srOnly}>
        {copied ? "SVG copied to clipboard." : ""}
      </div>

      <GlassModal isOpen={modalOpen} className="flex-column gap-md" onClose={() => setModalOpen(false)} title="Save image">
        <GlassCard className={styles.modalGroupContainer}>
          <h4>Export</h4>
          <ul className={styles.actionList} role="list">
            <li>
              <Tooltip position="top" content="Download the original SVG file">
                <button onClick={() => download(svg, `${fileName}.svg`, "image/svg+xml;charset=utf-8")} className={`flex-center gap-sm button ${styles.actionItem}`}>
                  <Download size={20} aria-hidden="true" />
                  <span>
                    <big>Original SVG</big>
                    <small>Download the .svg file</small>
                  </span>
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="top" content="Download PNG">
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={() => exportRaster("png")}>
                  <Download size={20} aria-hidden="true" />
                  <span>
                    <big>PNG</big>
                    <small>Download as a .png</small>
                  </span>
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="top" content="Download JPG">
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={() => exportRaster("jpg")}>
                  <Download size={20} aria-hidden="true" />
                  <span>
                    <big>JPG</big>
                    <small>Download as a .jpg</small>
                  </span>
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="top" content="Download PDF">
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={() => exportPDF()}>
                  <Download size={20} aria-hidden="true" />
                  <span>
                    <big>PDF</big>
                    <small>Download as a .pdf</small>
                  </span>
                </button>
              </Tooltip>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className={styles.modalGroupContainer}>
          <h4>Clipboard</h4>
          <ul className={styles.actionList} role="list">
            <li>
              <Tooltip position="top" content={copied ? "Copied!" : "Copy SVG markup to clipboard"}>
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={copySvg} aria-pressed={copied}>
                  <Copy size={20} aria-hidden="true" />
                  <span>
                    <big>{copied ? "Copied!" : "Copy SVG code"}</big>
                    <small>Paste anywhere as markup</small>
                  </span>
                </button>
              </Tooltip>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className={styles.modalGroupContainer}>
          <h4>Other</h4>
          <ul className={styles.actionList} role="list">
            <li>
              <Tooltip position="top" content="Download SVG as a text file">
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={() => download(svg, `${fileName}-raw.txt`, "text/plain")}>
                  <FileText size={20} aria-hidden="true" />
                  <span>
                    <big>Raw text file</big>
                    <small>Download SVG as .txt</small>
                  </span>
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="top" content="Open the browser print dialog">
                <button className={`flex-center gap-sm button ${styles.actionItem}`} onClick={printSvg}>
                  <Printer size={20} aria-hidden="true" />
                  <span>
                    <big>Print</big>
                    <small>Open print dialog</small>
                  </span>
                </button>
              </Tooltip>
            </li>
          </ul>
        </GlassCard>
      </GlassModal>

      <div className={`container flex-center flex-wrap-wrap gap-md ${styles.wrapper}`} role="toolbar" aria-label="Editor actions">
        <div className={`flex-center gap-sm ${styles.switchWrapper}`}>
          <GlassSwitch
            id={switchId}
            isOn={isColorMode}
            onChange={() => setIsColorMode((prev) => !prev)}
            thumbContent={isColorMode ? <Brush /> : <Eye />}
            aria-checked={isColorMode}
            ariaLabel={`Switch to ${isColorMode ? "preview" : "edit"} mode`}
            role="switch"
          />
          <label htmlFor={switchId} className={styles.switchLabel}>
            {isColorMode ? "Color" : "Preview"} mode
          </label>
        </div>

        <div className="flex-center gap-sm">
          <Tooltip position="top" content="Save or export the image">
            <button className={`button flex-center gap-xs`} onClick={() => setModalOpen(true)} aria-haspopup="dialog">
              <Save size={20} aria-hidden="true" />
              Save
            </button>
          </Tooltip>
          <Tooltip position="top" content="Share SVG with others">
            <button className="button flex-center gap-xs" onClick={shareSvg}>
              <Share2 size={20} aria-hidden="true" />
              Share
            </button>
          </Tooltip>
        </div>

        <div className="flex-center gap-sm" role="group" aria-label="History">
          <Tooltip position="top" content="Reset all coloured shapes">
            <button className="button" onClick={onReset} aria-label="Reset all coloured shapes">
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip position="top" content="Undo · Ctrl Z">
            <button className="button" onClick={onUndo} aria-label="Undo last change">
              <Undo size={18} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip position="top" content="Redo · Ctrl Y">
            <button className="button" onClick={onRedo} aria-label="Redo last change">
              <Redo size={18} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip position="top" content="Enter fullscreen">
            <button className="button" onClick={onFullscreen} aria-label="Enter fullscreen mode">
              <Expand size={18} aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default EditorControls;
