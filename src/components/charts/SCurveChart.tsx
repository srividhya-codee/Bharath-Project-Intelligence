import React, { useState } from 'react';
import { Project } from '../../types';
import { TrendingUp, Info, Calendar } from 'lucide-react';

interface SCurveChartProps {
  project: Project;
}

export const SCurveChart: React.FC<SCurveChartProps> = ({ project }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const months = [
    'Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022',
    'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023',
    'Q1 2024', 'Q2 2024', 'Q3 2024 (Now)', 'Q4 2024',
    'Q1 2025', 'Q2 2025 (Forecast)'
  ];

  const currentIdx = 10;

  const data = months.map((m, idx) => {
    const t = (idx / (months.length - 3)) * 6 - 3;
    const rawPlanned = 100 / (1 + Math.exp(-0.85 * t));
    const planned = Math.min(100, Math.max(0, Math.round(rawPlanned * 10) / 10));

    let actual: number | null = null;
    let spend: number | null = null;

    if (idx <= currentIdx) {
      if (idx === currentIdx) {
        actual = project.actualPhysicalPct;
        spend = project.financialSpendPct;
      } else {
        const factor = idx / currentIdx;
        actual = Math.round(project.actualPhysicalPct * Math.pow(factor, 1.2) * 10) / 10;
        spend = Math.round(project.financialSpendPct * Math.pow(factor, 0.95) * 10) / 10;
      }
    } else {
      const remainingTime = idx - currentIdx;
      actual = Math.min(100, Math.round((project.actualPhysicalPct + remainingTime * 14.0) * 10) / 10);
      spend = Math.min(100, Math.round((project.financialSpendPct + remainingTime * 5.0) * 10) / 10);
    }

    return {
      month: m,
      planned,
      actual,
      spend,
      isCurrent: idx === currentIdx,
      isFuture: idx > currentIdx
    };
  });

  const width = 720;
  const height = 300;
  const padding = { top: 25, right: 35, bottom: 45, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / 100) * graphHeight;

  const plannedPath = data.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.planned)}`,
    ''
  );

  const actualHistoryData = data.slice(0, currentIdx + 1);
  const actualPath = actualHistoryData.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.actual!)}`,
    ''
  );

  const spendHistoryData = data.slice(0, currentIdx + 1);
  const spendPath = spendHistoryData.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.spend!)}`,
    ''
  );

  const currentPt = data[currentIdx];
  const gap = Number(((currentPt.spend || 0) - (currentPt.actual || 0)).toFixed(1));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              S-Curve Progress & Financial Drawdown Trajectory
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {project.projectCode}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Earned Value Tracking: Planned Physical Baseline vs Verified Physical Delivery vs Financial Expenditure
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 text-[10px] block font-medium">Schedule Slippage</span>
            <span className="font-bold text-red-700">
              {project.delayDays} Days (~{(project.delayDays / 30.4).toFixed(1)} mos)
            </span>
          </div>
          <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 text-[10px] block font-medium">Financial Lead Gap</span>
            <span className={`font-bold ${gap > 15 ? 'text-amber-700' : 'text-emerald-700'}`}>
              +{gap}% Points
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] select-none"
        >
          <defs>
            <linearGradient id="spendGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 20, 40, 60, 80, 100].map(val => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={getY(val) + 4}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* Reporting Line */}
          <line
            x1={getX(currentIdx)}
            y1={padding.top}
            x2={getX(currentIdx)}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={getX(currentIdx)}
            y={padding.top - 8}
            fill="#475569"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            REPORTING DATE
          </text>

          {/* Shaded Area between Spend and Actual */}
          <path
            d={`${spendPath} L ${getX(currentIdx)} ${getY(currentPt.actual!)} ${actualHistoryData
              .slice()
              .reverse()
              .map((pt, i) => `L ${getX(currentIdx - i)} ${getY(pt.actual!)}`)
              .join(' ')} Z`}
            fill="url(#spendGradientLight)"
          />

          {/* Planned Curve */}
          <path
            d={plannedPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Cumulative Financial Spend Curve */}
          <path
            d={spendPath}
            fill="none"
            stroke="#D97706"
            strokeWidth="2.5"
          />

          {/* Actual Physical Progress Curve */}
          <path
            d={actualPath}
            fill="none"
            stroke="#1565C0"
            strokeWidth="3"
          />

          {/* Points */}
          {data.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={pt.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <rect
                  x={getX(i) - 15}
                  y={padding.top}
                  width="30"
                  height={graphHeight}
                  fill="transparent"
                />

                <circle
                  cx={getX(i)}
                  cy={getY(pt.planned)}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#94a3b8"
                />

                {pt.actual !== null && (
                  <circle
                    cx={getX(i)}
                    cy={getY(pt.actual)}
                    r={isHovered || pt.isCurrent ? 5.5 : 3.5}
                    fill="#1565C0"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {pt.spend !== null && (
                  <circle
                    cx={getX(i)}
                    cy={getY(pt.spend)}
                    r={isHovered || pt.isCurrent ? 5.5 : 3.5}
                    fill="#D97706"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                <text
                  x={getX(i)}
                  y={height - padding.bottom + 18}
                  fill={pt.isCurrent ? '#1565C0' : '#64748b'}
                  fontSize="9"
                  fontWeight={pt.isCurrent ? 'bold' : 'normal'}
                  textAnchor="middle"
                  transform={i % 2 !== 0 ? `rotate(15, ${getX(i)}, ${height - padding.bottom + 18})` : undefined}
                >
                  {pt.month.replace(' (Now)', '').replace(' (Forecast)', '')}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute top-2 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-xs z-20 pointer-events-none"
            style={{
              left: `${Math.min(70, Math.max(10, (hoverIndex / (data.length - 1)) * 100))}%`
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              {data[hoverIndex].month}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span>Planned Baseline:</span>
                <span className="font-mono font-bold text-white">{data[hoverIndex].planned}%</span>
              </div>
              {data[hoverIndex].actual !== null && (
                <div className="flex items-center justify-between gap-4 text-blue-300">
                  <span>Actual Delivery:</span>
                  <span className="font-mono font-bold">{data[hoverIndex].actual}%</span>
                </div>
              )}
              {data[hoverIndex].spend !== null && (
                <div className="flex items-center justify-between gap-4 text-amber-300">
                  <span>Capital Drawn:</span>
                  <span className="font-mono font-bold">{data[hoverIndex].spend}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" />
            <span className="text-slate-500">Planned Baseline</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-[#1565C0] rounded-full" />
            <span className="text-blue-900 font-semibold">Actual Physical ({project.actualPhysicalPct}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-[#D97706] rounded-full" />
            <span className="text-amber-800 font-semibold">Financial Expenditure ({project.financialSpendPct}%)</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Shaded amber zone denotes expenditure leading verified physical works</span>
        </div>
      </div>
    </div>
  );
};
