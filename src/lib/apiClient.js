// apiClient.js
import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? (import.meta.env.VITE_API_URL || "/api")
      : "/api",
});

let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
  localStorage.setItem("device_id", deviceId);
}
api.interceptors.request.use((cfg) => {
  cfg.headers["X-Client-Id"] = deviceId; // 後端用來限制重複按讚
  return cfg;
});
