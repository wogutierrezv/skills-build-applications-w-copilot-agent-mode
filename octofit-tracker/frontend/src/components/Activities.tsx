import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: Activity[] }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities }) => { if (active) setState({ status: 'loaded', items: activities }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      status={state.status}
      items={state.status === 'loaded' ? state.items : []}
      emptyMessage="No activities yet."
      renderItem={(activity) => `${activity.type} - ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
