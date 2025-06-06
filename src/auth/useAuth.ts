import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/utils/api';
import { notificationService } from '@/services/notification'
import { useCategorySystem } from '@/stores/categorySystem';

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const categorySystem = useCategorySystem();
  const isLoading = ref(false);
  const error = ref(null);

  const login = async (credentials: { email: string; password: string; }, rememberLogin: boolean) => {
    try {
      // authStore.clear();
      isLoading.value = true;
      error.value = null;
      
      // Lấy CSRF token trước khi login
      await api.get('/sanctum/csrf-cookie',
        {
          withCredentials: true,
          headers: {
            Accept: null,
          }
        }
      );
      
      const response = await api.post('/login', credentials);
      const data = response.data.data;
      if (data.user?.two_factor_enabled) {
        // Lưu thông tin tạm thời chờ xác thực 2FA
        authStore.setPreTwoFactorData({
          user: data.user,
          roles: data.roles,
          permissions: data.permissions,
          menu: data.menu,
          token: data.token,
          rememberLogin : rememberLogin,
          refresh_token: data.refresh_token
        });
        await categorySystem.fetchCategories();
        
        return router.push({ name: 'two-factor-challenge' });
      }

      
      authStore.setUser(data.user);
      authStore.setRoles(data.roles);
      authStore.setPermissions(data.permissions);
      authStore.setMenu(data.menu);
      
      authStore.setToken(data.token, rememberLogin);
      authStore.setRefreshToken(data.refresh_token, rememberLogin);
      
      const defaultRoute = getDefaultRoute(data.menu);
      
      await categorySystem.fetchCategories();
      
      const matchedRoute = router.getRoutes().find(r => r.name === defaultRoute.name);
      const nextRoute = (matchedRoute || (matchedRoute != undefined)) ? defaultRoute : '/'
      notificationService.success(data.message);
      await router.push(nextRoute);
    } catch (err) {
      //console.log('Login error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
      authStore.clear();
      categorySystem.clearCategories();
      await router.push({ name: 'signin' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      authStore.setUser(response.data.user);
      authStore.setRoles(response.data.roles);
      authStore.setPermissions(response.data.permissions);
      authStore.setMenu(response.data.menu);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // authStore.clear();
        }
      }
      throw err;
    }
  };
  const getDefaultRoute = (menu: any[]): { name: string } => {
    // Tìm item có isDefault = true
    const findDefault = (items: any[]): any => {
      for (const item of items) {
        if (item.routeName) {
          return { name: item.routeName };
        }
        if (item.children) {
          const found = findDefault(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findDefault(menu) || { name: 'Ecommerce' };
  };
  const verifyTwoFactor = async (code: string, recoveryCode?: string) => {
    try {
      isLoading.value = true;
      const token = authStore.preTwoFactorData?.token;
      const payload = recoveryCode 
        ? { recovery_code: recoveryCode }
        : { code };
      
      const resp = await api.post('/two-factor-challenge', payload,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Hoàn tất quá trình đăng nhập
      authStore.completeTwoFactorAuth();
      authStore.setToken(resp.data.data.token, authStore.preTwoFactorData?.rememberLogin);
      authStore.setRefreshToken(resp.data.data.refresh_token, authStore.preTwoFactorData?.rememberLogin);
      navigateAfterLogin(authStore.menu);
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const navigateAfterLogin = (menu: any[]) => {
    const defaultRoute = getDefaultRoute(menu);
    const matchedRoute = router.getRoutes().find(r => r.name === defaultRoute.name);
    const nextRoute = matchedRoute ? defaultRoute : '/';
    
    // notificationService.success(t(''));
    router.push(nextRoute);
  };
  const signup = async (data: any) => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await api.post('/register', data);
      const dataResponse = response.data.data;
      await router.push("/signin");
      notificationService.success(dataResponse.message);
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  const user = ref(authStore.user);
  

  return {
    isLoading,
    error,
    login,
    logout,
    fetchUser,
    verifyTwoFactor,
    signup,
    user
  };
};