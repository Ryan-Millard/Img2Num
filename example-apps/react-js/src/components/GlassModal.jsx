import { useEffect } from "react";
import PropTypes from "prop-types";
import GlassCard from "@components/GlassCard";
import styles from "./GlassModal.module.css";
import { X } from "lucide-react";

export default function GlassModal({
  isOpen,
  onClose,
  children,
  size = "md", // sm | md | lg
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = "",
  style = {}
}) {
  // Handle ESC key
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

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
    >
      <GlassCard
        as="div"
        className={`${styles.modal} ${className}`}
        style={{ ...style, width: size === "sm" ? "300px" : size === "md" ? "500px" : "800px" }}
      >
        {showCloseButton && (
          <button
            className={`button ${styles.closeButton}`}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </GlassCard>
    </div>
  );
}

GlassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showCloseButton: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
  className: PropTypes.string,
};
