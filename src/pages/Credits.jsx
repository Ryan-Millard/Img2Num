import React, { useEffect, useState } from "react";
import GlassCard from "@components/GlassCard";
import styles from "./Credits.module.css";

const GITHUB_REPO = "Ryan-Millard/Img2Num";
const PACKAGE_JSON_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json`;
const CONTRIBUTORS_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contributors`;

const Credits = () => {
	const [dependencies, setDependencies] = useState({});
	const [contributors, setContributors] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCredits = async () => {
			try {
				const pkgRes = await fetch(PACKAGE_JSON_URL);
				const pkgJson = await pkgRes.json();
				setDependencies(pkgJson.dependencies || {});

				const contribRes = await fetch(CONTRIBUTORS_API_URL);
				const contribJson = await contribRes.json();
				setContributors(contribJson || []);
			} catch (error) {
				console.error("Failed to fetch credits:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchCredits();
	}, []);

	if (loading)
		return <p className={styles.loading}>Loading credits...</p>;

	return (
		<div className={styles.container}>
			<h1>Credits & Acknowledgments</h1>

			<div className={styles.cardsContainer}>
				{/* Contributors */}
				<GlassCard className={styles.scrollCard}>
					<h2>Contributors</h2>
					<div className={styles.scrollList}>
						{contributors.map((c) => (
							<div key={c.id} className={styles.listItem}>
								<img src={c.avatar_url} alt={c.login} className={styles.avatar} />
								<a href={c.html_url} target="_blank" rel="noopener noreferrer">
									{c.login}
								</a>
								{c.contributions ? ` (${c.contributions})` : ""}
							</div>
						))}
					</div>
				</GlassCard>

				{/* Dependencies */}
				<GlassCard className={styles.scrollCard}>
					<h2>Dependencies</h2>
					<div className={styles.scrollList}>
						{Object.entries(dependencies).map(([name, version]) => (
							<div key={name} className={styles.listItem}>
								<img
									src="https://cdn.iconscout.com/icon/free/png-256/npm-282007.png"
									alt={name}
									className={styles.avatar}
								/>
								<a href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noopener noreferrer">
									{name} ({version})
								</a>
							</div>
						))}
					</div>
				</GlassCard>

				{/* Static Credits */}
				<GlassCard>
					<h2>Special Thanks</h2>
					<ul className={styles.list}>
						<li>Pixilart – Pixel art inspiration</li>
						<li>Flaticon – Icons</li>
						<li>Open-source community & testers</li>
						<li>Friends & family for support!</li>
					</ul>
					<img
						src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=600&q=80"
						alt="Thanks"
						className={styles.staticImage}
					/>
				</GlassCard>
			</div>
		</div>
	);
};

export default Credits;
