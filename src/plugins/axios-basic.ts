import axios from 'axios'
import { notificationService } from '@/services/notification'
import i18n from '@/i18n'
const { t } = i18n.global
import config from "@/config/config";

// Có thể lấy từ .env hoặc config của bạn
const BASIC_AUTH_USER = import.meta.env.VITE_BASIC_AUTH_USER || 'apiuser'
const BASIC_AUTH_PASS = import.meta.env.VITE_BASIC_AUTH_PASS || 'apipassword'


const api = axios.create({
  baseURL: config.api_be || "http://localhost:8000",
  // Axios tự sinh header Authorization cho bạn:
  auth: {
    username: BASIC_AUTH_USER,
    password: BASIC_AUTH_PASS
  }
})

// Nếu muốn gắn thêm header tùy biến ở mọi request
api.interceptors.request.use(config => {
  // Có thể custom thêm ở đây nếu cần
  return config
})

// Response interceptor: thông báo lỗi 401, 403, 500...
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        notificationService.error(t('Bạn không có quyền truy cập API (Basic Auth)'), 5000)
      }
      if (error.response.status === 403) {
        notificationService.error(t('Bạn không được phép truy cập tài nguyên'), 5000)
      }
      if (error.response.status >= 500) {
        notificationService.error(t('Lỗi server'), 5000)
      }
    } else {
      notificationService.error(t('Lỗi kết nối đến máy chủ API'), 5000)
    }
    return Promise.reject(error)
  }
)

export default api
