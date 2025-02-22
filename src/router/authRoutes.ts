import type { RouteRecordRaw } from 'vue-router';

const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('../views/Auth/Signin.vue'),
    meta: {
      title: 'Signin',
    },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Auth/Signup.vue'),
    meta: {
      title: 'Signup',
    },
  },
];

export default authRoutes;