import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import ListingCard from '../components/ListingCard';
import Pagination from '../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import StarRating from '../components/StarRating';
import api, { errorMessage, payloadOf } from '../services/api';
import { initials, shortDate } from '../utils';

const groupLabels = { machinery: 'Машини', crops: 'Земјоделски култури', livestock: 'Добиток', dairy: 'Млечни производи', supplies: 'Репроматеријали', other: 'Друго' };

export default function SellerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [groups, setGroups] = useState({});
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/users/${id}`, { params: { page, per_page: 12 } });
      const data = payloadOf(response);
      setProfile(data.user);
      setGroups(data.product_groups || {});
      const listingPayload = data.listings || {};
      setListings(listingPayload.data || []);
      setMeta(listingPayload.meta || {});
    } catch (err) {
      setError(errorMessage(err, 'Корисничкиот профил не е пронајден.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [id, page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <main className="page-shell"><LoadingState label="Го отвораме профилот…" /></main>;
  if (error || !profile) return <main className="page-shell"><ErrorState message={error || 'Профилот не е достапен.'} onRetry={loadProfile} /></main>;

  return (
    <main className="seller-profile-page">
      <section className="seller-cover">
        <div className="seller-cover__pattern" />
        <div className="container seller-cover__inner">
          <Link to="/" className="back-link back-link--light"><Icon name="back" size={18} /> Назад кон огласите</Link>
          <div className="public-profile-card">
            <span className="avatar avatar--xl">{initials(profile.name)}</span>
            <div className="public-profile-card__main"><span className="profile-kicker">ПРОФИЛ НА ОГЛАСУВАЧ</span><h1>{profile.name}</h1><p><Icon name="location" size={16} />{profile.location || 'Македонија'} <span>•</span> член од {shortDate(profile.created_at)}</p></div>
            <div className="public-profile-card__rating"><strong>{Number(profile.average_rating || 0).toFixed(1)}</strong><div><StarRating value={profile.average_rating || 0} readonly size={19} /><span>{profile.ratings_count || 0} оценки</span></div></div>
            {profile.phone && <a className="btn btn--accent" href={`tel:${profile.phone}`}><Icon name="phone" /> Контактирај</a>}
          </div>
        </div>
      </section>

      <div className="container seller-profile-content">
        <aside className="seller-about panel">
          <h2>За огласувачот</h2>
          <p>{profile.bio || 'Овој корисник сè уште нема внесено опис за своето производство.'}</p>
          <div className="seller-about__facts"><div><span>Активни огласи</span><strong>{profile.active_listings_count ?? listings.length}</strong></div><div><span>Просечна оценка</span><strong>{Number(profile.average_rating || 0).toFixed(1)} / 5</strong></div></div>
          {Object.keys(groups).length > 0 && <><h3>Што нуди</h3><div className="product-groups">{Object.entries(groups).map(([group, count]) => <span key={group}><Icon name={group === 'machinery' ? 'tractor' : group === 'crops' ? 'wheat' : 'leaf'} size={17} />{groupLabels[group] || group} <small>{count}</small></span>)}</div></>}
          <div className="verified-note"><Icon name="shield" /><span><strong>Јавен профил</strong>Оценките се од реални корисници.</span></div>
        </aside>
        <section className="seller-listings">
          <div className="section-heading"><div><div className="eyebrow"><span /> ПОНУДА НА ОГЛАСУВАЧОТ</div><h2>Активни огласи</h2><p>{meta.total ?? listings.length} објавени производи</p></div></div>
          {listings.length ? <><div className="listing-grid listing-grid--seller">{listings.map((listing) => <ListingCard listing={listing} key={listing.id} />)}</div><Pagination current={Number(meta.current_page || page)} last={Number(meta.last_page || 1)} onChange={setPage} /></> : <EmptyState title="Нема активни огласи" text="Корисникот во моментов нема производи во понудата." />}
        </section>
      </div>
    </main>
  );
}
