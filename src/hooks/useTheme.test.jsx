import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useTheme } from './useTheme'; // adjust path if needed

// A small test component that exposes the hook for testing
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
    <span data-testid="theme-value">{String(theme)}</span>
    <button data-testid="toggle-btn" onClick={toggleTheme}>
    Toggle
    </button>
    </div>
  );
}

describe('useTheme hook', () => {
  let originalMatchMedia;

  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();

    // Keep original matchMedia to restore later
    originalMatchMedia = window.matchMedia;

    // Provide a simple mock for matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated API
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    // Clean documentElement classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    // Restore matchMedia
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    document.documentElement.className = '';
    vi.clearAllMocks();
  });

  it('defaults to system preference when no localStorage value exists (prefers dark)', () => {
    // Simulate system preference = dark
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));

    render(<TestComponent />);

    const themeSpan = screen.getByTestId('theme-value');
    expect(themeSpan.textContent).toBe('dark');

    // documentElement should have 'dark' class and localStorage should be set
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('uses localStorage value when present', () => {
    localStorage.setItem('theme', 'light'); // preexisting preference

    // Even if system prefers dark, localStorage should win
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));

    render(<TestComponent />);

    const themeSpan = screen.getByTestId('theme-value');
    expect(themeSpan.textContent).toBe('light');

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggleTheme toggles theme and updates document class & localStorage', () => {
    // Start with light
    localStorage.setItem('theme', 'light');
    render(<TestComponent />);

    const themeSpan = screen.getByTestId('theme-value');
    const btn = screen.getByTestId('toggle-btn');

    expect(themeSpan.textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('light');

    // Toggle to dark
    fireEvent.click(btn);

    // After toggle, hook state should have updated
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    fireEvent.click(btn);
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('handles unexpected / falsy stored theme gracefully', () => {
    // store null-like string or unexpected value
    localStorage.setItem('theme', 'unexpected-theme');

    render(<TestComponent />);
    // The hook will still set the class to the stored value (so document class will match),
    // but your app logic might treat non 'dark' as light when rendering icons/components.
    expect(screen.getByTestId('theme-value').textContent).toBe('unexpected-theme');
    expect(document.documentElement.classList.contains('unexpected-theme')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('unexpected-theme');
  });
});
