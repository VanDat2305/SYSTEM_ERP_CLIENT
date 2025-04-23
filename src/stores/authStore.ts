import { defineStore } from "pinia";
import { ref } from "vue";
import AuthService from "../services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: ref<string | null>(
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    ),
    user: ref(
      JSON.parse(localStorage.getItem("authUser") || sessionStorage.getItem("authUser") || "null")
    ),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string, keepLoggedIn: boolean) {
      try {
        const response = await AuthService.login(email, password, keepLoggedIn);
        
        if (!response.data.token) throw new Error("Token không hợp lệ");

        this.token = response.data.token;
        this.user = response.data.user;

        if (this.token) {
          if (keepLoggedIn) {
            localStorage.setItem("authToken", this.token); // Lưu vĩnh viễn
            localStorage.setItem("authUser", JSON.stringify(this.user)); // Lưu user
          }
          sessionStorage.setItem("authToken", this.token); // Chỉ lưu trong session
          sessionStorage.setItem("authUser", JSON.stringify(this.user)); // Lưu user
        }

        return { success: true, message: response.message };
      } catch (error: any) {
        const response = error.response?.data;
      
        let message = "Error sytem: " + error.message;
        let errors = null;
      
        if (response) {
          message = response.message || message;
          errors = response.errors || null;
        }
      
        return {
          success: false,
          message,
          errors
        };
      }
    },

    async logout(t: Function) {
      await AuthService.logout(); // Gọi API nếu có

      this.token = null;
      this.user = null;

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("authUser");


      return { success: true, message: t("auth.logout_success") };
    },
  },
});
