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
export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fd) =>
      (await api.post("/posts", fd, { headers: { "Content-Type": "multipart/form-data" } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};

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
