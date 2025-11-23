import styles from './GlassCard.module.css';

const GlassCard = ({ children, className = '', style = {}, as: Component = 'div' }) => (
	<Component
		className={`text-center glass ${styles.card} ${className}`}
		style={style}
	>
		{children}
	</Component>
);

export default GlassCard;
