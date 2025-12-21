// src/pages/MyComments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fmt } from "../lib/date";

const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";

export default function MyComments() {
  const [myComments, setMyComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ⭐ 從 localStorage 讀取留言紀錄
    const savedComments = JSON.parse(localStorage.getItem("myComments")) || [];
    setMyComments(savedComments.reverse());
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: APP_BG }}>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 rounded-lg bg-[#D67318] !text-white shadow-md">
          ⬅ 返回帳號中心
        </button>

        <div className="rounded-2xl shadow-xl p-8 mt-8" style={{ backgroundColor: CARD_BG }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">💬 我的留言紀錄</h1>
          
          {myComments.length > 0 ? (
            <div className="space-y-4">
              {myComments.map((comment) => (
                <div key={comment.id} className="bg-white p-5 rounded-xl shadow-sm border border-amber-100">
                  <p className="text-gray-800 mb-3 font-medium text-lg">「{comment.text}」</p>
                  <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-amber-700">
                      於文章：<span className="font-bold">{comment.postTitle}</span> <br/>
                      時間：{fmt(comment.created_at)}
                    </p>
                    <button 
                      onClick={() => navigate(`/post/${comment.post_id}`)} 
                      className="text-[#D67318] font-bold text-sm hover:underline"
                    >
                      前往文章 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-amber-200">
              <p className="text-gray-500">目前還沒有留言紀錄喔 🗨️</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}