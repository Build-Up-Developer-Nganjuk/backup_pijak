import React from "react";
import { Terminal, Radio } from "lucide-react";

interface PipelineStatusProps {
  sessionId: string;
  sseStatus: string;
  globalTrend: string;
}

export const PipelineStatus: React.FC<PipelineStatusProps> = ({ sessionId, sseStatus, globalTrend }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 shadow-inner">
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/15">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Alur 1: Penyimpanan Sesi Browser</span>
          <span className="text-xs font-mono font-bold text-slate-300 truncate block">{sessionId || "Membuat Token"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-2.5 shadow-inner">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Alur 3: Aliran Data Acara SSE</span>
            <span className="text-xs font-extrabold text-slate-300 truncate block">{globalTrend}</span>
          </div>
        </div>
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0 border ${
            sseStatus === "TERPUTUS"
              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
              : sseStatus === "EROR"
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : sseStatus === "MENYAMBUNGKAN"
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {sseStatus}
        </span>
      </div>
    </div>
  );
};
