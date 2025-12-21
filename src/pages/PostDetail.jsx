import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import { usePost, useLikePost, useCreateComment, useDeletePost } from "../lib/queries";
import { fmt } from "../lib/date";

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
  const commentCount = (post.comments || []).length;

  const onToggleLike = () => {
    if (!user) return navigate("/login");
    like.mutate(post.id);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");

    const t = text.trim();
    if (!t) return;

    createComment.mutate({ post_id: post.id, text: t });
    setText("");
  };

  const onDelete = () => {
    if (confirm("確定要刪除這篇文章嗎？")) {
      del.mutate(post.id, { onSuccess: () => navigate("/feed") });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：文章 */}
        <div className="lg:col-span-2">
          <div className="relative bg-white rounded-2xl shadow-md p-6">
            <button
              onMouseEnter={() => setHoverDelete(true)}
              onMouseLeave={() => setHoverDelete(false)}
              onClick={onDelete}
              className="absolute right-8 bottom-4 transition-transform hover:scale-110 active:scale-95"
              title="刪除文章"
            >
              <img src={hoverDelete ? bin2 : bin} alt="刪除文章" className="w-6 h-6" />
            </button>

            {/* post.author / post.author_avatar */}
            <div className="flex items-center gap-3 mb-3">
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

            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

            <p className="mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {imgSrc && showImg ? (
              <img
                src={imgSrc}
                alt="post"
                className="rounded-xl mb-4 w-full"
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
              {/* ✅ 登入才可按讚/收回讚，likes_count 會跟著後端 +1/-1 */}
              <button
                onClick={onToggleLike}
                className="flex items-center gap-2 transition-transform hover:scale-110 active:scale-95"
                disabled={like.isPending}
                title={!user ? "登入後才能按讚" : "按讚/收回讚"}
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

        {/* 右：留言 */}
        <div className="space-y-3">
          {!user ? (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-700 mb-2">留言需要先登入帳號喔～</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
                前往登入
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-xl shadow p-4">
              <input
                className="input input-bordered w-full"
                placeholder="留言…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div className="text-right mt-2">
                <button className="btn btn-primary btn-sm">發布</button>
              </div>
            </form>
          )}

          {(post.comments || []).slice().reverse().map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                {c.author_avatar ? (
                  <img
                    src={c.author_avatar}
                    alt={c.author}
                    className="w-8 h-8 rounded-full object-cover border border-[#E4D3B5]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E4D3B5] opacity-60" />
                )}

                <div className="flex flex-col leading-tight">
                  <div className="text-sm font-semibold">{c.author}</div>
                  <div className="text-xs text-gray-500">{fmt(c.created_at)}</div>
                </div>
              </div>

              <p className="whitespace-pre-wrap">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
