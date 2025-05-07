import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { PermissionValues } from '@/types/permissions';

type MenuItem = any; // Replace with a more specific type if needed

export const useAuthStore = defineStore('auth', () => {
  // Load từ sessionStorage (ưu tiên) hoặc localStorage
  const loadAuthState = () => {
    try {
      const sessionState = sessionStorage.getItem('auth_session');
      if (sessionState) return JSON.parse(sessionState);
      
      const localState = localStorage.getItem('auth_persist');
      return localState ? JSON.parse(localState) : null;
    } catch (e) {
      return null;
    }
  };

  const savedState = loadAuthState();

  // Khởi tạo state như cũ
  const user = ref(savedState?.user || null);
  const token = ref<string | null>(savedState?.token || null);
  const roles = ref<string[]>(savedState?.roles || []);
  const permissions = ref<PermissionValues[]>(savedState?.permissions || []);
  const menu = ref<MenuItem[]>(savedState?.menu || []);

  const isAuthenticated = computed(() => !!token.value);

  // Lưu đồng thời vào cả sessionStorage (cho phiên hiện tại) và localStorage (nếu cần)
  const persistAuthState = (persist: boolean) => {
    const state = {
      user: user.value,
      token: token.value,
      roles: roles.value,
      permissions: permissions.value,
      menu: menu.value
    };

    // Luôn luôn lưu vào sessionStorage (an toàn hơn)
    sessionStorage.setItem('auth_session', JSON.stringify(state));
    
    // Chỉ lưu localStorage nếu người dùng chọn "Remember me"
    if (persist) {
      localStorage.setItem('auth_persist', JSON.stringify(state));
    } else {
      localStorage.removeItem('auth_persist');
    }
  };

  // Theo dõi thay đổi state - chỉ lưu vào sessionStorage mặc định
  // watch(
  //   [user, token, roles, permissions, menu],
  //   () => persistAuthState(false),
  //   { deep: true }
  // );

  // Các hàm gốc giữ nguyên
  function setUser(newUser: any) {
    user.value = newUser;
  }

  function setToken(newToken: string, rememberMe = false) {
    token.value = newToken;
    persistAuthState(rememberMe); // Cho phép lưu vào localStorage nếu rememberMe=true
  }

  function setRoles(newRoles: string[]) {
    roles.value = newRoles;
  }

  function setPermissions(newPermissions: PermissionValues[]) {
    permissions.value = newPermissions;
  }

  function setMenu(newMenu: any[]) {
    menu.value = newMenu;
  }

  function clear() {
    user.value = null;
    token.value = null;
    roles.value = [];
    permissions.value = [];
    menu.value = [];
    sessionStorage.removeItem('auth_session');
    localStorage.removeItem('auth_persist');
  }

  return {
    user,
    token,
    roles,
    permissions,
    menu,
    isAuthenticated,
    setUser,
    setToken,
    setRoles,
    setPermissions,
    setMenu,
    clear,
  };
});