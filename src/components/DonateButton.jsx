//贊助按鈕by Ting

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function DonateButton() {
  const [showHeart, setShowHeart] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const handleDonate = () => {
    setShowHeart(true);

    // 0.8 秒後開啟彈窗
    setTimeout(() => {
      setShowHeart(false);
      setShowDonateModal(true);
    }, 900);
  };


        //  <div className="relative">
        //   <button
        //     onClick={handleDonate}
        //     className="
        //       px-5 py-2 bg-red-400 text-white rounded-xl
        //       hover:bg-red-500 flex items-center gap-2
        //       active:bg-red-700
        //       active:scale-[0.95] 
        //     "
        //   >
        //     贊助 ❤
        //   </button>

        //   {showHeart && (
        //     <motion.div
        //       initial={{ opacity: 0, scale: 0.5, y: 50 }}
        //       animate={{ opacity: 1, scale: 1.5, y: -70 }}
        //       exit={{ opacity: 0 }}
        //       className="absolute left-1/2 -translate-x-1/2 text-red-500"
        //     >
        //       ❤️
        //     </motion.div>
        //   )}
        // </div>


  return (
    <>
      <div className="relative">
        <button
          onClick={handleDonate}
          className="
            px-5 py-2 bg-red-400 text-white rounded-xl
             hover:bg-red-500 flex items-center gap-2
             active:bg-red-700
             active:scale-[0.95] 
             "
        >
         
          贊助 ❤
        </button>

        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1.5, y: -70 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 -translate-x-1/2 text-red-500"
          >
            ❤️
          </motion.div>
        )}
      </div>

      {showDonateModal && <DonateModal onClose={() => setShowDonateModal(false)} />}
    </>
  );
}

function DonateModal({ onClose }) {
  const [customAmount, setCustomAmount] = useState("");

  const donate = (amount) => {
    alert(`感謝你捐款 ${amount} 元 🧡`);
    onClose(); // ✅ 捐完自動關閉
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex justify-center items-center z-50">
      {/* 📌 外層白色卡片 */}
      <div className="bg-white p-6 rounded-xl shadow-2xl w-80 text-center border border-orange-200">
        <h2 className="text-xl font-bold mb-4">選擇捐款金額 💝</h2>

        {/* ✅ 預設金額 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[50, 100, 300, 500].map(amount => (
            <button
              key={amount}
              className="border border-orange-300 rounded-lg py-2 hover:bg-orange-100 transition"
              onClick={() => donate(amount)}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* ✏️ 自訂金額 */}
        <input
          type="number"
          min="1"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="自訂金額"
          className="w-full border border-gray-300 rounded-lg p-2 mb-3"
        />

        {/* 自訂金額送出 */}
        <button
          disabled={!customAmount}
          onClick={() => donate(customAmount)}
          className={`w-full py-2 rounded-lg mb-2 
            ${customAmount ? "bg-orange-400 hover:bg-orange-500 text-white" : "bg-gray-300 text-gray-600"}
          `}
        >
          捐款
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 hover:bg-gray-300"
        >
          取消
        </button>
      </div>
    </div>
  );
}
