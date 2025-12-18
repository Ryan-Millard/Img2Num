import { Link } from 'react-router-dom';
import GlassCard from '@components/GlassCard';
import styles from './About.module.css';

const Author = () => (
  <GlassCard className={styles.container}>
    <h2>About the Author</h2>

    <p>
      Hi, I’m Ryan! I’m a software developer passionate about image processing, web tools, and creative coding. Img2Num
      started as a learning experiment and evolved into a tribute to Joan, my hedgehog.
    </p>

    <div className="flex-space-evenly">
      <a href="https://github.com/Ryan-Millard" target="_blank" rel="noopener noreferrer" title="Visit Ryan Millard's GitHub profile">
        GitHub
      </a>
      <a href="https://www.linkedin.com/in/ryan-millard/" target="_blank" rel="noopener noreferrer" title="Visit Ryan Millard's LinkedIn profile">
        LinkedIn
      </a>
    </div>

    <p className={`flex-center ${styles.authorNote}`}>
      While I led this project, I had some help from others—see the <Link to="/credits">Credits page</Link> for details.
    </p>
  </GlassCard>
);

export default Author;
