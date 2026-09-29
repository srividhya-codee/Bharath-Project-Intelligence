import React from 'react';
import { Layers } from 'lucide-react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-lg text-slate-800 text-xs">
      <div className="flex items-center space-x-1.5 font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5">
        <Layers className="w-3.5 h-3.5 text-blue-700" />
        <span>3D Infrastructure Status Legend</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-medium text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808] ring-2 ring-emerald-200" />
          <span className="text-slate-700">On Track</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808] opacity-80" />
          <span className="text-slate-700">Completed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-amber-200" />
          <span className="text-slate-700">At Risk</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-red-200 animate-pulse" />
          <span className="text-slate-700">Critical Delay</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0] ring-2 ring-blue-200" />
          <span className="text-slate-700">Planned / Tender</span>
        </div>
      </div>
    </div>
  );
};
