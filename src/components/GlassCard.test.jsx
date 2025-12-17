import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlassCard from './GlassCard';

// Mock CSS module
vi.mock('./GlassCard.module.css', () => ({
  default: {
    card: 'mocked-card-class',
  },
}));

describe('GlassCard', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<GlassCard>Hello World</GlassCard>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render as a div by default', () => {
      render(<GlassCard data-testid="glass-card">Content</GlassCard>);
      const element = screen.getByTestId('glass-card');
      expect(element.tagName).toBe('DIV');
    });

    it('should render with custom tag when "as" prop is provided', () => {
      render(
        <GlassCard as="section" data-testid="glass-card">
          Section Content
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element.tagName).toBe('SECTION');
    });

    it('should render as nav element', () => {
      render(
        <GlassCard as="nav" data-testid="glass-card">
          Navigation
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element.tagName).toBe('NAV');
    });

    it('should render complex nested children', () => {
      render(
        <GlassCard data-testid="glass-card">
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
          </div>
        </GlassCard>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });

  describe('className handling', () => {
    it('should include text-center, glass, and card classes', () => {
      render(<GlassCard data-testid="glass-card">Content</GlassCard>);
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveClass('text-center');
      expect(element).toHaveClass('glass');
      expect(element).toHaveClass('mocked-card-class');
    });

    it('should append additional className from props', () => {
      render(
        <GlassCard className="custom-class" data-testid="glass-card">
          Content
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveClass('custom-class');
    });

    it('should handle multiple custom classes', () => {
      render(
        <GlassCard className="class-one class-two" data-testid="glass-card">
          Content
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveClass('class-one');
      expect(element).toHaveClass('class-two');
    });
  });

  describe('prop spreading', () => {
    it('should spread additional props to the element', () => {
      render(
        <GlassCard data-testid="glass-card" id="custom-id" role="banner">
          Content
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveAttribute('id', 'custom-id');
      expect(element).toHaveAttribute('role', 'banner');
    });

    it('should handle style prop', () => {
      render(
        <GlassCard data-testid="glass-card" style={{ padding: '20px' }}>
          Content
        </GlassCard>
      );
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveStyle({ padding: '20px' });
    });
  });

  describe('edge cases', () => {
    it('should render with null children', () => {
      render(<GlassCard data-testid="glass-card">{null}</GlassCard>);
      const element = screen.getByTestId('glass-card');
      expect(element).toBeEmptyDOMElement();
    });

    it('should render with number children', () => {
      render(<GlassCard data-testid="glass-card">{42}</GlassCard>);
      const element = screen.getByTestId('glass-card');
      expect(element).toHaveTextContent('42');
    });
  });
});