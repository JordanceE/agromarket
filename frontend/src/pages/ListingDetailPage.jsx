import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { ErrorState, LoadingState } from '../components/PageState';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage, payloadOf } from '../services/api';
import { categoryLabel, imageUrl, initials, listingTypeLabel, money, shortDate, statusLabel, unitLabel } from '../utils';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingNotice, setRatingNotice] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadListing = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      try {
        response = await api.get(`/listings/${id}`);
      } catch (publicError) {
        if (!localStorage.getItem('agromarket_token')) throw publicError;
        response = await api.get(`/my/listings/${id}`);
      }
      const data = payloadOf(response);
      setListing(data?.listing ?? data);
    } catch (err) {
      setError(errorMessage(err, 'Огласот не е пронајден или повеќе не е достапен.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListing(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <main className="page-shell"><LoadingState label="Го отвораме огласот…" /></main>;
  if (error || !listing) return <main className="page-shell"><ErrorState message={error || 'Огласот не постои.'} onRetry={loadListing} /></main>;

  const seller = listing.user || listing.seller || {};
  const owner = user && String(user.id) === String(seller.id || listing.user_id);
  const ratings = listing.ratings || listing.reviews || [];
  const average = listing.average_rating ?? listing.rating_average ?? (ratings.length ? ratings.reduce((sum, item) => sum + Number(item.rating || item.score), 0) / ratings.length : 0);
  const photo = imageUrl(listing);

  const submitRating = async (event) => {
    event.preventDefault();
    setRatingNotice('');
    if (!rating) return setRatingNotice('Одберете оценка од 1 до 5 ѕвезди.');
    setRatingBusy(true);
    try {
      await api.post(`/listings/${id}/ratings`, { score: rating, comment });
      setRating(0);
      setComment('');
      setRatingNotice('Ви благодариме! Вашата оценка е објавена.');
      await loadListing();
    } catch (err) {
      setRatingNotice(errorMessage(err, 'Оценката не може да се зачува.'));
    } finally {
      setRatingBusy(false);
    }
  };

  const deleteListing = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/profil', { replace: true, state: { notice: 'Огласот е успешно избришан.' } });
    } catch (err) {
      setRatingNotice(errorMessage(err, 'Огласот не може да се избрише.'));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <main className="detail-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Патека"><Link to="/">Огласи</Link><Icon name="chevron" size={14} /><span>{categoryLabel(listing.category?.name || 'Категорија')}</span><Icon name="chevron" size={14} /><span>{listing.title}</span></nav>
        <Link to="/" className="back-link"><Icon name="back" size={18} /> Назад кон огласите</Link>

        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-photo">
              {photo ? <img src={photo} alt={listing.title} /> : <div className="image-placeholder image-placeholder--large"><Icon name="leaf" size={72} /><span>Нема приложена фотографија</span></div>}
              <span className={`listing-type listing-type--${listing.listing_type || listing.type || 'sell'}`}>{listingTypeLabel(listing.listing_type || listing.type)}</span>
              {listing.status === 'inactive' && <span className="detail-inactive"><Icon name="warning" size={17} /> Овој оглас е неактивен</span>}
            </div>

            <section className="detail-info panel">
              <div className="detail-info__top">
                <div><span className="detail-category">{categoryLabel(listing.category?.name || listing.category_name)}</span><h1>{listing.title}</h1></div>
                <p className="detail-price">{money(listing.price)}{listing.unit && <small>/ {unitLabel(listing.unit)}</small>}</p>
              </div>
              <div className="detail-meta"><span><Icon name="location" size={17} />{listing.location || seller.location || 'Македонија'}</span><span><Icon name="calendar" size={17} />Објавено {shortDate(listing.created_at)}</span><span><Icon name="eye" size={17} />{listing.views_count || 0} прегледи</span></div>
              <hr />
              <h2>Опис на огласот</h2>
              <p className="detail-description">{listing.description}</p>
              <div className="detail-facts">
                <div><span>Категорија</span><strong>{categoryLabel(listing.category?.name || listing.category_name)}</strong></div>
                <div><span>Тип</span><strong>{listingTypeLabel(listing.listing_type || listing.type)}</strong></div>
                <div><span>Статус</span><strong className={listing.status === 'inactive' ? 'text-muted' : 'text-success'}>{statusLabel(listing.status)}</strong></div>
              </div>
              {owner && <div className="owner-detail-actions"><Link className="btn btn--primary" to={`/oglasi/${id}/uredi`}><Icon name="edit" /> Уреди оглас</Link><button className="btn btn--danger-ghost" onClick={() => setDeleteOpen(true)}><Icon name="trash" /> Избриши</button></div>}
            </section>

            <section className="reviews panel">
              <div className="panel-title"><div><div className="eyebrow"><span /> ИСКУСТВА ОД КУПУВАЧИ</div><h2>Оценки за производот</h2></div><div className="rating-summary"><strong>{Number(average).toFixed(1)}</strong><div><StarRating value={average} readonly size={20} /><span>{ratings.length} {ratings.length === 1 ? 'оценка' : 'оценки'}</span></div></div></div>
              {ratings.length > 0 && <div className="review-list">{ratings.slice(0, 5).map((review) => <article className="review" key={review.id}><span className="avatar avatar--small">{initials(review.reviewer?.name)}</span><div><div className="review__top"><strong>{review.reviewer?.name || 'Корисник'}</strong><StarRating value={review.score} readonly size={15} label={false} /></div>{review.comment && <p>{review.comment}</p>}<small>{shortDate(review.created_at)}</small></div></article>)}</div>}

              {!owner && (user ? (
                <form className="rating-form" onSubmit={submitRating}>
                  <h3>Оценете го овој производ</h3>
                  <p>Вашето искуство им помага на другите земјоделци.</p>
                  <StarRating value={rating} onChange={setRating} size={29} label={false} />
                  <label htmlFor="rating-comment">Коментар <span>(незадолжително)</span></label>
                  <textarea id="rating-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength="1000" rows="4" placeholder="Споделете го вашето искуство…" />
                  {ratingNotice && <p className={ratingNotice.startsWith('Ви благодариме') ? 'form-success' : 'form-error'}>{ratingNotice}</p>}
                  <button className="btn btn--primary" disabled={ratingBusy}>{ratingBusy ? 'Се објавува…' : 'Објави оценка'}</button>
                </form>
              ) : <div className="login-prompt"><Icon name="star" /><p><Link to="/najava" state={{ from: { pathname: `/oglasi/${id}` } }}>Најавете се</Link> за да оставите оценка.</p></div>)}
            </section>
          </div>

          <aside className="seller-panel panel">
            <div className="seller-panel__label">ОГЛАСУВАЧ</div>
            <div className="seller-panel__identity"><span className="avatar avatar--large">{initials(seller.name)}</span><div><h2>{seller.name || 'Корисник'}</h2><p><Icon name="location" size={15} />{seller.location || listing.location || 'Македонија'}</p></div></div>
            <div className="seller-reputation"><StarRating value={seller.average_rating ?? seller.rating ?? average} readonly size={19} /><span>оценка на огласите</span></div>
            {!owner && listing.status !== 'inactive' && <div className="contact-actions">
              {(seller.phone || listing.contact_phone) && <a className="btn btn--accent btn--full" href={`tel:${seller.phone || listing.contact_phone}`}><Icon name="phone" /> Јави се</a>}
              {seller.email && <a className="btn btn--outline btn--full" href={`mailto:${seller.email}?subject=${encodeURIComponent(`За оглас: ${listing.title}`)}`}><Icon name="mail" /> Испрати е-пошта</a>}
            </div>}
            {seller.id && <Link className="seller-profile-link" to={`/prodavaci/${seller.id}`}>Сите огласи од корисникот <Icon name="arrow" size={17} /></Link>}
            <div className="safety-note"><Icon name="shield" size={21} /><p><strong>Совет за безбедност</strong>Проверете го производот лично пред плаќање.</p></div>
          </aside>
        </div>
      </div>

      <Modal open={deleteOpen} title="Да го избришеме огласот?" danger confirmLabel="Да, избриши" busy={deleting} onClose={() => setDeleteOpen(false)} onConfirm={deleteListing}>
        <p>Огласот „{listing.title}“ ќе биде трајно избришан. Ова дејство не може да се врати.</p>
      </Modal>
    </main>
  );
}
