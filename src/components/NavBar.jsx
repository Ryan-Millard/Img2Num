import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function NavBar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className={styles.navbar}>
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

			<ul className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/editor">Editor</Link>
				</li>
				<li>
					<Link to="/credits">Credits</Link>
				</li>
				<li>
					<a href="https://github.com/Ryan-Millard/Img2Num" target="_blank">
						GitHub
					</a>
				</li>
			</ul>
		</nav>
	);
}
