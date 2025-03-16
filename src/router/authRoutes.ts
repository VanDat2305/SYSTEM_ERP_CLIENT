import type { RouteRecordRaw } from 'vue-router';

const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('../modules/Auth/Signin.vue'),
    meta: {
      title: 'Signin',
    },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../modules/Auth/Signup.vue'),
    meta: {
      title: 'Signup',
    },
  },
];

export default authRoutes;