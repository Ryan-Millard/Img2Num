import GlassCard from '@components/GlassCard';

export default function StaticCreditsCard() {
  return (
    <GlassCard>
      <h2>Project Credits</h2>

      <table>
        <tbody>
          <tr>
            <td>Created by</td>
            <td colSpan="2">
              <a href="https://github.com/Ryan-Millard" target="_blank"  rel="noopener noreferrer" title="Open creator's GitHub profile">
                Ryan Millard
              </a>
            </td>
          </tr>

          <tr>
            <td>Related URLs</td>
            <td>
              <a href="https://github.com/Ryan-Millard/Img2Num" target="_blank"  rel="noopener noreferrer" title="View the Img2Num GitHub repository">
                GitHub Repository
              </a>
            </td>
            <td> 
              <a href="https://ryan-millard.github.io/Img2Num/" target="_blank"  rel="noopener noreferrer" title="Open the Img2Num website">
                Website on GitHub Pages
              </a>
            </td>
          </tr>

          <tr>
            <td>Media</td>
            <td>Pixel Art Hedgehog</td>
            <td>
              By{' '}
              <a href="https://opengameart.org/users/dustdfg" target="_blank"  rel="noopener noreferrer" title="View artist profile on OpenGameArt">
                dustdfg
              </a>
              , used under{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank"  rel="noopener noreferrer" title="View Creative Commons BY-SA 4.0 license">
                CC BY-SA 4.0
              </a>
              . No modifications. Source:{' '}
              <a href="https://opengameart.org/content/pixel-art-hedgehog" target="_blank"  rel="noopener noreferrer" title="View asset source on OpenGameArt">
                opengameart.org
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </GlassCard>
  );
}
