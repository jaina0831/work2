// src/pages/Signin.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import petsIcon from "../assets/petsIcon.png";

const ACCENT_COLOR = "#D6B788";
const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";

const Signin = () => {
  const navigate = useNavigate();

  const [realName, setRealName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!realName || !nickname || !phoneNumber || !address || !email || !password) {
      setMessage({ type: "error", text: "請填寫所有欄位。" });
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ 把「暱稱」寫進 Firebase Auth 的 displayName
      await updateProfile(cred.user, { displayName: nickname });

      setMessage({ type: "success", text: "註冊成功！已設定暱稱～" });

      // 清空
      setRealName("");
      setNickname("");
      setPhoneNumber("");
      setAddress("");
      setEmail("");
      setPassword("");

      // ✅ 直接帶去帳號中心或登入後的頁面
      navigate("/auth");
    } catch (error) {
      let text = "註冊失敗，請稍後再試。";
      if (error.code === "auth/email-already-in-use") {
        text = "Email 已被註冊。";
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "appearance-none block w-full px-4 py-3 rounded-full border border-gray-300 bg-white shadow-sm";

  return (
    <div className="min-h-screen flex justify-center px-2 py-6" style={{ backgroundColor: APP_BG }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl" style={{ backgroundColor: CARD_BG }}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <img src={petsIcon} alt="logo" className="w-8 h-8" />
            <span className="ml-2 text-3xl font-bold">浪浪主人</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">收養代替購買：給浪浪溫暖的家</p>
          <h2 className="font-bold text-lg">註冊帳號</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {message.text && (
            <div
              className={`mb-[10px] p-3 rounded-lg text-sm ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <input style={{ marginBottom: 10 }} className={inputStyle} placeholder="真實姓名" value={realName} onChange={(e) => setRealName(e.target.value)} />
          <input style={{ marginBottom: 10 }} className={inputStyle} placeholder="暱稱（會顯示在社群留言/發文）" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input style={{ marginBottom: 10 }} className={inputStyle} placeholder="聯絡電話" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <input style={{ marginBottom: 10 }} className={inputStyle} placeholder="住址" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input style={{ marginBottom: 10 }} className={inputStyle} placeholder="信箱" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputStyle} placeholder="密碼" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div style={{ height: 10 }} />

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: ACCENT_COLOR, color: "#fff" }}
            className="w-full py-3 rounded-full text-lg font-bold shadow"
          >
            {loading ? "註冊中..." : "註冊"}
          </button>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-gray-500">
              已有帳號
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
