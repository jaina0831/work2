//AnimalDetail 動物資訊詳細頁面 by ting

import { useParams, useNavigate } from "react-router-dom";     
import { animalsData } from "../data/animals";
import { motion } from "framer-motion"; //彈跳愛心
import { useState } from "react";
import DonateButton from "../components/DonateButton";



export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animalsData.find(a => a.id === Number(id));

  const [showHeart, setShowHeart] = useState(false);   //彈跳愛心
  const handleDonate = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800); //心跳完消失
  };
  


  function addToAdoptList() {
    const list = JSON.parse(localStorage.getItem("adoptList")) || [];
    if (!list.find(a => a.id === animal.id)) {
      list.push(animal);
      localStorage.setItem("adoptList", JSON.stringify(list));
      alert(`${animal.name} 已加入領養清單 🧡`);
    } else {
      alert(`${animal.name} 已在領養清單中`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

       <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mb-4"
      >
        ⬅ &nbsp;返回
      </button>

      <img src={animal.image} alt={animal.name} className="rounded-xl w-full h-96 object-cover" />
      <h1 className="text-3xl font-bold mt-4">{animal.name}</h1>
      <p className="text-gray-600 mt-2">
        {animal.age} 歲 · {animal.gender} · {animal.breed}
      </p>

      <p className="text-gray-600 mt-2">
        {animal.neutered ? "✅ 已結紮" : "❌ 未結紮"}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">{animal.description}</p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={addToAdoptList}
          className="
            px-5 py-2 bg-orange-400 text-white rounded-xl
             hover:bg-orange-500
             active:bg-orange-600
            active:scale-[0.95] 
             "
        >
          加入領養清單
        </button>
        
        <button
          onClick={() => navigate("/AdoptList")}
          className="
            px-5 py-2 bg-yellow-500 text-white rounded-xl
             hover:bg-yellow-600
             active:bg-yellow-700
            active:scale-[0.95] 
          "
        >
          待領養清單
        </button>

        <DonateButton />  
      
      </div>
    </div>
  );
}