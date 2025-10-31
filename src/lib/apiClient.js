import axios from "axios";

export const api = axios.create({
  baseURL: "https://work2-enfq.onrender.com",   // ← 不再用外部域名，交給 vercel.json 代理
});

// 保留你的 X-Client-Id
let deviceId = localStorage.getItem("device_id");
if (!deviceId) {
  deviceId = crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  localStorage.setItem("device_id", deviceId);
}
api.interceptors.request.use(cfg => {
  cfg.headers["X-Client-Id"] = deviceId;
  return cfg;
});
