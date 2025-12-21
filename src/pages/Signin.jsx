// src/pages/Signin.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
  const [email, setEmail] = useState(""); // 當作登入帳號
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("註冊成功 Firebase user:", user);
      setMessage({
        type: "success",
        text: `註冊成功！Email：${email}，暱稱：${nickname}`,
      });

      // 清空欄位
      setRealName("");
      setNickname("");
      setPhoneNumber("");
      setAddress("");
      setEmail("");
      setPassword("");

      // 想註冊成功就回登入頁，打開這行
      // navigate("/login");
    } catch (error) {
      console.error("Firebase SignUp Error:", error);
      let text = "註冊失敗，請稍後再試。";
      if (error.code === "auth/email-already-in-use") {
        text = "Email 已被註冊，請改用其他 Email。";
      } else if (error.code === "auth/weak-password") {
        text = "密碼太簡單，請至少 6 碼以上。";
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 這邊用 mb-[10px] 硬保證每個 input 間隔 10px
  const inputClass =
    "appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#D6B788]/40 " +
    "mb-[10px]";

  return (
    <div
      className="min-h-screen flex items-start px-2 py-6 justify-center font-inter"
      style={{ backgroundColor: APP_BG }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: CARD_BG,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
        }}
      >
        <div className="p-8 pb-4 text-gray-800 text-center">
          <div className="flex justify-center items-center mb-4">
            <img src={petsIcon} alt="寵物之家標誌" className="w-8 h-8 object-contain" />
            <span className="text-3xl font-bold ml-2 text-gray-800">浪浪主人</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">收養代替購買：給浪浪溫暖的家</p>
          <h2 className="font-bold text-lg mt-2">註冊帳號</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-0 pb-8">
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm font-medium mb-[10px] ${
                message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <input
            type="text"
            placeholder="真實姓名"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="暱稱"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          <input
            type="tel"
            placeholder="連絡電話"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="住址"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email（登入帳號）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          {/* 最後一個 input 不要多一個 mb，避免跟按鈕距離過大 */}
          <input
            type="password"
            placeholder="設定密碼（至少 6 碼）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={inputClass.replace("mb-[10px]", "mb-0")}
          />

          {/* ✅ 按鈕上方固定 10px */}
          <div className="h-[10px]" />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-bold shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-opacity-90 transform hover:scale-[1.01] active:scale-[0.98]"
            }`}
            style={{
              backgroundColor: ACCENT_COLOR,
              boxShadow: "0 4px 10px rgba(184, 140, 110, 0.4)",
              color: "#ffffff", // ✅ 最高優先權，保證白字
            }}
          >
            {loading ? "註冊中..." : "註冊"}
          </button>

          {/* ✅ 最下方中間：返回 login */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-500 hover:text-gray-700 "
            >
              返回 Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
