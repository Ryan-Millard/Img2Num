import PropTypes from "prop-types";
import { RotateCcw } from "lucide-react";
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
  colorSpace,
  setColorSpace,
  isOpen = false,
  onReset,
  onAction,
  actionLabel = "Apply",
  isProcessing = false,
  className = "",
}) => {
  return (
    <div
      className={`${styles.settingsPanel} ${isOpen ? styles.settingsOpen : ""} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className={styles.settingsHeading}>Configuration</h3>

      {/* Smoothing parameters (originally Bilateral Filter) */}
      <div className={styles.sectionHeader}>Image Smoothing</div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="sigma-spatial">
            Smoothing Radius: <strong>{sigmaSpatial}</strong>
          </label>
          <span className={styles.rangeLimits}>1 - 20</span>
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
          <label htmlFor="sigma-range">
            Color Smoothing: <strong>{sigmaRange}</strong>
          </label>
          <span className={styles.rangeLimits}>1 - 200</span>
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

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="color-space">Processing Mode</label>
        </div>
        <select
          id="color-space"
          value={colorSpace}
          onChange={(e) => setColorSpace(parseInt(e.target.value, 10))}
          className={styles.selectInput}
          disabled={isProcessing}
        >
          <option value={0}>Detailed (Accurate)</option>
          <option value={1}>Simple (Fast)</option>
        </select>
      </div>

      {/* Colors (originally K-Means) */}
      <div className={styles.sectionHeader}>Color Settings</div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="k-colors">
            Number of Colors: <strong>{numColors}</strong>
          </label>
          <span className={styles.rangeLimits}>2 - 64</span>
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

      {/* Outline settings (originally Contours) */}
      <div className={styles.sectionHeader}>Outline Details</div>

      <div className={styles.settingGroup}>
        <div className={styles.settingLabelWrapper}>
          <label htmlFor="min-area">
            Ignore Small Spots: <strong>{minArea}</strong>
          </label>
          <span className={styles.rangeLimits}>100 - 1000</span>
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
          <label htmlFor="min-thickness">
            Merge Thin Lines: <strong>{minThickness === 0 ? "Disabled" : minThickness}</strong>
          </label>
          <span className={styles.rangeLimits}>0 - 100</span>
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

      <div className="flex-center gap-sm" style={{ marginTop: "var(--spacing-xs)", width: "100%" }}>
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
  colorSpace: PropTypes.number.isRequired,
  setColorSpace: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onReset: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  actionLabel: PropTypes.string,
  isProcessing: PropTypes.bool,
  className: PropTypes.string,
};

export default ConfigPanel;
