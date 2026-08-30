import { useEffect, useRef } from 'react';
import Icon from './Icon';

export default function Modal({ open, title, children, confirmLabel = 'Потврди', cancelLabel = 'Откажи', danger = false, busy = false, onConfirm, onClose }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const closeOnEscape = (event) => event.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('modal-open');
    };
  }, [open, busy, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal__close icon-button" onClick={onClose} aria-label="Затвори" disabled={busy}><Icon name="close" /></button>
        <span className={`modal__symbol ${danger ? 'modal__symbol--danger' : ''}`}><Icon name={danger ? 'trash' : 'check'} size={28} /></span>
        <h2 id="modal-title">{title}</h2>
        <div className="modal__content">{children}</div>
        <div className="modal__actions">
          <button ref={cancelRef} className="btn btn--ghost" onClick={onClose} disabled={busy}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Почекајте…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
