import { Helmet } from 'react-helmet';

const AboutHelmet = () => (
  <Helmet>
    <title>Img2Num – About</title>
    <meta
      name="description"
      content="Learn about the story, inspiration, and purpose behind Img2Num, a web tool that turns images into colour-by-number templates."
    />
    <meta property="og:title" content="Img2Num – About" />
    <meta
      property="og:description"
      content="Discover how Img2Num blends creativity, technology, and personal tribute to offer a unique colour-by-number experience."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ryan-millard.github.io/Img2Num/about" />
    <link rel="canonical" href="https://ryan-millard.github.io/Img2Num/about" />
  </Helmet>
);

export default AboutHelmet;
