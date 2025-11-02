// AnimalDetail 動物資訊詳細頁面 by Ting

import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";
import { motion } from "framer-motion"; // 彈跳愛心
import { useState } from "react";
import DonateButton from "../components/DonateButton";

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animalsData.find((a) => a.id === Number(id));

  const [showHeart, setShowHeart] = useState(false); // 彈跳愛心
  const handleDonate = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800); // 心跳完消失
  };

  function addToAdoptList() {
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
      {/* 返回鍵與圖片之間留空 */}
      <button
        onClick={() => navigate(-1)}
        className="
          px-4 py-2 rounded-lg
          bg-[#D67318] hover:bg-[#BB5500] active:bg-[#BB5500]
          transition
          text-white !text-white 
          mb-6    
        "
      >
        ⬅ &nbsp;返回
      </button>

      {/* 圖片與名稱之間再留空 */}
      <div className="mt-6">
    <img
      src={animal.image}
      alt={animal.name}
      className="block rounded-xl w-full h-96 object-cover"
    />
  </div>
<div className="mt-4">
      {/* 名字加粗（粗體），更顯眼可讀 */}
      <h1 className="text-3xl font-bold tracking-wide">{animal.name}</h1>
</div>
      <p className="text-gray-600 mt-2">
        {animal.age} 歲 · {animal.gender} · {animal.breed}
      </p>

      <p className="text-gray-600 mt-2">
        {animal.neutered ? "✅ 已結紮" : "❌ 未結紮"}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">{animal.description}</p>

      <div className="flex flex-wrap gap-4 mt-6">
        {/* 加入領養清單：底色 #CC6611、hover/active 統一橘系；字白 */}
        <button
          onClick={addToAdoptList}
          className="
            px-5 py-2 rounded-xl
            bg-[#e6737d] 
            hover:bg-[#c94b5c] active:bg-[#c34154]
            active:scale-[0.97] transition
          text-white !text-white 
          "
        >
          加入領養清單
        </button>

        {/* 待領養清單：底色 #E7B76F，hover/active 稍微加深；字白 */}
        <button
          onClick={() => navigate('/AdoptList')}
          className="
            px-5 py-2 rounded-xl
            bg-[#e68673] 
            hover:bg-[#c9604b] active:bg-[#c35741]
            active:scale-[0.97] transition
            text-white !text-white
          "
        >
          待領養清單
        </button>

        <DonateButton />
      </div>
    </div>
  );
}
