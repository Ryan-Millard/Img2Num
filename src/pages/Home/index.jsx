import WasmImageProcessor from '@components/WasmImageProcessor';
import Hero from '@components/Hero';
import GlassCard from '@components/GlassCard';
import styles from './Home.module.css';
import HomeHelmet from './HomeHelmet';

const Home = () => (
  <>
    <HomeHelmet />

    <div className="flex-column gap-md">
      <Hero header="Img2Num" description="Upload an image to convert it into a color-by-number template to color in directly in your browser!"/>

      <WasmImageProcessor />

      <div className={styles.featureContainer}>
        <GlassCard title="Performance feature">
          <h3>⚡ Fast & Lightweight</h3>
          <p>Compiled C++ runs in your browser via WebAssembly with near-native speed.</p>
        </GlassCard>
        <GlassCard title="Integration feature">
          <h3>🛠️ Easy to Integrate</h3>
          <p>Minimal dependencies, works with any project or workflow.</p>
        </GlassCard>
      </div>
    </div>
  </>
);

export default Home;
