// src/pages/AnimalDetail.jsx
// AnimalDetail 動物資訊詳細頁面 by Ting (fixed)

import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import DonateButton from "../components/DonateButton";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const animal = useMemo(
    () => animalsData.find((a) => a.id === Number(id)),
    [id]
  );

  const [showHeart, setShowHeart] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0);

  // ✅ 追蹤登入狀態
  const [user, setUser] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ⭐ 計算該動物贊助總額（你原本就有）
  useEffect(() => {
    const records = JSON.parse(localStorage.getItem("sponsorList") || "[]");
    const sum = records
      .filter((r) => r.animalId === Number(id))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    setTotalDonated(sum);
  }, [id]);

  if (!animal) return <div className="p-10 text-center">找不到動物資訊...</div>;

  const handleDonate = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  function addToAdoptList() {
    if (!user) {
      alert("請先登入帳號，才能加入領養清單 🐾");
      navigate("/login");
      return;
    }

    // ✅ 分帳號存 key
    const adoptListKey = `adoptList_${user.uid}`;

    const list = JSON.parse(localStorage.getItem(adoptListKey) || "[]");

    if (!list.find((a) => a.id === animal.id)) {
      list.unshift({
        ...animal,
        owner_uid: user.uid,
        owner_email: user.email || "",
        added_at: new Date().toISOString(),
      });
      localStorage.setItem(adoptListKey, JSON.stringify(list));
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

      <div className="mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">{animal.name}</h1>
          <p className="text-gray-600 mt-2">
            {animal.age} 歲 · {animal.gender} · {animal.breed}
          </p>
        </div>

        {totalDonated > 0 && (
          <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg text-right shadow-sm">
            <p className="text-[10px] text-[#BB5500] font-bold uppercase tracking-tighter">
              累計贊助
            </p>
            <p className="text-xl font-black text-[#BB5500]">
              ${totalDonated.toLocaleString()}
            </p>
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
          onClick={() => navigate("/adoptlist")}
          className="px-5 py-2 rounded-xl bg-[#e68673] hover:bg-[#c9604b] active:bg-[#c35741] active:scale-[0.97] transition text-white !text-white"
        >
          待領養清單
        </button>

        <DonateButton animalId={animal.id} animalName={animal.name} />
      </div>

      {showHeart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-10 right-10 text-4xl"
        >
          💖
        </motion.div>
      )}
    </div>
  );
}
