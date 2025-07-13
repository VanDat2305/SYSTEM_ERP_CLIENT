import axios from "axios";
import config from "@/config/config";

// Lấy ngôn ngữ từ localStorage/sessionStorage
const getLang = () => {
  return localStorage.getItem("lang") || sessionStorage.getItem("lang") || "en";
};

const instance = axios.create({
  baseURL: config.api_be || "http://localhost:8000/api",
  withCredentials: true,
});


instance.interceptors.request.use((config) => {
    config.headers["Accept-Language"] = getLang();
    return config;
});

export default instance;
