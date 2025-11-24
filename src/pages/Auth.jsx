// src/pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { auth, storage } from "../firebase";
import {
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";
const ACCENT_COLOR = "#D6B788";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");   // ⭐ 新增：本地頭像狀態

  useEffect(() => {
    if (user) {
      setAvatarUrl(
        user.photoURL ||
          "https://placehold.co/120x120/EEE/AAA?text=Avatar"
      );
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: APP_BG }}>
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const displayName = user.displayName || "未設定暱稱";
  const email = user.email;

  // ✅ 上傳頭像並立即更新畫面
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMsg("");

      const avatarRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);

      // 更新 Firebase Auth
      await updateProfile(user, { photoURL: url });

      // 立刻更新畫面上的頭像
      setAvatarUrl(url);

      setMsg("頭像更新成功！");
    } catch (error) {
      console.error("更新頭像失敗:", error);
      setMsg("更新頭像失敗，請稍後再試。");
    } finally {
      setUploading(false);
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: APP_BG }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6"
        style={{
          backgroundColor: CARD_BG,
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          帳號中心
        </h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          查看與管理你的帳號資訊
        </p>

        {msg && (
          <div className="p-3 rounded-lg text-sm font-medium bg-amber-100 text-amber-800">
            {msg}
          </div>
        )}

        {/* 頭像 + 資訊 */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border border-amber-200"
            />
            <label
              className="absolute bottom-0 right-0 bg-white rounded-full px-2 py-1 text-xs font-medium shadow cursor-pointer"
              style={{ color: ACCENT_COLOR }}
            >
              更換
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              {displayName}
            </p>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-xs text-gray-400 mt-1">
              UID：{user.uid}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full py-2.5 rounded-full text-sm font-semibold text-white shadow"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            寄送重設密碼信
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            登出
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
