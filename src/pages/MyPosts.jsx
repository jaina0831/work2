// src/pages/MyPosts.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const kPosts = (uid) => `myPosts:${uid}`;

export default function MyPosts() {
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
    const myPosts = JSON.parse(localStorage.getItem(kPosts(user.uid)) || "[]");
    setItems(myPosts);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ✅ 20px 間距：用 mb-5 */}
        <button
          onClick={() => navigate("/auth")}
          className="btn bg-[#c76c21] text-white hover:bg-[#a95a1c] border-0 mb-5"
        >
          ← 返回帳號中心
        </button>

        <div className="bg-[#fff7e6] rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold mb-6">📝 我的發文紀錄</h1>

          {!user ? (
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="font-semibold mb-2">請先登入帳號</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
                前往登入
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow text-gray-500">
              目前沒有發文紀錄
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold">{p.title || "（無標題）"}</div>
                    <div className="text-sm text-gray-500">{fmt(p.created_at)}</div>
                  </div>

                  {/* ✅ 正確：用 p.id */}
                  <button
                    onClick={() => navigate(`/posts/${p.id}`)}
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
