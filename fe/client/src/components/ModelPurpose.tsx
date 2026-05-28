import React from "react";
import { HelpCircle, BrainCircuit, TrendingUp, ShieldAlert } from "lucide-react";

export const ModelPurpose: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <h2 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2.5 uppercase tracking-wider">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
          <BrainCircuit className="w-4 h-4" />
        </div>
        Tentang AI Forecasting
      </h2>

      <div className="space-y-4 text-xs leading-relaxed text-slate-400">
        <p>
          Website <span className="text-white font-semibold">SMARTSELLER AI</span> ini memiliki fitur{" "}
          <span className="text-orange-400 font-bold">Prediksi Omset Penjualan</span>. Fitur ini memprediksi secara{" "}
          <span className="text-white font-medium underline decoration-indigo-500/50 decoration-2 underline-offset-2">mingguan</span> total uang
          (pendapatan kotor dalam USD) yang akan diterima toko per kategori produk, yaitu kategori{" "}
          <span className="text-slate-200 font-semibold">Clothing (pakaian)</span>,{" "}
          <span className="text-slate-200 font-semibold">Electronics (elektronik/teknologi)</span>, dan{" "}
          <span className="text-slate-200 font-semibold">Beauty (kecantikan)</span>.
        </p>

        <p>
          Prediksi ini didasarkan pada data historis penjualan yang telah dikumpulkan sebelumnya. Dengan menggunakan algoritma{" "}
          <span className="text-indigo-400 font-medium">Machine Learning (Prophet)</span>, website ini menganalisis pola penjualan dari minggu-minggu
          sebelumnya untuk memberikan perkiraan omset penjualan di masa depan.
        </p>

        {/* Highlight Manfaat Bisnis */}
        <div className="pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wide">
          <div className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Manajemen Stok</span>
          </div>
          <div className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Strategi Pasar</span>
          </div>
          <div className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Arus Keuangan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
