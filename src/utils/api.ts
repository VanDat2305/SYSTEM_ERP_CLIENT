import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import type { InternalAxiosRequestConfig } from 'axios';
const api = axios;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStore = useAuthStore();

  if (authStore.token) {
    // Axios v1 headers có thể là AxiosHeaders
    config.headers.set?.('Authorization', `Bearer ${authStore.token}`);
    // hoặc nếu headers là object thường
    if (typeof config.headers === 'object' && !config.headers.set) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    // NotificationService.error(t('access.denied'));
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Thử refresh token nếu có
        const response = await api.post('/refresh');
        authStore.setToken(response.data.token);
        return api(originalRequest);
      } catch (refreshError) {
        authStore.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 403) {
      // Xử lý khi không có quyền
      console.error('Forbidden:', error);
      // Có thể show toast notification ở đây
      // NotificationService.error(t('access.denied'));
    }
    
    return Promise.reject(error);
  }
);

export { api };