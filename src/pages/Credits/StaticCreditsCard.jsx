import GlassCard from '@components/GlassCard';
import Tooltip from '@components/Tooltip.jsx';
import styles from './StaticCreditsCard.module.css';

export default function StaticCreditsCard() {
  return (
    <GlassCard>
      <h2>Project Credits</h2>

      <table className={styles.table}>
        <tbody>
          <tr>
            <td>Created by</td>
            <td>
              <Tooltip content="Open creator's GitHub profile">
                <a href="https://github.com/Ryan-Millard" target="_blank" rel="noopener noreferrer">
                  Ryan Millard
                </a>
              </Tooltip>
            </td>
          </tr>

          <tr>
            <td>Related URLs</td>
            <td>
              <Tooltip content="View the Img2Num GitHub repository">
                <a href="https://github.com/Ryan-Millard/Img2Num" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </Tooltip>
              {' · '}
              <Tooltip content="Open the Img2Num website">
                <a href="https://ryan-millard.github.io/Img2Num/" target="_blank" rel="noopener noreferrer">
                  Website on GitHub Pages
                </a>
              </Tooltip>
            </td>
          </tr>

          <tr>
            <td>Media</td>
            <td>
              Pixel Art Hedgehog- By{' '}
              <Tooltip content="View artist profile on OpenGameArt">
                <a href="https://opengameart.org/users/dustdfg" target="_blank" rel="noopener noreferrer">
                  dustdfg
                </a>
              </Tooltip>
              , licensed under{' '}
              <Tooltip content="View Creative Commons BY-SA 4.0 license">
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                  CC BY-SA 4.0
                </a>
              </Tooltip>
              . No modifications. Source:{" "}
              <Tooltip content="View asset source on OpenGameArt">
                <a href="https://opengameart.org/content/pixel-art-hedgehog" target="_blank" rel="noopener noreferrer">
                  opengameart.org
                </a>
              </Tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </GlassCard>
  );
}
