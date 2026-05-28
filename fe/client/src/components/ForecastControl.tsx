import React, { useEffect, useState } from "react";
import { Sliders, RefreshCw, Play, CalendarDays, Maximize2, Minimize2 } from "lucide-react";

interface ForecastControlProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  forecastWeeks: number;
  setForecastWeeks: (weeks: number) => void;
  onForecast: () => void;
  onReset: () => void;
  isProcessing: boolean;
  hasForecastResult: boolean;
}

export const ForecastControl: React.FC<ForecastControlProps> = ({
  selectedCategory,
  setSelectedCategory,
  forecastWeeks,
  setForecastWeeks,
  onForecast,
  onReset,
  isProcessing,
  hasForecastResult,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCategories = [
    {
      id: "Clothing",
      name: "Clothing / Pakaian",
    },
    {
      id: "Beauty",
      name: "Beauty / Kecantikan",
    },
    {
      id: "Electronics",
      name: "Electronics / Teknologi",
    },
  ];

  const handleWeeksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value)) {
      setForecastWeeks(1);
      return;
    }

    const sanitizedValue = Math.max(1, Math.min(100, value));

    setForecastWeeks(sanitizedValue);
  };

  const handleToggleExpand = () => {
    if (!isExpanded) {
      document.body.style.overflow = "hidden";
      setIsExpanded(true);
    } else {
      document.body.style.overflow = "auto";
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className={`bg-slate-900/40 border border-slate-800/60 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out transform-gpu ${
        isExpanded ? "fixed inset-4 z-50 bg-slate-950 p-7 overflow-y-auto scale-100 opacity-100" : "p-5 scale-100 opacity-100"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h2
          className={`font-extrabold text-white flex items-center gap-2.5 uppercase tracking-wider transition-all duration-300 ${isExpanded ? "text-xl" : "text-sm"}`}
        >
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/15 transition-all duration-300">
            <Sliders className={`transition-all duration-300 ${isExpanded ? "w-6 h-6" : "w-4 h-4"}`} />
          </div>
          Kontrol Panel Prophet
        </h2>

        <button
          type="button"
          onClick={handleToggleExpand}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-orange-500/40 transition-all duration-300 cursor-pointer"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4 transition-all duration-300" /> : <Maximize2 className="w-4 h-4 transition-all duration-300" />}
        </button>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "space-y-6" : "space-y-4"}`}>
        {/* Pilihan Kategori */}
        <div>
          <label
            className={`text-slate-500 font-black uppercase tracking-widest block mb-2 transition-all duration-300 ${isExpanded ? "text-xs" : "text-[10px]"}`}
          >
            Pilih Kategori Produk
          </label>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isProcessing || hasForecastResult}
            className={`w-full bg-slate-950 border border-slate-900 focus:border-orange-500/60 focus:ring-4 focus:ring-orange-500/10 rounded-xl px-4 text-slate-200 font-semibold outline-none transition-all duration-300 disabled:opacity-50 ${
              isExpanded ? "py-4 text-base" : "py-3 text-xs"
            }`}
          >
            {activeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minggu */}
        <div>
          <label
            className={`text-slate-500 font-black uppercase tracking-widest mb-2 flex justify-between items-center transition-all duration-300 ${
              isExpanded ? "text-xs" : "text-[10px]"
            }`}
          >
            <span>Durasi Peramalan (Minggu)</span>

            <span
              className={`${isExpanded ? "text-[11px]" : "text-[9px]"} text-slate-600 font-mono lowercase font-normal transition-all duration-300`}
            >
              Batas: 1 - 100 minggu
            </span>
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-500 pointer-events-none">
              <CalendarDays className={`transition-all duration-300 ${isExpanded ? "w-5 h-5" : "w-4 h-4"}`} />
            </div>

            <input
              type="number"
              min={1}
              max={100}
              value={forecastWeeks}
              onChange={handleWeeksChange}
              disabled={isProcessing || hasForecastResult}
              className={`w-full bg-slate-950 border border-slate-900 focus:border-orange-500/60 focus:ring-4 focus:ring-orange-500/10 rounded-xl pl-11 pr-4 text-slate-200 font-bold font-mono outline-none transition-all duration-300 disabled:opacity-50 ${
                isExpanded ? "py-4 text-base" : "py-2.5 text-xs"
              }`}
              placeholder="Masukkan angka 1-100"
            />
          </div>
        </div>

        {/* Tombol */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* RESET */}
          <button
            onClick={onReset}
            type="button"
            disabled={!hasForecastResult || isProcessing}
            className={`bg-slate-950 border border-slate-900 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isExpanded ? "px-4 py-4 text-sm" : "px-3 py-3 text-xs"
            }`}
            title="Reset seluruh pipeline"
          >
            <RefreshCw className={`transition-all duration-300 ${isExpanded ? "w-5 h-5" : "w-3.5 h-3.5"}`} />
            Reset
          </button>

          {/* FORECAST */}
          <button
            onClick={onForecast}
            disabled={isProcessing || hasForecastResult}
            type="button"
            className={`col-span-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isExpanded ? "px-5 py-4 text-sm" : "px-4 py-3 text-xs"
            }`}
          >
            <Play className={`transition-all duration-300 ${isExpanded ? "w-5 h-5" : "w-3.5 h-3.5"}`} />

            {isProcessing ? "Memproses..." : hasForecastResult ? "Forecast Terkunci" : "Alur 2: Forecast"}
          </button>
        </div>
      </div>
    </div>
  );
};
