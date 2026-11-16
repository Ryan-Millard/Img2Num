import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./CopyButton.module.css";

/** Copies `text` to the clipboard and says so for a moment. */
export default function CopyButton({ text, label = "Copy", className }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers, or no secure context: fall back to a selection copy.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      try {
        area.select();
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      } finally {
        document.body.removeChild(area);
      }
    }
    if (ok) setCopied(true);
  }

  return (
    <button type="button" className={clsx(styles.button, copied && styles.copied, className)} onClick={copy} aria-label={copied ? "Copied" : `${label} to clipboard`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
