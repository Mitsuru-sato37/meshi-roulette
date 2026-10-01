import { useEffect, useState } from 'react';

export type RouletteRevealConfig = {
  items: string[];
  winnerLabel: string;
};

type RouletteRevealProps = RouletteRevealConfig & { onComplete: () => void };

export function RouletteReveal({ items, winnerLabel, onComplete }: RouletteRevealProps) {
  const [displayLabel, setDisplayLabel] = useState(items[0] ?? winnerLabel);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const steps = reducedMotion ? 1 : Math.max(10, Math.min(18, items.length * 3));
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= steps) {
        setDisplayLabel(winnerLabel);
        window.clearInterval(timer);
        onComplete();
        return;
      }
      setDisplayLabel(items[step % items.length] ?? winnerLabel);
    }, reducedMotion ? 40 : 82);
    return () => window.clearInterval(timer);
  }, [items, winnerLabel, onComplete]);

  return (
    <div className="roulette-reveal" role="status" aria-live="polite">
      <span className="roulette-reveal__eyebrow">抽選中</span>
      <span className="roulette-reveal__label" aria-label={`抽選候補 ${displayLabel}`}>{displayLabel}</span>
      <span className="roulette-reveal__track" aria-hidden="true"><span /></span>
    </div>
  );
}
