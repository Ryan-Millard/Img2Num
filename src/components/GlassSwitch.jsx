import styles from './GlassSwitch.module.css'

const GlassSwitch = ({onChange ,checked,ariaLabel}) => {
  return (
    <button type='button' role='switch' onClick={onChange} 
     aria-checked={checked} className={`glass ${styles.switch} ${checked ? styles.checked : styles.unChecked}`} aria-label={ariaLabel}>

      <span type='span' className={`${styles.thumb}`}></span>
    </button>
  )
}

export default GlassSwitch
