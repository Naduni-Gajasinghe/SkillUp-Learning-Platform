import axios from 'axios';
import { clearSession } from '../utils/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillup_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';

    if (
      status === 401 &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/reset-password')
    ) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
