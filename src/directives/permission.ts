import { type Directive, type DirectiveBinding } from 'vue';
import { usePermissions } from '@/auth/usePermissions';
import type { PermissionValues } from '@/types/permissions';

export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValues | PermissionValues[]>) {
    const { hasPermission, hasAnyPermission } = usePermissions();
    
    let hasPerm = false;
    
    if (Array.isArray(binding.value)) {
      hasPerm = hasAnyPermission(binding.value);
    } else {
      hasPerm = hasPermission(binding.value);
    }
    
    if (!hasPerm) {
      el.style.display = 'none';
    }
  },
};

export const vRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { hasRole, hasAnyRole } = usePermissions();
    
    let hasRolePerm = false;
    
    if (Array.isArray(binding.value)) {
      hasRolePerm = hasAnyRole(binding.value);
    } else {
      hasRolePerm = hasRole(binding.value);
    }
    
    if (!hasRolePerm) {
      el.style.display = 'none';
    }
  },
};