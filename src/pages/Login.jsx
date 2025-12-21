// src/pages/Login.jsx
import React, { useState } from "react";
import petsIcon from "../assets/petsIcon.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ACCENT_COLOR = "#D6B788";
const LIGHT_ACCENT_COLOR = "#D4A48A";
const CARD_BG = "#FFF7E6";
//const APP_BG = "#FDF8F0";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // 當作帳號
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!email || !password) {
      setMessage({ type: "error", text: "請輸入 Email 與密碼。" });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      console.log("登入成功 Firebase user:", user);
      console.log("ID Token:", token);

      setMessage({ type: "success", text: "登入成功！歡迎回來～" });

      // ✅ 登入成功後導到帳號中心頁面
      navigate("/auth");

    } catch (error) {
      console.error("Firebase Login Error:", error);
      let text = "登入失敗，請確認帳號密碼。";
      if (error.code === "auth/invalid-email") {
        text = "Email 格式不正確。";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        text = "帳號或密碼錯誤。";
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-187 flex items-start px-2 py-6 justify-center font-inter transition-colors duration-500"
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
          <p className="text-sm text-gray-500 mb-6">
            收養代替購買：給浪浪溫暖的家
          </p>

          <h2 className="font-bold text-lg">登入帳號</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-0 pb-8 space-y-6">
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

          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
              placeholder="請輸入 Email（登入帳號）"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white"
              placeholder="請輸入密碼"
            />
          </div>

          <div className="flex items-center">
            <input
              id="staySignedIn"
              name="staySignedIn"
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 border-gray-400 rounded focus:ring-1"
              style={{ accentColor: ACCENT_COLOR }}
            />
            <label
              htmlFor="staySignedIn"
              className="ml-2 block text-sm text-gray-600"
            >
              保持登入狀態
            </label>
          </div>

          <button
  type="submit"
  disabled={loading}
  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold ${
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
  {loading ? "登入中..." : "登 入"}
</button>
        </form>

        <div className="px-8 pb-8 text-center">
          <a
            href="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition duration-200"
            style={{ color: LIGHT_ACCENT_COLOR }}
          >
            忘記密碼？
          </a>
          <div className="mt-2 text-sm">
            還沒有帳號嗎？{" "}
            <a
              href="/signin"
              className="font-semibold"
              style={{ color: ACCENT_COLOR }}
            >
              前往註冊
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
