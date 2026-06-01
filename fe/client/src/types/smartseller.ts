export interface ForecastItem {
  date: string;
  sales: number;
  week_offset: number;
  label: string;
}

export interface ForecastResponse {
  category: string;
  forecast: ForecastItem[];
  description: string;
  insight: {
    gender_distribution: Record<string, number>;
    age_distribution: Record<string, number>;
  };
  trend_status: string;
  forecast_summary: string;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export interface TrendSource {
  title: string;
  url: string;
}

export interface TrendAnalysisResponse {
  text: string;
  sources: TrendSource[];
}

export interface ChatHistoryItem {
  role: "user" | "model";
  text: string;
}

export interface ChatConsultationRequest {
  session_id: string;
  category: string;
  context_insight: string;
  history: ChatHistoryItem[];
  message: string;
}

export interface ChatConsultationResponse {
  reply: string;
}
