import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FallbackImage from './FallbackImage';

describe('FallbackImage', () => {
  describe('rendering', () => {
    it('should render image when src is provided', () => {
      render(<FallbackImage src="https://example.com/image.jpg" alt="Test" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render fallback when src is null', () => {
      render(<FallbackImage src={null} fallback={<div>Fallback Content</div>} />);
      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should render fallback when src is empty string', () => {
      render(<FallbackImage src="" fallback={<div>Fallback Content</div>} />);
      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should render fallback when image fails to load', () => {
      render(<FallbackImage src="https://example.com/broken.jpg" fallback={<div>Image Failed</div>} alt="Test" />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(screen.getByText('Image Failed')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should only trigger fallback once per error', () => {
      render(<FallbackImage src="https://example.com/broken.jpg" fallback={<div>Fallback</div>} />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(screen.getAllByText('Fallback')).toHaveLength(1);
    });
  });

  describe('fallback types', () => {
    it('should render fallback as function component', () => {
      const FallbackComponent = () => <div>Function Fallback</div>;
      render(<FallbackImage src={null} fallback={FallbackComponent} />);
      expect(screen.getByText('Function Fallback')).toBeInTheDocument();
    });

    it('should pass props to fallback component', () => {
      const FallbackComponent = (props) => <div data-testid="fallback" {...props}>Fallback</div>;
      render(<FallbackImage src={null} fallback={FallbackComponent} className="test-class" />);
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('test-class');
    });
  });

  describe('prop spreading', () => {
    it('should spread additional props to image', () => {
      render(
        <FallbackImage
          src="https://example.com/image.jpg"
          alt="Test"
          width="100"
          className="custom-class"
        />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '100');
      expect(img).toHaveClass('custom-class');
    });
  });
});