import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: LeaderboardEntry[] }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then(({ leaderboard }) => { if (active) setState({ status: 'loaded', items: leaderboard }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      status={state.status}
      items={state.status === 'loaded' ? state.items : []}
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => `${entry.rank}. ${entry.teamName} - ${entry.totalPoints} points`}
    />
  );
}
