import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassSwitch from './GlassSwitch';

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
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalled();
  });
});
