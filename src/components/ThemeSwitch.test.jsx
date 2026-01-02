import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitch from './ThemeSwitch';
import * as useThemeModule from '@hooks/useTheme';

// Mock the useTheme hook module
vi.mock('@hooks/useTheme');

// Mock lucide icons (Sun / Moon)
vi.mock('lucide-react', () => ({
  Moon: ({ className }) => <span data-testid="moon-icon" className={className}>Moon Icon</span>,
  Sun: ({ className }) => <span data-testid="sun-icon" className={className}>Sun Icon</span>,
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

  it('renders a switch with the correct aria-label when theme is light', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('switch', { name: 'switch to dark mode' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('shows Moon icon for light theme', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('shows Sun icon for dark theme and updates aria-label accordingly', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'dark', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();

    const button = screen.getByRole('switch', { name: 'switch to light mode' });
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('switch', { name: 'switch to dark mode' });
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible (focusable)', () => {
    vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });

    render(<ThemeSwitch />);

    const button = screen.getByRole('switch', { name: 'switch to dark mode' });
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

    const btn = screen.getByRole('switch', { name: 'switch to dark mode' });
    fireEvent.click(btn);
    expect(customToggle).toHaveBeenCalledTimes(1);
  });
});