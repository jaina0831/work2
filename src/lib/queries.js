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

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd) => api.post("/posts", fd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "發佈失敗";
      alert(msg);
      console.error("POST /posts failed:", err);
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