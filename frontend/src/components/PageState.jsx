import Icon from './Icon';

export function LoadingState({ label = 'Се вчитува…', compact = false }) {
  return (
    <div className={`state-block ${compact ? 'state-block--compact' : ''}`} role="status" aria-live="polite">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-block state-block--error" role="alert">
      <span className="state-icon"><Icon name="warning" size={27} /></span>
      <h3>Нешто не е во ред</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn--outline btn--small" onClick={onRetry}>Обиди се повторно</button>}
    </div>
  );
}

export function EmptyState({ title = 'Нема пронајдени огласи', text, action }) {
  return (
    <div className="state-block state-block--empty">
      <span className="state-icon state-icon--leaf"><Icon name="leaf" size={30} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
