import LoadingHedgehog from '@components/LoadingHedgehog';
import GlassCard from '@components/GlassCard';
import styles from './About.module.css';
import Tooltip from '@components/Tooltip';

const Motivation = () => {
  return (
    <GlassCard className={styles.container}>
      <h2>Motivation</h2>

      <p>
        <Tooltip content="Visit the Img2Num GitHub repository">
          <a href="https://github.com/Ryan-Millard/Img2Num" target="_blank" rel="noopener noreferrer">
            Img2Num
          </a>{' '}
        </Tooltip>
        started as a simple goal: to <strong>learn how image processing works</strong>. I wanted to experiment with
        transforming images at the pixel level—playing with colours and seeing how software could reinterpret visual
        data.
      </p>

      <p>
        As I explored the possibilities, I thought about my mom, who loves <strong>colour-by-number drawings</strong>. I
        noticed that she would often switch apps because <strong>they only had a limited number of drawings</strong>.
        This led me to the realisation that I could create a tool that would let anyone—friends, family, or myself—
        <strong>turn any image into a colour-by-number template</strong>, printable or digital, to enjoy colouring.
      </p>

      <p>
        Finally, the project became even more personal. After Joan, my hedgehog, passed away, I wanted Img2Num to&nbsp;
        <strong>carry a tribute to her</strong>. I redesigned the UI with her in mind, added hedgehog-themed touches
        like the animated hedgehog loading bar, and subtly infused the project with elements that remind me of her.
      </p>

      <div aria-hidden="true">
        <LoadingHedgehog />
      </div>

      <p>
        Img2Num is now more than just a learning exercise or a practical tool. It’s a blend of&nbsp;
        <strong>tech, creativity, and memory</strong>—a small way to honour someone who brought joy to my life, while
        giving others a fun way to create art.
      </p>
    </GlassCard>
  );
};

export default Motivation;
