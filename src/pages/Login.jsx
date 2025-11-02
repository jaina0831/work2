import React, { useState } from 'react';

// --- [重要] 請將您下載圖片的公開網址替換到這裡 ---
// 這裡使用的是一個簡單的棕色「爪印」佔位圖作為範例。
const PET_ICON_URL = "https://placehold.co/40x40/B88C6E/FFF?text=%E7%88%AA%E5%8D%B0"; 
// ----------------------------------------------------

// 主要的登入頁面組件
const Login = () => {
  // 狀態來儲存表單輸入值
  const [loginId, setLoginId] = useState('');     // 5. 設定帳號 / 登入時的帳號 (原來的 username 狀態)
  const [password, setPassword] = useState('');   // 6. 設定密碼
  
  // 註冊專用的狀態
  const [realName, setRealName] = useState('');   // 1. 真實姓名
  const [nickname, setNickname] = useState('');   // 2. 暱稱 (新的狀態)
  const [phoneNumber, setPhoneNumber] = useState(''); // 3. 連絡電話
  const [address, setAddress] = useState('');     // 4. 住址
  
  const [staySignedIn, setStaySignedIn] = useState(false); // 保持登入狀態
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTab, setCurrentTab] = useState('signIn'); // 分頁狀態

  // 定義溫暖的主題顏色
  const ACCENT_COLOR = '#c76c21'; // 焦糖棕色
  const LIGHT_ACCENT_COLOR = '#D4A48A'; // 淺棕色
  const CARD_BG = '#FFF7E6'; // 奶油黃#FFF7E6
  const APP_BG = '#FDF8F0'; // 溫暖米白#FDF8F0
  const isSignIn = currentTab === 'signIn';
  const buttonText = isSignIn ? '登 入' : '註 冊';


  // 處理表單提交
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // --- 登入/註冊邏輯示範 ---
    if (isSignIn) {
      // ** 登入邏輯 (只使用 loginId 和 password) **
      console.log('--- 嘗試登入 ---');
      console.log(`使用者帳號: ${loginId}`);
      console.log(`密碼: ${password}`);
      
      // 模擬 API 呼叫的延遲
      setTimeout(() => {
        setLoading(false);
        // 模擬認證邏輯
        if (loginId === 'petlover' && password === 'dogandcat') {
          setMessage({ type: 'success', text: '登入成功！歡迎回家！' });
        } else if (loginId && password) {
          setMessage({ type: 'error', text: '帳號或密碼錯誤，請再試一次。' });
        } else {
          setMessage({ type: 'error', text: '請輸入您的帳號和密碼。' });
        }
      }, 1500); 

    } else {
      // ** 註冊邏輯 (使用所有 6 個欄位) **
      console.log('--- 嘗試註冊 ---');
      console.log(`1. 真實姓名: ${realName}`); 
      console.log(`2. 暱稱: ${nickname}`); 
      console.log(`3. 連絡電話: ${phoneNumber}`);
      console.log(`4. 住址: ${address}`);
      console.log(`5. 設定帳號: ${loginId}`); 
      console.log(`6. 設定密碼: ${password}`);
      
      // 模擬 API 呼叫的延遲
      setTimeout(() => {
        setLoading(false);
        // 檢查所有必填欄位
        if (loginId && password && phoneNumber && address && realName && nickname) { 
          setMessage({ type: 'success', text: `註冊成功！帳號: ${loginId}，暱稱: ${nickname}` });
          // 清空欄位以便新用戶註冊
          setLoginId('');
          setPassword('');
          setRealName('');
          setNickname('');
          setPhoneNumber('');
          setAddress('');
        } else {
          setMessage({ type: 'error', text: '請填寫所有必填的註冊資訊。' });
        }
      }, 1500);
    }
  };

  return (
    <div 
      className="h-187 flex items-start px-2 py-6 justify-center font-inter transition-colors duration-500"
      style={{ backgroundColor: APP_BG }}
    >
      {/* 登入卡片 - 使用溫暖主題 */}
      <div 
        className="w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl overflow-hidden" 
        style={{ backgroundColor: CARD_BG, boxShadow: `0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)` }}
      >
        
        {/* 卡片頭部 / Logo */}
        <div className="p-8 pb-4 text-gray-800 text-center">
          {/* Logo 區 - 已替換為 IMG 標籤 */}
          <div className="flex justify-center items-center mb-4">
            <img 
              src="./public/images/petsIcon.png"
              alt="寵物之家標誌" 
              className="w-8 h-8 object-contain" // object-contain 確保圖片完整顯示
            />
            <span className="text-3xl font-bold ml-2 text-gray-800">浪浪主人</span> 
          </div>
          <p className="text-sm text-gray-500 mb-6">收養代替購買：給浪浪溫暖的家</p>

          {/* 登入 / 註冊 分頁切換 */}
          <div className="flex justify-center border-b border-gray-300 mb-8 text-sm font-semibold">
            {/* 登入 Tab */}
            <button
              onClick={() => setCurrentTab('signIn')}
              className={`px-4 py-2 uppercase tracking-wider transition duration-200 ${
                isSignIn
                  ? 'text-gray-800 border-b-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={isSignIn ? { borderColor: ACCENT_COLOR } : {}}
            >
              登入 (SIGN IN)
            </button>
            {/* 註冊 Tab */}
            <button
              onClick={() => setCurrentTab('signUp')}
              className={`px-4 py-2 uppercase tracking-wider transition duration-200 ${
                !isSignIn
                  ? 'text-gray-800 border-b-2 font-bold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={!isSignIn ? { borderColor: ACCENT_COLOR } : {}}
            >
              註冊 (SIGN UP)
            </button>
          </div>
        </div>

        {/* 表單主體 */}
        <form onSubmit={handleSubmit} className="px-8 pt-0 pb-8 space-y-6">
          
          {/* 訊息顯示區 */}
          {message.text && (
            <div 
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'error' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* === 登入欄位 START === */}
          {isSignIn && (
            <>
              {/* 帳號 (Login ID) 輸入欄位 */}
              <div>
                <input
                  id="loginId"
                  name="loginId"
                  type="text" 
                  autoComplete="username"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入您的帳號"
                />
              </div>
              
              {/* 密碼 輸入欄位 */}
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
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入密碼"
                />
              </div>

              {/* 保持登入 Checkbox */}
              <div className="flex items-center">
                <input
                  id="staySignedIn"
                  name="staySignedIn"
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  disabled={loading}
                  // 使用自定義的棕色 accent 樣式
                  className="h-4 w-4 border-gray-400 rounded focus:ring-1 transition duration-150"
                  style={{ accentColor: ACCENT_COLOR }}
                />
                <label htmlFor="staySignedIn" className="ml-2 block text-sm text-gray-600">
                  保持登入狀態
                </label>
              </div>
            </>
          )}
          {/* === 登入欄位 END === */}


          {/* === 註冊欄位 START (按照指定順序) === */}
          {!isSignIn && (
            <>
              {/* 1. 真實姓名 輸入欄位 */}
              <div>
                <input
                  id="realName"
                  name="realName"
                  type="text"
                  autoComplete="name"
                  required
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入真實姓名"
                />
              </div>

              {/* 2. 暱稱 輸入欄位 */}
              <div>
                <input
                  id="nickname"
                  name="nickname"
                  type="text" 
                  autoComplete="nickname"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入暱稱"
                />
              </div>

              {/* 3. 連絡電話 輸入欄位 */}
              <div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel" 
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入連絡電話"
                />
              </div>
              
              {/* 4. 住址 輸入欄位 */}
              <div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="請輸入住址"
                />
              </div>
              
              {/* 5. 設定帳號 輸入欄位 (Login ID) */}
              <div>
                <input
                  id="loginId_signup"
                  name="loginId_signup"
                  type="text" 
                  autoComplete="new-username"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="設定帳號 (Login ID)"
                />
              </div>

              {/* 6. 設定密碼 輸入欄位 */}
              <div>
                <input
                  id="password_signup"
                  name="password_signup"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 transition duration-150 sm:text-base bg-white"
                  placeholder="設定密碼"
                />
              </div>
            </>
          )}
          {/* === 註冊欄位 END === */}


          {/* 登入 / 註冊 按鈕 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              // 溫暖焦糖色按鈕
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white !text-white transition duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'hover:bg-opacity-90 transform hover:scale-[1.01] active:scale-[0.98]'
              }`}
              style={{ backgroundColor: ACCENT_COLOR, boxShadow: '0 4px 10px rgba(184, 140, 110, 0.4)' }}
            >
              {loading ? (
                // 載入指示器
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
        
        {/* 忘記密碼連結 (僅登入頁面顯示) */}
        {isSignIn && (
          <div className="px-8 pb-8 text-center">
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition duration-200" style={{ color: LIGHT_ACCENT_COLOR }}>
              忘記密碼？
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;