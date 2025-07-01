import type { RouteRecordRaw } from 'vue-router';

const ecommerceRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'pages.Dashboard',
      requiresAuth: true
    },
  },
  {
    path: '/line-chart',
    name: 'Line Chart',
    component: () => import('../views/Chart/LineChart/LineChart.vue'),
  },
  // Thêm các route khác cho module Ecommerce
];

export default ecommerceRoutes;