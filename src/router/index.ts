import { createRouter, createWebHistory } from "vue-router";
import i18n from '@/i18n';
import ecommerceRoutes from "./ecommerceRoutes";
import authRoutes from "./authRoutes";
import systemRoutes from "./systemRoutes";
import settingRouters from "./settingRouters";


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
    ...settingRouters,
    {
      path: '/filemanager',
      name: 'filemanager.name',
      component: () => import('@/modules/filemanager/views/FileManager.vue'),
      meta: { 
          title: 'file_manager.title',
          requiresAuth: true, permissions: ['files.list'] 
      },
    },
    {
      path: '/service-packages',
      name: 'service_packages.name',
      component: () => import('@/modules/service/views/ServicePackageView.vue'),
      meta: { 
          title: 'service_packages.title',
          requiresAuth: true, permissions: ['service_packages.view'] 
      },
    },
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
      component:  () => import("../views/Errors/ForbiddenView.vue"),
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
  const titleKey = to.meta?.title as string | undefined;
  const translatedTitle = titleKey ? i18n.global.t(titleKey) : '';
  document.title = `${translatedTitle}` + ' | ' + i18n.global.t('title_default') ;
  next();
});
router.beforeEach(authGuard);
router.beforeEach(permissionGuard);

export default router;


