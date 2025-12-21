//Report 登記野貓頁面 by ting


import { Outlet, Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import { useState } from "react";
import { animalsData } from "../data/animals";
import { Space } from "antd";
import { useAuth } from "../context/AuthContext"; //new
import { useNavigate } from "react-router-dom"; //new

export default function Report() {
  const { user } = useAuth(); // 【新增】取得全域登入狀態
  const navigate = useNavigate(); // 【新增】取得跳轉頁面的函式
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // all / cat / dog
  const [onlyNeutered, setOnlyNeutered] = useState(false); // ✅ 已結紮篩選

  const filteredAnimals = animalsData.filter((animal) => {
    const matchSearch = animal.name.includes(search);

    let matchCategory = true;
      
    if (filterCategory === "cat" || filterCategory === "dog") {
        // 如果選擇貓或狗，則按 animal.category 進行精確匹配
        matchCategory = animal.category === filterCategory;
    } else if (filterCategory === "other") {
        // 如果選擇「其他」，則排除貓和狗
        matchCategory = animal.category !== "cat" && animal.category !== "dog";
    }
      // 如果 filterCategory === "all"，則 matchCategory 保持 true (全部顯示)

    const matchNeuter = !onlyNeutered || animal.neutered === true;
      
      // 修正點 5: 過濾條件
    return matchSearch && matchCategory && matchNeuter; 
  });


  const perPage = 8;
  const totalPages = Math.ceil(filteredAnimals.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentAnimals = filteredAnimals.slice(start, start + perPage);

  // 【新增】處理卡片點擊的邏輯
  const handleAnimalClick = (id) => {
    if (!user) {
      // 1. 如果沒登入，跳出提醒
      alert("請先登入帳號，才能查看動物詳情與進行收養喔！");
      // 2. 導向登入頁面
      navigate("/login");
    } else {
      // 3. 已登入，正常前往詳細頁面
      navigate(`/report/${id}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">可領養的動物</h1>

      {/* ✅ 搜尋 + 篩選區塊 */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-center p-4 ">

        {/* 🔍 搜尋 */}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
          placeholder="搜尋動物名稱..."
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 w-48 shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />

        {/* 🐱 類別 */}
        <select
          value={filterCategory}
          onChange={(e) => {
            setCurrentPage(1);
            setFilterCategory(e.target.value);
          }}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
          <option value="all">全部</option>
          <option value="cat">貓咪 🐱</option>
          <option value="dog">狗狗 🐶</option>
          <option value="other">其他 🐾</option>
        </select>

        

        {/* 🔘 已結紮按鈕 */}
        <button
          onClick={() => {
            setCurrentPage(1);
            setOnlyNeutered(!onlyNeutered);
          }}
          className={`px-4 py-2 rounded-lg shadow-sm border transition 
            ${onlyNeutered ? "bg-blue-100 border-gray-200 text-gray-700  hover:bg-blue-200" : "bg-white border-gray-200 text-gray-700 hover:bg-blue-100"}
          `}
        >
          {onlyNeutered ? "☑ 只看已結紮" : "□ 只看已結紮"}
        </button>

      </div>

      
      {/* ✅ 卡片區 (修改點：將 Link 改為手動點擊判斷) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {currentAnimals.map((animal) => (
            <div 
              key={animal.id} 
              onClick={() => handleAnimalClick(animal.id)} 
              className="cursor-pointer transition hover:opacity-80"
            >
              {/* 這裡不再包 Link，由父層 div 的 onClick 控制 */}
              <AnimalCard animal={animal} />
            </div>
          ))}
        </div>

      {/* ✅ 分頁 */}
      <div className="flex justify-center mt-12 space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1  rounded bg-[#E7836F] hover:bg-[#c9604b] active:bg-[#c35741] transition
          text-white !text-white"
        >
          上一頁
        </button>
        <Space> </Space>
        <span>{currentPage} / {totalPages}</span>
        <Space> </Space>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 rounded bg-[#E7836F] hover:bg-[#c9604b] active:bg-[#c35741] transition
          text-white !text-white"
        >
          下一頁
        </button>
      </div>

      <Outlet />
    </div>
  );
}