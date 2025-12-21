// src/pages/PostDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { usePost, useLikePost, useCreateComment, useDeletePost } from "../lib/queries";
import { useEffect, useState } from "react";
import { fmt } from "../lib/date";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import bin from "../assets/bin.png";
import bin2 from "../assets/bin2.png";
import heart from "../assets/heart.png";
import heart2 from "../assets/heart2.png";
import comment from "../assets/comment.png";

function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading } = usePost(Number(id));
  const like = useLikePost();
  const createComment = useCreateComment();
  const del = useDeletePost();

  const [user, setUser] = useState(() => auth.currentUser);
  const [hoverDelete, setHoverDelete] = useState(false);
  const [text, setText] = useState("");
  const [showImg, setShowImg] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (isLoading) return <div className="p-8">載入中…</div>;
  if (!post) return <div className="p-8">找不到文章</div>;

  const imgSrc = resolveUrl(post.image_url);
  const commentCount = post.comments?.length ?? 0;

  const onToggleLike = () => {
    if (!user) return navigate("/login");
    like.mutate(post.id);
  };

  // ✅ 修正：送 author / author_avatar（avatar 永遠是字串）
  const submit = (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    const t = text.trim();
    if (!t) return;

    createComment.mutate(
      {
        post_id: post.id,
        text: t,
        author: user.displayName || user.email || "匿名",
        author_avatar: user.photoURL || "",
      },
      {
        onSuccess: () => {
          try {
            const myComments = JSON.parse(localStorage.getItem("myComments") || "[]");
            myComments.unshift({
              id: Date.now(),
              post_id: post.id,
              postTitle: post.title || "無標題文章",
              text: t,
              created_at: new Date().toISOString(),
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
        navigate("/feed");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative bg-white rounded-2xl shadow-md p-6">
            <button
              onMouseEnter={() => setHoverDelete(true)}
              onMouseLeave={() => setHoverDelete(false)}
              onClick={onDelete}
              className="absolute right-8 bottom-4 transition-transform hover:scale-110 active:scale-95"
              title="刪除文章"
              aria-label="刪除文章"
            >
              <img src={hoverDelete ? bin2 : bin} alt="刪除文章" className="w-6 h-6" />
            </button>

            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

            <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author}
                  className="w-8 h-8 rounded-full object-cover border border-[#E4D3B5]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E4D3B5] opacity-60" />
              )}
              <div>
                <div>{post.author}</div>
                <div className="text-xs">{fmt(post.created_at)}</div>
              </div>
            </div>

            <p className="mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {imgSrc && showImg ? (
              <img
                src={imgSrc}
                alt="post"
                className="rounded-xl mb-4"
                onError={() => setShowImg(false)}
              />
            ) : (
              post.image_url && (
                <div className="mb-4 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  圖片載入失敗
                </div>
              )
            )}

            <div className="flex items-center gap-6">
              <button
                onClick={onToggleLike}
                className="flex items-center gap-2 transition-transform hover:scale-110 active:scale-95"
                title={!user ? "請先登入才能按讚" : "按讚"}
              >
                <img src={post.is_liked ? heart2 : heart} alt="like" className="w-6 h-6" />
                <span className="text-gray-700">{post.likes_count ?? 0}</span>
              </button>

              <div className="flex items-center gap-2">
                <img src={comment} alt="comment" className="w-6 h-6 opacity-80" />
                <span className="text-gray-700">{commentCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!user ? (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="font-semibold mb-1">留言需要先登入帳號喔～</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
                前往登入
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-xl shadow p-4">
              <input
                className="input input-bordered w-full"
                placeholder="寫下留言..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div className="text-right mt-2">
                <button className="btn btn-primary btn-sm" disabled={createComment.isPending}>
                  {createComment.isPending ? "發布中…" : "發布"}
                </button>
              </div>
            </form>
          )}

          {post.comments?.slice().reverse().map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-500 mb-1">
                {c.author}・{fmt(c.created_at)}
              </div>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
