// src/components/PostForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useCreatePost } from "../lib/queries";

const kPosts = (uid) => `myPosts:${uid}`;

// 強制清掉舊版共用
const clearLegacyKeys = () => {
  localStorage.removeItem("myPosts");
  localStorage.removeItem("myComments");
};

export default function PostForm() {
  const navigate = useNavigate();
  const createPost = useCreatePost();

  const [user, setUser] = useState(() => auth.currentUser);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    clearLegacyKeys();

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    if (image) fd.append("image", image);

    createPost.mutate(fd, {
      onSuccess: (data) => {
        try {
          const key = kPosts(user.uid);
          const myPosts = JSON.parse(localStorage.getItem(key) || "[]");

          myPosts.unshift({
            id: data?.id ?? Date.now(),
            title: data?.title ?? title,
            created_at: data?.created_at ?? new Date().toISOString(),
            author: user.displayName || user.email || "匿名",
            author_avatar: user.photoURL || "",
          });

          localStorage.setItem(key, JSON.stringify(myPosts));
        } catch (err) {
          console.warn("save myPosts failed:", err);
        }

        setTitle("");
        setContent("");
        setImage(null);
      },
      onError: (err) => {
        console.error("發文失敗:", err);
      },
    });
  };

  if (!user) {
    return (
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">想發文嗎？</h3>
        <p className="text-sm text-gray-600 mb-3">發文需要先登入帳號喔～</p>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          前往登入
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded-xl shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">發新文章</h3>

      <input
        className="input input-bordered w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="標題"
        required
      />

      <textarea
        className="textarea textarea-bordered w-full mt-3"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="內文..."
        required
      />

      <div className="mt-3 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button className="btn btn-primary" disabled={createPost.isPending}>
          {createPost.isPending ? "發佈中…" : "發佈"}
        </button>
      </div>
    </form>
  );
}
