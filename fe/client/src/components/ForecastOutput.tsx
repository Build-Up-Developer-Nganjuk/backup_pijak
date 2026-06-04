import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

import { LineChart, Sparkles, TrendingUp, TrendingDown, Radio, Users, PieChart, Maximize2, Minimize2 } from "lucide-react";

import type { ForecastResponse, TrendSource } from "../types/smartseller";

interface ForecastOutputProps {
  data: ForecastResponse | null;
  trendText: string;
  trendSources: TrendSource[];
  trendLoading: boolean;
}

export const ForecastOutput: React.FC<ForecastOutputProps> = ({ data, trendText, trendSources, trendLoading }) => {
  const isMeningkat = data?.trend_status === "MENINGKAT";

  const genderData = data?.insight?.gender_distribution ?? {
    Unknown: 0,
  };

  const ageData = data?.insight?.age_distribution ?? {
    "-": 0,
  };

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleToggleExpand = (cardId: string) => {
    if (expandedCard === cardId) {
      document.body.style.overflow = "auto";
      setExpandedCard(null);
    } else {
      document.body.style.overflow = "hidden";
      setExpandedCard(cardId);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const getCardClass = (cardId: string, defaultClass: string) =>
    expandedCard === cardId
      ? "fixed inset-4 z-50 bg-slate-950 border border-slate-800 rounded-2xl p-7 shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      : `${defaultClass} transition-all duration-300 ease-in-out`;

  return (
    <div className="flex flex-col gap-5">
      {/* FORECAST */}
      {!data ? (
        <div
          className={getCardClass(
            "forecast",
            "bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col h-85",
          )}
        >
          <div className="flex items-start justify-between mb-4 shrink-0">
            <div>
              <h3 className={`font-bold text-white ${expandedCard === "forecast" ? "text-2xl" : "text-sm"}`}>Pipeline Siap Dieksekusi</h3>
              <p className={`text-slate-500 ${expandedCard === "forecast" ? "text-sm" : "text-xs"}`}>Jalankan Peramalan terlebih dahulu</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleExpand("forecast")}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/40 transition-all cursor-pointer shrink-0"
            >
              {expandedCard === "forecast" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-4">
              <LineChart className="w-5 h-5 text-slate-700" />
            </div>
            <p className="text-xs text-slate-500">Menunggu proses forecasting dijalankan...</p>
          </div>
        </div>
      ) : (
        <div className={getCardClass("forecast", "bg-slate-900/40 border border-slate-800 rounded-2xl p-5 h-85 flex flex-col")}>
          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h2 className={`font-bold text-white ${expandedCard === "forecast" ? "text-2xl" : "text-lg"}`}>Hasil Prediksi</h2>
              <p className={`${expandedCard === "forecast" ? "text-sm" : "text-xs"} text-slate-500`}>Hasil prediksi Prophet</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold ${expandedCard === "forecast" ? "text-base" : "text-sm"} ${isMeningkat ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
              >
                {isMeningkat ? (
                  <TrendingUp size={expandedCard === "forecast" ? 22 : 18} />
                ) : (
                  <TrendingDown size={expandedCard === "forecast" ? 22 : 18} />
                )}
                {data.trend_status}
              </div>
              <button
                type="button"
                onClick={() => handleToggleExpand("forecast")}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/40 transition-all cursor-pointer"
              >
                {expandedCard === "forecast" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 rounded-xl border border-slate-800 bg-slate-950/20">
            <table className="w-full border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase sticky top-0 z-10 shadow-[0_1px_0_0_rgba(30,41,59,1)]">
                <tr>
                  <th className="p-4 text-left w-16">No</th>
                  <th className="p-4 text-left">Minggu</th>
                  <th className="p-4 text-right">Hasil Prediksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.forecast.map((row, index) => (
                  <tr key={row.week_offset} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-slate-400 font-mono">{index + 1}</td>
                    <td className="p-4 text-white">Minggu ke-{row.week_offset}</td>
                    <td className="p-4 text-right">
                      <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg font-bold inline-block">
                        $
                        {row.sales.toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* GENDER */}
        <div className={getCardClass("gender", "bg-slate-900/40 border border-slate-800 rounded-2xl p-5")}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Users size={expandedCard === "gender" ? 24 : 18} />
              <h3 className={`font-bold ${expandedCard === "gender" ? "text-2xl" : ""}`}>Distribusi Jenis Kelamin</h3>
            </div>
            <button
              type="button"
              onClick={() => handleToggleExpand("gender")}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              {expandedCard === "gender" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(genderData)
              .sort((a, b) => b[1] - a[1])
              .map(([key, val]) => (
                <div key={key}>
                  <div className={`flex justify-between mb-2 ${expandedCard === "gender" ? "text-base" : "text-sm"}`}>
                    <span className="text-white">
                      {key === "Female" ? "Perempuan" : key === "Male" ? "Laki-laki" : key === "Unknown" ? "Tidak Ada Data" : key}
                    </span>
                    <span className="text-slate-400">{data ? `${(val * 100).toFixed(1)}%` : "Menunggu..."}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: data ? `${val * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* AGE */}
        <div className={getCardClass("age", "bg-slate-900/40 border border-slate-800 rounded-2xl p-5")}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-violet-400">
              <PieChart size={expandedCard === "age" ? 24 : 18} />
              <h3 className={`font-bold ${expandedCard === "age" ? "text-2xl" : ""}`}>Distribusi Usia</h3>
            </div>
            <button
              type="button"
              onClick={() => handleToggleExpand("age")}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all cursor-pointer"
            >
              {expandedCard === "age" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(ageData)
              .sort((a, b) => b[1] - a[1])
              .map(([key, val]) => (
                <div key={key}>
                  <div className={`flex justify-between mb-2 ${expandedCard === "age" ? "text-base" : "text-sm"}`}>
                    <span className="text-white">{key === "-" ? "Tidak Ada Data" : `${key} Tahun`}</span>
                    <span className="text-slate-400">{data ? `${(val * 100).toFixed(1)}%` : "Menunggu..."}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: data ? `${val * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* GEMINI */}
      <div className={getCardClass("gemini", "bg-slate-900/40 border border-slate-800 rounded-2xl p-5")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-orange-400">
            <Sparkles size={expandedCard === "gemini" ? 24 : 18} />
            <h3 className={`font-bold ${expandedCard === "gemini" ? "text-2xl" : ""}`}>Wawasan Gemini</h3>
          </div>
          <button
            type="button"
            onClick={() => handleToggleExpand("gemini")}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/40 transition-all cursor-pointer"
          >
            {expandedCard === "gemini" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
        <div className={`${expandedCard === "gemini" ? "h-[80vh]" : "h-56"} overflow-y-auto pr-2`}>
          {!data?.description ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">Menunggu hasil analisis...</div>
          ) : (
            <div className={`prose prose-invert max-w-none text-slate-300 ${expandedCard === "gemini" ? "prose-lg" : "prose-sm"}`}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {data.description}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* ALIRAN PASAR */}
      <div className={getCardClass("stream", "bg-slate-900/40 border border-slate-800 rounded-2xl p-5")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radio size={expandedCard === "stream" ? 24 : 18} />
            <h3 className={`font-bold ${expandedCard === "stream" ? "text-2xl" : ""}`}>Aliran Pasar Langsung</h3>
          </div>
          <button
            type="button"
            onClick={() => handleToggleExpand("stream")}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            {expandedCard === "stream" ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className={`${expandedCard === "stream" ? "h-[60vh]" : "h-48"} overflow-y-auto pr-2 mb-4`}>
          {trendLoading ? (
            <div className="flex items-center justify-center h-full gap-2 text-slate-500 text-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Sedang menganalisis pasar...
            </div>
          ) : !trendText ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">Menunggu hasil analisis...</div>
          ) : (
            <div className={`prose prose-invert max-w-none text-slate-300 ${expandedCard === "stream" ? "prose-lg" : "prose-sm"}`}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {trendText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {trendSources.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Sumber Berita</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {trendSources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-52 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center">
                      <Radio size={10} className="text-cyan-400" />
                    </div>
                    <span className="text-xs text-cyan-400 font-mono truncate">{new URL(source.url).hostname.replace("www.", "")}</span>
                  </div>
                  <p className="text-xs text-slate-300 group-hover:text-white line-clamp-3 leading-relaxed transition-colors">
                    {source.title || "Buka artikel"}
                  </p>
                  <div className="mt-2 text-xs text-slate-600 group-hover:text-cyan-500 transition-colors">Baca →</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
