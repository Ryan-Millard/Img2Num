import React from 'react';
import styles from './index.module.css';

const Switch = ({ isOn, onToggle, onColor = 'var(--color-primary)', offColor = 'var(--color-bg)', size = 35 }) => {
  return (
    <div
      className={ styles.switchContainer }
      style={{
        width: size * 2,
        height: size,
        background: isOn ? onColor : offColor,
        borderRadius: size / 2,
      }}
      onClick={onToggle}
    >
      <div
        className={ styles.switchKnob }
        style={{
          width: size - 4,
          height: size - 4,
          transform: isOn ? `translateX(${size}px)` : 'translateX(0)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default Switch;
