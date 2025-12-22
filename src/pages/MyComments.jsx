import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const kComments = (uid) => `myComments:${uid}`;

export default function MyComments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => auth.currentUser);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const myComments = JSON.parse(
      localStorage.getItem(kComments(user.uid)) || "[]"
    );
    setItems(myComments);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* 返回帳號中心 */}
        <button
          onClick={() => navigate("/auth")}
          className="mb-5 inline-flex items-center gap-2
                     bg-[#c76c21] hover:bg-[#a95a1c]
                     text-white font-semibold
                     rounded-full px-5 py-3 shadow"
          style={{ color: "#fff" }}
        >
          ← 返回帳號中心
        </button>

        {/* 主匡 */}
        <div className="bg-[#fff7e6] rounded-3xl shadow p-8">
          <h1 className="text-3xl font-black mb-6 flex items-center gap-3">
            💬 我的留言紀錄
          </h1>

          {!user ? (
            <div className="bg-white rounded-2xl p-6 shadow">
              請先登入帳號
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow text-gray-500">
              目前沒有留言紀錄
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl shadow
                             px-6 py-5
                             flex items-center justify-between"
                >
                  {/* 左側文字 */}
                  <div>
                    {/* 留言內容 */}
                    <div className="text-lg font-semibold mb-1">
                      「{c.text}」
                    </div>

                    {/* 🔥 指定顏色區塊 */}
                    <div
                      className="text-sm font-medium"
                      style={{ color: "#c76c21" }}
                    >
                      該文章：{c.postTitle || "（無標題）"} ｜ 時間：
                      {fmt(c.created_at)}
                    </div>
                  </div>

                  {/* 右側按鈕 */}
                  <button
                    onClick={() => navigate(`/posts/${c.post_id}`)}
                    className="rounded-xl px-4 py-2
                               border border-[#c76c21]
                               text-[#c76c21] font-semibold
                               hover:bg-[#fff0dc]"
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
