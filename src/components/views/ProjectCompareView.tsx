import React, { useState } from 'react';
import { Project, User } from '../../types';
import {
  GitCompare,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Building2,
  DollarSign
} from 'lucide-react';

interface ProjectCompareViewProps {
  projects: Project[];
  currentUser: User;
  onOpenAssistantWithQuery: (query: string) => void;
  onSelectProject: (code: string) => void;
}

export const ProjectCompareView: React.FC<ProjectCompareViewProps> = ({
  projects,
  currentUser,
  onOpenAssistantWithQuery,
  onSelectProject
}) => {
  const [project1Code, setProject1Code] = useState<string>('P-101');
  const [project2Code, setProject2Code] = useState<string>('P-102');
  const [project3Code, setProject3Code] = useState<string>('P-103');

  const p1 = projects.find(p => p.projectCode === project1Code) || projects[0];
  const p2 = projects.find(p => p.projectCode === project2Code) || projects[1];
  const p3 = projects.find(p => p.projectCode === project3Code) || projects[2];

  const comparedProjects = [p1, p2, p3];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              MULTI-PROJECT BENCHMARKING
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-700" />
            Cross-Project Performance Variance Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side comparison across capital outlay, schedule delivery velocity, and risk triggers.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenAssistantWithQuery(
              `Compare execution performance, EVM metrics and delays between ${p1.projectCode} and ${p2.projectCode}`
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Synthesize Comparative Analysis with AI</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Project Slot 1:</label>
          <select
            value={project1Code}
            onChange={e => setProject1Code(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.projectCode} value={p.projectCode}>
                {p.projectCode}: {p.name.slice(0, 36)}... ({p.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Project Slot 2:</label>
          <select
            value={project2Code}
            onChange={e => setProject2Code(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.projectCode} value={p.projectCode}>
                {p.projectCode}: {p.name.slice(0, 36)}... ({p.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Project Slot 3:</label>
          <select
            value={project3Code}
            onChange={e => setProject3Code(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.projectCode} value={p.projectCode}>
                {p.projectCode}: {p.name.slice(0, 36)}... ({p.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparedProjects.map(p => (
          <div
            key={p.projectCode}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-4 relative"
          >
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-base text-blue-700">
                  {p.projectCode}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    p.status === 'Delayed'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2">
                {p.name}
              </h3>
              <div className="text-[11px] text-slate-500 mt-1">
                {p.ministryCode} • {p.state} • {p.sector}
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-600">Approved Outlay:</span>
                <span className="font-mono font-bold text-slate-900">₹{p.approvedCostCr} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expenditure Drawn:</span>
                <span className="font-mono font-bold text-amber-700">₹{p.expenditureCr} Cr ({p.financialSpendPct}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Financial Lead Gap:</span>
                <span className="font-mono font-bold text-slate-800">+{p.evm.financialPhysicalGap}% points</span>
              </div>
            </div>

            {/* Physical Delivery */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-600">Physical Progress:</span>
                <span className="font-mono font-bold text-blue-700">{p.actualPhysicalPct}% / {p.plannedPhysicalPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Schedule Index (SPI):</span>
                <span className={`font-mono font-bold ${p.evm.spi >= 0.85 ? 'text-amber-700' : 'text-red-700'}`}>
                  {p.evm.spi}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Schedule Slippage:</span>
                <span className="font-mono font-bold text-red-700">+{p.delayDays} Days</span>
              </div>
            </div>

            {/* Risk & Milestones */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-600">Predictive Risk Score:</span>
                <span className="font-mono font-bold text-red-700">{p.prediction.riskScore}/100 ({p.prediction.riskBand})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Milestones Done:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {p.milestones.filter(m => m.status === 'Completed').length} / {p.milestones.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectProject(p.projectCode)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
            >
              Open Project 360°
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
