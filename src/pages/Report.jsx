//Report 登記野貓頁面 by ting


import { Outlet, Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import { useState } from "react";
import { animalsData } from "../data/animals";
import { Space } from "antd";

export default function Report() {
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

      
      {/* ✅ 卡片區 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {currentAnimals.map((animal) => (
          <Link key={animal.id} to={`${animal.id}`}>
            <AnimalCard animal={animal} />
          </Link>
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