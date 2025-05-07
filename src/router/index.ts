import { createRouter, createWebHistory } from "vue-router";
import ecommerceRoutes from "./ecommerceRoutes";
import authRoutes from "./authRoutes";
import systemRoutes from "./systemRoutes";


import { authGuard, permissionGuard } from '@/router/gaurds';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 };
  },
  routes: [
    ...ecommerceRoutes,
    ...authRoutes,
    ...systemRoutes,
    {
      path: "/calendar",
      name: "Calendar",
      component: () => import("../views/Others/Calendar.vue"),
      meta: { title: "Calendar", requiresAuth: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("../views/Others/UserProfile.vue"),
      meta: { title: "Profile", requiresAuth: true },
    },
    {
      path: "/form-elements",
      name: "Form Elements",
      component: () => import("../views/Forms/FormElements.vue"),
      meta: { title: "Form Elements", requiresAuth: true },
    },
    {
      path: "/basic-tables",
      name: "Basic Tables",
      component: () => import("../views/Tables/BasicTables.vue"),
      meta: { title: "Basic Tables", requiresAuth: true },
    },
    {
      path: "/error-404",
      name: "404 Error",
      component: () => import("../views/Errors/FourZeroFour.vue"),
      meta: { title: "404 Error" },
    },
    // {
    //   path: "/login",
    //   name: "Login",
    //   component: () => import("../views/Auth/Login.vue"),
    //   meta: { title: "Login" },
    // },
    // {
    //   path: "/register",
    //   name: "Register",
    //   component: () => import("../views/Auth/Register.vue"),
    //   meta: { title: "Register" },
    // },
    // {
    //   path: "/",
    //   redirect: "/login", // Mặc định chuyển hướng đến trang đăng nhập
    // },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: import("../views/Errors/ForbiddenView.vue"),
      meta: {
        title: '403 - Forbidden'
      }
    },
    {
      path: "/:catchAll(.*)", // Bắt tất cả các route không hợp lệ
      redirect: "/error-404",
    },
  ],
});
router.beforeEach((to, from, next) => {
  document.title = `ERP System | ${to.meta.title || "Dashboard"}`;
  next();
});
router.beforeEach(authGuard);
router.beforeEach(permissionGuard);

export default router;


