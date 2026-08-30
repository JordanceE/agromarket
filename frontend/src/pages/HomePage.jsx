import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Filters from '../components/Filters';
import Icon from '../components/Icon';
import ListingCard from '../components/ListingCard';
import Pagination from '../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import api, { collectionOf, errorMessage } from '../services/api';
import { categoryIcon, categoryLabel } from '../utils';

const defaults = { search: '', category: '', listing_type: '', min_price: '', max_price: '', sort: 'newest', page: 1 };

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...defaults,
    ...Object.fromEntries(searchParams.entries()),
    page: Number(searchParams.get('page') || 1),
  }));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const firstLoad = useRef(true);
  const requestSequence = useRef(0);

  useEffect(() => {
    api.get('/categories')
      .then((response) => setCategories(collectionOf(response).items))
      .catch(() => setCategories([]));
  }, []);

  const loadListings = async () => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    if (loadedOnce) setRefreshing(true);
    else setInitialLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value != null));
      const response = await api.get('/listings', { params });
      if (requestId !== requestSequence.current) return;
      const collection = collectionOf(response);
      setListings(collection.items);
      setMeta(collection.meta || {});
      setLoadedOnce(true);
    } catch (err) {
      if (requestId !== requestSequence.current) return;
      setError(errorMessage(err, 'Огласите не може да се вчитаат во моментов.'));
    } finally {
      if (requestId === requestSequence.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setFilters((current) => current.search === nextSearch
        ? current
        : { ...current, search: nextSearch, page: 1 });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const urlValues = Object.entries(filters).filter(([key, value]) => value !== '' && value != null && !(key === 'page' && Number(value) === 1) && !(key === 'sort' && value === 'newest'));
    setSearchParams(Object.fromEntries(urlValues), { replace: !firstLoad.current });
    firstLoad.current = false;
    loadListings();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitSearch = (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setFilters((current) => current.search === nextSearch && Number(current.page) === 1
      ? current
      : { ...current, search: nextSearch, page: 1 });
  };

  const reset = () => {
    setFilters(defaults);
    setSearchInput('');
  };

  const total = meta.total ?? listings.length;
  const currentPage = Number(meta.current_page || filters.page || 1);
  const lastPage = Number(meta.last_page || 1);

  return (
    <main>
      <section className="hero">
        <div className="hero__grain" />
        <div className="container hero__content">
          <div className="eyebrow eyebrow--light"><span /> ПАЗАР ОД НИВА ДО ТРПЕЗА</div>
          <h1>Сè за земјоделството,<br /><em>на едно место.</em></h1>
          <p>Купувајте и продавајте машини, земјоделски производи и добиток директно од проверени производители.</p>
          <form className="hero-search" onSubmit={submitSearch} role="search">
            <Icon name="search" size={23} />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Што барате денес? трактор, пченица, грозје…" aria-label="Пребарај огласи" />
            <button className="btn btn--accent" type="submit">Пребарај</button>
          </form>
          <div className="hero__stats">
            <div><strong>{meta.total ?? '100+'}</strong><span>активни огласи</span></div>
            <div><strong>12+</strong><span>категории</span></div>
            <div><strong>24/7</strong><span>директен контакт</span></div>
          </div>
        </div>
        <div className="hero__field" aria-hidden="true">
          <span className="sun" />
          <span className="hill hill--back" />
          <span className="hill hill--front" />
          <Icon name="tractor" size={96} strokeWidth={1.15} />
        </div>
      </section>

      <section className="category-strip">
        <div className="container category-row">
          {categories.slice(0, 6).map((category) => (
            <button key={category.id} className={`category-chip ${String(filters.category) === String(category.id) ? 'is-active' : ''}`} onClick={() => setFilters((current) => ({ ...current, category: String(current.category) === String(category.id) ? '' : category.id, page: 1 }))}>
              <span><Icon name={categoryIcon(category.name)} size={27} /></span>
              <span>{categoryLabel(category.name)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-section">
        <div className="container">
          <div className="section-heading catalog-heading">
            <div>
              <div className="eyebrow"><span /> НАЈНОВО ОД ПАЗАРОТ</div>
              <h2>{filters.search ? `Резултати за „${filters.search}“` : 'Свежи огласи'}</h2>
              <p>{total} {total === 1 ? 'оглас е достапен' : 'огласи се достапни'} во моментов</p>
            </div>
            <button className="btn btn--outline mobile-filter-button" onClick={() => setFiltersOpen(true)}><Icon name="filter" size={18} /> Филтри</button>
          </div>

          <div className="catalog-layout">
            <Filters values={filters} categories={categories} onChange={setFilters} onReset={reset} resultCount={total} open={filtersOpen} onClose={() => setFiltersOpen(false)} />
            {filtersOpen && <button className="filter-backdrop" aria-label="Затвори филтри" onClick={() => setFiltersOpen(false)} />}
            <div className="catalog-results" aria-busy={refreshing}>
              {refreshing && <div className="results-refreshing" role="status" aria-live="polite"><span className="spinner" /> Се освежуваат огласите…</div>}
              {error && loadedOnce && <div className="refresh-error" role="alert"><Icon name="warning" size={17} />{error}<button className="text-button" onClick={loadListings}>Обиди се повторно</button></div>}
              {initialLoading ? <LoadingState label="Ги собираме најдобрите огласи…" /> : error && !loadedOnce ? <ErrorState message={error} onRetry={loadListings} /> : listings.length ? (
                <>
                  <div className="listing-grid">
                    {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                  </div>
                  <Pagination current={currentPage} last={lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} />
                </>
              ) : (
                <EmptyState text="Променете ги филтрите или пребарајте друг поим." action={<button className="btn btn--outline btn--small" onClick={reset}>Прикажи ги сите</button>} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div className="cta-icon"><Icon name="wheat" size={48} /></div>
          <div><span>ИМАТЕ НЕШТО ЗА ПРОДАВАЊЕ?</span><h2>Вашиот следен купувач е тука.</h2></div>
          <Link className="btn btn--cream" to="/oglas/nov">Објави бесплатен оглас <Icon name="arrow" /></Link>
        </div>
      </section>
    </main>
  );
}
