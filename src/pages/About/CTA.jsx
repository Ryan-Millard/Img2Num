import { Link } from "react-router-dom";
import GlassCard from "@components/GlassCard";
import styles from "./About.module.css";
import Tooltip from "@components/Tooltip";

const CTA = () => (
  <GlassCard className={styles.container}>
    <h2>Try Img2Num!</h2>
    <p className="flex-center">Ready to turn your favourite photos into colour-by-number masterpieces?</p>
    <Tooltip content="Go to homepage and start converting images to color-by-number templates">
      <Link to="/">Launch Img2Num</Link>
    </Tooltip>
  </GlassCard>
);

export default CTA;
