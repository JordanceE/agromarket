export const money = (value) =>
  new Intl.NumberFormat('mk-MK', {
    style: 'currency',
    currency: 'MKD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const shortDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('mk-MK', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

export const imageUrl = (listing) => {
  const value = listing?.image_url || listing?.image || listing?.photo_url || listing?.photos?.[0]?.url;
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const origin = apiUrl.startsWith('http') ? new URL(apiUrl).origin : '';
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
};

export const listingTypeLabel = (type) => (type === 'buy' ? 'Се бара' : 'Се продава');
export const statusLabel = (status) => (status === 'inactive' ? 'Неактивен' : 'Активен');

export const initials = (name = 'Корисник') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const categoryIcon = (name = '') => {
  const normalized = name.toLowerCase();
  if (/трактор|комбајн|машин|tractor|combine|equipment/.test(normalized)) return 'tractor';
  if (/млек|добиток|живот|milk|cattle|livestock/.test(normalized)) return 'cow';
  if (/овош|гроз|бадем|grape|almond|fruit/.test(normalized)) return 'grape';
  if (/жито|пчениц|пченк|култур|wheat|corn|crop/.test(normalized)) return 'wheat';
  return 'leaf';
};

const categoryTranslations = {
  tractors: 'Трактори',
  combines: 'Комбајни',
  'farm equipment': 'Земјоделска опрема',
  wheat: 'Пченица',
  corn: 'Пченка',
  grapes: 'Грозје',
  almonds: 'Бадеми',
  cattle: 'Добиток',
  milk: 'Млеко',
  seeds: 'Семиња',
  fertilizers: 'Ѓубрива',
};

export const categoryLabel = (name = 'Друго') => categoryTranslations[name.toLowerCase()] || name;

export const unitLabel = (unit = '') => ({
  piece: 'парче', kg: 'кг', liter: 'литар', tonne: 'тон', ton: 'тон', agreement: 'договор',
}[unit.toLowerCase()] || unit);
