// 收養動物列表 ting

import { Link } from "react-router-dom";

export default function AnimalCard({ animal }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow hover:scale-[1.02] transition">
      {/* 圖片佔滿內容區，左右邊界 = card 內容區邊界 */}
      <img
        src={animal.image}
        alt={animal.name}
        className="w-full h-56 object-cover rounded-2xl"
      />

      {/* 文字區：不要再加 px-*，讓左邊剛好對齊圖片左邊 */}
      <div className="mt-4">
        <h3
          className="text-2xl font-extrabold text-left"
          style={{
            fontFamily:
              '"PingFang TC","Noto Sans TC","Microsoft JhengHei","Inter",system-ui,-apple-system,sans-serif',
          }}
        >
          {animal.name}
        </h3>

        <p className="mt-2 text-left text-gray-500">
          {animal.age} 歲・{animal.gender}・{animal.breed}
        </p>

        {/* 按鈕容器：向右對齊 → 與圖片右邊緣對齊 */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 rounded-xl  bg-[#e7b76f] hover:bg-[#BB5500] active:bg-[#994400] active:scale-[0.98] transition text-white !text-white"
          >
            查看詳情
          </button>
        </div>
      </div>
    </div>
  );
}


