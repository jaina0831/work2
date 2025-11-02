//AdoptConfirm.jsx 確認領養頁面by Ting

import { useParams, useNavigate } from "react-router-dom";
import { animalsData } from "../data/animals";

export default function AdoptConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animalsData.find(a => a.id === Number(id));

  const handleConfirm = () => {
    alert(`恭喜！你已成功領養 ${animal.name} 🧡`);
    navigate("/"); // 可以改成首頁或領養完成頁
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">確認領養</h2>
      <img src={animal.image} className="rounded-xl w-full h-72 object-cover mb-4" />

      <p className="text-xl mb-4">
        你確定要領養 <span className="font-bold">{animal.name}</span> 嗎？🐾
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2  rounded-lg bg-[#e68673] hover:bg-[#c9604b] active:bg-[#c35741]
                    transition
                    text-white !text-white"
        >
          返回
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2 rounded-lg bg-[#E7B76F] hover:bg-[#c76c21] active:bg-[#994400] transition
                    text-white !text-white"
        >
          確認領養
        </button>
      </div>
    </div>
  );
}