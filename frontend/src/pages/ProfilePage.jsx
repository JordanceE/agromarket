import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import ListingCard from '../components/ListingCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import api, { collectionOf, errorMessage } from '../services/api';
import { initials } from '../utils';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice || '');
  const requestSequence = useRef(0);

  const loadListings = async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    if (loadedOnce) setRefreshing(true);
    else setInitialLoading(true);
    setError('');
    try {
      const response = await api.get('/my/listings', {
        params: {
          per_page: 12,
          page,
          ...(status !== 'all' ? { status } : {}),
          ...(type !== 'all' ? { listing_type: type } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        },
      });
      if (requestId !== requestSequence.current) return;
      const collection = collectionOf(response);
      setListings(collection.items);
      setMeta(collection.meta || {});
      setLoadedOnce(true);
    } catch (err) {
      if (requestId !== requestSequence.current) return;
      setError(errorMessage(err, 'Вашите огласи не може да се вчитаат.'));
    } finally {
      if (requestId === requestSequence.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => { loadListings(); }, [debouncedSearch, page, status, type]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { refreshUser(); }, [refreshUser]);

  const active = Number(user?.active_listings_count || 0);
  const inactive = Number(user?.inactive_listings_count || 0);
  const total = active + inactive;

  const deleteListing = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${deleteTarget.id}`);
      await refreshUser();
      if (listings.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadListings();
      setNotice('Огласот е успешно избришан.');
      setDeleteTarget(null);
    } catch (err) {
      setError(errorMessage(err, 'Огласот не може да се избрише.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container profile-hero__inner">
          <div className="profile-identity"><span className="avatar avatar--xl">{initials(user?.name)}</span><div><span className="profile-kicker">МОЈ ПРОФИЛ</span><h1>{user?.name}</h1><p><Icon name="location" size={16} />{user?.location || 'Македонија'} <span>•</span> Член на АгроМаркет</p></div></div>
          <div className="profile-rating"><StarRating value={user?.average_rating ?? user?.rating ?? 0} readonly size={21} /><span>просечна оценка</span></div>
          <Link to="/oglas/nov" className="btn btn--accent btn--large"><Icon name="plus" /> Нов оглас</Link>
        </div>
      </section>
      <div className="container profile-content">
        {notice && <div className="notice-banner"><Icon name="check" size={18} />{notice}<button onClick={() => setNotice('')} aria-label="Затвори"><Icon name="close" size={16} /></button></div>}
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-card__icon"><Icon name="grid" /></span><div><strong>{total}</strong><span>Вкупно огласи</span></div></div>
          <div className="stat-card stat-card--active"><span className="stat-card__icon"><Icon name="check" /></span><div><strong>{active}</strong><span>Активни</span></div></div>
          <div className="stat-card stat-card--muted"><span className="stat-card__icon"><Icon name="eye" /></span><div><strong>{inactive}</strong><span>Неактивни</span></div></div>
        </div>

        <section className="my-listings">
          <div className="section-heading"><div><div className="eyebrow"><span /> ВАША ПОНУДА</div><h2>Мои огласи</h2></div></div>
          <div className="profile-filters">
            <div className="tabs" role="tablist" aria-label="Статус на огласи">{[['all', `Сите (${total})`], ['active', `Активни (${active})`], ['inactive', `Неактивни (${inactive})`]].map(([value, label]) => <button key={value} role="tab" aria-selected={status === value} className={status === value ? 'is-active' : ''} onClick={() => { setStatus(value); setPage(1); }}>{label}</button>)}</div>
            <div className="profile-filter-controls"><div className="input-with-icon input-with-icon--small"><Icon name="search" size={17} /><input aria-label="Пребарај мои огласи" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пребарај…" /></div><select aria-label="Филтрирај по тип" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}><option value="all">Сите типови</option><option value="sell">Се продава</option><option value="buy">Се бара</option></select></div>
          </div>

          <div className="profile-results" aria-busy={refreshing}>
            {refreshing && <div className="results-refreshing" role="status" aria-live="polite"><span className="spinner" /> Се освежуваат вашите огласи…</div>}
            {error && loadedOnce && <div className="refresh-error" role="alert"><Icon name="warning" size={17} />{error}<button className="text-button" onClick={loadListings}>Обиди се повторно</button></div>}
            {initialLoading ? <LoadingState /> : error && !loadedOnce ? <ErrorState message={error} onRetry={loadListings} /> : listings.length ? <><div className="listing-grid listing-grid--profile">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} ownerMode onDelete={setDeleteTarget} />)}</div><Pagination current={Number(meta.current_page || page)} last={Number(meta.last_page || 1)} onChange={setPage} /></> : <EmptyState title="Нема огласи во овој приказ" text={total ? 'Променете ги филтрите за да видите други огласи.' : 'Објавете го вашиот прв производ или машина.'} action={!total && <Link className="btn btn--accent" to="/oglas/nov"><Icon name="plus" /> Објави оглас</Link>} />}
          </div>
        </section>
      </div>

      <Modal open={Boolean(deleteTarget)} title="Да го избришеме огласот?" danger confirmLabel="Да, избриши" busy={deleting} onClose={() => setDeleteTarget(null)} onConfirm={deleteListing}>
        <p>Огласот „{deleteTarget?.title}“ ќе биде трајно отстранет.</p>
      </Modal>
    </main>
  );
}
