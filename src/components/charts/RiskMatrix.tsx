import React, { useState } from 'react';
import { RiskItem } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskMatrixProps {
  risks: RiskItem[];
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredRisk, setHoveredRisk] = useState<RiskItem | null>(null);

  const categories = ['All', 'Forest & Environmental', 'Utility Shifting', 'Weather & Monsoon', 'Financial & Budgetary', 'Land Acquisition'];

  const filteredRisks = selectedCategory === 'All'
    ? risks
    : risks.filter(r => r.category === selectedCategory);

  const scoreMap = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4
  };

  const levels = [
    { label: 'Critical', val: 4 },
    { label: 'High', val: 3 },
    { label: 'Medium', val: 2 },
    { label: 'Low', val: 1 }
  ];

  const getCellBg = (likelihood: number, impact: number) => {
    const product = likelihood * impact;
    if (product >= 12) return 'bg-red-50 border-red-200 hover:bg-red-100';
    if (product >= 6) return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
    return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">
              Risk Probability & Impact Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Categorization of project execution risks across likelihood and impact dimensions
          </p>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-xl transition whitespace-nowrap font-medium ${
                selectedCategory === c
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="relative">
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-500 tracking-wider">
              LIKELIHOOD →
            </div>

            <div className="ml-4 space-y-1.5">
              {levels.map(lRow => (
                <div key={lRow.label} className="flex items-center space-x-1.5">
                  <div className="w-16 text-[11px] font-mono text-slate-600 text-right pr-2">
                    {lRow.label}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 flex-1">
                    {levels
                      .slice()
                      .reverse()
                      .map(iCol => {
                        const cellRisks = filteredRisks.filter(
                          r =>
                            scoreMap[r.likelihood] === lRow.val &&
                            scoreMap[r.impact] === iCol.val
                        );

                        return (
                          <div
                            key={iCol.label}
                            className={`h-16 rounded-xl border p-1.5 transition-all flex flex-wrap gap-1 items-start content-start relative ${getCellBg(
                              lRow.val,
                              iCol.val
                            )}`}
                          >
                            {cellRisks.map(r => (
                              <button
                                key={r.id}
                                onMouseEnter={() => setHoveredRisk(r)}
                                className="w-6 h-6 rounded-full bg-white border border-slate-300 text-[10px] font-bold flex items-center justify-center hover:scale-125 transition-transform shadow-xs text-blue-900"
                              >
                                R{r.id}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}

              <div className="flex items-center space-x-1.5 pt-1">
                <div className="w-16" />
                <div className="grid grid-cols-4 gap-1.5 flex-1 text-center text-[11px] font-mono text-slate-500">
                  <div>Low Impact</div>
                  <div>Medium</div>
                  <div>High</div>
                  <div>Critical Impact</div>
                </div>
              </div>

              <div className="text-center text-[10px] font-bold text-slate-500 tracking-wider pt-1 ml-16">
                IMPACT SEVERITY →
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
          <div className="text-[10px] uppercase font-mono text-blue-700 font-bold mb-1">
            RISK DETAIL INSPECTOR
          </div>
          {hoveredRisk ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-900">Risk #{hoveredRisk.id}</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold text-[10px]">
                  {hoveredRisk.severity} Severity
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">Category</span>
                <span className="font-semibold text-slate-900">{hoveredRisk.category}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-medium">Description</span>
                <p className="text-slate-700 leading-relaxed">{hoveredRisk.description}</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                <span className="text-emerald-800 font-semibold text-[10px] block flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-[#138808]" />
                  Mitigation Action Plan:
                </span>
                <p className="text-slate-700 text-[11px]">{hoveredRisk.mitigationPlan}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-10">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              Hover over any numbered circle (R1, R2, etc.) in the risk matrix to inspect active impediment and mitigation plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
