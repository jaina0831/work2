// AdoptConfirm.jsx 確認領養頁面by Ting

import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";

export default function AdoptConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animalsData.find(a => a.id === Number(id));

  // ✅ 核心功能修改：處理確認領養的資料轉換
  const handleConfirm = () => {
    if (!animal) return;

    // 1. 取得現有的已領養紀錄並新增
    const confirmed = JSON.parse(localStorage.getItem("confirmedAdoptions")) || [];
    
    // ⭐ 檢查是否已經領養過，避免重複存入
    if (!confirmed.find(a => a.id === animal.id)) {
      const newAdoption = {
        ...animal,
        adoptDate: new Date().toLocaleDateString(), // 紀錄領養日期
      };
      confirmed.push(newAdoption);
      localStorage.setItem("confirmedAdoptions", JSON.stringify(confirmed));
    }

    // 2. ⭐ 自動從「待領養書籤 (adoptList)」中移除
    const waiting = JSON.parse(localStorage.getItem("adoptList")) || [];
    const updatedWaiting = waiting.filter(a => a.id !== animal.id);
    localStorage.setItem("adoptList", JSON.stringify(updatedWaiting));

    // 3. 提示與跳轉
    alert(`恭喜！你已成功領養 ${animal.name} 🧡 \n快去「領養清單」查看你的新家人吧！`);
    
    // 跳轉至領養清單頁，讓使用者立刻看到分類後的結果
    navigate("/adoptlist"); 
  };

  if (!animal) return <div className="p-10 text-center">找不到動物資訊...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">確認領養</h2>
      <img src={animal.image} className="rounded-xl w-full h-72 object-cover mb-4 shadow-lg" alt={animal.name} />

      <p className="text-xl mb-4">
        你確定要領養 <span className="font-bold text-[#c76c21]">{animal.name}</span> 嗎？🐾
      </p>
      
      <p className="text-gray-500 text-sm mb-8">
        點擊確認後，{animal.name} 將會正式加入您的已領養清單。
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-[#e68673] hover:bg-[#c9604b] active:bg-[#c35741]
                    transition shadow-md text-white !text-white"
        >
          返回
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded-lg bg-[#E7B76F] hover:bg-[#c76c21] active:bg-[#994400] 
                    transition shadow-md text-white !text-white font-bold"
        >
          確認領養
        </button>
      </div>
    </div>
  );
}