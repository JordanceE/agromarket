import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agromarket_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('agromarket_token')) {
      localStorage.removeItem('agromarket_token');
      window.dispatchEvent(new Event('agromarket:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function payloadOf(response) {
  const body = response?.data ?? response;
  return body?.data ?? body;
}

export function collectionOf(response) {
  const body = response?.data ?? response ?? {};
  if (Array.isArray(body)) return { items: body, meta: {} };
  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      meta: body.meta ?? {
        current_page: body.current_page,
        last_page: body.last_page,
        total: body.total,
      },
    };
  }
  if (Array.isArray(body.data?.data)) {
    return { items: body.data.data, meta: body.data.meta ?? body.data };
  }
  return { items: body.items ?? body.listings ?? body.users ?? body.categories ?? [], meta: body.meta ?? {} };
}

export function errorMessage(error, fallback = 'Настана неочекувана грешка. Обидете се повторно.') {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return data?.message || error?.message || fallback;
}

export default api;
