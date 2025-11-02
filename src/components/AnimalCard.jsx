// 收養動物列表 ting

import { Link } from "react-router-dom";

export default function AnimalCard({ animal }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition p-3">
      <img
        src={animal.image}
        alt={animal.name}
        className="w-full h-48 object-cover rounded-xl"
      />
      <div className="mt-3 px-5">
        <h2 className="text-lg font-semibold">{animal.name}</h2>
        <p className="text-sm text-gray-500">{animal.age} 歲 · {animal.gender}· {animal.breed}</p>
        <div className="flex justify-end mt-5">
          <Link
            to={`/report/${animal.id}`}
            className="px-4 py-2 bg-orange-400 text-white rounded-lg
             hover:bg-orange-500
             active:bg-orange-600
            active:scale-[0.95] 
            "
          >
            查看詳情
          </Link>
        </div>
      </div>
    </div>
  );
}