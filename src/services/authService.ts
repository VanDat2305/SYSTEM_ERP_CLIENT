import axios from "@/plugins/axios";
import { useAuthStore } from "@/stores/authStore";

const AuthService = {
  async login(email: string, password: string, keepLoggedIn: boolean) {
    
    const response = await axios.post(`/login`, {
      email,
      password,
      keepLoggedIn,
    });
    return response.data;
  },
  async logout() {
    await axios.post(`/logout`, null, {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
      },
    });
  },
};

export default AuthService; // ✅ Dùng export default
