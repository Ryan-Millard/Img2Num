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

    it('should render as ul element', () => {
      render(
        <GlassCard as="ul" data-testid="glass-card">
          <li>Item 1</li>
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      expect(element.tagName).toBe('UL');
    });

    it('should render as article element', () => {
      render(
        <GlassCard as="article" data-testid="glass-card">
          Article Content
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      expect(element.tagName).toBe('ARTICLE');
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
      expect(element).toHaveClass('text-center');
      expect(element).toHaveClass('glass');
      expect(element).toHaveClass('mocked-card-class');
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

    it('should not add undefined to className when no className prop is provided', () => {
      render(<GlassCard data-testid="glass-card">Content</GlassCard>);

      const element = screen.getByTestId('glass-card');
      expect(element.className).not.toContain('undefined');
    });
  });

  describe('props spreading', () => {
    it('should pass through arbitrary props to the element', () => {
      render(
        <GlassCard data-testid="glass-card" id="my-id" aria-label="Glass card component">
          Content
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      expect(element).toHaveAttribute('id', 'my-id');
      expect(element).toHaveAttribute('aria-label', 'Glass card component');
    });

    it('should pass through style prop', () => {
      render(
        <GlassCard data-testid="glass-card" style={{ padding: '1rem', backgroundColor: 'blue' }}>
          Content
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      expect(element).toHaveStyle({ padding: '1rem' });
    });

    it('should pass through onClick handler', () => {
      const handleClick = vi.fn();
      render(
        <GlassCard data-testid="glass-card" onClick={handleClick}>
          Clickable
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      element.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass through role attribute', () => {
      render(
        <GlassCard data-testid="glass-card" role="region">
          Content
        </GlassCard>
      );

      const element = screen.getByTestId('glass-card');
      expect(element).toHaveAttribute('role', 'region');
    });
  });

  describe('children rendering', () => {
    it('should render nested elements', () => {
      render(
        <GlassCard data-testid="glass-card">
          <h2>Title</h2>
          <p>Paragraph content</p>
        </GlassCard>
      );

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <GlassCard>
          <span>First</span>
          <span>Second</span>
          <span>Third</span>
        </GlassCard>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should render without children', () => {
      render(<GlassCard data-testid="glass-card" />);

      const element = screen.getByTestId('glass-card');
      expect(element).toBeInTheDocument();
      expect(element).toBeEmptyDOMElement();
    });
  });
});
