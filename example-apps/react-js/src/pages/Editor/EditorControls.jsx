import GlassSwitch from "@components/GlassSwitch";
import Tooltip from "@components/Tooltip";
import { useMemo } from "react";
import { Eye, Brush, Download, Copy, RotateCcw } from "lucide-react";
import styles from "./EditorControls.module.css";

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
    <div className={styles.container}>
      <span className="flex-center gap-xl">
        <Tooltip content="Download original SVG file">
          <a
            type="button"
            className="flex-center gap-sm"
            href={svgUrl}
            download={`${fileName}.svg`}
          >
            <Download />
            Original SVG
          </a>
        </Tooltip>

        <Tooltip content="Download raw SVG as text file">
          <a
            type="button"
            className="flex-center gap-sm"
            onClick={() => download(svg, `${fileName}-raw.txt`, "text/plain")}
          >
            <Download />
            Raw Text
          </a>
        </Tooltip>

        <Tooltip content="Copy SVG code to clipboard">
          <a
            type="button"
            className="flex-center gap-sm"
            onClick={() => navigator.clipboard.writeText(svg)}
          >
            <Copy />
            Copy SVG
          </a>
        </Tooltip>
      </span>

      <span className="flex-center gap-xl">
        <Tooltip content="Reset all colored shapes">
          <a
            type="button"
            className="flex-center gap-sm"
            onClick={onResetColors}
          >
            <RotateCcw />
            Reset Progress
          </a>
        </Tooltip>

        <GlassSwitch
          isOn={isColorMode}
          onChange={() => setIsColorMode((prev) => !prev)}
          ariaLabel={`Switch to ${isColorMode ? "preview" : "color"} mode`}
          thumbContent={isColorMode ? <Eye /> : <Brush />}
        />
      </span>
    </div>
  );
};

export default EditorControls;
