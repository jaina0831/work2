
// src/pages/Layout.jsx
import { NavLink, Link, Outlet, useNavigation } from "react-router-dom"; // 1. 引入 useNavigation
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx"; // 2. 引入您的 Loading 組件

const linkBase =
  "text-gray-800 no-underline px-5 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7b76f] hover:text-white";
const active = ({ isActive }) =>
  isActive ? "font-semibold bg-[#D6B788] text-white border-b-2 border-[#836054]" : "";

const defaultAvatar =
  "https://placehold.co/32x32/EEE/AAA?text=U";

export default function Layout() {

  const { user } = useAuth();
  // 3. 使用 useNavigation 監控導航狀態
  const navigation = useNavigation();
  // 當狀態為 "loading" 時，表示正在載入新頁面的組件或資料
  const isPageLoading = navigation.state === "loading";

  // 顯示名字的優先順序：displayName > email 前半段 > 預設「訪客」
  const displayName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "訪客");

  const avatarSrc = user?.photoURL || defaultAvatar;

  return (
    <div className="min-h-screen bg-[#FFFCF2]">
      {/* 4. 路由跳轉時顯示 LoadingScreen */}
      {isPageLoading && <LoadingScreen />}
      
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
              地圖
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

            {/* 右上角：如果有登入 → 頭像＋姓名；沒登入 → 登入按鈕 */}
            {user ? (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-[#fff2db] transition-colors duration-200 border border-[#f0d9ac]"
              >
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-[#D6B788]"
                />
                <span className="text-sm font-medium text-gray-800">
                  {displayName}
                </span>
              </Link>
            ) : (
              <NavLink to="/login" className={(s) => `${linkBase} ${active(s)}`}>
                登入
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="flex-grow max-w-7xl mx-auto px-2 py-10">
        <Outlet />
      </main>

      <footer className="bg-[#D6B788] border-t py-3 text-center text-white">
        © 2025 浪浪領地 | Hogwarts Coder · Slytherin
      </footer>
    </div>
  );
}
