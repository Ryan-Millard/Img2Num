import GlassSwitch from "@components/GlassSwitch";
import Tooltip from "@components/Tooltip";
import { useMemo } from "react";
import { Ellipsis, Eye, Brush, Download, Copy, RotateCcw } from "lucide-react";
import styles from "./EditorControls.module.css";
import HamburgerMenu from "@components/HamburgerMenu";

const EditorControls = ({
  svg,
  fileName,
  isColorMode,
  setIsColorMode,
  onResetColors,
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

  if (!svg) return null;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
          <Tooltip content="Reset all colored shapes">
            <a
              type="button"
              className="flex-center gap-sm"
              onClick={onResetColors}
            >
              <RotateCcw />
              <span>Restart</span>
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
