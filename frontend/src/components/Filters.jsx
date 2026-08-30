import Icon from './Icon';
import { categoryLabel } from '../utils';

export default function Filters({ values, categories, onChange, onReset, resultCount, open, onClose }) {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value, page: 1 });

  return (
    <aside className={`filters-panel ${open ? 'is-open' : ''}`} aria-label="Филтри за огласи">
      <div className="filters-panel__head">
        <div><Icon name="filter" size={19} /><h2>Филтри</h2></div>
        <button className="icon-button filters-close" onClick={onClose} aria-label="Затвори филтри"><Icon name="close" /></button>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-category">Категорија</label>
        <select id="filter-category" value={values.category || ''} onChange={set('category')}>
          <option value="">Сите категории</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{categoryLabel(category.name)}</option>)}
        </select>
      </div>

      <fieldset className="filter-group filter-radio">
        <legend>Тип на оглас</legend>
        {[
          ['', 'Сите огласи'],
          ['sell', 'Се продава'],
          ['buy', 'Се бара'],
        ].map(([value, label]) => (
          <label key={value || 'all'}>
            <input type="radio" name="listing_type" value={value} checked={(values.listing_type || '') === value} onChange={set('listing_type')} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <div className="filter-group">
        <label>Цена (денари)</label>
        <div className="price-range">
          <input aria-label="Минимална цена" type="number" min="0" placeholder="Од" value={values.min_price || ''} onChange={set('min_price')} />
          <span>—</span>
          <input aria-label="Максимална цена" type="number" min="0" placeholder="До" value={values.max_price || ''} onChange={set('max_price')} />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Подреди</label>
        <select id="filter-sort" value={values.sort || 'newest'} onChange={set('sort')}>
          <option value="newest">Најнови прво</option>
          <option value="price_asc">Цена: ниска кон висока</option>
          <option value="price_desc">Цена: висока кон ниска</option>
        </select>
      </div>

      <div className="filters-panel__bottom">
        <span>{resultCount != null ? `${resultCount} резултати` : ''}</span>
        <button className="text-button" onClick={onReset}>Исчисти ги филтрите</button>
      </div>
    </aside>
  );
}
