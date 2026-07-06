import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, vi } from "vitest";
import { act } from "react";
import Editor from "./index.jsx";
import styles from "./Editor.module.css";
import { setEditorHandoff, clearEditorHandoff } from "@utils/editorHandoff";

const renderEditor = (svg) => {
  if (svg) setEditorHandoff({ svg });
  else clearEditorHandoff();
  return render(
    <MemoryRouter initialEntries={["/editor"]}>
      <Editor />
    </MemoryRouter>,
  );
};

const svgSample = '<svg width="10" height="10"><path d="M0 0h10v10z" fill="#abcdef" /></svg>';

afterEach(() => {
  clearEditorHandoff();
  vi.clearAllMocks();
});

describe("Editor page", () => {
  it("renders fallback when no svg data is present", () => {
    renderEditor();

    expect(screen.getByText(/No SVG data found/i)).toBeInTheDocument();
    expect(screen.getByText(/Please upload an image first/i)).toBeInTheDocument();
  });

  it("renders the canvas when svg content is provided", () => {
    renderEditor(svgSample);

    // The SVG is rasterized into a single <canvas>, not per-shape DOM nodes.
    expect(screen.getByTestId("svg-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("svg-canvas").tagName.toLowerCase()).toBe("canvas");
  });

  it("toggles between color and preview mode via the switch", async () => {
    const { container } = renderEditor(svgSample);

    const modeSwitch = screen.getByRole("switch");
    expect(modeSwitch).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector(`.${styles.colorMode}`)).toBeTruthy();

    await act(async () => {
      fireEvent.click(modeSwitch);
    });

    expect(modeSwitch).toHaveAttribute("aria-checked", "false");
    expect(container.querySelector(`.${styles.previewMode}`)).toBeTruthy();
  });
});
