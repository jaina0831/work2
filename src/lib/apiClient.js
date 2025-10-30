import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ← 跟 .env 的鍵一致
});
// 帶裝置ID
let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  localStorage.setItem("device_id", deviceId);
}
api.interceptors.request.use(cfg => {
  cfg.headers["X-Client-Id"] = deviceId;
  return cfg;
});
