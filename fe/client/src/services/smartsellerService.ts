import api from "./axios";
import type { ForecastResponse, ChatConsultationRequest, ChatConsultationResponse } from "../types/smartseller";

export const getForecast = async (category: string, weeks: number): Promise<ForecastResponse> => {
  const response = await api.post("/forecast", {
    category,
    weeks,
  });

  return response.data;
};

export const createTrendStream = (category: string, trendStatus: string, forecastSummary: string) => {
  const baseUrl = api.defaults.baseURL;

  return new EventSource(
    `${baseUrl}/stream-trends?category=${encodeURIComponent(category)}&trend_status=${encodeURIComponent(trendStatus)}&forecast_summary=${encodeURIComponent(forecastSummary)}`,
  );
};

export const sendChatConsultation = async (payload: ChatConsultationRequest): Promise<ChatConsultationResponse> => {
  const response = await api.post("/chat-consultation", payload);

  return response.data;
};

export const clearChatSession = async (sessionId: string) => {
  await api.post(`/clear-chat?session_id=${sessionId}`);
};
