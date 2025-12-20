import axios from "axios";
import { auth } from "../firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// device id for like/unlike（更安全：只在瀏覽器環境取 localStorage）
let deviceId = "server";
try {
  if (typeof window !== "undefined" && window.localStorage) {
    deviceId = localStorage.getItem("device_id") || "";
    if (!deviceId) {
      const uuid =
        (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2);
      deviceId = uuid;
      localStorage.setItem("device_id", deviceId);
    }
  }
} catch {
  deviceId = Math.random().toString(36).slice(2);
}

// 在每次 request 時，自動帶上 X-Client-Id + Firebase JWT
api.interceptors.request.use(
  async (cfg) => {
    cfg.headers = cfg.headers || {};
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
