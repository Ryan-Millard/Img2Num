import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlassSwitch from './GlassSwitch';

describe('GlassSwitch', () => {
  it('renders a switch button', () => {
    render(<GlassSwitch checked={false} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('sets aria-checked to true when checked', () => {
    render(<GlassSwitch checked={true} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false when unchecked', () => {
    render(<GlassSwitch checked={false} onChange={() => {}} ariaLabel="Toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<GlassSwitch checked={false} onChange={onChange} ariaLabel="Toggle" />);
    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<GlassSwitch checked={false} onChange={onChange} ariaLabel="Toggle" />);
    const button = screen.getByRole('switch');

    button.focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalled();
  });
});
