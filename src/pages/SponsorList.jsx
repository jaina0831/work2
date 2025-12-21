// src/pages/SponsorList.jsx 期末新增
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";
const ACCENT_COLOR = "#D6B788";

export default function SponsorList() {
  const [sponsors, setSponsors] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 從 localStorage 讀取贊助紀錄
    const records = JSON.parse(localStorage.getItem("sponsorList")) || [];
    
    // 2. 依照時間排序 (最新的在上面)
    const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 3. 計算總金額
    const total = records.reduce((sum, item) => sum + Number(item.amount), 0);
    
    setSponsors(sortedRecords);
    setTotalAmount(total);
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: APP_BG }}>
      <div className="max-w-2xl mx-auto">
        {/* 返回按鈕 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-[#D67318] hover:bg-[#BB5500] !text-white transition shadow-md"
        >
          ⬅ 返回帳號中心
        </button>

        <div className="rounded-2xl shadow-xl p-8 mt-8" style={{ backgroundColor: CARD_BG }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">💰 我的贊助紀錄</h1>
          <p className="text-gray-500 text-sm mb-6">感謝你的愛心，讓浪浪們有更好的生活</p>

          {/* 總額統計卡片 */}
          <div className="bg-white rounded-xl p-6 mb-8 border border-amber-100 flex justify-between items-center shadow-sm">
            <span className="text-gray-600 font-medium">累計贊助總額</span>
            <span className="text-3xl font-black text-[#BB5500]">${totalAmount.toLocaleString()}</span>
          </div>

          {/* 清單列表 */}
          <div className="space-y-4">
            {sponsors.length > 0 ? (
              sponsors.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/60 p-4 rounded-xl border border-white flex justify-between items-center hover:bg-white transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">贊助給 {item.animalName}</h3>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <div className="text-lg font-bold text-[#D67318]">
                    + ${Number(item.amount).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">目前還沒有贊助紀錄喔 🐾</p>
                <button 
                  onClick={() => navigate("/report")}
                  className="mt-4 text-sm font-bold underline text-[#D67318]"
                >
                  前往看看需要幫助的浪浪
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}