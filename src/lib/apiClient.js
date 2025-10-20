import axios from "axios";

const apiBase =
  import.meta.env.MODE === "development"
    ? (import.meta.env.VITE_API_URL || "/api")
    : "/api";

export const api = axios.create({
  baseURL: apiBase,
});
