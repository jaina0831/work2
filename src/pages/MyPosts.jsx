// src/pages/MyPosts.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";

export default function MyPosts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const myPosts = JSON.parse(localStorage.getItem("myPosts") || "[]");
    setItems(myPosts);
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/auth")}
          className="px-4 py-2 rounded-lg bg-[#c76c21] hover:bg-[#BB5500] transition text-white !text-white mb-6"
        >
          ← 返回帳號中心
        </button>

        <div className="bg-[#FFF7E6] rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">📝 我的發文紀錄</h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-500">
              目前還沒有發文紀錄喔～
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-black/5 shadow-sm p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{p.title || "（無標題）"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.created_at ? fmt(p.created_at) : ""}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/posts/${c.post_id}`)}
                    className="ml-4 text-sm font-semibold text-[#c76c21] hover:underline whitespace-nowrap"
                  >
                    前往文章 →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
