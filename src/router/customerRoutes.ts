import type { RouteRecordRaw } from 'vue-router';

const customerRoutes: Array<RouteRecordRaw> = [
  {
    path: '/customers',
    name: 'customers.list',
    component: () => import('@/modules/customer/views/CustomerView.vue'),
    meta: { 
        title: 'menu.customers',
        requiresAuth: true, permissions: ['customers.view', "customers.view.own" , "customers.view.team"] 
    },
  },
];

export default customerRoutes;