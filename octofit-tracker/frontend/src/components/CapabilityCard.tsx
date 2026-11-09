import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  collection: string;
  emptyMessage: string;
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  endpoint,
  collection,
  emptyMessage,
  renderItem,
}: Props<T>) {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: T[] }>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<Record<string, T[]>>(endpoint)
      .then((response) => {
        const items = response[collection];
        if (!Array.isArray(items)) throw new Error(`Invalid ${collection} response`);
        if (active) setState({ status: 'loaded', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [collection, endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
        {state.status === 'loaded' && state.items.length === 0 && <p>{emptyMessage}</p>}
        {state.status === 'loaded' && state.items.length > 0 && (
          <ul className="list-group">
            {state.items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item, index)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
