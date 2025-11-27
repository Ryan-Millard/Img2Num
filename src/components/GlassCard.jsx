import styles from './GlassCard.module.css';

// eslint-disable-next-line no-unused-vars
const GlassCard = ({ as: Tag = 'div', children, ...rest }) => (
  <Tag {...rest} className={`text-center glass ${styles.card} ${rest.className || ''}`}>
    {children}
  </Tag>
);

export default GlassCard;
