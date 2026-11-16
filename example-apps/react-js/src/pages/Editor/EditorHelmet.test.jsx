import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import EditorHelmet from "./EditorHelmet";

describe("EditorHelmet", () => {
  const resetHead = () => {
    document.title = "";
    document.head.innerHTML = "";
  };

  beforeEach(() => {
    resetHead();
  });

  afterEach(() => {
    // Unmount while the head is still intact: React must be able to detach the nodes
    // Helmet rendered. Clearing `head.innerHTML` first leaves React holding null
    // parents and unmount throws `Cannot read properties of null (reading 'removeChild')`.
    cleanup();
    resetHead();
  });

  it("sets title, meta, and canonical link", async () => {
    render(
      <HelmetProvider>
        <EditorHelmet />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Editor – Img2Num");
    });

    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")).toBe("Img2Num editor page (private, do not index).");

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute("content")).toBe("noindex, nofollow");

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute("href")).toBe("https://img2num.dev/example-apps/react-js/editor");
  });
});
