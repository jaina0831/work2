import { useEffect, useState } from "react";
import { api } from "../lib/apiClient"; // 你原本的 axios instance
import catAvatar from "../assets/cat.png"; // 先共用這張
import chatbotIcon from "../assets/chatbot.png"; // 圓圈 icon，自行換檔名

export default function ChatWidget() {
  const CHAT_STORAGE_KEY = "strayland_chat_v1";

  // ✅ 常見問題建議（左下角提示按鍵會開啟）
  const SUGGESTIONS = [
    "請問這個網頁主要是要幹嘛？",
    "請問台北市哪裡可以領養動物？",
    "我撿到一隻流浪小狗，我可以帶她去哪裡檢查？",
    "我撿到一隻流浪小狗，我可以帶她去哪個收容所呢？",
    "哪裡有可以領養寵物的咖啡廳呢？",
    "怎麼和寵物增加感情？",
    "我想領養寵物，請問我需要具備什麼能力嗎？",
  ];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        role: "assistant",
        content: "嗨～我是浪浪領地的小管家，有什麼想詢問的嗎？",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleToggle = () => {
    setOpen((o) => !o);
    setShowSuggestions(false);
  };

  // ✅ 讓「點提示後直接送出」不會踩到 setState 非同步
  const handleSendText = async (text) => {
    const content = (text ?? "").trim();
    if (!content || loading) return;
    setErrorMsg("");

    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post("/chat", { messages: newMessages });
      const reply = res.data.reply || "（小管家暫時忙碌中，再試一次 > <）";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        setErrorMsg("請先登入後再使用客服喔！");
      } else {
        setErrorMsg("伺服器忙碌中，稍後再試一次～");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePickSuggestion = (text) => {
    setShowSuggestions(false);
    setInput(""); // 可選：把輸入框清空（你也可以改成 setInput(text)）
    handleSendText(text); // ✅ 點了就直接送出
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    await handleSendText(text);
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
          bg-[#836054] hover:bg-[#e7b76f] active:bg-[#D6B788]
          text-white
        "
      >
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
                <span className="text-xs text-[#9C8A75]">線上客服</span>
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setShowSuggestions(false);
              }}
              className="text-sm text-[#9C8A75] hover:text-[#D6B788]"
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
                      ${
                        isUser
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
          <div className="border-t border-[#E4D3B5] p-2 bg-white rounded-b-2xl relative">
            {/* ✅ 建議問題面板 */}
            {showSuggestions && (
              <div
                className="
                  absolute left-2 bottom-[92px] z-50
                  w-[calc(100%-16px)]
                  bg-white border border-[#E4D3B5] rounded-2xl shadow-xl
                  p-2
                "
              >
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="text-xs font-semibold text-[#774422]">
                    不知道要問什麼？可以點下面～
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-[#9C8A75] hover:text-[#D6B788]"
                    title="關閉"
                  >
                    ✕
                  </button>
                </div>

                {/* ✅ 這裡強制每個提示間隔 5px：gap-[5px] */}
                <div className="max-h-44 overflow-y-auto flex flex-col gap-[5px] px-1 pb-1">
                  {SUGGESTIONS.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePickSuggestion(q)}
                      className="
                        w-full text-left
                        px-3 py-2 rounded-xl
                        bg-[#FFF9F0] border border-[#E4D3B5]
                        text-sm text-[#4A2A07]
                        hover:bg-[#D6B788]
                        active:bg-[#9C8A75]
                      "
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* 下排：左邊提示按鈕 + 右邊發送按鈕 */}
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={() => setShowSuggestions((v) => !v)}
                className="
                  inline-flex items-center gap-1
                  px-2 py-1 rounded-lg
                  text-xs font-semibold
                  bg-[#FFF3E0] border border-[#E4D3B5]
                  text-[#774422]
                  hover:bg-[#D6B788]
                  active:bg-[#9C8A75]
                "
                title="常見問題"
              >
                ☰ 提示
              </button>

              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className={`
                  px-3 py-1 text-sm rounded-lg font-semibold text-white
                  ${
                    loading || !input.trim()
                      ? "bg-[#E4D3B5] cursor-not-allowed opacity-60"
                      : "bg-[#E4D3B5] hover:bg-[#D6B788] active:bg-[#9C8A75]"
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
