// AdoptList 待領養清單頁面 by Ting
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdoptList() {
  const [adopted, setAdopted] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adoptList")) || [];
    setAdopted(stored);
  }, []);

  const removeAnimal = (id) => {
    const newList = adopted.filter((a) => a.id !== id);
    localStorage.setItem("adoptList", JSON.stringify(newList));
    setAdopted(newList);
  };

  if (adopted.length === 0) {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          className="
            px-4 py-2 rounded-lg mb-4
            bg-[#CC6611] hover:bg-[#D67318] active:bg-[#B85C0F]
            transition
            text-white !text-white
          "
        >
          ⬅ &nbsp;返回
        </button>

        <p className="text-center mt-10">
          目前還沒有領養清單喔~ 趕快去認養一隻可愛浪浪吧❤️
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 返回 */}
      <button
        onClick={() => navigate(-1)}
        className="
          px-4 py-2 rounded-lg mb-4
          bg-[#c76c21] hover:bg-[#BB5500] active:bg-[#BB5500]
          transition
          text-white !text-white
        "
      >
        ⬅ &nbsp;返回
      </button>

      {/* 清單 */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {adopted.map((animal) => (
          <Link key={animal.id} to={`/report/${animal.id}`}>
            <div className="bg-white p-4 rounded-xl shadow hover:scale-105 transition">
              {/* 圖片與名字拉開距離 */}
              <img
                src={animal.image}
                className="rounded-xl w-full h-48 object-cover mb-3"
                alt={animal.name}
              />

              {/* 名字：粗體＋圓潤感（系統常見圓體優先） */}
              <h2
                className="mt-6 text-xl font-extrabold text-center "
                style={{
                  fontFamily:
                    '"PingFang TC","Noto Sans TC","Microsoft JhengHei","Inter",system-ui,-apple-system,sans-serif',
                }}
              >
                {animal.name}
              </h2>

              <div className="flex justify-center gap-3 mt-4">
                {/* 移除：#e7836f */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // 阻止 Link 跳頁
                    removeAnimal(animal.id);
                  }}
                  className="
                    px-4 py-2 rounded-lg
                    bg-[#e68673] hover:bg-[#c9604b] active:bg-[#c35741]
                    transition
                    text-white !text-white
                  "
                >
                  移除
                </button>

                {/* 我要領養：#e7b76f */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/AdoptConfirm/${animal.id}`);
                  }}
                  className="
                    px-4 py-2 rounded-lg
                    bg-[#E7B76F] hover:bg-[#BB5500] active:bg-[#994400]
                    transition
                    text-white !text-white
                  "
                >
                  我要領養
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
