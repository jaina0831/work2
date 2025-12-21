import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./apiClient";

// 取得全部貼文
export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.get("/posts")).data,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

// 取得單篇
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
    mutationFn: (fd) => api.post("/posts", fd).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
    onError: (err) => {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 401) alert("請先登入後再發文");
      else alert("發佈失敗：" + (detail || "請稍後再試"));
    },
  });
}

// 按讚/收回
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

// 留言
export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
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

// 刪文
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
