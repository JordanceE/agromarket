import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 22, label = true }) {
  const [hovered, setHovered] = useState(0);
  const activeValue = hovered || value;

  return (
    <div className={`star-rating ${readonly ? 'star-rating--readonly' : ''}`} aria-label={`Оцена ${Number(value).toFixed(1)} од 5`}>
      <div className="star-rating__stars" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= activeValue ? 'star is-active' : 'star'}
            style={{ fontSize: size }}
            disabled={readonly}
            aria-label={`${star} ${star === 1 ? 'ѕвезда' : 'ѕвезди'}`}
            onMouseEnter={() => !readonly && setHovered(star)}
            onFocus={() => !readonly && setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange?.(star)}
          >★</button>
        ))}
      </div>
      {label && <span className="star-rating__value">{Number(value || 0).toFixed(1)}</span>}
    </div>
  );
}
