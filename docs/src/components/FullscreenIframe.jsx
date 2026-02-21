import FullscreenWrapper from "./FullscreenWrapper";

const FullscreenIframe = ({ src, title }) => {
  return (
    <FullscreenWrapper>
      <iframe
        src={src}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          margin: 0,
          padding: 0,
          display: "block",
        }}
        title={title}
      />
    </FullscreenWrapper>
  );
};

export default FullscreenIframe;
