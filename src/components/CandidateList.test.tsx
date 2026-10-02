import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CandidateList } from './CandidateList';

describe('candidate list', () => {
  it('shows the route detour when a candidate came from along-route search', () => {
    render(<CandidateList candidates={[{
      id: 'route-shop',
      name: '道中の店',
      foodIds: ['ramen'],
      locationLabel: '名古屋市',
      travelSummary: '約5分',
      routeDetourMinutes: 3,
      isOpen: true,
      budgetLabel: '2,000円前後',
    }]} excludedIds={[]} selectedIds={['route-shop']} onToggleSelected={() => undefined} />);

    expect(screen.getByText(/寄り道約3分/)).toBeInTheDocument();
  });
});
