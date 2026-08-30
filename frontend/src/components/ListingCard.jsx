import { Link } from 'react-router-dom';
import { categoryLabel, imageUrl, listingTypeLabel, money, shortDate, unitLabel } from '../utils';
import Icon from './Icon';
import StarRating from './StarRating';

export default function ListingCard({ listing, ownerMode = false, onDelete }) {
  const image = imageUrl(listing);
  const seller = listing.user || listing.seller || {};
  const rating = listing.average_rating ?? listing.rating_average ?? listing.rating ?? 0;

  return (
    <article className={`listing-card ${listing.status === 'inactive' ? 'listing-card--inactive' : ''}`}>
      <Link to={`/oglasi/${listing.id}`} className="listing-card__image" aria-label={`Отвори: ${listing.title}`}>
        {image ? <img src={image} alt={listing.title} loading="lazy" /> : (
          <div className="image-placeholder"><Icon name="leaf" size={42} /><span>АгроМаркет</span></div>
        )}
        <span className={`listing-type listing-type--${listing.listing_type || listing.type || 'sell'}`}>
          {listingTypeLabel(listing.listing_type || listing.type)}
        </span>
        {listing.status === 'inactive' && <span className="inactive-overlay">Неактивен</span>}
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__meta">
          <span>{categoryLabel(listing.category?.name || listing.category_name)}</span>
          <span>{shortDate(listing.created_at)}</span>
        </div>
        <Link to={`/oglasi/${listing.id}`} className="listing-card__title"><h3>{listing.title}</h3></Link>
        <p className="listing-card__price">{money(listing.price)}{listing.unit && <small> / {unitLabel(listing.unit)}</small>}</p>
        <div className="listing-card__location"><Icon name="location" size={16} /><span>{listing.location || 'Македонија'}</span></div>
        <div className="listing-card__footer">
          {!ownerMode ? (
            <>
              <Link className="seller-link" to={seller.id ? `/prodavaci/${seller.id}` : '#'}>{seller.name || 'Корисник'}</Link>
              <StarRating value={rating} readonly size={16} />
            </>
          ) : (
            <div className="card-actions">
              <Link to={`/oglasi/${listing.id}/uredi`} className="btn btn--soft btn--small"><Icon name="edit" size={16} /> Уреди</Link>
              <button className="btn btn--danger-ghost btn--small" onClick={() => onDelete?.(listing)}><Icon name="trash" size={16} /> Избриши</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
