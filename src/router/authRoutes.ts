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
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../modules/Auth/ForgotPassword.vue'), 
    meta: {
      title: 'pages.ForgotPassword',
    },
  },
  {
    path: '/reset-password',
    redirect: to => {
      const { token, email } = to.query;
  
      // Nếu có token và email, chuyển hướng đến /reset-password/:token với email trong query
      if (token && email) {
        return `/reset-password/${token}?email=${email}`;
      }
  
      // Nếu không, chỉ cần quay lại /reset-password
      return '/reset-password';
    }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('../modules/Auth/ResetPassword.vue'),
    props: route => ({ token: route.params.token, email: route.query.email }), // Truyền token và email từ route vào component
    meta: {
      title: 'pages.ResetPassword',
    },
  },
  {
    path: '/send-success',
    name: 'send-success',
    component: () => import('../views/Pages/SendEmailSuccesPage.vue'),
    meta: {
      title: 'pages.sendSuccess',
    },
  },
  {
    path: '/two-factor-challenge',
    name: 'two-factor-challenge',
    component: () => import('../modules/Auth/TwoFactorAuthForm.vue'),
    meta: {
      title: 'pages.TwoFactorAuthentication',
    },
  },
  
];

export default authRoutes;