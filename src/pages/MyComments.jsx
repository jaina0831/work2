// src/pages/MyComments.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";

export default function MyComments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const myComments = JSON.parse(localStorage.getItem("myComments") || "[]");
    setItems(myComments);
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
          <h2 className="text-2xl font-bold mb-6">💬 我的留言紀錄</h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-500">
              目前還沒有留言紀錄喔～
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-black/5 shadow-sm p-5 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 truncate">
                      「{c.text}」
                    </div>

                    <div className="text-[11px] text-gray-500 mt-2">
                      該文章：{c.postTitle || "（無標題）"}
                      <span className="mx-2">｜</span>
                      時間：{c.created_at ? fmt(c.created_at) : ""}
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
