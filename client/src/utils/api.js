import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on expired/invalid token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('token') || msg.includes('authorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
