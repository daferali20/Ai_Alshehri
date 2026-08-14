import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await axios.post(`${API_BASE}/api/v1/auth/login`, { email, password });
    localStorage.setItem('access_token', data.access_token);
    return data;
  },
  async register(email: string, password: string, full_name: string, terms_accepted = true) {
    const { data } = await axios.post(`${API_BASE}/api/v1/auth/register`, { email, password, full_name, terms_accepted });
    localStorage.setItem('access_token', data.access_token);
    return data;
  },
  logout() { localStorage.removeItem('access_token'); },
  token() { return localStorage.getItem('access_token'); },
};
