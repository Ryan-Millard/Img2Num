import styles from './GlassSwitch.module.css'
import Tooltip from '@components/Tooltip';

const GlassSwitch = ({onChange ,checked,ariaLabel}) => {
  return (
    <Tooltip content={ariaLabel}>
    <button type='button' role='switch' onClick={(e) => {
        e.stopPropagation();
        onChange()
    }}  aria-checked={checked} className={`glass ${styles.switch} ${checked ? styles.checked : styles.unChecked}`} aria-label={ariaLabel}>

      <span type='span' className={`glass ${styles.thumb}`}></span>
    </button>
    </Tooltip>
  )
}

export default GlassSwitch
