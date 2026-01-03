import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from './ThemeSwitch'; // adjust path if needed
import * as useThemeModule from '@hooks/useTheme';

// Mock the useTheme hook module
vi.mock('@hooks/useTheme');

// Mock CSS module so `className` checks work
vi.mock('./ThemeSwitch.module.css', () => ({
  default: {
    themeButton: 'mocked-theme-button-class',
    icon: 'mocked-icon-class',
  },
}));

// Mock lucide icons (Sun / Moon)
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

// ✅ Correct Tooltip mock: return module object with default export (and __esModule for ESM interop)
vi.mock('@components/Tooltip', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe('ThemeSwitch component', () => {
  let mockToggleTheme;

  beforeEach(() => {
    mockToggleTheme = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a button with the correct aria-label when theme is light', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('button', { name: 'Switch to Dark Mode' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('mocked-theme-button-class');
  });

  it('shows Moon icon for light theme and applies icon class', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon).toHaveClass('mocked-icon-class');
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('shows Sun icon for dark theme and applies icon class', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'dark', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveClass('mocked-icon-class');
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();

    // aria-label should match dark case
    const button = screen.getByRole('button', { name: 'Switch to Light Mode' });
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('button', { name: 'Switch to Dark Mode' });
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible (focusable)', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('button', { name: 'Switch to Dark Mode' });
    button.focus();
    expect(button).toHaveFocus();
  });

  it('works with unexpected/falsy theme values (defaults to Moon icon for non-"dark")', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: undefined, toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('uses the toggleTheme coming from the hook', () => {
    const customToggle = vi.fn();
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: customToggle });

    render(<ThemeSwitch />);

    const btn = screen.getByRole('button', { name: 'Switch to Dark Mode' });
    fireEvent.click(btn);
    expect(customToggle).toHaveBeenCalledTimes(1);
  });
});
