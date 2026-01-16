import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, afterEach } from 'vitest';
import { act } from 'react';
import Editor from './index.jsx';
import styles from './Editor.module.css';

const renderEditor = (svg) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/editor', state: svg ? { svg } : undefined }]}>
      <Editor />
    </MemoryRouter>
  );
};

const svgSample = '<svg data-testid="svg-root"><path data-testid="shape" d="M0 0h10v10z" /></svg>';

const getViewport = (container) => container.querySelector('.flex-center');

const withElementFromPoint = async (element, fn) => {
  const original = document.elementFromPoint;
  document.elementFromPoint = vi.fn(() => element);
  await fn();
  document.elementFromPoint = original;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('Editor page', () => {
  it('renders fallback when no svg data is present', () => {
    renderEditor();

    expect(screen.getByText(/No SVG data found/i)).toBeInTheDocument();
    expect(screen.getByText(/Please upload an image first/i)).toBeInTheDocument();
  });

  it('renders provided svg content', () => {
    renderEditor(svgSample);

    expect(screen.getByTestId('svg-root')).toBeInTheDocument();
    expect(screen.getByTestId('shape')).toBeInTheDocument();
  });

  it('toggles original colour for a shape when tapping in color mode', async () => {
    const { container } = renderEditor(svgSample);
    const shape = screen.getByTestId('shape');
    const viewport = getViewport(container);

    expect(viewport).toBeTruthy();

    await withElementFromPoint(shape, async () => {
      await act(async () => {
        fireEvent.pointerDown(viewport, {
          pointerId: 1,
          button: 0,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });

        fireEvent.pointerUp(viewport, {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: 10,
          clientY: 10,
        });
      });
    });

    expect(shape.classList.contains(styles.coloredRegion)).toBe(true);
  });

  it('enters preview mode via switch and skips color toggling', async () => {
    const { container } = renderEditor(svgSample);
    const viewport = getViewport(container);
    const shape = screen.getByTestId('shape');

    const modeSwitch = screen.getByRole('switch');
    expect(modeSwitch).toHaveAttribute('aria-checked', 'true');

    await act(async () => {
      fireEvent.click(modeSwitch);
    });

    expect(modeSwitch).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelector(`.${styles.previewMode}`)).toBeTruthy();

    await withElementFromPoint(shape, async () => {
      await act(async () => {
        fireEvent.pointerDown(viewport, {
          pointerId: 2,
          button: 0,
          pointerType: 'mouse',
          clientX: 5,
          clientY: 5,
        });
        fireEvent.pointerUp(viewport, {
          pointerId: 2,
          pointerType: 'mouse',
          clientX: 5,
          clientY: 5,
        });
      });
    });

    expect(shape.classList.contains(styles.coloredRegion)).toBe(false);
  });
});
