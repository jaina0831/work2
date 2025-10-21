// src/lib/apiClient.js
import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? (import.meta.env.VITE_API_URL || "/api")
      : "/api",
});

// 產生/帶入裝置 ID（存在 localStorage）
let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  localStorage.setItem("device_id", deviceId);
}
api.interceptors.request.use((cfg) => {
  cfg.headers["X-Client-Id"] = deviceId;   // 後端會用它限制重複按讚
  return cfg;
});
