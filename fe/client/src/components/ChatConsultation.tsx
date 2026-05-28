import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import { MessageSquare, Send, Bot, User, Maximize2, Minimize2 } from "lucide-react";

import type { ChatMessage } from "../types/smartseller";

interface ChatConsultationProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => void;
  hasContext: boolean;
}

export const ChatConsultation: React.FC<ChatConsultationProps> = ({ chatHistory, onSendMessage, hasContext }) => {
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef(0);
  const handleSend = () => {
    if (!inputMsg.trim() || isTyping) return;

    setIsTyping(true);
    onSendMessage(inputMsg);
    setInputMsg("");
  };
  const handleToggleExpand = () => {
    if (!isExpanded) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      setIsExpanded(true);
    } else {
      document.body.style.overflow = "auto";
      setIsExpanded(false);

      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant",
        });
      });
    }
  };
  useEffect(() => {
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.sender === "ai") {
      setIsTyping(false);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, isTyping]);
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div
      className={`bg-slate-900/40 border border-slate-800/60 rounded-2xl shadow-xl backdrop-blur-md flex flex-col transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 h-auto bg-slate-950 shadow-2xl p-7" : "h-100 p-5"
      }`}
    >
      <div className="flex items-start justify-between mb-1 shrink-0">
        <h2 className={`font-extrabold text-white flex items-center gap-2.5 uppercase tracking-wider ${isExpanded ? "text-xl" : "text-sm"}`}>
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/15">
            <MessageSquare className={isExpanded ? "w-6 h-6" : "w-4 h-4"} />
          </div>
          Alur 4: Konsultasi Bisnis Berbasis Sesi
        </h2>

        <button
          type="button"
          onClick={handleToggleExpand}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/40 transition-all shrink-0 cursor-pointer"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mb-4 shrink-0 font-medium">
        Riwayat obrolan diikat otomatis ke memori server via <code className="text-slate-400 font-mono">penyimpanan sesi browser</code>.
      </p>

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-3 mb-3 flex flex-col"
      >
        {chatHistory.length === 0 ? (
          <div className="m-auto text-center max-w-xs text-slate-600 text-xs py-8">
            {!hasContext ? (
              "Lakukan prediksi kategori produk terlebih dahulu untuk menyuntikkan basis konteks awal."
            ) : (
              <span className="text-slate-400 font-medium animate-pulse">
                Klik tombol "Konsultasi Lanjutan dengan AI" di bawah atau kirim pesan langsung untuk membuka sesi obrolan berbasis sesi.
              </span>
            )}
          </div>
        ) : (
          <>
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[90%] rounded-xl leading-relaxed font-medium ${
                  isExpanded ? "p-5 text-base" : "p-3 text-xs"
                } ${msg.sender === "ai" ? "bg-slate-900 border border-slate-800 text-slate-200 self-start" : "bg-linear-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/20 text-orange-100 self-end"}`}
              >
                <div className="shrink-0 mt-0.5">
                  {msg.sender === "ai" ? (
                    <Bot className={isExpanded ? "w-5 h-5" : "w-3.5 h-3.5"} />
                  ) : (
                    <User className={isExpanded ? "w-5 h-5" : "w-3.5 h-3.5"} />
                  )}
                </div>

                <div className="min-w-0 overflow-hidden">
                  {msg.sender === "ai" ? (
                    <div
                      className={`prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-pre:bg-slate-950 prose-code:text-orange-300 wrap-break-words ${isExpanded ? "prose-lg" : "prose-sm"}`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className={`flex gap-2.5 max-w-[85%] rounded-xl bg-slate-900 border border-slate-800 self-start ${isExpanded ? "p-5" : "p-3"}`}>
                <Bot className={`text-orange-400 mt-0.5 shrink-0 ${isExpanded ? "w-5 h-5" : "w-3.5 h-3.5"}`} />

                <div className={`flex items-center gap-1 text-slate-400 ${isExpanded ? "text-base" : "text-xs"}`}>
                  <span>AI sedang mengetik</span>

                  <span className="flex gap-1">
                    <span className="animate-bounce">.</span>

                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      .
                    </span>

                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                      .
                    </span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          required
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!hasContext || isTyping}
          placeholder={
            isTyping
              ? "Menunggu AI selesai menjawab..."
              : hasContext
                ? "Ketik pertanyaan lanjutan strategi bisnis..."
                : "Kunci konteks via tombol peramalan terlebih dahulu..."
          }
          className={`flex-1 bg-slate-950 border border-slate-900 focus:border-orange-500/60 rounded-xl px-4 text-slate-200 font-medium outline-none disabled:opacity-40 ${
            isExpanded ? "py-4 text-base" : "text-xs"
          }`}
        />

        <button
          onClick={handleSend}
          disabled={!hasContext || isTyping}
          className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
