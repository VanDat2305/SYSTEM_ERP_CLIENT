import type { RouteRecordRaw } from 'vue-router';

const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../modules/Auth/Signin.vue'),
    meta: {
      title: 'Signin',
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../modules/Auth/Signup.vue'),
    meta: {
      title: 'Signup',
    },
  },
];

export default authRoutes;