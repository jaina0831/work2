// src/pages/MyComments.jsx
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
    const myComments = JSON.parse(localStorage.getItem(kComments(user.uid)) || "[]");
    setItems(myComments);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ✅ 20px */}
        <button
          onClick={() => navigate("/auth")}
          className="btn bg-[#c76c21] text-white hover:bg-[#a95a1c] border-0 mb-5"
        >
          ← 返回帳號中心
        </button>

        <div className="bg-[#fff7e6] rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold mb-6">💬 我的留言紀錄</h1>

          {!user ? (
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="font-semibold mb-2">請先登入帳號</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
                前往登入
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow text-gray-500">
              目前沒有留言紀錄
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((c) => (
                <div key={c.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate">「{c.text}」</div>
                    <div className="text-sm text-gray-500">
                      該文章：{c.postTitle || "（無標題）"} ｜ 時間：{fmt(c.created_at)}
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
