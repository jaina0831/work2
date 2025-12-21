// src/lib/queries.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiClient";

export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.get("/posts")).data,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

export const usePost = (id) =>
  useQuery({
    queryKey: ["posts", id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data,
    enabled: !!id,
  });

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd) => api.post("/posts", fd).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) alert("請先登入後再發文");
      else alert("發文失敗");
    },
  });
}

export const useLikePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", id] });
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) alert("請先登入後才可以按讚/收回讚");
      else alert("按讚失敗");
    },
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    // ✅ payload: { post_id, text }
    mutationFn: (payload) => api.post(`/comments`, payload).then((r) => r.data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", vars.post_id] });
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) alert("請先登入後再留言");
      else alert("留言失敗");
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", id] });
    },
  });
};
