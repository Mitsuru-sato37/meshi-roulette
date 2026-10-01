import { useEffect, useMemo, useState } from 'react';

export type RouletteRevealConfig = {
  items: string[];
  winnerLabel: string;
};

type RouletteRevealProps = RouletteRevealConfig & { onComplete: () => void };

export function RouletteReveal({ items, winnerLabel, onComplete }: RouletteRevealProps) {
  const rollingItems = useMemo(() => {
    const candidates = items.filter((item) => item !== winnerLabel);
    return candidates.length > 0 ? candidates : ['…'];
  }, [items, winnerLabel]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayLabel, setDisplayLabel] = useState(rollingItems[0]);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(() => reducedSteps(items.length));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const steps = reducedMotion ? 1 : Math.max(12, Math.min(18, items.length * 2 + 6));
    let step = 0;
    setTotalSteps(steps);
    setDisplayIndex(0);
    setDisplayLabel(rollingItems[0]);
    setStep(0);
    setCompleted(false);
    const timer = window.setInterval(() => {
      step += 1;
      if (step >= steps) {
        setDisplayLabel(winnerLabel);
        setStep(steps);
        setCompleted(true);
        window.clearInterval(timer);
        onComplete();
        return;
      }
      const nextIndex = step % rollingItems.length;
      setDisplayIndex(nextIndex);
      setStep(step);
      setDisplayLabel(rollingItems[nextIndex]);
    }, reducedMotion ? 40 : 82);
    return () => window.clearInterval(timer);
  }, [onComplete, rollingItems, winnerLabel, items.length]);

  const previousLabel = rollingItems[(displayIndex - 1 + rollingItems.length) % rollingItems.length];
  const nextLabel = rollingItems[(displayIndex + 1) % rollingItems.length];
  const progress = Math.round(Math.min(step / totalSteps, 1) * 100);

  return (
    <div className={`roulette-reveal${completed ? ' roulette-reveal--complete' : ''}`} role="status" aria-live="polite">
      <div className="roulette-reveal__meta">
        <span className="roulette-reveal__eyebrow">抽選中</span>
        <span className="roulette-reveal__count">{String(Math.min(step + 1, totalSteps)).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}</span>
      </div>
      <div className="roulette-reveal__slot-window" aria-label={`抽選候補 ${displayLabel}`}>
        <span className="roulette-reveal__slot-row roulette-reveal__slot-row--previous" aria-hidden="true">{completed ? '・' : previousLabel}</span>
        <span key={`${step}-${displayLabel}`} className="roulette-reveal__label">{displayLabel}</span>
        <span className="roulette-reveal__slot-row roulette-reveal__slot-row--next" aria-hidden="true">{completed ? '・' : nextLabel}</span>
        <span className="roulette-reveal__marker" aria-hidden="true">◆</span>
      </div>
      <div className="roulette-reveal__track" role="progressbar" aria-label="抽選の進行状況" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <span className="roulette-reveal__hint">候補をめくっています</span>
    </div>
  );
}

function reducedSteps(itemCount: number) {
  return Math.max(12, Math.min(18, itemCount * 2 + 6));
}
