import Icon from './Icon';

export default function Pagination({ current = 1, last = 1, onChange }) {
  if (last <= 1) return null;
  const pages = [];
  const from = Math.max(1, current - 2);
  const to = Math.min(last, current + 2);
  for (let page = from; page <= to; page += 1) pages.push(page);

  return (
    <nav className="pagination" aria-label="Страници">
      <button className="pagination__arrow" disabled={current <= 1} onClick={() => onChange(current - 1)} aria-label="Претходна страница"><Icon name="back" size={18} /></button>
      {from > 1 && <><button onClick={() => onChange(1)}>1</button>{from > 2 && <span>…</span>}</>}
      {pages.map((page) => <button key={page} className={page === current ? 'is-active' : ''} onClick={() => onChange(page)} aria-current={page === current ? 'page' : undefined}>{page}</button>)}
      {to < last && <>{to < last - 1 && <span>…</span>}<button onClick={() => onChange(last)}>{last}</button></>}
      <button className="pagination__arrow" disabled={current >= last} onClick={() => onChange(current + 1)} aria-label="Следна страница"><Icon name="arrow" size={18} /></button>
    </nav>
  );
}
