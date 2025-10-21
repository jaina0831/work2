import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiClient";

// 取得所有貼文
export const usePosts = () =>
  useQuery({ queryKey: ["posts"], queryFn: async () => (await api.get("/posts")).data,staleTime: 10_000,
    refetchOnWindowFocus: false, });

export const usePost = (id) =>
  useQuery({
    queryKey: ["posts", id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data,
    enabled: !!id,
  });

// 新增貼文（含圖片）

function pickErrorMessage(err) {
  const res = err?.response;
  const data = res?.data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;

  // 不是字串就把它序列化
  try { return JSON.stringify(data ?? {}, null, 2); } catch (_) {}

  // 退回 axios 的 message
  return err?.message || "發佈失敗";
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd) => api.post("/posts", fd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
    onError: (err) => {
      console.error("❌ POST /posts failed:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data ||
        err?.message ||
        "未知錯誤";

      alert("發佈失敗：" + message);
    },
  });
}

// 按讚
export const useLikePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/posts/${id}/like`)).data,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", id] });
    },
  });
};

// 新增留言
export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/comments`, payload)).data,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", variables.post_id] });
    },
  });
};

// 🗑️ 新增：刪除貼文
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/posts/${id}`)).data,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", id] }); // ← 新增
    },
  });
};

// 新增地圖
export const usePlaces = () => useQuery({
  queryKey: ["places"],
  queryFn: async () => (await api.get("/places")).data
});