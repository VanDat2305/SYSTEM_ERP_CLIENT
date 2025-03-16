import { defineStore } from "pinia";
import { ref } from "vue";
import { authService } from "@/services/AuthService";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const user = ref(null);

  const login = async (email: string, password: string, keepLoggedIn: boolean) => {
    try {
      const response = await authService.login(email, password, keepLoggedIn);
      
      token.value = response.data?.token;
      user.value = response.data?.user;

      if (keepLoggedIn) {
        localStorage.setItem("authToken", token.value);
      } else {
        sessionStorage.setItem("authToken", token.value);
      }

      return { success: true, message: response.message };
    } catch (error: any) {
      throw error.response?.data?.message || "Lỗi hệ thống";
    }
  };

  return { token, user, login };
});
