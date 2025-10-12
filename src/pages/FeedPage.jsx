import PostForm from "../components/PostForm";
import { usePosts } from "../lib/queries";
import { Link } from "react-router-dom";
import { fmt } from "../lib/date";

export default function FeedPage() {
  const { data: posts, isLoading } = usePosts();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">🐾 貓咪日常分享</h1>
        <PostForm />
        {isLoading && <p>載入中...</p>}
        <div className="space-y-4">
          {posts?.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">
                {p.author}・{fmt(p.created_at)}
              </div>
              <h2 className="text-xl font-bold">{p.title}</h2>
              <div className="text-right mt-2">
                <Link to={`/post/${p.id}`} className="link link-primary">See more →</Link>
              </div>
            </div>
          ))}
          {!isLoading && posts?.length === 0 && (
            <p className="opacity-60">還沒有貼文，發一篇吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}