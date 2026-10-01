import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouletteReveal } from './RouletteReveal';

describe('RouletteReveal', () => {
  afterEach(() => vi.useRealTimers());

  it('cycles through candidates before settling on the chosen item', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<RouletteReveal items={['ラーメン', 'カレー', '海鮮']} winnerLabel="海鮮" onComplete={onComplete} />);

    expect(screen.getByRole('status')).toHaveTextContent('抽選中');
    expect(onComplete).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1600); });

    expect(screen.getByText('海鮮')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
