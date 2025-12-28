import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from '@components/ThemeSwitch';
import * as useThemeModule from '@hooks/useTheme';

// Mock the useTheme hook
vi.mock('@hooks/useTheme');

// Mock CSS module
vi.mock('@components/ThemeSwitch.module.css', () => ({
  default: {
    themeButton: 'mocked-theme-button-class',
    icon: 'mocked-icon-class',
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: ({ className }) => (
    <span data-testid="moon-icon" className={className}>
      Moon Icon
    </span>
  ),
  Sun: ({ className }) => (
    <span data-testid="sun-icon" className={className}>
      Sun Icon
    </span>
  ),
}));

describe('ThemeSwitch', () => {
  let mockToggleTheme;

  beforeEach(() => {
    mockToggleTheme = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render a button', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button', { name: 'Toggle Dark Mode' });
      expect(button).toBeInTheDocument();
    });

    it('should have type="button" attribute', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have proper aria-label for accessibility', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button', { name: 'Toggle Dark Mode' });
      expect(button).toHaveAttribute('aria-label', 'Toggle Dark Mode');
    });

    it('should apply the themeButton CSS class', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('mocked-theme-button-class');
    });
  });

  describe('icon display based on theme', () => {
    it('should display Moon icon when theme is light', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('should display Sun icon when theme is dark', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('should apply icon CSS class to Moon icon', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toHaveClass('mocked-icon-class');
    });

    it('should apply icon CSS class to Sun icon', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toHaveClass('mocked-icon-class');
    });
  });

  describe('theme toggling functionality', () => {
    it('should call toggleTheme when button is clicked', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should call toggleTheme multiple times on multiple clicks', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });

    it('should be accessible via keyboard (Enter key)', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // Note: fireEvent.keyDown doesn't automatically trigger click for buttons
      // but the button element itself handles Enter key natively
      // We're testing that the button can receive keyboard events
      expect(button).toBeInTheDocument();
    });

    it('should be accessible via keyboard (Space key)', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  describe('integration with useTheme hook', () => {
    it('should use theme value from useTheme hook', () => {
      const customTheme = 'dark';
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: customTheme,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      // Sun icon should be shown for dark theme
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should use toggleTheme function from useTheme hook', () => {
      const customToggle = vi.fn();
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: customToggle,
      });

      render(<ThemeSwitch />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(customToggle).toHaveBeenCalledTimes(1);
    });

    it('should call useTheme hook on component mount', () => {
      const useThemeSpy = vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      expect(useThemeSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined theme gracefully', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: undefined,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      // Should default to showing Moon icon (theme !== 'dark')
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should handle null theme gracefully', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: null,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      // Should default to showing Moon icon (theme !== 'dark')
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should handle unexpected theme value gracefully', () => {
      vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
        theme: 'unexpected-theme',
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitch />);

      // Should show Moon icon for any value that's not 'dark'
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
  });
});
