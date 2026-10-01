import styles from "./GlassSwitch.module.css";
import Tooltip from "@components/Tooltip";
import PropTypes from "prop-types";

const GlassSwitch = ({ onChange, isOn, ariaLabel, thumbContent, disabled = false }) => {
  const fallbackContent = isOn ? styles.fallbackThumbContentOn : styles.fallbackThumbContentOff;
  return (
    <Tooltip content={ariaLabel}>
      <button
        type="button"
        role="switch"
        onClick={onChange}
        aria-checked={isOn ? "true" : "false"}
        className={`glass ${styles.switch} ${isOn ? styles.checked : ""}`}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className={`glass ${styles.thumb} ${!thumbContent ? fallbackContent : ""}`}>{thumbContent}</span>
      </button>
    </Tooltip>
  );
};

GlassSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  thumbContent: PropTypes.node,
  disabled: PropTypes.bool,
};

export default GlassSwitch;
