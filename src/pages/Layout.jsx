import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "text-gray-800 no-underline px-5 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7b76f] hover:text-white";
const active = ({ isActive }) =>
  isActive ? "font-semibold bg-[#c76c21] text-white border-b-2 border-gray-400" : "";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-2xl font-bold flex items-center gap-2">
            🐾 浪浪領地
          </div>

          {/* 導覽列 */}
          <nav className="flex items-center gap-6">
            <NavLink to="/" className={(s) => `${linkBase} ${active(s)}`}>
              首頁
            </NavLink>
            <NavLink to="/map" className={(s) => `${linkBase} ${active(s)}`}>
             咖啡廳
            </NavLink>
            <NavLink to="/care" className={(s) => `${linkBase} ${active(s)}`}>
             知識
            </NavLink>
            <NavLink to="/feed" className={(s) => `${linkBase} ${active(s)}`}>
              社群
            </NavLink>
            <NavLink to="/report" className={(s) => `${linkBase} ${active(s)}`}>
              認養
            </NavLink>
            <NavLink to="/login" className={(s) => `${linkBase} ${active(s)}`}>
              登入
            </NavLink>
          </nav>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="flex-grow max-w-7xl mx-auto px-2 py-10">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-gray-600">
        © 2025 浪浪領地 | Hogwarts Coder · Slytherin
      </footer>
    </div>
  );
}
