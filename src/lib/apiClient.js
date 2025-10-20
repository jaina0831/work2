import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const base =
  isDev
    ? (import.meta.env.VITE_API_URL || "/api") // 本機可用 .env 或 /api 走代理
    : "/api";                                  // 線上一律同網域 /api

export const api = axios.create({ baseURL });
