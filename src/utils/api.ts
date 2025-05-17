import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import type { InternalAxiosRequestConfig } from 'axios';
import { notificationService } from '@/services/notification'
import i18n from '@/i18n';
const { t } = i18n.global;
const api = axios;

import router from '@/router';

// Biến để xử lý race condition khi refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStore = useAuthStore();
  if (config.url?.includes('/refresh')) {
    return config;
  }
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }

  return config;
});

// Interceptor response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Bỏ qua nếu là request login hoặc refresh token
    if (originalRequest.url?.includes('/login') || 
        originalRequest.url?.includes('/refresh')) {
      return Promise.reject(error);
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            'Authorization': `Bearer ${token}`
          };
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      // Kiểm tra có refresh token không
      if (!authStore.refresh_token) {
        authStore.clear();
        router.push('/signin');
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post('/refresh', null, {
          headers: {
            Authorization: `Bearer ${authStore.refresh_token}`,
          }
        });
        
        authStore.setToken(data.data.token);
        authStore.setRefreshToken(data.data.refresh_token);
        
        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        
        // Xử lý các request đang chờ
        processQueue(null, data.token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.clear();
        notificationService.error(t('login_page.refresh_token_expired'), 6000);
        router.push('/signin');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    if (error.response?.status === 403) {
      // Có thể thêm thông báo cho người dùng ở đây
      // NotificationService.error(t('access.denied'));
    }
    
    return Promise.reject(error);
  }
);

export { api };