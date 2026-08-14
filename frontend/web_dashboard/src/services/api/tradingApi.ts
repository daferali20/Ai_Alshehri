import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const client = axios.create({ baseURL: API_BASE });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const tradingApi = {
  async stock(symbol: string) { return (await client.get(`/api/v1/stocks/${encodeURIComponent(symbol)}`)).data; },
  async screener(mode = 'most-active', limit = 20) {
    return (await client.get('/api/v1/screener/us', { params: { mode, limit } })).data;
  },
};
