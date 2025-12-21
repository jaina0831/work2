import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import ChatWidget from "./components/ChatWidget";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  // 1. 宣告一個「載入中」的狀態，預設為 true
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 2. 定義處理函式：當視窗資源（圖片、字體、CSS）全部下載完後，將載入狀態設為關閉
    const handleWindowLoad = () => {
      // 增加一點點延遲（0.5秒），讓使用者能看到美美的載入畫面，視覺感更平滑
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // 3. 檢查頁面是否已經載入完成
    if (document.readyState === "complete") {
      handleWindowLoad();
      return;
    }

    // 如果還沒跑完，就監聽瀏覽器的 'load' 事件
    window.addEventListener("load", handleWindowLoad);

    // 清除函式：當組件卸載時，移除監聽器以節省記憶體空間
    return () => window.removeEventListener("load", handleWindowLoad);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF7EB]">
      {/* 4. 如果 isLoading 為 true，載入畫面就會出現 */}
      {/* 由於 LoadingScreen 設定了 position: fixed，它會蓋在畫面上方 */}
      {isLoading && <LoadingScreen />}

      {/* 5. 原本的內容會一直存在，只是在載入時會被蓋在 LoadingScreen 後面 */}
      <RouterProvider router={router} />

      <ChatWidget /> {/* ⭐ 全域小浮動按鈕 */}
    </div>
  );
}

export default App;
