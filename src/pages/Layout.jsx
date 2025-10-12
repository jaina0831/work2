import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "text-gray-800 no-underline px-5 py-2 rounded-md transition-colors duration-200 hover:bg-gray-100 hover:text-black";
const active = ({ isActive }) =>
  isActive ? "font-semibold bg-[#BB5500] text-white border-b-2 border-gray-400" : "";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-2xl font-bold flex items-center gap-2">
            🐾 野貓領地
          </div>

          {/* 導覽列 */}
          <nav className="flex items-center gap-6">
            <NavLink to="/" className={(s) => `${linkBase} ${active(s)}`}>
              首頁
            </NavLink>
            <NavLink to="/map" className={(s) => `${linkBase} ${active(s)}`}>
              地圖
            </NavLink>
            <NavLink to="/care" className={(s) => `${linkBase} ${active(s)}`}>
             知識
            </NavLink>
            <NavLink to="/feed" className={(s) => `${linkBase} ${active(s)}`}>
              社群
            </NavLink>
            <NavLink to="/report" className={(s) => `${linkBase} ${active(s)}`}>
              登記野貓
            </NavLink>
          </nav>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
