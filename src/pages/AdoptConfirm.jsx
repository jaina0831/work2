// src/pages/AdoptConfirm.jsx
// 確認領養頁面 by Ting (fixed)

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdoptConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const animal = useMemo(
    () => animalsData.find((a) => a.id === Number(id)),
    [id]
  );

  // ✅ 追蹤登入狀態（避免頁面剛載入 currentUser 還沒同步）
  const [user, setUser] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ✅ 沒登入就導去登入
  useEffect(() => {
    if (user === null) {
      alert("請先登入帳號，才能確認領養 🐾");
      navigate("/login", showReplace(navigate));
    }
  }, [user, navigate]);

  // 小工具：避免 React Router warning
  function showReplace(navigateFn) {
    // 若你不想 replace，可以改成 return undefined;
    return { replace: true };
  }

  // ✅ 根據 user.uid 分開儲存（重要：不同帳號不互相干擾）
  const adoptListKey = user?.uid ? `adoptList_${user.uid}` : "adoptList";
  const confirmedKey = user?.uid
    ? `confirmedAdoptions_${user.uid}`
    : "confirmedAdoptions";

  const handleConfirm = () => {
    if (!animal) return;

    // ✅ 再保險：按按鈕當下仍需登入
    if (!user) {
      alert("請先登入帳號，才能確認領養 🐾");
      navigate("/login");
      return;
    }

    // 1) 取得已領養紀錄並新增（避免重複）
    const confirmed = JSON.parse(localStorage.getItem(confirmedKey) || "[]");
    if (!confirmed.find((a) => a.id === animal.id)) {
      const newAdoption = {
        ...animal,
        adoptDate: new Date().toLocaleDateString(),
        owner_uid: user.uid,
        owner_email: user.email || "",
      };
      confirmed.unshift(newAdoption);
      localStorage.setItem(confirmedKey, JSON.stringify(confirmed));
    }

    // 2) 從待領養清單移除
    const waiting = JSON.parse(localStorage.getItem(adoptListKey) || "[]");
    const updatedWaiting = waiting.filter((a) => a.id !== animal.id);
    localStorage.setItem(adoptListKey, JSON.stringify(updatedWaiting));

    // 3) 提示與跳轉
    alert(
      `恭喜！你已成功領養 ${animal.name} 🧡 \n快去「領養清單」查看你的新家人吧！`
    );
    navigate("/adoptlist");
  };

  if (!animal) {
    return <div className="p-10 text-center">找不到動物資訊...</div>;
  }

  // ✅ user 尚未同步完成時，先顯示載入（避免閃一下）
  if (user === undefined) {
    return <div className="p-10 text-center">載入中...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">確認領養</h2>

      <img
        src={animal.image}
        className="rounded-xl w-full h-72 object-cover mb-4 shadow-lg"
        alt={animal.name}
      />

      <p className="text-xl mb-4">
        你確定要領養{" "}
        <span className="font-bold text-[#c76c21]">{animal.name}</span> 嗎？🐾
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
