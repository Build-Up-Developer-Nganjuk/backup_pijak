import { useState, useRef } from "react";
import type { StreamResponse } from "../types/smartseller";
import { createTrendStream } from "../services/smartsellerService";

export const useTrendStream = () => {
  const [streamText, setStreamText] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);
  // Menyimpan referensi EventSource agar bisa ditutup paksa dari luar fungsi startStream jika direset
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = (category: string, trendStatus: string, forecastSummary: string) => {
    // Jika ada koneksi lama yang belum selesai, tutup terlebih dahulu
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStreamText("");
    setStreamLoading(true);

    const eventSource = createTrendStream(category, trendStatus, forecastSummary);

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        eventSourceRef.current = null;
        setStreamLoading(false);
        return;
      }

      const data: StreamResponse = JSON.parse(event.data);

      if (data.text) {
        setStreamText((prev) => prev + data.text);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;
      setStreamLoading(false);
    };
  };

  // Fungsi baru untuk dipanggil saat tombol reset diklik
  const resetStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreamText("");
    setStreamLoading(false);
  };

  return {
    streamText,
    streamLoading,
    startStream,
    resetStream,
  };
};
