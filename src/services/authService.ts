import axios from "axios";
import config from "@/config/config";

const AuthService = {
  async login(email: string, password: string, keepLoggedIn: boolean) {
    
    const response = await axios.post(`${config.api_be}/login`, {
      email,
      password,
      keepLoggedIn,
    });
    return response.data;
  },
  async logout() {
    await axios.post(`${config.api_be}/logout`); // Nếu API hỗ trợ logout
  },
};

export default AuthService; // ✅ Dùng export default
