import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/utils/api';

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const isLoading = ref(false);
  const error = ref(null);

  const login = async (credentials: { email: string; password: string; }, rememberLogin: boolean) => {
    try {
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
      authStore.setUser(data.user);
      authStore.setRoles(data.roles);
      authStore.setPermissions(data.permissions);
      authStore.setMenu(data.menu);
      
      authStore.setToken(data.token, rememberLogin);
      
      const defaultRoute = getDefaultRoute(data.menu);
      
      const matchedRoute = router.getRoutes().find(r => r.name === defaultRoute.name);
      const nextRoute = (matchedRoute || (matchedRoute != undefined)) ? defaultRoute : '/'
      
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
          authStore.clear();
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
  

  return {
    isLoading,
    error,
    login,
    logout,
    fetchUser,
  };
};