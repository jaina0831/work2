// src/components/PostCard.jsx
import { useEffect, useState } from "react";
import { useLikePost, useCreateComment, useDeletePost } from "../lib/queries";
import { fmt } from "../lib/date";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import bin from "../assets/bin.png";
import bin2 from "../assets/bin2.png";

// ✅ 統一處理圖片 url（支援 http 完整連結，也支援後端回傳 /xxx 路徑）
function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const like = useLikePost();
  const createComment = useCreateComment();
  const del = useDeletePost();

  const [user, setUser] = useState(() => auth.currentUser);
  const [text, setText] = useState("");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const imgSrc = resolveUrl(post.image_url);

  // ✅ 登入才可按讚
  const onToggleLike = () => {
    if (!user) return navigate("/login");
    like.mutate(post.id);
  };

  // ✅ 留言：登入才可送出 + 成功後存 localStorage.myComments
  const submit = (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    const t = text.trim();
    if (!t) return;

    createComment.mutate(
      { post_id: post.id, text: t },
      {
        onSuccess: () => {
          try {
            // ⭐⭐⭐ 存到 localStorage：我的留言紀錄
            const myComments = JSON.parse(localStorage.getItem("myComments") || "[]");

            myComments.unshift({
              id: Date.now(),
              post_id: post.id,
              postTitle: post.title || "無標題文章",
              text: t,
              created_at: new Date().toISOString(),
              // 這兩個方便你之後在「我的留言紀錄」頁展示
              author: user.displayName || user.email || "匿名",
              author_avatar: user.photoURL || "",
            });

            localStorage.setItem("myComments", JSON.stringify(myComments));
          } catch (err) {
            console.warn("save myComments failed:", err);
          }
        },
      }
    );

    setText("");
  };

  // ✅ 刪除：成功後從 localStorage.myPosts 移除（配合你要做我的發文紀錄）
  const onDelete = () => {
    if (!user) return navigate("/login");

    if (!confirm("確定要刪除這篇文章嗎？")) return;

    del.mutate(post.id, {
      onSuccess: () => {
        try {
          const myPosts = JSON.parse(localStorage.getItem("myPosts") || "[]");
          const updatedPosts = myPosts.filter((p) => p.id !== post.id);
          localStorage.setItem("myPosts", JSON.stringify(updatedPosts));
        } catch (err) {
          console.warn("update myPosts failed:", err);
        }
      },
    });
  };

  return (
    <div className="relative rounded-xl border border-black/10 bg-[#fff9f0] shadow text-black">
      {/* 右上角垃圾桶 */}
      <button
        onClick={onDelete}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute right-3 top-3 hover:scale-110 transition-transform z-10"
        title="刪除文章"
      >
        <img src={hover ? bin2 : bin} alt="刪除文章" className="w-6 h-6" />
      </button>

      {/* 作者列：post.author / post.author_avatar */}
      <div className="flex items-center gap-3 px-4 pt-4">
        {post.author_avatar ? (
          <img
            src={post.author_avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full object-cover border border-[#E4D3B5]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#E4D3B5] opacity-60" />
        )}

        <div className="flex flex-col leading-tight">
          <div className="font-semibold">{post.author}</div>
          <div className="text-xs text-gray-500">{fmt(post.created_at)}</div>
        </div>
      </div>

      {/* 圖片 */}
      {imgSrc && (
        <figure className="px-4 pt-3">
          <img src={imgSrc} alt="post" className="rounded-xl w-full" />
        </figure>
      )}

      <div className="p-4">
        {post.title && <h3 className="text-xl font-bold mb-2">{post.title}</h3>}
        <p className="text-base mb-3 whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-3 mb-2">
          {/* ✅ 登入才可按讚/收回讚 */}
          <button
            className="btn btn-sm"
            onClick={onToggleLike}
            disabled={like.isPending}
            title={!user ? "請先登入才能按讚" : "按讚"}
          >
            👍 {post.likes_count ?? 0}
          </button>

          <button
            className="btn btn-sm"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            看完整內文
          </button>
        </div>

        {/* 留言 */}
        <div className="mt-4">
          <h4 className="font-semibold mb-1">留言</h4>

          <ul className="space-y-1">
            {(post.comments || []).map((c) => (
              <li key={c.id} className="text-sm opacity-90">
                <span className="font-medium">{c.author}：</span>
                {c.text}
              </li>
            ))}
          </ul>

          {!user ? (
            <div className="mt-3 text-sm text-gray-600">
              留言需要先登入喔～
              <button
                className="ml-2 btn btn-xs btn-primary"
                onClick={() => navigate("/login")}
                type="button"
              >
                去登入
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex gap-2 mt-3">
              <input
                className="input input-bordered flex-1"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="寫點什麼…"
                required
              />
              <button className="btn btn-accent btn-sm" disabled={createComment.isPending}>
                送出
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
