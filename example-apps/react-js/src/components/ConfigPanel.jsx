import { useState } from "react";
import PropTypes from "prop-types";
import { RotateCcw, X, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./ConfigPanel.module.css";

const ConfigPanel = ({
  numColors,
  setNumColors,
  minArea,
  setMinArea,
  minThickness,
  setMinThickness,
  sigmaSpatial,
  setSigmaSpatial,
  sigmaRange,
  setSigmaRange,
  isOpen = false,
  onReset,
  onAction,
  onClose,
  actionLabel = "Apply",
  isProcessing = false,
  className = "",
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div
      className={`${styles.settingsPanel} ${isOpen ? styles.settingsOpen : ""} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.settingsHeaderWrapper}>
        <h3 className={styles.settingsHeading}>Configuration</h3>
        <div className={styles.headerButtons}>
          {onClose && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* K-Means Parameters (Color Settings) */}
      <div className={styles.sectionHeader}>K-Means Segmentation</div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="k-colors">Number of Colors (k)</label>
          <input
            id="k-colors-num"
            type="number"
            min="2"
            max="64"
            value={numColors}
            onChange={(e) => {
              const val = Math.max(2, Math.min(64, parseInt(e.target.value, 10) || 2));
              setNumColors(val);
            }}
            className={styles.numberInput}
            disabled={isProcessing}
          />
        </div>
        <input
          id="k-colors"
          type="range"
          min="2"
          max="64"
          value={numColors}
          onChange={(e) => setNumColors(parseInt(e.target.value, 10))}
          className={styles.rangeInput}
          disabled={isProcessing}
        />
      </div>

      {/* Contours Parameters (Outline Details) */}
      <div className={styles.sectionHeader}>Outline Details</div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="min-area">Minimum Region Area</label>
          <input
            id="min-area-num"
            type="number"
            min="100"
            max="1000"
            step="50"
            value={minArea}
            onChange={(e) => {
              const val = Math.max(100, Math.min(1000, parseInt(e.target.value, 10) || 100));
              setMinArea(val);
            }}
            className={styles.numberInput}
            disabled={isProcessing}
          />
        </div>
        <input
          id="min-area"
          type="range"
          min="100"
          max="1000"
          step="50"
          value={minArea}
          onChange={(e) => setMinArea(parseInt(e.target.value, 10))}
          className={styles.rangeInput}
          disabled={isProcessing}
        />
      </div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="min-thickness">Minimum Region Thickness</label>
          <input
            id="min-thickness-num"
            type="number"
            min="0"
            max="100"
            value={minThickness}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
              setMinThickness(val);
            }}
            className={styles.numberInput}
            disabled={isProcessing}
          />
        </div>
        <input
          id="min-thickness"
          type="range"
          min="0"
          max="100"
          value={minThickness}
          onChange={(e) => setMinThickness(parseInt(e.target.value, 10))}
          className={styles.rangeInput}
          disabled={isProcessing}
        />
      </div>

      {/* Advanced Settings Collapsible Toggle */}
      <button
        type="button"
        className={styles.advancedToggle}
        onClick={() => setIsAdvancedOpen((prev) => !prev)}
        aria-expanded={isAdvancedOpen}
      >
        <span>Advanced Settings</span>
        {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isAdvancedOpen && (
        <div className={styles.advancedContent}>
          <div className={styles.sectionHeader}>Bilateral Filter</div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabelWrapper}>
              <label htmlFor="sigma-spatial">Spatial Sigma (σ<sub>s</sub>)</label>
              <input
                id="sigma-spatial-num"
                type="number"
                min="1"
                max="20"
                value={sigmaSpatial}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
                  setSigmaSpatial(val);
                }}
                className={styles.numberInput}
                disabled={isProcessing}
              />
            </div>
            <input
              id="sigma-spatial"
              type="range"
              min="1"
              max="20"
              value={sigmaSpatial}
              onChange={(e) => setSigmaSpatial(parseInt(e.target.value, 10))}
              className={styles.rangeInput}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabelWrapper}>
              <label htmlFor="sigma-range">Range Sigma (σ<sub>range</sub>)</label>
              <input
                id="sigma-range-num"
                type="number"
                min="1"
                max="200"
                value={sigmaRange}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1));
                  setSigmaRange(val);
                }}
                className={styles.numberInput}
                disabled={isProcessing}
              />
            </div>
            <input
              id="sigma-range"
              type="range"
              min="1"
              max="200"
              value={sigmaRange}
              onChange={(e) => setSigmaRange(parseInt(e.target.value, 10))}
              className={styles.rangeInput}
              disabled={isProcessing}
            />
          </div>
        </div>
      )}

      <div className="flex-center gap-sm" style={{ marginTop: "var(--spacing-md)", width: "100%" }}>
        <button
          type="button"
          className={`button flex-center gap-xs ${styles.resetButton}`}
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          disabled={isProcessing}
        >
          <RotateCcw size={16} />
          <span>Use Defaults</span>
        </button>

        <button
          type="button"
          className="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          disabled={isProcessing}
          style={{ flex: 1 }}
        >
          {isProcessing ? "Processing..." : actionLabel}
        </button>
      </div>
    </div>
  );
};

ConfigPanel.propTypes = {
  numColors: PropTypes.number.isRequired,
  setNumColors: PropTypes.func.isRequired,
  minArea: PropTypes.number.isRequired,
  setMinArea: PropTypes.func.isRequired,
  minThickness: PropTypes.number.isRequired,
  setMinThickness: PropTypes.func.isRequired,
  sigmaSpatial: PropTypes.number.isRequired,
  setSigmaSpatial: PropTypes.func.isRequired,
  sigmaRange: PropTypes.number.isRequired,
  setSigmaRange: PropTypes.func.isRequired,
  colorSpace: PropTypes.number,
  setColorSpace: PropTypes.func,
  isOpen: PropTypes.bool,
  onReset: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  actionLabel: PropTypes.string,
  isProcessing: PropTypes.bool,
  className: PropTypes.string,
};

export default ConfigPanel;
