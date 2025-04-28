import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import { NotificationService } from '@/services/notification';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const api = axios;

api.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    NotificationService.error(t('access.denied'));
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
      NotificationService.error(t('access.denied'));
    }
    
    return Promise.reject(error);
  }
);

export { api };