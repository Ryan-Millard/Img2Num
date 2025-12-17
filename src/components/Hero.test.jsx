import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

// Mock GlassCard
vi.mock('@components/GlassCard', () => ({
  default: ({ children, className }) => (
    <div data-testid="glass-card" className={className}>
      {children}
    </div>
  ),
}));

// Mock CSS module
vi.mock('./Hero.module.css', () => ({
  default: {
    heroParagraph: 'hero-paragraph-class',
  },
}));

describe('Hero', () => {
  describe('rendering', () => {
    it('should render header text', () => {
      render(<Hero header="Welcome" description="This is a description" />);
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
    });

    it('should render description text', () => {
      render(<Hero header="Welcome" description="This is a description" />);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should wrap content in GlassCard', () => {
      render(<Hero header="Test" description="Description" />);
      const glassCard = screen.getByTestId('glass-card');
      expect(glassCard).toBeInTheDocument();
      expect(glassCard).toHaveClass('text-center');
    });

    it('should apply hero paragraph class to description', () => {
      render(<Hero header="Test" description="Description" />);
      const paragraph = screen.getByText('Description');
      expect(paragraph).toHaveClass('hero-paragraph-class');
    });
  });

  describe('prop variations', () => {
    it('should handle empty header', () => {
      render(<Hero header="" description="Description" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeEmptyDOMElement();
    });

    it('should handle long header text', () => {
      const longHeader = 'This is a very long header that contains many words';
      render(<Hero header={longHeader} description="Short description" />);
      expect(screen.getByText(longHeader)).toBeInTheDocument();
    });

    it('should handle special characters in header', () => {
      render(<Hero header="Welcome! 🎉 & Enjoy" description="Test" />);
      expect(screen.getByText('Welcome! 🎉 & Enjoy')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<Hero header="Accessible Title" description="Description" />);
      const heading = screen.getByRole('heading', { name: 'Accessible Title' });
      expect(heading).toBeInTheDocument();
    });
  });
});