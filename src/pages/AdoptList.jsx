//AdoptList 待領養清單頁面 by Ting

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdoptList() {
  const [adopted, setAdopted] = useState([]);
   const navigate = useNavigate(); // ✅ add this

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adoptList")) || [];
    setAdopted(stored);
  }, []);

  const removeAnimal = (id) => {
    const newList = adopted.filter(a => a.id !== id);
    localStorage.setItem("adoptList", JSON.stringify(newList));
    setAdopted(newList);
  };




  if (adopted.length === 0) {

    return (

    <div>
    <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mb-4"
    >
        ⬅ &nbsp;返回
    </button>

    <p className="text-center mt-10">目前還沒有領養清單喔~ 趕快去認養一隻可愛浪浪吧❤️</p>

    </div>
    
    );
  }

  return (

    <div>
        
    <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mb-4"
    >
        ⬅ &nbsp;返回
    </button>
        
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">

    {adopted.map(animal => (
      <Link key={animal.id} to={`/report/${animal.id}`}>
        <div className="bg-white p-4 rounded-xl shadow hover:scale-105 transition">

          <img src={animal.image} className="rounded-xl w-full h-48 object-cover" />
          <h2 className="text-xl font-bold mt-2 text-center">{animal.name}</h2>

          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={(e) => {
                e.preventDefault(); // ❗阻止 Link 跳頁
                removeAnimal(animal.id);
              }}
              className=" bg-red-400 hover:bg-red-500 text-white rounded-lg px-4 py-2 "
            >
              移除
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/AdoptConfirm/${animal.id}`);
              }}
              className=" bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg px-4 py-2"
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