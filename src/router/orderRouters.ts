import type { RouteRecordRaw } from 'vue-router';

const orderRouters: Array<RouteRecordRaw> = [
  {
    path: '/orders',
    name: 'orders.list',
    component: () => import('@/modules/order/views/OrderView.vue'),
    meta: { 
        title: 'menu.orders',
        requiresAuth: true, permissions: ['orders.view'] 
    },
  },
];

export default orderRouters;