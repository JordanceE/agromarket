import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { ErrorState, LoadingState } from '../components/PageState';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import api, { collectionOf, errorMessage, payloadOf } from '../services/api';
import { categoryLabel, initials, listingTypeLabel, money, shortDate } from '../utils';

const groups = [
  ['machinery', 'Машини'], ['crops', 'Земјоделски култури'], ['livestock', 'Добиток'], ['dairy', 'Млечни производи'], ['supplies', 'Репроматеријали'], ['other', 'Друго'],
];

export default function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({});
  const [usersPage, setUsersPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [listingsMeta, setListingsMeta] = useState({});
  const [listingsPage, setListingsPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', group: 'crops' });
  const [categoryBusy, setCategoryBusy] = useState(false);
  const requestSequence = useRef(0);

  const loadDashboard = async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    const isInitialRequest = !stats;
    if (isInitialRequest) setInitialLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [statsResponse, usersResponse, categoriesResponse, listingsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params: { per_page: 20, page: usersPage, ...(tab === 'users' && debouncedSearch ? { search: debouncedSearch } : {}) } }),
        api.get('/categories'),
        api.get('/admin/listings', { params: { per_page: 20, page: listingsPage, ...(tab === 'listings' && debouncedSearch ? { search: debouncedSearch } : {}) } }),
      ]);
      if (requestId !== requestSequence.current) return;
      setStats(payloadOf(statsResponse));
      const userCollection = collectionOf(usersResponse);
      setUsers(userCollection.items);
      setUsersMeta(userCollection.meta || {});
      setCategories(collectionOf(categoriesResponse).items);
      const listingCollection = collectionOf(listingsResponse);
      setListings(listingCollection.items);
      setListingsMeta(listingCollection.meta || {});
    } catch (err) {
      if (requestId !== requestSequence.current) return;
      setError(errorMessage(err, 'Администраторските податоци не може да се вчитаат.'));
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
      if (tab === 'users') setUsersPage(1);
      if (tab === 'listings') setListingsPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, tab]);

  useEffect(() => { loadDashboard(); }, [debouncedSearch, listingsPage, tab, usersPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeTab = (value) => {
    setTab(value);
    setSearch('');
    setDebouncedSearch('');
    setUsersPage(1);
    setListingsPage(1);
  };

  const changeRole = async (user, role) => {
    setBusyId(`user-${user.id}`);
    setNotice('');
    try {
      const response = await api.patch(`/admin/users/${user.id}/role`, { role });
      const updated = payloadOf(response);
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, ...updated } : item));
      setNotice(`Улогата на ${user.name} е успешно променета.`);
    } catch (err) {
      setError(errorMessage(err, 'Улогата не може да се промени.'));
    } finally {
      setBusyId(null);
    }
  };

  const toggleListing = async (listing) => {
    const status = listing.status === 'active' ? 'inactive' : 'active';
    setBusyId(`listing-${listing.id}`);
    try {
      const response = await api.patch(`/admin/listings/${listing.id}`, { status });
      const updated = payloadOf(response);
      setListings((items) => items.map((item) => item.id === listing.id ? { ...item, ...updated } : item));
      setNotice(`Огласот е означен како ${status === 'active' ? 'активен' : 'неактивен'}.`);
    } catch (err) {
      setError(errorMessage(err, 'Статусот не може да се промени.'));
    } finally {
      setBusyId(null);
    }
  };

  const createCategory = async (event) => {
    event.preventDefault();
    setCategoryBusy(true);
    setError('');
    try {
      const response = await api.post('/admin/categories', categoryForm);
      const category = payloadOf(response);
      setCategories((items) => [...items, category]);
      setCategoryForm({ name: '', group: 'crops' });
      setNotice('Новата категорија е додадена.');
    } catch (err) {
      setError(errorMessage(err, 'Категоријата не може да се додаде.'));
    } finally {
      setCategoryBusy(false);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setBusyId(`${target.kind}-${target.item.id}`);
    try {
      await api.delete(`/admin/${target.kind === 'listing' ? 'listings' : 'categories'}/${target.item.id}`);
      if (target.kind === 'listing') {
        if (listings.length === 1 && listingsPage > 1) setListingsPage((current) => current - 1);
        else await loadDashboard();
      }
      else setCategories((items) => items.filter((item) => item.id !== target.item.id));
      setNotice(target.kind === 'listing' ? 'Огласот е отстранет.' : 'Категоријата е отстранета.');
      setDeleteTarget(null);
    } catch (err) {
      setError(errorMessage(err, 'Записот не може да се избрише.'));
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  };

  if (initialLoading && !stats) return <main className="page-shell"><LoadingState label="Се подготвува контролната табла…" /></main>;
  if (error && !stats) return <main className="page-shell"><ErrorState message={error} onRetry={loadDashboard} /></main>;

  return (
    <main className="admin-page">
      <div className="admin-header"><div className="container"><div><span className="profile-kicker">АДМИНИСТРАЦИЈА</span><h1>Контролна табла</h1><p>Преглед и управување со АгроМаркет.</p></div><div className="admin-badge"><Icon name="shield" /><span>Најавен како<strong>{currentUser?.name}</strong></span></div></div></div>
      <div className="container admin-layout" aria-busy={refreshing}>
        <nav className="admin-tabs" aria-label="Администраторски делови">{[
          ['overview', 'grid', 'Преглед'], ['users', 'users', 'Корисници'], ['listings', 'tag', 'Огласи'], ['categories', 'leaf', 'Категории'],
        ].map(([value, icon, label]) => <button key={value} className={tab === value ? 'is-active' : ''} onClick={() => changeTab(value)}><Icon name={icon} size={18} />{label}</button>)}</nav>

        {refreshing && <div className="admin-refreshing" role="status" aria-live="polite"><span className="spinner" /> Се освежуваат резултатите…</div>}

        {notice && <div className="notice-banner"><Icon name="check" size={18} />{notice}<button onClick={() => setNotice('')} aria-label="Затвори"><Icon name="close" size={16} /></button></div>}
        {error && <div className="form-alert" role="alert"><Icon name="warning" size={18} />{error}<button onClick={() => setError('')} aria-label="Затвори"><Icon name="close" size={15} /></button></div>}

        {tab === 'overview' && <section className="admin-section">
          <div className="section-heading"><div><div className="eyebrow"><span /> ДЕНЕШНА СОСТОЈБА</div><h2>Преглед на платформата</h2></div></div>
          <div className="admin-stat-grid">
            <div className="admin-stat admin-stat--green"><span><Icon name="users" /></span><div><small>Корисници</small><strong>{stats?.users?.total || 0}</strong><em>{stats?.users?.admins || 0} администратори</em></div></div>
            <div className="admin-stat admin-stat--gold"><span><Icon name="tag" /></span><div><small>Сите огласи</small><strong>{stats?.listings?.total || 0}</strong><em>{stats?.listings?.active || 0} активни</em></div></div>
            <div className="admin-stat admin-stat--blue"><span><Icon name="leaf" /></span><div><small>Категории</small><strong>{stats?.categories || 0}</strong><em>организирана понуда</em></div></div>
            <div className="admin-stat admin-stat--orange"><span><Icon name="star" /></span><div><small>Оценки</small><strong>{stats?.ratings?.total || 0}</strong><em>просек {Number(stats?.ratings?.average || 0).toFixed(1)}</em></div></div>
          </div>
          <div className="admin-overview-grid">
            <section className="panel admin-overview-card"><div className="panel-title"><h2>Огласи по статус</h2><button className="text-button" onClick={() => changeTab('listings')}>Управувај</button></div><div className="status-bars"><div><span><i className="dot dot--active" />Активни</span><strong>{stats?.listings?.active || 0}</strong></div><div><span><i className="dot dot--inactive" />Неактивни</span><strong>{stats?.listings?.inactive || 0}</strong></div><div><span><i className="dot dot--sell" />Се продава</span><strong>{stats?.listings?.selling || 0}</strong></div><div><span><i className="dot dot--buy" />Се бара</span><strong>{stats?.listings?.buying || 0}</strong></div></div></section>
            <section className="panel admin-overview-card"><div className="panel-title"><h2>Последни огласи</h2><button className="text-button" onClick={() => changeTab('listings')}>Види ги сите</button></div><div className="recent-list">{listings.slice(0, 4).map((listing) => <Link key={listing.id} to={`/oglasi/${listing.id}`}><span className="recent-list__icon"><Icon name="leaf" /></span><span><strong>{listing.title}</strong><small>{listing.seller?.name} · {shortDate(listing.created_at)}</small></span><b>{money(listing.price)}</b></Link>)}</div></section>
          </div>
        </section>}

        {tab === 'users' && <section className="admin-section panel admin-table-panel">
          <div className="admin-table-head"><div><h2>Корисници</h2><p>{usersMeta.total ?? users.length} регистрирани профили</p></div><div className="input-with-icon input-with-icon--small"><Icon name="search" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Име или е-пошта…" aria-label="Пребарај корисници" /></div></div>
          <div className="table-scroll"><table><thead><tr><th>Корисник</th><th>Локација</th><th>Огласи</th><th>Оценка</th><th>Улога</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="table-user"><span className="avatar avatar--small">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.location || '—'}</td><td>{(user.active_listings_count || 0) + (user.inactive_listings_count || 0)}</td><td><StarRating value={user.average_rating || 0} readonly size={14} /></td><td><select className="role-select" value={user.role} disabled={busyId === `user-${user.id}` || user.id === currentUser?.id} onChange={(e) => changeRole(user, e.target.value)}><option value="user">Корисник</option><option value="admin">Администратор</option></select></td></tr>)}</tbody></table></div>
          <Pagination current={Number(usersMeta.current_page || usersPage)} last={Number(usersMeta.last_page || 1)} onChange={setUsersPage} />
        </section>}

        {tab === 'listings' && <section className="admin-section panel admin-table-panel">
          <div className="admin-table-head"><div><h2>Сите огласи</h2><p>{listingsMeta.total ?? listings.length} записи</p></div><div className="input-with-icon input-with-icon--small"><Icon name="search" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Наслов или огласувач…" aria-label="Пребарај огласи" /></div></div>
          <div className="table-scroll"><table><thead><tr><th>Оглас</th><th>Огласувач</th><th>Тип</th><th>Цена</th><th>Статус</th><th aria-label="Акции" /></tr></thead><tbody>{listings.map((listing) => <tr key={listing.id}><td><Link className="table-listing" to={`/oglasi/${listing.id}`}><strong>{listing.title}</strong><small>{categoryLabel(listing.category?.name)}</small></Link></td><td>{listing.seller?.name || '—'}</td><td>{listingTypeLabel(listing.listing_type)}</td><td>{money(listing.price)}</td><td><button className={`status-pill status-pill--${listing.status}`} disabled={busyId === `listing-${listing.id}`} onClick={() => toggleListing(listing)}>{listing.status === 'active' ? 'Активен' : 'Неактивен'}</button></td><td><button className="icon-button table-delete" onClick={() => setDeleteTarget({ kind: 'listing', item: listing })} aria-label={`Избриши ${listing.title}`}><Icon name="trash" size={17} /></button></td></tr>)}</tbody></table></div>
          <Pagination current={Number(listingsMeta.current_page || listingsPage)} last={Number(listingsMeta.last_page || 1)} onChange={setListingsPage} />
        </section>}

        {tab === 'categories' && <section className="admin-section admin-categories-grid">
          <form className="panel category-form" onSubmit={createCategory}><span className="form-icon"><Icon name="plus" /></span><h2>Нова категорија</h2><p>Додајте нов тип производ во каталогот.</p><div className="field"><label htmlFor="category-name">Име</label><input id="category-name" required minLength="2" maxLength="120" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="пр. Пчеларство" /></div><div className="field"><label htmlFor="category-group">Група</label><select id="category-group" value={categoryForm.group} onChange={(e) => setCategoryForm({ ...categoryForm, group: e.target.value })}>{groups.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><button className="btn btn--primary btn--full" disabled={categoryBusy}>{categoryBusy ? 'Се додава…' : 'Додај категорија'}</button></form>
          <div className="panel category-list-panel"><div className="admin-table-head"><div><h2>Категории</h2><p>{categories.length} категории</p></div></div><div className="category-admin-list">{categories.map((category) => <div key={category.id}><span className="category-admin-icon"><Icon name={category.group === 'machinery' ? 'tractor' : category.group === 'crops' ? 'wheat' : 'leaf'} /></span><span><strong>{categoryLabel(category.name)}</strong><small>{groups.find(([value]) => value === category.group)?.[1] || category.group} · {category.listings_count || 0} огласи</small></span><button className="icon-button table-delete" onClick={() => setDeleteTarget({ kind: 'category', item: category })} aria-label={`Избриши ${category.name}`}><Icon name="trash" size={17} /></button></div>)}</div></div>
        </section>}
      </div>

      <Modal open={Boolean(deleteTarget)} title={deleteTarget?.kind === 'listing' ? 'Да се избрише огласот?' : 'Да се избрише категоријата?'} danger confirmLabel="Да, избриши" busy={Boolean(busyId)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}><p>„{deleteTarget?.item?.title || categoryLabel(deleteTarget?.item?.name)}“ ќе биде трајно отстранет{deleteTarget?.kind === 'category' ? 'а' : ''}. Категорија со постоечки огласи не може да се избрише.</p></Modal>
    </main>
  );
}
