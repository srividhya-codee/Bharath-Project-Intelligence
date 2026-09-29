import React from 'react';
import { EVMMetrics } from '../../types';
import {
  Calculator,
  CheckCircle2,
  DollarSign,
  Clock
} from 'lucide-react';

interface EVMDashboardProps {
  evm: EVMMetrics;
  approvedCostCr: number;
  revisedCostCr?: number | null;
}

export const EVMDashboard: React.FC<EVMDashboardProps> = ({
  evm,
  approvedCostCr,
  revisedCostCr
}) => {
  const getSpiBadge = (spi: number) => {
    if (spi >= 0.95) return 'text-[#138808] border-emerald-200 bg-emerald-50';
    if (spi >= 0.85) return 'text-amber-800 border-amber-200 bg-amber-50';
    return 'text-[#DC2626] border-red-200 bg-red-50';
  };

  const getCpiBadge = (cpi: number) => {
    if (cpi >= 0.95) return 'text-[#138808] border-emerald-200 bg-emerald-50';
    if (cpi >= 0.85) return 'text-amber-800 border-amber-200 bg-amber-50';
    return 'text-[#DC2626] border-red-200 bg-red-50';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Earned Value Management (EVM) Analytical Engine
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#138808] border border-emerald-200 font-semibold">
              STATUTORY NORMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematical appraisal per Ministry of Finance capital project oversight guidelines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${getSpiBadge(evm.spi)}`}>
            <span>SPI: {evm.spi}</span>
            <span className="text-[10px] opacity-90">
              {evm.spi >= 0.95 ? 'ON SCHEDULE' : evm.spi >= 0.85 ? 'WARNING' : 'CRITICAL DELAY'}
            </span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${getCpiBadge(evm.cpi)}`}>
            <span>CPI: {evm.cpi}</span>
            <span className="text-[10px] opacity-90">
              {evm.cpi >= 0.95 ? 'EFFICIENT' : evm.cpi >= 0.85 ? 'MODERATE OVERRUN' : 'COST DIVERGENCE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Planned Value (PV)</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            ₹{evm.pv.toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Budgeted work scheduled to date
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Earned Value (EV)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">
            ₹{evm.ev.toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Budgeted value of verified physical work
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Actual Cost (AC)</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">
            ₹{evm.ac.toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Actual capital disbursement to date
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Budget at Completion (BAC)</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            ₹{evm.bac.toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {revisedCostCr ? `Revised Cap: ₹${revisedCostCr.toLocaleString()} Cr` : 'Approved Capital Outlay'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Variances & Delivery Deficits
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-900">Schedule Variance (SV)</div>
                <div className="text-[10px] text-slate-500 font-mono">Formula: EV - PV</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold font-mono ${evm.sv >= 0 ? 'text-[#138808]' : 'text-red-700'}`}>
                  {evm.sv >= 0 ? '+' : ''}₹{evm.sv} Cr
                </div>
                <div className="text-[10px] text-slate-500">
                  {evm.sv < 0 ? 'Physical work behind plan' : 'On schedule'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-900">Cost Variance (CV)</div>
                <div className="text-[10px] text-slate-500 font-mono">Formula: EV - AC</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold font-mono ${evm.cv >= 0 ? 'text-[#138808]' : 'text-red-700'}`}>
                  {evm.cv >= 0 ? '+' : ''}₹{evm.cv} Cr
                </div>
                <div className="text-[10px] text-slate-500">
                  {evm.cv < 0 ? 'Disbursement leading physical progress' : 'Cost efficiency'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-900">Financial Lead Gap</div>
                <div className="text-[10px] text-slate-500 font-mono">Spend % - Physical %</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold font-mono ${evm.financialPhysicalGap > 15 ? 'text-amber-700' : 'text-[#138808]'}`}>
                  +{evm.financialPhysicalGap}% points
                </div>
                <div className="text-[10px] text-slate-500">
                  {evm.financialPhysicalGap > 15 ? 'Exceeds 15% alert threshold' : 'Within normal limits'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Forecast At Completion (EAC)
          </h4>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600 font-medium">Estimate at Completion (EAC)</span>
                <span className="text-[10px] text-slate-400 font-mono">EAC = BAC / CPI</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                ₹{evm.eac.toLocaleString()} Cr
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Projected total expenditure required to finish full project scope
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600 font-medium">Variance at Completion (VAC)</span>
                <span className="text-[10px] text-slate-400 font-mono">VAC = BAC - EAC</span>
              </div>
              <div className={`text-lg font-bold font-mono ${evm.vac < 0 ? 'text-red-700' : 'text-[#138808]'}`}>
                {evm.vac < 0 ? '-' : '+'}₹{Math.abs(evm.vac).toLocaleString()} Cr (
                {Math.abs(Number(((evm.vac / evm.bac) * 100).toFixed(1)))}% Cost Overrun)
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {Math.abs(evm.vac / evm.bac) > 0.1
                  ? 'Exceeds 10% limit: Requires Revised Cost Committee review'
                  : 'Within standard administrative bandwidth'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
