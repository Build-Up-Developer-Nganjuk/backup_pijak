import api from "./axios";
import type { ForecastResponse, ChatConsultationRequest, ChatConsultationResponse, TrendAnalysisResponse } from "../types/smartseller";

export const getForecast = async (category: string, weeks: number): Promise<ForecastResponse> => {
  const response = await api.post("/forecast", {
    category,
    weeks,
  });

  return response.data;
};

export const getTrendAnalysis = async (category: string, trendStatus: string, forecastSummary: string): Promise<TrendAnalysisResponse> => {
  const response = await api.get("/trend-analysis", {
    params: {
      category,
      trend_status: trendStatus,
      forecast_summary: forecastSummary,
    },
  });
  return response.data;
};

export const sendChatConsultation = async (payload: ChatConsultationRequest): Promise<ChatConsultationResponse> => {
  const response = await api.post("/chat-consultation", payload);

  return response.data;
};

export const clearChatSession = async (sessionId: string) => {
  await api.post(`/clear-chat?session_id=${sessionId}`);
};
