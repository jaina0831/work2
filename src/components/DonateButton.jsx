// 贊助按鈕 by Ting（調整色票＋間距）
import { useState } from "react";
import { motion } from "framer-motion";

export default function DonateButton() {
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
        {/* 觸發鈕 → #BB5500 */}
        <button
          onClick={handleDonate}
          className="
            px-5 py-2 rounded-xl
            bg-[#e7b76f] hover:bg-[#BB5500] active:bg-[#994400]
            active:scale-[0.95] flex items-center gap-2
          text-white !text-white
          "
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

      {showDonateModal && <DonateModal onClose={() => setShowDonateModal(false)} />}
    </>
  );
}

function DonateModal({ onClose }) {
  const [customAmount, setCustomAmount] = useState("");

  const donate = (amount) => {
    alert(`感謝你捐款 ${amount} 元 🧡`);
    onClose();
  };

  // 按鈕色票：有自訂金額 → #994400；否則 → #BB5500；hover 都有
  const donateBtnColor = customAmount
    ? "bg-[#BB5500] hover:bg-[#994400]"
    : "bg-[#e7b76f] hover:bg-[#994400]";

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-80 text-center border border-orange-200">
        <h2 className="text-xl font-bold mb-4">選擇捐款金額 💝</h2>

        {/* 預設金額 */}
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

        {/* 自訂金額 */}
        <input
          type="number"
          min="1"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="自訂金額"
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        {/* 讓兩個按鈕之間有間距 */}
        <div className="mt-3 flex flex-col gap-3">
          {/* 捐款 → 基本 #BB5500、hover #cc6611；有自訂金額時變 #994400 */}
          <button
    onClick={() => donate(customAmount || "未填")}
    className={`
      w-full py-2 rounded-lg transition 
      ${donateBtnColor} 
      text-white !text-white
    `}
  >
    捐款
  </button>

          {/* 取消 → 背景 #fff9f0、hover 我幫你調成 #FFEACE；文字白色 */}
          <button
    onClick={onClose}
    className="
      w-full py-2 rounded-lg transition 
      bg-[#e7b76f] hover:bg-[#994400] 
      text-white !text-white
    "
  >
    取消
  </button>
        </div>
      </div>
    </div>
  );
}
