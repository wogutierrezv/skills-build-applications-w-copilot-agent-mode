import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: Team[] }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams }) => { if (active) setState({ status: 'loaded', items: teams }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      status={state.status}
      items={state.status === 'loaded' ? state.items : []}
      emptyMessage="No teams yet."
      renderItem={(team) => `${team.name} - ${team.members.length} members`}
    />
  );
}
