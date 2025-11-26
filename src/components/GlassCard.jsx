import styles from './GlassCard.module.css';

const GlassCard = ({ as: Component = 'div', children, ...rest }) => {
  const mergedClassName = `glass ${rest.className || ''}`;

  return (
    <Component {...rest} className={mergedClassName}>
      {children}
    </Component>
  );
};

export default GlassCard;
