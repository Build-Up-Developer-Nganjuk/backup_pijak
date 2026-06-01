import { useState } from "react";
import type { TrendSource } from "../types/smartseller";
import { getTrendAnalysis } from "../services/smartsellerService";

export const useTrendAnalysis = () => {
  const [trendText, setTrendText] = useState("");
  const [trendSources, setTrendSources] = useState<TrendSource[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const fetchTrend = async (category: string, trendStatus: string, forecastSummary: string) => {
    setTrendText("");
    setTrendSources([]);
    setTrendLoading(true);
    try {
      const result = await getTrendAnalysis(category, trendStatus, forecastSummary);
      setTrendText(result.text);
      setTrendSources(result.sources);
    } catch {
      setTrendText("Gagal mengambil analisis tren.");
    } finally {
      setTrendLoading(false);
    }
  };

  const resetTrend = () => {
    setTrendText("");
    setTrendSources([]);
    setTrendLoading(false);
  };

  return { trendText, trendSources, trendLoading, fetchTrend, resetTrend };
};
