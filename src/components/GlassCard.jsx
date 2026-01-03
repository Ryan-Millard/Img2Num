import PropTypes from 'prop-types';
import styles from './GlassCard.module.css';

// eslint-disable-next-line no-unused-vars
const GlassCard = ({ as: Tag = 'div', children, ...rest }) => (
  <Tag
    {...rest}
    className={`text-center glass ${styles.card} ${rest.className || ''}`}
  >
    {children}
  </Tag>
);

GlassCard.propTypes = {
  /** HTML element to render (polymorphic support) */
  as: PropTypes.oneOf([
    'div',
    'section',
    'article',
    'nav',
    'main',
    'aside',
    'header',
    'footer',
  ]),

  /** Content inside the GlassCard */
  children: PropTypes.node,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default GlassCard;
