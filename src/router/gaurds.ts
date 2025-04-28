import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePermissions } from '@/auth/usePermissions';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'signin', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
};

export const permissionGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  if (to.meta.permissions) {
    const permissions = Array.isArray(to.meta.permissions)
      ? to.meta.permissions
      : [to.meta.permissions];
      
    if (!hasAnyPermission(permissions)) {

      next({ name: 'forbidden' });
      return;
    }
  }
  
  next();
};