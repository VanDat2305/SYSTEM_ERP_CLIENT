import { createI18n } from 'vue-i18n';

// Import các file ngôn ngữ
import en from './locales/en.json';
import vi from './locales/vi.json';

// Định nghĩa kiểu cho các thông điệp
type MessageSchema = typeof en;

const messages = {
  en,
  vi,
};

const i18n = createI18n<[MessageSchema], 'en' | 'vi'>({
  locale: localStorage.getItem('lang') || 'en', // Ngôn ngữ mặc định
  fallbackLocale: 'en', // Ngôn ngữ dự phòng
  messages, // Các thông điệp đã dịch
  legacy: false, // Sử dụng Composition API
});

export default i18n;