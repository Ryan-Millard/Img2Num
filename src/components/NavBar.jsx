import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import GlassCard from '@components/GlassCard';

export default function NavBar() {
	const [isOpen, setIsOpen] = useState(false);
	const links = (
		<>
			<li>
				<Link to="/">Home</Link>
			</li>
			<li>
				<Link to="/credits">Credits</Link>
			</li>
			<li>
				<a href="https://github.com/Ryan-Millard/Img2Num" target="_blank">
					GitHub
				</a>
			</li>
		</>
	);

	return (
		<GlassCard as='nav' className={styles.navbar} style={{ padding: '0.5rem 1rem' }}>
			<div className={styles.logo}>
				<Link to="/">Img2Num</Link>
			</div>

			<button
				className={styles.hamburger}
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Toggle menu"
			>
				<span className={isOpen ? styles.barActive : styles.bar}></span>
				<span className={isOpen ? styles.barActive : styles.bar}></span>
				<span className={isOpen ? styles.barActive : styles.bar}></span>
			</button>

		{isOpen ? (
				<GlassCard as='ul'
					className={`${styles.navLinks} ${isOpen ? `glass ${styles.active}` : ""}`}
					stacked={isOpen ? "true" : "false"}>
						{links}
				</GlassCard>
			) : (
				<ul className={`${styles.navLinks} ${isOpen ? `glass ${styles.active}` : ""}`}
					stacked={isOpen ? "true" : "false"}>
						{links}
				</ul>
			)}
		</GlassCard>
	);
}
