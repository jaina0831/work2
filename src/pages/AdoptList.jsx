// src/pages/AdoptList.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdoptList() {
  const [waitingList, setWaitingList] = useState([]); // 待領養
  const [confirmedList, setConfirmedList] = useState([]); // 已領養
  const navigate = useNavigate();

  useEffect(() => {
    // ⭐ 讀取待領養資料
    const storedWaiting = JSON.parse(localStorage.getItem("adoptList")) || [];
    setWaitingList(storedWaiting);

    // ⭐ 讀取已領養資料 (Key 為 confirmedAdoptions)
    const storedConfirmed = JSON.parse(localStorage.getItem("confirmedAdoptions")) || [];
    setConfirmedList(storedConfirmed);
  }, []);

  // 移除待領養
  const removeAnimal = (id) => {
    const newList = waitingList.filter((a) => a.id !== id);
    localStorage.setItem("adoptList", JSON.stringify(newList));
    setWaitingList(newList);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 返回按鈕 */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg mb-8 bg-[#c76c21] hover:bg-[#BB5500] transition text-white !text-white"
      >
        ⬅ &nbsp;返回
      </button>

      {/* ------------------- 第一區塊：待領養 ------------------- */}
      <section className="mb-12 mt-10">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#e68673] pl-3 text-gray-800">
          🐾 待領養清單 (書籤)
        </h2>
        
        {waitingList.length === 0 ? (
          // ⭐ 修改點：當清單為空時，新增跳轉至 Report 頁面的連結按鈕
          <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-dashed border-gray-200">
            <p className="text-gray-400 mb-6">
              目前還沒有待領養的動物喔 ❤️
            </p>
            <button
              onClick={() => navigate("/report")}
              className="px-6 py-3 rounded-full bg-[#E7B76F] hover:bg-[#BB5500] transition text-white font-bold shadow-md hover:scale-105 active:scale-95"
            >
              🚀 前往動物列表找尋新家人
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {waitingList.map((animal) => (
              <div key={animal.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <Link to={`/report/${animal.id}`}>
                  <img
                    src={animal.image}
                    className="rounded-xl w-full h-40 object-cover mb-3"
                    alt={animal.name}
                  />
                  <h3 className="text-xl font-extrabold text-center mb-4">{animal.name}</h3>
                </Link>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/AdoptConfirm/${animal.id}`)}
                    className="w-full py-2 rounded-lg bg-[#E7B76F] hover:bg-[#BB5500] transition text-white !text-white text-sm"
                  >
                    前往領養
                  </button>
                  <button
                    onClick={() => removeAnimal(animal.id)}
                    className="w-full py-2 rounded-lg bg-[#e68673] hover:bg-[#c9604b] transition text-white !text-white text-sm"
                  >
                    從書籤移除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------- 第二區塊：已領養 ------------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#5ca382] pl-3 text-gray-800">
          🏠 已領養成功 (正式家庭)
        </h2>
        
        {confirmedList.length === 0 ? (
          <p className="text-gray-400 bg-white p-10 rounded-xl text-center shadow-sm">
            目前還沒有已領養的紀錄，期待你的好消息！ ✨
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {confirmedList.map((animal) => (
              <div key={animal.id} className="bg-[#f0f9f4] p-4 rounded-xl shadow-sm border border-[#d1e7dd]">
                <img
                  src={animal.image}
                  className="rounded-xl w-full h-40 object-cover mb-3 grayscale-[50%]"
                  alt={animal.name}
                />
                <h3 className="text-xl font-extrabold text-center text-[#2d5a44]">{animal.name}</h3>
                <div className="mt-3 text-center">
                  <span className="inline-block bg-[#d1e7dd] text-[#0f5132] px-3 py-1 rounded-full text-xs font-bold">
                    已正式成為家人
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  領養日期：{animal.adoptDate || "近期"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}