import styles from './GlassSwitch.module.css'
import Tooltip from '@components/Tooltip';

const GlassSwitch = ({onChange ,checked,ariaLabel}) => {
  return (
    <Tooltip content={ariaLabel}>
    <button type='button' role='switch' onClick={onChange} 
     aria-checked={checked} className={`glass ${styles.switch} ${checked ? styles.checked : ''}`} aria-label={ariaLabel}>

      <span className={`${styles.thumb}`}></span>
    </button>
    </Tooltip>
  )
}

export default GlassSwitch
