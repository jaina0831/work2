// src/apiClient.js
import axios from "axios";
import { auth } from "../firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// device id for like/unlike（保留原本邏輯）
let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  localStorage.setItem("device_id", deviceId);
}

// 在每次 request 時，自動帶上 X-Client-Id + Firebase JWT
api.interceptors.request.use(
  async (cfg) => {
    cfg.headers["X-Client-Id"] = deviceId;

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      cfg.headers["Authorization"] = `Bearer ${token}`;
    }

    return cfg;
  },
  (error) => Promise.reject(error)
);
