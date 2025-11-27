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
					title="Visit the Img2Num GitHub repository"
				>
					Img2Num
				</a> is a web-based tool that transforms any image into a <strong>colour-by-number template</strong>. 
				Whether you want to print it out or colour digitally, Img2Num makes it easy to turn your favourite photos or pictures into a fun, creative activity.
			</p>

			<p>
				Using advanced image processing, the website analyses the colours in your image and breaks it down into a numbered palette. 
				Each number corresponds to a specific colour, making it simple to recreate the image one block at a time. 
				This approach allows you to focus on <strong>creativity and relaxation</strong> without worrying about where to get the next one to colour in.
			</p>

			<img src={coverHedge} alt="hedgehog" style={{width: '10vw', minWidth: '100px', margin: '0 auto'}} />


			<p>
				Img2Num is designed for everyone—friends, family, or solo users who enjoy colouring. 
				It’s flexible, easy to use, and lets you explore countless images in a way that is <strong>fun, personalised, and engaging</strong>.
			</p>

			<p>
				Beyond being a creative tool, Img2Num also carries a personal touch. The hedgehog-themed UI is a tribute to Joan, the hedgehog who inspired many of the design elements on this site. 
				It’s a blend of <strong>technology, art, and memory</strong>, offering a unique colouring experience unlike any other.
			</p>
		</GlassCard>
	);
};

export default WhatIsThis;
