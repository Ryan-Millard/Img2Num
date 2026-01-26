import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

// Mock CSS module
vi.mock('./Pagination.module.css', () => ({
  default: {
    pagination: 'mocked-pagination-class',
    arrow: 'mocked-arrow-class',
    page: 'mocked-page-class',
    active: 'mocked-active-class',
    ellipsis: 'mocked-ellipsis-class',
  },
}));

describe('Pagination', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('should not render when totalPages is 1', () => {
      const { container } = render(<Pagination page={0} totalPages={1} onChange={mockOnChange} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const { container } = render(<Pagination page={0} totalPages={0} onChange={mockOnChange} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render when totalPages is greater than 1', () => {
      render(<Pagination page={0} totalPages={5} onChange={mockOnChange} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render with correct aria-label', () => {
      render(<Pagination page={0} totalPages={5} onChange={mockOnChange} />);

      expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    });

    it('should render previous and next arrow buttons', () => {
      render(<Pagination page={1} totalPages={5} onChange={mockOnChange} />);

      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
  });

  describe('page buttons', () => {
    it('should render page numbers correctly (1-indexed display)', () => {
      render(<Pagination page={0} totalPages={3} onChange={mockOnChange} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should mark current page with aria-current="page"', () => {
      render(<Pagination page={1} totalPages={5} onChange={mockOnChange} />);

      const currentPageButton = screen.getByText('2');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('should apply active class to current page', () => {
      render(<Pagination page={1} totalPages={5} onChange={mockOnChange} />);

      const currentPageButton = screen.getByText('2');
      expect(currentPageButton).toHaveClass('mocked-active-class');
    });

    it('should not have aria-current on non-active pages', () => {
      render(<Pagination page={1} totalPages={5} onChange={mockOnChange} />);

      const otherPageButton = screen.getByText('1');
      expect(otherPageButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('ellipsis display', () => {
    it('should show leading ellipsis when not on first pages', () => {
      render(<Pagination page={5} totalPages={10} onChange={mockOnChange} />);

      // Should show first page button and ellipsis before visible pages
      const ellipses = screen.getAllByText('…');
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });

    it('should show trailing ellipsis when not on last pages', () => {
      render(<Pagination page={2} totalPages={10} onChange={mockOnChange} />);

      // Should show ellipsis and last page button
      const ellipses = screen.getAllByText('…');
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });

    it('should show first page button when current page is far from start', () => {
      render(<Pagination page={5} totalPages={10} onChange={mockOnChange} />);

      // First page (displayed as "1") should be visible
      const firstPageButton = screen.getByRole('button', { name: '1' });
      expect(firstPageButton).toBeInTheDocument();
    });

    it('should show last page button when current page is far from end', () => {
      render(<Pagination page={2} totalPages={10} onChange={mockOnChange} />);

      // Last page (displayed as "10") should be visible
      const lastPageButton = screen.getByRole('button', { name: '10' });
      expect(lastPageButton).toBeInTheDocument();
    });

    it('should not show leading ellipsis when on first page', () => {
      render(<Pagination page={0} totalPages={10} onChange={mockOnChange} />);

      // First page button should exist without ellipsis before it
      const firstPageButton = screen.getByRole('button', { name: '1' });
      expect(firstPageButton).toBeInTheDocument();

      // Check that only one ellipsis exists (trailing)
      const ellipses = screen.getAllByText('…');
      expect(ellipses.length).toBe(1);
    });

    it('should not show trailing ellipsis when on last page', () => {
      render(<Pagination page={9} totalPages={10} onChange={mockOnChange} />);

      // Only leading ellipsis should exist
      const ellipses = screen.getAllByText('…');
      expect(ellipses.length).toBe(1);
    });
  });

  describe('navigation buttons', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination page={0} totalPages={5} onChange={mockOnChange} />);

      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<Pagination page={4} totalPages={5} onChange={mockOnChange} />);

      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
    });

    it('should enable previous button when not on first page', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).not.toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('click interactions', () => {
    it('should call onChange with previous page when clicking previous button', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText('Previous page'));
      expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    it('should call onChange with next page when clicking next button', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText('Next page'));
      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('should call onChange with correct page when clicking a page number', () => {
      render(<Pagination page={0} totalPages={5} onChange={mockOnChange} />);

      // With page=0 and delta=1, visible pages are 1,2 + ellipsis + 5
      // Click page 2 (which is index 1)
      fireEvent.click(screen.getByText('2'));
      expect(mockOnChange).toHaveBeenCalledWith(1); // 0-indexed
    });

    it('should call onChange with 0 when clicking first page button', () => {
      render(<Pagination page={5} totalPages={10} onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: '1' }));
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('should call onChange with last index when clicking last page button', () => {
      render(<Pagination page={2} totalPages={10} onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole('button', { name: '10' }));
      expect(mockOnChange).toHaveBeenCalledWith(9); // 0-indexed
    });
  });

  describe('keyboard navigation', () => {
    afterEach(() => {
      // Clean up any event listeners
      vi.restoreAllMocks();
    });

    it('should go to next page on ArrowRight key', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('should go to previous page on ArrowLeft key', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    it('should not go beyond last page on ArrowRight', () => {
      render(<Pagination page={4} totalPages={5} onChange={mockOnChange} />);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not go before first page on ArrowLeft', () => {
      render(<Pagination page={0} totalPages={5} onChange={mockOnChange} />);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should ignore keyboard navigation when typing in input field', () => {
      render(
        <>
          <input data-testid="text-input" />
          <Pagination page={2} totalPages={5} onChange={mockOnChange} />
        </>
      );

      const input = screen.getByTestId('text-input');
      fireEvent.keyDown(input, { key: 'ArrowRight' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should ignore keyboard navigation when typing in textarea', () => {
      render(
        <>
          <textarea data-testid="text-area" />
          <Pagination page={2} totalPages={5} onChange={mockOnChange} />
        </>
      );

      const textarea = screen.getByTestId('text-area');
      fireEvent.keyDown(textarea, { key: 'ArrowRight' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should ignore other keys', () => {
      render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('visible pages calculation', () => {
    it('should show adjacent pages around current page', () => {
      render(<Pagination page={5} totalPages={10} onChange={mockOnChange} />);

      // Current page (6) and adjacent pages (5, 7) should be visible
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should handle edge case at the beginning', () => {
      render(<Pagination page={0} totalPages={10} onChange={mockOnChange} />);

      // First page and next page should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should handle edge case at the end', () => {
      render(<Pagination page={9} totalPages={10} onChange={mockOnChange} />);

      // Last page and previous page should be visible
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<Pagination page={2} totalPages={5} onChange={mockOnChange} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
