// AnimalDetail 動物資訊詳細頁面 by Ting
import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";
import { motion } from "framer-motion"; 
import { useState, useEffect } from "react"; // ✅ 修改點：引入 useEffect
import DonateButton from "../components/DonateButton";

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animalsData.find((a) => a.id === Number(id));

  const [showHeart, setShowHeart] = useState(false); 
  
  // ⭐ 新增：儲存該動物目前被贊助的總金額
  const [totalDonated, setTotalDonated] = useState(0);

  // ⭐ 新增：從 localStorage 計算該動物目前的贊助總額
  useEffect(() => {
    const records = JSON.parse(localStorage.getItem("sponsorList")) || [];
    // 過濾出屬於這隻動物的贊助紀錄並加總
    const sum = records
      .filter((r) => r.animalId === Number(id))
      .reduce((acc, curr) => acc + curr.amount, 0);
    setTotalDonated(sum);
  }, [id]);

  const handleDonate = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800); 
  };

  function addToAdoptList() {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("請先登入帳號，才能加入領養清單 🐾");
      return;
    }

    const list = JSON.parse(localStorage.getItem("adoptList")) || [];
    if (!list.find((a) => a.id === animal.id)) {
      list.push(animal);
      localStorage.setItem("adoptList", JSON.stringify(list));
      alert(`${animal.name} 已加入領養清單 🧡`);
    } else {
      alert(`${animal.name} 已在領養清單中`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-6 pb-10">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg bg-[#D67318] hover:bg-[#BB5500] active:bg-[#BB5500] transition text-white !text-white mb-6"
      >
        ⬅ &nbsp;返回
      </button>

      <div className="mt-6">
        <img
          src={animal.image}
          alt={animal.name}
          className="block rounded-xl w-full h-96 object-cover"
        />
      </div>

      {/* ✅ 修改：標題區塊改為 flex 並加入贊助金額顯示 */}
      <div className="mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">{animal.name}</h1>
          <p className="text-gray-600 mt-2">
            {animal.age} 歲 · {animal.gender} · {animal.breed}
          </p>
        </div>

        {/* ⭐ 新增：顯示這隻動物收到的贊助總金額標籤 */}
        {totalDonated > 0 && (
          <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg text-right shadow-sm">
            <p className="text-[10px] text-[#BB5500] font-bold uppercase tracking-tighter">累計贊助</p>
            <p className="text-xl font-black text-[#BB5500]">${totalDonated.toLocaleString()}</p>
          </div>
        )}
      </div>

      <p className="text-gray-600 mt-2">
        {animal.neutered ? "✅ 已結紮" : "❌ 未結紮"}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">{animal.description}</p>

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={addToAdoptList}
          className="px-5 py-2 rounded-xl bg-[#e6737d] hover:bg-[#c94b5c] active:bg-[#c34154] active:scale-[0.97] transition text-white !text-white"
        >
          加入領養清單
        </button>

        <button
          onClick={() => navigate('/AdoptList')}
          className="px-5 py-2 rounded-xl bg-[#e68673] hover:bg-[#c9604b] active:bg-[#c35741] active:scale-[0.97] transition text-white !text-white"
        >
          待領養清單
        </button>

        {/* ✅ 修改：將當前動物 ID 傳入贊助組件 */}
        <DonateButton animalId={animal.id} animalName={animal.name} />
      </div>
    </div>
  );
}