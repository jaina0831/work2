// src/pages/Auth.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { auth, storage } from "../firebase";
import { signOut, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";
const ACCENT_COLOR = "#D6B788";
const DEFAULT_AVATAR = "https://placehold.co/120x120/EEE/AAA?text=Avatar";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    if (user) setAvatarUrl(user.photoURL || DEFAULT_AVATAR);
  }, [user]);

  const displayName = useMemo(() => user?.displayName || "未設定暱稱", [user]);
  const email = user?.email || "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: APP_BG }}>
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMsg("");

      const avatarRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);

      await updateProfile(user, { photoURL: url });
      setAvatarUrl(url);
      setMsg("頭像更新成功！");
    } catch (error) {
      console.error("更新頭像失敗:", error);
      setMsg("更新頭像失敗，請稍後再試。");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleResetPassword = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg(`已寄出重設密碼信到：${email}`);
    } catch (error) {
      console.error("重設密碼信寄送失敗:", error);
      setMsg(`寄送重設密碼信失敗：${error.code || error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ✅ 你的圖一要能點進「我的發文/留言紀錄」→ 這裡改成 false
  const menuItems = [
    { label: "🐾 我的收養書籤", to: "/adoptlist" },
    { label: "💰 已贊助清單", to: "/sponsorlist" },
    { label: "📝 我的發文紀錄", to: "/myposts" },
    { label: "💬 我的留言紀錄", to: "/mycomments" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: APP_BG }}>
      <div
        className="w-full max-w-md rounded-2xl shadow-xl px-7 py-8"
        style={{
          backgroundColor: CARD_BG,
          boxShadow: "0 10px 30px rgba(0,0,0,0.10), 0 5px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">帳號中心</h1>

        {msg && (
          <div className="mt-4 p-3 rounded-xl text-sm font-medium bg-amber-100 text-amber-800 text-center">
            {msg}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border border-amber-200"
            />

            <label
              className={`absolute bottom-0 right-0 rounded-full px-2 py-1 text-xs font-semibold shadow cursor-pointer select-none ${
                uploading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: "#fff", color: ACCENT_COLOR }}
              title={uploading ? "上傳中..." : "更換頭像"}
            >
              {uploading ? "上傳中" : "更換"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-gray-800">{displayName}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-amber-200/60" />

        <div className="mt-5">
          <p className="text-xs font-bold text-gray-400 tracking-wider">記錄查詢</p>
          <div className="mt-3 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className="
                  w-full flex justify-between items-center
                  px-5 py-3 rounded-xl
                  bg-white border border-amber-100
                  transition-all hover:border-amber-300
                "
              >
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 這裡改成固定 10px 間距 */}
        <div className="mt-7">
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full py-3 rounded-full text-sm font-semibold shadow"
            style={{ backgroundColor: ACCENT_COLOR, color: "#fff" }}
          >
            寄送重設密碼信
          </button>

          <div className="h-[10px]" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
