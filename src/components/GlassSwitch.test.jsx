import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassSwitch from './GlassSwitch';

// Mock the Tooltip component
vi.mock('@components/Tooltip', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

// Mock the CSS module
vi.mock('./GlassSwitch.module.css', () => ({
  default: {
    switch: 'mocked-switch-class',
    thumb: 'mocked-thumb-class',
    checked: 'mocked-checked-class',
    fallbackThumbContentOn: 'mocked-fallback-on',
    fallbackThumbContentOff: 'mocked-fallback-off',
  },
}));

describe('GlassSwitch', () => {
  it('renders a switch button', () => {
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('sets aria-checked to true when checked', () => {
    render(<GlassSwitch isOn={true} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false when unchecked', () => {
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" />);
    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" />);
    const button = screen.getByRole('switch');

    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalled();
  });

  it('applies correct CSS classes when checked', () => {
    render(<GlassSwitch isOn={true} onChange={() => {}} ariaLabel="Toggle" />);
    const switchButton = screen.getByRole('switch');

    expect(switchButton).toHaveClass('mocked-switch-class');
    expect(switchButton).toHaveClass('mocked-checked-class');
  });

  it('does not apply checked class when unchecked', () => {
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" />);
    const switchButton = screen.getByRole('switch');

    expect(switchButton).toHaveClass('mocked-switch-class');
    expect(switchButton).not.toHaveClass('mocked-checked-class');
  });

  it('renders with thumbContent when provided', () => {
    const thumbContent = <span data-testid="custom-thumb">Custom</span>;
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" thumbContent={thumbContent} />);

    expect(screen.getByTestId('custom-thumb')).toBeInTheDocument();
  });

  it('uses fallback off styling when no thumbContent and isOff', () => {
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" />);
    const thumb = screen.getByRole('switch').querySelector('span');
    expect(thumb).toHaveClass('mocked-thumb-class');
    expect(thumb).toHaveClass('mocked-fallback-off');
    expect(thumb?.textContent).toBe('');
  });

  it('uses fallback on styling when no thumbContent and isOn', () => {
    render(<GlassSwitch isOn={true} onChange={() => {}} ariaLabel="Toggle" />);
    const thumb = screen.getByRole('switch').querySelector('span');
    expect(thumb).toHaveClass('mocked-thumb-class');
    expect(thumb).toHaveClass('mocked-fallback-on');
    expect(thumb?.textContent).toBe('');
  });

  it('can be disabled', () => {
    const onChange = vi.fn();
    render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" disabled={true} />);
    const switchButton = screen.getByRole('switch');

    expect(switchButton).toBeDisabled();
  });

  it('sets correct aria-label', () => {
    render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="My Custom Label" />);

    expect(screen.getByLabelText('My Custom Label')).toBeInTheDocument();
  });
});
