import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createPinia } from "pinia";
import { createApp } from 'vue'
import Notification from '@/components/ui/Notification.vue';
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import i18n from './i18n';

const app = createApp(App)

app.use(createPinia());
app.use(router)
const apexChartsOptions = {
  theme: {
    mode: 'light', // or 'dark'
  },
};

app.use(VueApexCharts, apexChartsOptions);
app.use(i18n);
app.component('Notification', Notification)
app.mount('#app')
