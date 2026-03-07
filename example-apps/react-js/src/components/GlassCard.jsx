import { forwardRef } from 'react';
import PropTypes from "prop-types";
import styles from "./GlassCard.module.css";

// eslint-disable-next-line no-unused-vars
const GlassCard = forwardRef( ({ as: Tag = "div", children, ...rest }, ref) => (
  <Tag {...rest} className={`text-center glass ${styles.card} ${rest.className || ""}`} ref={ref}>
    {children}
  </Tag>
));

GlassCard.propTypes = {
  as: PropTypes.oneOf([
    "div",
    "section",
    "article",
    "nav",
    "main",
    "aside",
    "ul", // ✅ added as requested in issue #178
  ]),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default GlassCard;
