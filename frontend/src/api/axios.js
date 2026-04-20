import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wearms_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// On 401, clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = /\/auth\/(login|register|vigilance\/login)$/.test(requestUrl);

      // Let login/register pages handle invalid credentials without forced redirect.
      if (!isAuthRequest) {
        const role = localStorage.getItem('wearms_role');
        localStorage.removeItem('wearms_token');
        localStorage.removeItem('wearms_user');
        localStorage.removeItem('wearms_role');
        window.location.href = role === 'officer' || role === 'admin' ? '/vigilance/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
