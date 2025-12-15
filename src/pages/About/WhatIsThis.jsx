import GlassCard from '@components/GlassCard';
import styles from './About.module.css';
import coverHedge from '@assets/pixel_art_hedgehog/cover/cover.gif';

const WhatIsThis = () => {
  return (
    <GlassCard className={styles.container}>
      <h2>What This Site Is About</h2>

      <p>
        <a
          href="https://github.com/Ryan-Millard/Img2Num"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit the Img2Num GitHub repository">
          Img2Num
        </a>{' '}
        is a web-based tool that transforms any image into a <strong>colour-by-number template</strong>.
      </p>

      <p>
        Using advanced image processing, the website analyses the colours in your image and breaks it down into a
        numbered palette.
      </p>

      <img src={coverHedge} alt="hedgehog" className={styles.coverImage} />

      <p>Img2Num is designed for everyone—friends, family, or solo users who enjoy colouring.</p>

      <p>Beyond being a creative tool, Img2Num also carries a personal touch.</p>
    </GlassCard>
  );
};

export default WhatIsThis;
