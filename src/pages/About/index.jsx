import Hero from '@components/Hero';
import WhatIsThis from './WhatIsThis';
import Motivation from './Motivation';
import TechStack from './TechStack';
import CTA from './CTA';
import Author from './Author';
import AboutHelmet from './AboutHelmet';

const About = () => (
  <>
    <AboutHelmet />

    <div className="flex-column gap-lg">
      <Hero
        header="About"
        description={`Learn about the story, inspiration, and purpose behind Img2Num,
                and discover how it brings creativity, technology, and personal tribute together.`}
      />
      <WhatIsThis />
      <Motivation />
      <TechStack />
      <CTA />
      <Author />
    </div>
  </>
);

export default About;
