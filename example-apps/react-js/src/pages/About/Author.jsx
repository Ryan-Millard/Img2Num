import { Link } from "react-router-dom";
import GlassCard from "@components/GlassCard";
import Tooltip from "@components/Tooltip";
import styles from "./About.module.css";

const AuthorCard = ({ name, bio, github, linkedin, avatar }) => (
  <GlassCard>
    <div className={styles.header}>
      <img src={avatar} alt={name} className={styles.avatar} />

      <div className="flex flex-column gap-sm p-3">
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.links}>
          <Tooltip content={`Visit ${name}'s GitHub profile`}>
            <a href={github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Tooltip>

          {linkedin && (
            <Tooltip content={`Visit ${name}'s LinkedIn profile`}>
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </Tooltip>
          )}
        </div>
      </div>
    </div>

    {/* BIO BELOW */}
    <p className={styles.bio}>{bio}</p>
  </GlassCard>
);

const Author = () => (
  <GlassCard className={styles.container}>
    <h2 className={styles.title}>About the Authors</h2>

    <div className={styles.grid}>
      <AuthorCard
        name="Ryan Millard"
        avatar="https://github.com/Ryan-Millard.png"
        github="https://github.com/Ryan-Millard"
        bio={
          <>
            Hi, I’m Ryan Millard! 🦔
            <p>
              I like understanding how things work - wrecking them, then building them better.
              <br />I build software with a focus on performance and clear, predictable behavior.
            </p>
          </>
        }
      />

      <AuthorCard
        name="Alex Krasner"
        avatar="https://github.com/Krasner.png"
        github="https://github.com/Krasner"
        linkedin="https://www.linkedin.com/in/alex-krasner-72090329"
        bio={
          <>
            Hi, I'm Alex Krasner. ⚡
            <p>
              I'm an experienced computer scientist focused on computer vision and building efficient, optimized algorithms. Img2Num uses Google Dawn WebGPU to accelerate image processing and enable
              cross-platform deployment.
            </p>
          </>
        }
      />
    </div>

    <p className={`flex-center ${styles.note}`}>
      While we led this project, there were contributions from others — see the&nbsp;
      <Tooltip content="View project credits">
        <Link to="/credits">Credits page</Link>
      </Tooltip>
      .
    </p>
  </GlassCard>
);

export default Author;
