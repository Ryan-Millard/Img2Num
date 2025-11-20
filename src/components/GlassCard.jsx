import styles from './GlassCard.module.css';

const GlassCard = ({ children, className = '', style = {} }) => (
	<div
		className={`text-center glass ${styles.card} ${className}`}
		style={style}
	>
		{children}
	</div>
);

export default GlassCard;
