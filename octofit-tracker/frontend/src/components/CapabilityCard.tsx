type Props<T> = {
  title: string;
  description: string;
  status: 'loading' | 'error' | 'loaded';
  items: T[];
  emptyMessage: string;
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function CapabilityCard<T>({ title, description, status, items, emptyMessage, renderItem }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
        {status === 'loaded' && items.length === 0 && <p>{emptyMessage}</p>}
        {status === 'loaded' && items.length > 0 && (
          <ul className="list-group">
            {items.map((item, index) => <li className="list-group-item" key={index}>{renderItem(item, index)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
