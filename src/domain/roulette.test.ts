import { describe, expect, it } from 'vitest';
import { drawOne, RouletteError } from './roulette';

describe('drawOne', () => {
  it('draws equal candidates using equal intervals', () => {
    const result = drawOne([{ id: 'ramen' }, { id: 'sushi' }, { id: 'yakiniku' }], () => 0.34);
    expect(result.id).toBe('sushi');
  });

  it('uses only explicit weights when supplied', () => {
    const result = drawOne([{ id: 'small', weight: 1 }, { id: 'large', weight: 3 }], () => 0.5);
    expect(result.id).toBe('large');
  });

  it('rejects empty and non-positive weighted inputs', () => {
    expect(() => drawOne([])).toThrow(RouletteError);
    expect(() => drawOne([{ id: 'bad', weight: 0 }])).toThrow(RouletteError);
  });
});
