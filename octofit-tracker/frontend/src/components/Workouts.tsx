import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; reason: string };

export default function Workouts() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: WorkoutSuggestion[] }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>('/api/workouts/suggestions/mona@example.com')
      .then(({ suggestions }) => { if (active) setState({ status: 'loaded', items: suggestions }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      status={state.status}
      items={state.status === 'loaded' ? state.items : []}
      emptyMessage="No workout suggestions yet."
      renderItem={(workout) => `${workout.title} - ${workout.reason}`}
    />
  );
}
