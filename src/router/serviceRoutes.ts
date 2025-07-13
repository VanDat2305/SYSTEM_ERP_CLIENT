import type { RouteRecordRaw } from 'vue-router';

const serviceRoutes: Array<RouteRecordRaw> = [
  {
    path: '/ihoadon/login',
    name: 'ihoadon',
    component: () => import('@/views/Services/Ihoadon/LoginPage.vue'),
    meta: { 
        title: 'Đăng nhập Ihoadon'
    },
  },
  {
    path: '/ihoadon/my-services',
    name: 'ihoadon-my-services',
    component: () => import('@/views/Services/Ihoadon/MyServices.vue'),
    meta: { 
        title: 'Dịch vụ Ihoadon'
    },
  },
  {
    path: '/econtract/login',
    name: 'eContract',
    component: () => import('@/views/Services/eContract/LoginPage.vue'),
    meta: { 
        title: 'Đăng nhập eContract'
    },
  },
  {
    path: '/econtract/my-services',
    name: 'eContract-my-services',
    component: () => import('@/views/Services/eContract/MyServices.vue'),
    meta: { 
        title: 'Dịch vụ eContract'
    },
  },
      {
    path: '/ebhxh/login',
    name: 'ebhxh',
    component: () => import('@/views/Services/ebhxh/LoginPage.vue'),
    meta: { 
        title: 'Đăng nhập ebhxh'
    },
  },
  {
    path: '/ebhxh/my-services',
    name: 'ebhxh-my-services',
    component: () => import('@/views/Services/ebhxh/MyServices.vue'),
    meta: { 
        title: 'Dịch vụ ebhxh'
    },
  },
];

export default serviceRoutes;