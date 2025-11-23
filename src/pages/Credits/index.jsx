import styles from "./Credits.module.css";
import StaticCreditsCard from "./StaticCreditsCard";
import DependencyCreditsCard from "./DependencyCreditsCard";
import ContributorsCreditsCard from "./ContributorsCreditsCard";

export default function Credits() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Credits</h1>

			<div className="flex-column gap-lg">
				<ContributorsCreditsCard />
				<StaticCreditsCard />
				<DependencyCreditsCard />
			</div>
		</div>
	);
}
