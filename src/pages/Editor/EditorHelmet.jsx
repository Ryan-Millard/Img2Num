import { Helmet } from 'react-helmet';

// Although this page shouldn't be indexed, bots may still disregard no-index rules
const EditorHelmet = () => (
  <Helmet>
    <title>Editor – Img2Num</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content="Img2Num editor page (private, do not index)." />
    <link rel="canonical" href="https://ryan-millard.github.io/Img2Num/editor" />
  </Helmet>
);

export default EditorHelmet;
