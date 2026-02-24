import styles from "./Credits.module.css";
import Hero from "@components/Hero";
import StaticCreditsCard from "./StaticCreditsCard";
import DependencyCreditsCard from "./DependencyCreditsCard";
import ContributorsCreditsCard from "./ContributorsCreditsCard";
import GlassCard from "@components/GlassCard";
import CreditsHelmet from "./CreditsHelmet";

export default function Credits() {
  return (
    <>
      <CreditsHelmet />

      <div className={styles.container}>
        <Hero header="Credits" description="Here you can find the contributors, libraries, and resources that made this project possible." />

        <div className="flex-column gap-lg">
          <ContributorsCreditsCard />
          <StaticCreditsCard />
          <DependencyCreditsCard />
        </div>
      </div>
    </>
  );
}
