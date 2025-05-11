import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PermissionValues } from '@/types/permissions';

type MenuItem = any; // Replace with a more specific type if needed

interface PreTwoFactorData {
  user: any;
  roles: string[];
  permissions: PermissionValues[];
  menu: any[];
  token: string;
  timestamp: number; // Thêm timestamp để theo dõi thời gian
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref<string | null>(null);
  const roles = ref<string[]>([]);
  const permissions = ref<PermissionValues[]>([]);
  const menu = ref<MenuItem[]>([]);
  const twoFactorVerified = ref(false); // Thêm trạng thái xác thực 2FA
  const preTwoFactorData = ref<PreTwoFactorData | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  const setPreTwoFactorData = (data: {
    user: any;
    roles: string[];
    permissions: PermissionValues[];
    menu: MenuItem[];
    token: string;
  }) => {
      preTwoFactorData.value = {
        ...data,
        timestamp: Date.now() // Thêm timestamp
      };
    // Lưu tạm vào sessionStorage
    sessionStorage.setItem('pre_2fa_data', JSON.stringify(preTwoFactorData.value));
  };

  const completeTwoFactorAuth = () => {
    if (!preTwoFactorData.value) {
      throw new Error('No pre-2FA data available');
    }
    
    // Cập nhật state chính thức sau khi xác thực 2FA thành công
    user.value = preTwoFactorData.value.user;
    roles.value = preTwoFactorData.value.roles;
    permissions.value = preTwoFactorData.value.permissions;
    menu.value = preTwoFactorData.value.menu;
    token.value = preTwoFactorData.value.token;
    twoFactorVerified.value = true;
    
    // Xóa dữ liệu tạm
    preTwoFactorData.value = null;
    sessionStorage.removeItem('pre_2fa_data');
    
    // Lưu trạng thái đã xác thực
    persistAuthState(false);
  };

  const persistAuthState = (persist: boolean) => {
    const state = {
      user: user.value,
      token: token.value,
      roles: roles.value,
      permissions: permissions.value,
      menu: menu.value,
      twoFactorVerified: twoFactorVerified.value // Lưu cả trạng thái 2FA
    };

    sessionStorage.setItem('auth_session', JSON.stringify(state));
    
    if (persist) {
      localStorage.setItem('auth_persist', JSON.stringify(state));
    } else {
      localStorage.removeItem('auth_persist');
    }
  };

  // Khởi tạo state từ storage
  const loadAuthState = () => {
    try {
      const sessionState = sessionStorage.getItem('auth_session');
      const localState = localStorage.getItem('auth_persist');
      const savedState = sessionState ? JSON.parse(sessionState) : 
                       localState ? JSON.parse(localState) : null;
      
      if (savedState) {
        user.value = savedState.user;
        token.value = savedState.token;
        roles.value = savedState.roles;
        permissions.value = savedState.permissions;
        menu.value = savedState.menu;
        twoFactorVerified.value = savedState.twoFactorVerified || false;
      }

      // Khôi phục dữ liệu tạm 2FA nếu có
      const pre2faData = sessionStorage.getItem('pre_2fa_data');
     
      
      if (pre2faData) {
        const parsed = JSON.parse(pre2faData);
        if (parsed.timestamp && Date.now() - parsed.timestamp > 300000) {
          sessionStorage.removeItem('pre_2fa_data');
        } else {
          preTwoFactorData.value = parsed;
        }
      }
      return savedState;
    } catch (e) {
      clear();
      return null;
    }
  };

  // Gọi khi khởi tạo store
  loadAuthState();

  const setUser = (newUser: any) => {
    user.value = newUser;
  };

  const setToken = (newToken: string, rememberMe = false) => {
    token.value = newToken;
    persistAuthState(rememberMe);
  };

  const setRoles = (newRoles: string[]) => {
    roles.value = newRoles;
  };

  const setPermissions = (newPermissions: PermissionValues[]) => {
    permissions.value = newPermissions;
  };

  const setMenu = (newMenu: any[]) => {
    menu.value = newMenu;
  };

  const clear = () => {
    user.value = null;
    token.value = null;
    roles.value = [];
    permissions.value = [];
    menu.value = [];
    twoFactorVerified.value = false;
    preTwoFactorData.value = null;
    sessionStorage.removeItem('auth_session');
    sessionStorage.removeItem('pre_2fa_data');
    localStorage.removeItem('auth_persist');
  };

  return {
    user,
    token,
    roles,
    permissions,
    menu,
    isAuthenticated,
    twoFactorVerified,
    preTwoFactorData,
    setUser,
    setToken,
    setRoles,
    setPermissions,
    setMenu,
    setPreTwoFactorData,
    completeTwoFactorAuth,
    clear,
    loadAuthState
  };
});