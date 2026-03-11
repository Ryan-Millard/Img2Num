import GlassModal from "@components/GlassModal";
import GlassSwitch from "@components/GlassSwitch";
import Tooltip from "@components/Tooltip";
import { useMemo, useState } from "react";
import { Undo, Redo, Ellipsis, Save, Eye, Brush, Printer, Download, Copy, RotateCcw, Share2 } from "lucide-react";
import styles from "./EditorControls.module.css";
import HamburgerMenu from "@components/HamburgerMenu";

const EditorControls = ({
  svg,
  fileName,
  isColorMode = false,
  setIsColorMode = () => {},
  onReset = () => {},
  onUndo = () => {},
  onRedo = () => {},
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const svgUrl = useMemo(() => {
    if (!svg) return null;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [svg]);

  const download = (content, name, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const printSvg = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(svg);
    doc.close();

    // Give browser a moment to render
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 100);
  };

  const shareSvg = () => {
    if (!navigator.canShare || !svg) return alert("Sharing not supported!");

    const file = new File([svg], `${fileName}.svg`, { type: "image/svg+xml" });

    if (navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: fileName,
        text: "Check out this SVG!",
      }).catch(console.error);
    } else {
      alert("Sharing this file is not supported on your device.");
    }
  };

  if (!svg) return null;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          size="sm"
        >
          <h2>Download Image</h2>
          <div className="flex-column container" style={{ maxWidth: "max-content" }}>
            <Tooltip content="Download original SVG file">
              <button href={svgUrl} download={`${fileName}.svg`} className="button">
                <Download />
                <span>Original SVG</span>
              </button>
            </Tooltip>

            <Tooltip content="Download raw SVG as text file">
              <button onClick={() => download(svg, `${fileName}-raw.txt`, "text/plain")} className="button">
                <Download />
                Raw Text
              </button>
            </Tooltip>

            <Tooltip content="Copy SVG code to clipboard">
              <button onClick={() => navigator.clipboard.writeText(svg)} className="button">
                <Copy />
                Copy SVG
              </button>
            </Tooltip>

            <Tooltip content="Print SVG">
              <button onClick={printSvg} className="button">
                <Printer />
                <span>Print</span>
              </button>
            </Tooltip>
          </div>
        </GlassModal>

      <div className="flex-space-evenly">
        <Tooltip content="Reset all colored shapes">
          <button
            className="flex-center gap-sm"
            onClick={onReset}
          >
            <RotateCcw />
          </button>
        </Tooltip>

        <Tooltip content="Undo last change">
          <button onClick={onUndo}>
            <Undo />
          </button>
        </Tooltip>

        <Tooltip content="Redo last change">
          <button onClick={onRedo}>
            <Redo />
          </button>
        </Tooltip>
      </div>

      <HamburgerMenu className={styles.hamburger} CloseMenuIcon={<Ellipsis />}>
        <li>
          <Tooltip content="Share the image with others">
            <span onClick={() => setModalOpen(true)}>
              <Save />
              <span>Save</span>
            </span>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Share SVG">
            <span onClick={shareSvg}>
              <Share2 />
              <span>Share</span>
            </span>
          </Tooltip>
        </li>

        <li>
          <GlassSwitch
            isOn={isColorMode}
            onChange={() => setIsColorMode((prev) => !prev)}
            ariaLabel={`Switch to ${isColorMode ? "preview" : "color"} mode`}
            thumbContent={isColorMode ? <Eye /> : <Brush />}
          />
        </li>
      </HamburgerMenu>
    </div>
  );
};

export default EditorControls;
