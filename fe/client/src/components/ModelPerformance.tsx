import React from "react";
import { BarChart3, Target, Percent } from "lucide-react";

interface ModelPerformanceProps {
  selectedCategory: string;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ selectedCategory }) => {
  // Data statis berdasarkan hasil evaluasi riil dari Jupyter Notebook Anda (Skala Dollar)
  const performanceData: Record<string, { mae: string; rmse: string; mape: string; accuracy: string }> = {
    Clothing: {
      mae: "1,840.16",
      rmse: "2,336.23",
      mape: "18.67%",
      accuracy: "81.33%",
    },
    Beauty: {
      mae: "1,641.70",
      rmse: "2,220.38",
      mape: "23.52%",
      accuracy: "76.48%",
    },
    Electronics: {
      mae: "5,921.73",
      rmse: "6,955.19",
      mape: "24.30%",
      accuracy: "75.70%",
    },
  };

  const currentMetrics = performanceData[selectedCategory] || performanceData["Clothing"];

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <h2 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2.5 uppercase tracking-wider">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
          <BarChart3 className="w-4 h-4" />
        </div>
        Model Evaluation Metrics
      </h2>

      {/* Label Kategori Aktif */}
      <div className="mb-3 px-3 py-1.5 bg-slate-950/60 border border-slate-900 rounded-lg flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kategori Terpilih:</span>
        <span className="text-xs font-extrabold text-orange-400 font-mono">{selectedCategory}</span>
      </div>

      <div className="space-y-3">
        {/* MAE */}
        <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">MAE</p>
              <p className="text-[9px] text-slate-500 lowercase">mean absolute error</p>
            </div>
          </div>
          {/* DIUBAH KE USD */}
          <span className="text-xs font-bold font-mono text-slate-200">${currentMetrics.mae}</span>
        </div>

        {/* RMSE */}
        <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">RMSE</p>
              <p className="text-[9px] text-slate-500 lowercase">root mean squared error</p>
            </div>
          </div>
          {/* DIUBAH KE USD */}
          <span className="text-xs font-bold font-mono text-slate-200">${currentMetrics.rmse}</span>
        </div>

        {/* MAPE & AKURASI */}
        <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
          <div className="flex items-center gap-2">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">MAPE (Error)</p>
              <p className="text-[9px] text-slate-500 lowercase">mean absolute percentage error</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold font-mono text-rose-400">{currentMetrics.mape}</span>
            <span className="text-[9px] font-medium text-emerald-400 block">Akurasi: {currentMetrics.accuracy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
