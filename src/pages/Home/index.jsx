import WasmImageProcessor from '@components/WasmImageProcessor';
import Hero from '@components/Hero';
import GlassCard from '@components/GlassCard';
import styles from './Home.module.css';

const Home = () => (
  <div className="flex-column gap-md">
    <Hero header="Img2Num" description="Convert images of numbers into actual digits instantly in your browser!" />

    <WasmImageProcessor />

    <div className={styles.featureContainer}>
      <GlassCard>
        <h3>⚡ Fast & Lightweight</h3>
        <p>Compiled C++ runs in your browser via WebAssembly with near-native speed.</p>
      </GlassCard>
      <GlassCard>
        <h3>🛠️ Easy to Integrate</h3>
        <p>Minimal dependencies, works with any project or workflow.</p>
      </GlassCard>
    </div>
  </div>
);

export default Home;
