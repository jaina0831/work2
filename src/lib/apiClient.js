import axios from "axios";
import { auth } from "../firebase";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
