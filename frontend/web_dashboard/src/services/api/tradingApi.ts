import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || 'https://ai-alshehri.onrender.com').replace(/\/$/, '');

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const tradingApi = {
  async stock(symbol: string) {
    return (await client.get(`/api/v1/stocks/${encodeURIComponent(symbol)}`)).data;
  },

  async screener(mode = 'most-active', limit = 20) {
    const response = await client.get('/api/v1/screener/us', {
      params: { mode, limit },
    });

    if (!response.data || response.data.status !== 'ok') {
      throw new Error('خادم التحليل أعاد استجابة غير صالحة');
    }

    return response.data;
  },
};

export function getTradingApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'انتهت مهلة الاتصال بخادم التحليل. قد يحتاج الخادم إلى لحظات للاستيقاظ.';
    }
    if (error.response) {
      const detail = error.response.data?.detail;
      return `خادم التحليل أعاد الخطأ ${error.response.status}${detail ? `: ${detail}` : ''}`;
    }
    if (error.request) {
      return 'تعذر الوصول إلى خادم التحليل. تحقق من حالة الخادم أو اتصال الشبكة.';
    }
  }

  return error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء الاتصال بخادم التحليل';
}
