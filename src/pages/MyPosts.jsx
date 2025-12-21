// src/pages/MyPosts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";

const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";

export default function MyPosts() {
  const [myPosts, setMyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ⭐ 從 localStorage 讀取紀錄
    const savedPosts = JSON.parse(localStorage.getItem("myPosts")) || [];
    setMyPosts(savedPosts.reverse()); // 最新的排前面
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: APP_BG }}>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 rounded-lg bg-[#D67318] !text-white shadow-md transition hover:bg-[#BB5500]">
          ⬅ 返回帳號中心
        </button>

        <div className="rounded-2xl shadow-xl p-8 mt-8" style={{ backgroundColor: CARD_BG }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 我的發文紀錄</h1>
          
          {myPosts.length > 0 ? (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{fmt(post.created_at)}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/post/${post.id}`)} 
                    className="px-4 py-2 rounded-lg border border-[#D67318] text-[#D67318] hover:bg-[#D67318] hover:text-white transition"
                  >
                    詳情
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-amber-200">
              <p className="text-gray-500">你還沒有發布過任何文章喔 🐾</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}