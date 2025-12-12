import { useState } from "react";
import { api } from "../lib/apiClient";        // 你原本的 axios instance
import catAvatar from "../assets/cat.png"; // 先共用這張
import chatbotIcon from "../assets/chatbot.png"; // 圓圈 icon，自行換檔名

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "嗨～我是浪浪領地的小管家，有什麼想詢問的嗎？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const handleToggle = () => setOpen((o) => !o);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setErrorMsg("");

    const newMessages = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        messages: newMessages,
      });
      const reply = res.data.reply || "（小管家暫時忙碌中，再試一次 > <）";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        setErrorMsg("請先登入後再使用客服喔！");
        // 也可以直接跳轉登入
        // navigate("/login");
      } else {
        setErrorMsg("伺服器忙碌中，稍後再試一次～");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 右下角圓圈按鈕 */}
      <button
        type="button"
        onClick={handleToggle}
        className="
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          bg-[#BB5500] hover:bg-[#D67318] active:bg-[#994400]
          text-white
        "
      >
        {/* 你可以改成圖示 */}
        <img
          src={chatbotIcon}
          alt="聊天小管家"
          className="w-9 h-9 object-cover rounded-full"
        />
      </button>

      {/* 聊天視窗 */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6 z-50
            w-80 max-w-[90vw] h-96
            bg-white rounded-2xl shadow-2xl border border-[#D6B788]
            flex flex-col
          "
        >
          {/* header */}
          <div className="px-4 py-2 border-b border-[#E4D3B5] flex items-center justify-between bg-[#FFF3E0] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <img
                src={catAvatar}
                alt="小管家"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#774422]">
                  浪浪小管家
                </span>
                <span className="text-xs text-[#9C8A75]">
                  線上客服
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-[#9C8A75] hover:text-[#774422]"
            >
              ✕
            </button>
          </div>

          {/* 訊息區 */}
          <div className="flex-1 overflow-y-auto px-3 py-2 bg-[#FFF9F0] space-y-2">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <img
                      src={catAvatar}
                      alt="小管家"
                      className="w-6 h-6 rounded-full object-cover mr-2 mt-1"
                    />
                  )}
                  <div
                    className={`
                      max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                      ${isUser
                        ? "bg-[#FFCF99] text-[#4A2A07] rounded-br-none"
                        : "bg-white text-[#444444] rounded-bl-none border border-[#E4D3B5]"
                      }
                    `}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="text-xs text-[#9C8A75] text-center mt-1">
                小管家思考中…
              </div>
            )}
            {errorMsg && (
              <div className="text-xs text-red-500 text-center mt-1">
                {errorMsg}
              </div>
            )}
          </div>

          {/* 輸入區 */}
          <div className="border-t border-[#E4D3B5] p-2 bg-white rounded-b-2xl">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="想問領養流程、咖啡廳交通或貓咪照護都可以唷～"
              className="
                w-full resize-none text-sm
                border border-[#E4D3B5] rounded-xl px-2 py-1
                focus:outline-none focus:ring-1 focus:ring-[#D6B788]
                bg-[#FFF9F0]
              "
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className={`
                  px-3 py-1 text-sm rounded-lg font-semibold
                  ${
                    loading || !input.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#BB5500] text-white hover:bg-[#D67318] active:bg-[#994400]"
                  }
                `}
              >
                發送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
