import { Link } from 'react-router-dom';
import GlassCard from '@components/GlassCard';
import styles from './About.module.css';

const CTA = () => (
  <GlassCard className={styles.container}>
    <h2>Try Img2Num!</h2>
    <p className="flex-center">Ready to turn your favourite photos into colour-by-number masterpieces?</p>
    <Link to="/" title="Launch the Img2Num application">Launch Img2Num</Link>
  </GlassCard>
);

export default CTA;
