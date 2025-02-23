import type { RouteRecordRaw } from 'vue-router';

const ecommerceRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Ecommerce',
    component: () => import('../views/Ecommerce.vue'),
    meta: {
      title: 'eCommerce Dashboard',
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