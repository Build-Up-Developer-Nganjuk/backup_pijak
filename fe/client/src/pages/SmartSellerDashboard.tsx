import React, { useState, useEffect } from "react";

import { PipelineStatus } from "../components/PipelineStatus";
import { ForecastControl } from "../components/ForecastControl";
import { ForecastOutput } from "../components/ForecastOutput";
import { ChatConsultation } from "../components/ChatConsultation";
import { ModelPerformance } from "../components/ModelPerformance";
import { ModelPurpose } from "../components/ModelPurpose";
import type { ForecastResponse, ChatMessage, ChatHistoryItem } from "../types/smartseller";

import { getForecast, sendChatConsultation, clearChatSession } from "../services/smartsellerService";
import { useTrendAnalysis } from "../hooks/useTrendAnalysis";

export const SmartSellerDashboard: React.FC = () => {
  const { trendText, trendSources, trendLoading, fetchTrend, resetTrend } = useTrendAnalysis();
  const [sessionId, setSessionId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Clothing");
  const [forecastWeeks, setForecastWeeks] = useState<number>(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sseStatus, setSseStatus] = useState("TERPUTUS");
  const [globalTrend, setGlobalTrend] = useState("Menunggu aktivitas data");
  const hasForecastResult = forecastData !== null;

  useEffect(() => {
    let currentSession = sessionStorage.getItem("smartseller_session_id");

    if (!currentSession) {
      const randomId = `user_tab_smart_${Math.floor(100 + Math.random() * 900)}`;
      sessionStorage.setItem("smartseller_session_id", randomId);
      currentSession = randomId;
    }
    setSessionId(currentSession);

    const savedForecast = sessionStorage.getItem(`forecast_data_${currentSession}`);
    if (savedForecast) {
      const parsedForecast: ForecastResponse = JSON.parse(savedForecast);
      setForecastData(parsedForecast);
      setSseStatus("SIARAN LANGSUNG");
      setGlobalTrend(`TREN ${parsedForecast.category.toUpperCase()} TERDETEKSI (DIPULIHKAN)`);
    }

    const savedChat = sessionStorage.getItem(`chat_history_${currentSession}`);
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }
  }, []);

  const handleForecastPipeline = async () => {
    try {
      setIsProcessing(true);
      setSseStatus("MENYAMBUNGKAN");
      setGlobalTrend("Menghubungkan AI Forecast");

      const data = await getForecast(selectedCategory, forecastWeeks);

      setForecastData(data);

      sessionStorage.setItem(`forecast_data_${sessionId}`, JSON.stringify(data));

      setSseStatus("SIARAN LANGSUNG");
      setGlobalTrend(`TREN ${data.category.toUpperCase()} TERDETEKSI`);

      fetchTrend(data.category, data.trend_status, data.forecast_summary);
    } catch (err) {
      console.log(err);
      setSseStatus("EROR");
      setGlobalTrend("Gagal mengambil data");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendChatConsultation = async (userMessage: string) => {
    if (!forecastData) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: userMessage,
    };

    const updatedHistoryWithUser = [...chatHistory, userMsg];
    setChatHistory(updatedHistoryWithUser);
    sessionStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(updatedHistoryWithUser));

    try {
      const historyForAPI: ChatHistoryItem[] = chatHistory.map((msg) => ({
        role: msg.sender === "user" ? ("user" as const) : ("model" as const),
        text: msg.text,
      }));

      const fullContextInsight = `Ringkasan Penjualan Mingguan: ${forecastData.forecast_summary}. Analisis Insight: ${forecastData.description}`;

      const response = await sendChatConsultation({
        session_id: sessionId,
        category: forecastData.category,
        context_insight: fullContextInsight,
        history: historyForAPI,
        message: userMessage,
      });

      const aiMsg: ChatMessage = {
        sender: "ai",
        text: response.reply,
      };

      const finalHistory = [...updatedHistoryWithUser, aiMsg];
      setChatHistory(finalHistory);

      sessionStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(finalHistory));
    } catch (err) {
      console.log(err);
      const errorHistory = [...updatedHistoryWithUser, { sender: "ai" as const, text: "AI gagal merespons. Sesi bermasalah." }];
      setChatHistory(errorHistory);
      sessionStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(errorHistory));
    }
  };

  const handleClearSesiDashboard = async () => {
    try {
      await clearChatSession(sessionId);
    } catch (err) {
      console.log(err);
    }

    sessionStorage.removeItem(`forecast_data_${sessionId}`);
    sessionStorage.removeItem(`chat_history_${sessionId}`);

    setForecastData(null);
    setForecastWeeks(4);
    setChatHistory([]);
    setSseStatus("TERPUTUS");
    setGlobalTrend("Sesi direset");
    resetTrend();
  };

  return (
    <div className="bg-slate-950 text-slate-100 flex flex-col min-h-screen relative overflow-x-hidden antialiased font-sans w-full p-4 lg:p-6 gap-6">
      <PipelineStatus sessionId={sessionId} sseStatus={trendLoading ? "MENGANALISIS" : sseStatus} globalTrend={globalTrend} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ForecastControl
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            forecastWeeks={forecastWeeks}
            setForecastWeeks={setForecastWeeks}
            onForecast={handleForecastPipeline}
            onReset={handleClearSesiDashboard}
            isProcessing={isProcessing}
            hasForecastResult={hasForecastResult}
          />
          <ModelPerformance selectedCategory={selectedCategory} />
          <ModelPurpose />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <ForecastOutput data={forecastData} streamText={trendText} trendSources={trendSources} trendLoading={trendLoading} />

          <ChatConsultation chatHistory={chatHistory} onSendMessage={handleSendChatConsultation} hasContext={!!forecastData} />
        </div>
      </div>
    </div>
  );
};
