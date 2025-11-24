// src/pages/Signin.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import petsIcon from "../assets/petsIcon.png";

const ACCENT_COLOR = "#D6B788";
const CARD_BG = "#FFF7E6";
const APP_BG = "#FDF8F0";

const Signin = () => {
  const [realName, setRealName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");     // 當作登入帳號
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      console.log("註冊成功 Firebase user:", user);
      console.log("ID Token:", token);
      console.log("額外註冊資料：", {
        realName,
        nickname,
        phoneNumber,
        address,
      });
      // 之後若要存到你自己的 Supabase，可在這裡再用 api.post 傳過去

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

  return (
    <div
      className="h-187 flex items-start px-2 py-6 justify-center font-inter"
      style={{ backgroundColor: APP_BG }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: CARD_BG,
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="p-8 pb-4 text-gray-800 text-center">
          <div className="flex justify-center items-center mb-4">
            <img
              src={petsIcon}
              alt="寵物之家標誌"
              className="w-8 h-8 object-contain"
            />
            <span className="text-3xl font-bold ml-2 text-gray-800">
              浪浪主人
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">收養代替購買：給浪浪溫暖的家</p>
          <h2 className="font-bold text-lg mt-2">註冊帳號</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-0 pb-8 space-y-4">
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
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
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />
          <input
            type="text"
            placeholder="暱稱"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />
          <input
            type="tel"
            placeholder="連絡電話"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />
          <input
            type="text"
            placeholder="住址"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />
          <input
            type="email"
            placeholder="Email（登入帳號）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />
          <input
            type="password"
            placeholder="設定密碼（至少 6 碼）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-bold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-opacity-90 transform hover:scale-[1.01] active:scale-[0.98]"
            }`}
            style={{
              backgroundColor: ACCENT_COLOR,
              boxShadow: "0 4px 10px rgba(184, 140, 110, 0.4)",
            }}
          >
            {loading ? "註冊中..." : "註冊"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
