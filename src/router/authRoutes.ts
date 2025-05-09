import type { RouteRecordRaw } from 'vue-router';

const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../modules/Auth/Signin.vue'),
    meta: {
      title: 'pages.Signin',
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../modules/Auth/Signup.vue'),
    meta: {
      title: 'pages.Signup',
    },
  },
];

export default authRoutes;