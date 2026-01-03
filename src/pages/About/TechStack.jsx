import GlassCard from '@components/GlassCard';
import Tooltip from '@components/Tooltip';
import styles from './About.module.css';

const NewGitHubTabAnchor = ({ path, projName }) => (
  <Tooltip content={`Visit the ${projName} GitHub repository`}>
    <a href={`https://github.com/${path}`} target="_blank" rel="noopener noreferrer">
      {projName}
    </a>
  </Tooltip>
);

const TechStack = () => (
  <GlassCard className={styles.container}>
    <h2>Technology Behind Img2Num</h2>
    <p>
      <NewGitHubTabAnchor path="Ryan-Millard/Img2Num" projName="Img2Num" />
      &nbsp; is built with&nbsp;
      <NewGitHubTabAnchor path="facebook/react" projName="React" />
      &nbsp; and&nbsp;
      <NewGitHubTabAnchor path="vitejs/vite" projName="Vite" />, and uses&nbsp;{' '}
      <strong>client-side image processing</strong>&nbsp; (written in C++ and compiled to WebAssembly using&nbsp;
      <NewGitHubTabAnchor path="emscripten-core/emscripten" projName="Emscripten" />) to convert photos into
      colour-by-number templates. This ensures your images never leave your browser, keeping everything private and
      fast.
    </p>
    <p>
      The app analyses the colours in each image, assigns numbered blocks, and generates a palette to make recreating
      images simple and enjoyable. Advanced algorithms allow flexible output for both print and digital colouring.
    </p>
  </GlassCard>
);

export default TechStack;
