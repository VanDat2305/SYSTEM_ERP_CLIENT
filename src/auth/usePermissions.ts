import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { PermissionValues } from '@/types/permissions';

export const usePermissions = () => {
  const authStore = useAuthStore();

  const hasPermission = (permission: PermissionValues) => {
    return computed(() => authStore.permissions.includes(permission)).value;
  };

  const hasAnyPermission = (permissions: PermissionValues[]) => {
    return computed(() => 
      permissions.some(permission => authStore.permissions.includes(permission))
    ).value;
  };

  const hasRole = (role: string) => {
    return computed(() => authStore.roles.includes(role)).value;
  };

  const hasAnyRole = (roles: string[]) => {
    return computed(() => 
      roles.some(role => authStore.roles.includes(role))
    ).value;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
  };
};