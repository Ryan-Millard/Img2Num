import GlassSwitch from "@components/GlassSwitch";
import Tooltip from "@components/Tooltip";
import { useMemo } from "react";
import { Undo, Redo, Ellipsis, Eye, Brush, Printer, Download, Copy, RotateCcw, Share2 } from "lucide-react";
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
      <div className={`flex-space-evenly gap-sm ${styles.historyContainer}`}>
        <Tooltip content="Undo last change">
          <Undo size={"2em"} onClick={onUndo} className="anchor-style" />
        </Tooltip>

        <Tooltip content="Redo last change">
          <Redo size={"2em"} onClick={onRedo} className="anchor-style" />
        </Tooltip>

        <Tooltip content="Reset all colored shapes">
          <a
            type="button"
            className="flex-center gap-sm"
            onClick={onReset}
          >
            <RotateCcw />
            <span>Restart</span>
          </a>
        </Tooltip>
      </div>

      <HamburgerMenu className={styles.hamburger} CloseMenuIcon={<Ellipsis />}>
        <li>
          <Tooltip content="Download original SVG file">
            <a
              type="button"
              href={svgUrl}
              download={`${fileName}.svg`}
            >
              <Download />
              <span>Original SVG</span>
            </a>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Download raw SVG as text file">
            <a
              type="button"
              onClick={() => download(svg, `${fileName}-raw.txt`, "text/plain")}
            >
              <Download />
              Raw Text
            </a>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Copy SVG code to clipboard">
            <a
              type="button"
              onClick={() => navigator.clipboard.writeText(svg)}
            >
              <Copy />
              Copy SVG
            </a>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Print SVG">
            <a
              type="button"
              onClick={printSvg}
            >
              <Download /> {/* Replace with Printer icon if desired */}
              <span>Print</span>
            </a>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Share SVG">
            <a type="button" onClick={shareSvg}>
              <Share2 />
              <span>Share</span>
            </a>
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
