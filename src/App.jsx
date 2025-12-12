import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <div className="min-h-screen bg-[#FFF7EB]">
      <RouterProvider router={router} />
      <ChatWidget /> {/* ⭐ 全域小浮動按鈕 */}
    </div>
  );
}

export default App;
