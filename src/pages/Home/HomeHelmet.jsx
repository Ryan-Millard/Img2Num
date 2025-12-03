import { Helmet } from 'react-helmet';

const HomeHelmet = () => (
  <Helmet>
    <title>Img2Num – Convert images into Color-by-Number templates</title>
    <meta
      name="description"
      content="Convert any image into a Color-by-Number template instantly in your browser! Drag & Drop or Choose File. Fast, lightweight, compiled C++ runs via WebAssembly."
    />
    <meta property="og:title" content="Img2Num – Color-by-Number from your images" />
    <meta
      property="og:description"
      content="Drag & Drop or Choose File. Fast, lightweight, near-native performance with WebAssembly."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ryan-millard.github.io/Img2Num/" />
    <link rel="canonical" href="https://ryan-millard.github.io/Img2Num/" />
  </Helmet>
);

export default HomeHelmet;
