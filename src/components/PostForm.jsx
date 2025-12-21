// src/components/PostForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useCreatePost } from "../lib/queries";

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

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    if (image) fd.append("image", image);

    createPost.mutate(fd, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setImage(null);
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
