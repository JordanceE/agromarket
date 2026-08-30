import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { ErrorState, LoadingState } from '../components/PageState';
import api, { collectionOf, errorMessage, payloadOf } from '../services/api';
import { categoryLabel } from '../utils';

const emptyForm = {
  title: '', category_id: '', listing_type: 'sell', price: '', unit: 'piece', location: '', description: '', status: 'active', image_url: '',
};

export default function ListingFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const requests = [api.get('/categories')];
        if (editing) requests.push(api.get(`/my/listings/${id}`));
        const [categoryResponse, listingResponse] = await Promise.all(requests);
        setCategories(collectionOf(categoryResponse).items);
        if (listingResponse) {
          const data = payloadOf(listingResponse);
          const listing = data?.listing ?? data;
          setForm({
            title: listing.title || '',
            category_id: listing.category_id || listing.category?.id || '',
            listing_type: listing.listing_type || listing.type || 'sell',
            price: listing.price ?? '',
            unit: listing.unit || 'piece',
            location: listing.location || '',
            description: listing.description || '',
            status: listing.status || 'active',
            image_url: listing.image_url || '',
          });
        }
      } catch (err) {
        setError(errorMessage(err, 'Формуларот не може да се подготви.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editing, id]);

  const selectedCategory = useMemo(() => categories.find((category) => String(category.id) === String(form.category_id)), [categories, form.category_id]);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      let response;
      if (editing) {
        response = await api.put(`/listings/${id}`, form);
      } else {
        response = await api.post('/listings', form);
      }
      const data = payloadOf(response);
      const saved = data?.listing ?? data;
      navigate(`/oglasi/${saved?.id || id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Огласот не може да се зачува. Проверете ги означените полиња.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="page-shell"><LoadingState label="Го подготвуваме формуларот…" /></main>;
  if (error && editing && !form.title) return <main className="page-shell"><ErrorState message={error} /></main>;

  return (
    <main className="form-page">
      <div className="form-page__header">
        <div className="container"><Link to={editing ? `/oglasi/${id}` : '/profil'} className="back-link back-link--light"><Icon name="back" size={18} /> Назад</Link><div className="eyebrow eyebrow--light"><span /> {editing ? 'УРЕДУВАЊЕ' : 'НОВ ОГЛАС'}</div><h1>{editing ? 'Уредете го огласот' : 'Што сакате да огласите?'}</h1><p>{editing ? 'Направете ги потребните промени и зачувајте.' : 'Пополнете ги деталите за полесно да стигнете до вистинските луѓе.'}</p></div>
      </div>
      <div className="container form-layout">
        <form className="listing-form panel" onSubmit={submit}>
          {error && <div className="form-alert" role="alert"><Icon name="warning" size={18} />{error}</div>}
          <section className="form-section">
            <div className="form-section__number">01</div><div className="form-section__heading"><h2>Основни податоци</h2><p>Кажете ни што продавате или барате.</p></div>
            <div className="form-grid">
              <div className="field field--full"><label htmlFor="listing-title">Наслов на огласот</label><input id="listing-title" name="title" required maxLength="150" value={form.title} onChange={update} placeholder="пр. Трактор IMT 539 во одлична состојба" /><small>{form.title.length}/150</small></div>
              <div className="field"><label htmlFor="listing-category">Категорија</label><select id="listing-category" name="category_id" required value={form.category_id} onChange={update}><option value="">Одберете категорија</option>{categories.map((category) => <option value={category.id} key={category.id}>{categoryLabel(category.name)}</option>)}</select></div>
              <fieldset className="field segmented-field"><legend>Тип на оглас</legend><div className="segmented"><label className={form.listing_type === 'sell' ? 'is-selected' : ''}><input type="radio" name="listing_type" value="sell" checked={form.listing_type === 'sell'} onChange={update} /><span>Се продава</span></label><label className={form.listing_type === 'buy' ? 'is-selected' : ''}><input type="radio" name="listing_type" value="buy" checked={form.listing_type === 'buy'} onChange={update} /><span>Се бара</span></label></div></fieldset>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__number">02</div><div className="form-section__heading"><h2>Цена и локација</h2><p>Јасните информации носат посериозни понуди.</p></div>
            <div className="form-grid form-grid--thirds">
              <div className="field"><label htmlFor="listing-price">Цена (денари)</label><input id="listing-price" name="price" type="number" required min="0" step="any" value={form.price} onChange={update} placeholder="150000" /></div>
              <div className="field"><label htmlFor="listing-unit">Единица</label><select id="listing-unit" name="unit" value={form.unit} onChange={update}><option value="piece">по парче</option><option value="kg">по килограм</option><option value="liter">по литар</option><option value="ton">по тон</option><option value="agreement">по договор</option></select></div>
              <div className="field"><label htmlFor="listing-location">Локација</label><input id="listing-location" name="location" required value={form.location} onChange={update} placeholder="Струмица" /></div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__number">03</div><div className="form-section__heading"><h2>Опис и фотографија</h2><p>Наведете состојба, количина и други важни детали.</p></div>
            <div className="field"><label htmlFor="listing-description">Детален опис</label><textarea id="listing-description" name="description" required minLength="20" maxLength="3000" rows="7" value={form.description} onChange={update} placeholder="Опишете го производот, состојбата, годината, количината и можностите за испорака…" /><small>{form.description.length}/3000</small></div>
            <div className="field"><label htmlFor="listing-image">Линк до фотографија <span>(незадолжително)</span></label><div className="input-with-icon"><Icon name="image" size={18} /><input id="listing-image" name="image_url" type="url" maxLength="2048" value={form.image_url} onChange={update} placeholder="https://primer.mk/fotografija.jpg" /></div><small>Внесете јавна HTTP(S) адреса до фотографијата.</small>{form.image_url && <div className="image-url-preview"><img key={form.image_url} src={form.image_url} alt="Преглед на внесената фотографија" onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div>}</div>
          </section>

          <section className="form-section form-section--last">
            <div className="form-section__number">04</div><div className="form-section__heading"><h2>Видливост</h2><p>Неактивните огласи остануваат во вашиот профил.</p></div>
            <label className="status-toggle"><input type="checkbox" checked={form.status === 'active'} onChange={(event) => setForm({ ...form, status: event.target.checked ? 'active' : 'inactive' })} /><span className="status-toggle__switch" /><span><strong>{form.status === 'active' ? 'Активен оглас' : 'Неактивен оглас'}</strong><small>{form.status === 'active' ? 'Огласот е видлив во јавниот каталог.' : 'Огласот е сокриен од јавниот каталог.'}</small></span></label>
          </section>

          <div className="form-submit"><Link to={editing ? `/oglasi/${id}` : '/profil'} className="btn btn--ghost">Откажи</Link><button className="btn btn--accent btn--large" disabled={busy}>{busy ? <><span className="spinner spinner--button" /> Се зачувува…</> : <>{editing ? 'Зачувај промени' : 'Објави оглас'} <Icon name="arrow" /></>}</button></div>
        </form>

        <aside className="form-tips panel">
          <span className="form-tips__icon"><Icon name="leaf" size={29} /></span><h2>Совет за добар оглас</h2><ul><li><Icon name="check" />Користете јасен и конкретен наслов.</li><li><Icon name="check" />Напишете реална цена и точна локација.</li><li><Icon name="check" />Опишете ја состојбата без премолчување.</li><li><Icon name="check" />Додајте светла, јасна фотографија.</li></ul>
          {selectedCategory && <div className="selected-category"><span>Избрана категорија</span><strong>{categoryLabel(selectedCategory.name)}</strong></div>}
        </aside>
      </div>
    </main>
  );
}
