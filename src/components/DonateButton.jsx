
// 贊助按鈕 by Ting（調整色票＋間距）
import { useState } from "react";
import { motion } from "framer-motion";

// ✅ 修改：組件現在接收 animalId 和 animalName
export default function DonateButton({ animalId, animalName }) {
  const [showHeart, setShowHeart] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleDonate = () => {
    setShowHeart(true);
    setTimeout(() => {
      setShowHeart(false);
      setShowDonateModal(true);
    }, 900);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleDonate}
          className="px-5 py-2 rounded-xl bg-[#e7b76f] hover:bg-[#BB5500] active:bg-[#994400] active:scale-[0.95] flex items-center gap-2 text-white !text-white"
        >
          贊助 ❤
        </button>

        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1.5, y: -70 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 text-[#BB5500]"
          >
            ❤️
          </motion.div>
        )}
      </div>

      {/* ✅ 修改：將相關資訊傳給 Modal */}
      {showDonateModal && (
        <DonateModal 
          animalId={animalId} 
          animalName={animalName} 
          onClose={() => setShowDonateModal(false)} 
        />
      )}
    </>
  );
}

function DonateModal({ onClose, animalId, animalName }) {
  const [customAmount, setCustomAmount] = useState("");

  // ⭐ 新增：處理贊助存儲邏輯
  const donate = (amount) => {
    const numAmount = Number(amount);
    
    if (!numAmount || numAmount <= 0) {
      alert("請輸入有效的贊助金額 🐾");
      return;
    }

    // 1. 取得舊有紀錄
    const records = JSON.parse(localStorage.getItem("sponsorList")) || [];
    
    // 2. 加入新紀錄 (包含動物 ID、名稱、金額、時間)
    records.push({
      animalId: animalId,
      animalName: animalName,
      amount: numAmount,
      date: new Date().toLocaleString()
    });

    // 3. 存回 localStorage
    localStorage.setItem("sponsorList", JSON.stringify(records));

    alert(`感謝你捐款 ${numAmount} 元給 ${animalName} 🧡`);
    
    // 4. 關閉視窗並重新整理頁面以更新 AnimalDetail 的顯示金額
    onClose();
    window.location.reload(); 
  };

  const donateBtnColor = customAmount
    ? "bg-[#BB5500] hover:bg-[#994400]"
    : "bg-[#e7b76f] hover:bg-[#994400]";

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-80 text-center border border-orange-200">
        <h2 className="text-xl font-bold mb-1">贊助 {animalName} 💝</h2>
        <p className="text-xs text-gray-400 mb-4">選擇或輸入捐款金額</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[50, 100, 300, 500].map((amount) => (
            <button
              key={amount}
              className="border border-orange-300 rounded-lg py-2 hover:bg-orange-100 transition"
              onClick={() => donate(amount)}
            >
              ${amount}
            </button>
          ))}
        </div>

        <input
          type="number"
          min="1"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="自訂金額"
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <div className="mt-3 flex flex-col gap-3">
          <button
            onClick={() => donate(customAmount)}
            className={`w-full py-2 rounded-lg transition ${donateBtnColor} text-white !text-white`}
          >
            確認捐款
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg transition bg-[#e7b76f] hover:bg-[#994400] text-white !text-white"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
