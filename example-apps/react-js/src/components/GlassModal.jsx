import { useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import GlassCard from "@components/GlassCard";
import styles from "./GlassModal.module.css";
import { X } from "lucide-react";

export default function GlassModal({
  isOpen,
  onClose,
  children,
  size = "lg", // sm | md | lg | any CSS width
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = "",
  style = {},
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose?.();
    }
  };

  const width = size === "sm" ? "300px" : size === "md" ? "500px" : size === "lg" ? "800px" : size;

  const modal = (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog">
      <GlassCard
        as="div"
        className={`${styles.modal} ${className}`}
        style={{
          flex: "0 0 auto",
          width: width,
          ...style,
        }}
      >
        {showCloseButton && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className={`${styles.closeButton}`}
            aria-label="Close modal"
          >
            <X size={20} />
          </a>
        )}
        {children}
      </GlassCard>
    </div>
  );

  return createPortal(modal, document.body);
}
