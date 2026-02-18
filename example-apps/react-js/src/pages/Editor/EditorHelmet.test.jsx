import { render, waitFor } from "@testing-library/react";
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
    resetHead();
  });

  it("sets title, meta, and canonical link", async () => {
    render(<EditorHelmet />);

    await waitFor(() => {
      expect(document.title).toBe("Editor – Img2Num");
    });

    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute("content")).toBe("noindex, nofollow");

    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")).toBe("Img2Num editor page (private, do not index).");

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute("href")).toBe("https://ryan-millard.github.io/Img2Num/editor");
  });
});
