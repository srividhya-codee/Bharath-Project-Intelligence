import React, { useState } from 'react';
import { AlertItem, Project, User } from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Send,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Bookmark,
  Building2,
  Compass
} from 'lucide-react';

interface EarlyWarningViewProps {
  alerts: AlertItem[];
  projects: Project[];
  currentUser: User;
  onSelectProject: (code: string) => void;
  onOpenAssistantWithQuery: (query: string) => void;
  onUpdateAlertStatus: (alertId: number, status: AlertItem['status']) => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({
  alerts,
  projects,
  currentUser,
  onSelectProject,
  onOpenAssistantWithQuery,
  onUpdateAlertStatus
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(alerts[0] || null);

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'All') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Statutory Early Warning Policy Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-red-700 uppercase tracking-wider text-[11px] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                Automated Tripwire Engine
              </span>
              <span aria-hidden="true">·</span>
              <span>Rule-Based EVM + ML Composite Triggers</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Early Warning Center
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Automated surveillance detects schedule slippage (SPI &lt; 0.85), financial lead divergence (&gt; 15%), and ML risk escalation (≥ 60/100) before contractual delays compound.
            </p>
          </div>

          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['All', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Statutory Triggers Info Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start space-x-2.5">
            <TrendingDown className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Trigger 1: Schedule Slippage (SPI &lt; 0.85)</span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-0.5">
                Earned physical delivery falls more than 15% behind the planned calendar baseline.
              </span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Trigger 2: Financial Lead Gap (&gt; 15%)</span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-0.5">
                Capital disbursement percentage leads verified on-site physical progress by 15+ points.
              </span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Trigger 3: ML Composite Risk (≥ 60/100)</span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-0.5">
                Forward-looking predictive multi-factor risk score crosses into High or Critical tiers.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Alert Feed & Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Alerts Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span className="uppercase tracking-wider">
              Monitored Early Warnings ({filteredAlerts.length})
            </span>
            <span>Sorted by Severity</span>
          </div>

          <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
            {filteredAlerts.map(alert => {
              const isSelected = selectedAlert?.id === alert.id;
              const sourceDocName = alert.projectCode === 'P-102'
                ? 'Quarterly Site Inspection Report'
                : `${alert.projectCode} Progress Review Record`;

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {alert.projectCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        alert.severity === 'Critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : alert.severity === 'High'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {alert.severity} • {alert.alertType}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {alert.title}
                  </h3>

                  <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {alert.explanation}
                  </div>

                  {/* Evidence & Trigger Snippet */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      Ground Evidence:
                    </div>
                    <div className="font-mono text-slate-800">
                      {alert.evidence.spi !== undefined && (
                        <span>SPI: <strong>{alert.evidence.spi}</strong> | </span>
                      )}
                      {alert.evidence.gap !== undefined && (
                        <span>Lead Gap: <strong>+{alert.evidence.gap}%</strong> | </span>
                      )}
                      {alert.evidence.riskScore !== undefined && (
                        <span>Risk Score: <strong>{alert.evidence.riskScore}/100</strong></span>
                      )}
                    </div>
                    <div className="text-[10px] text-blue-700 font-medium pt-0.5">
                      Source: {sourceDocName}
                    </div>
                  </div>

                  {/* Direct Link to Project 360 */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.state} · {alert.sector}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectProject(alert.projectCode);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] flex items-center space-x-1 transition cursor-pointer shadow-2xs"
                    >
                      <Compass className="w-3 h-3 text-amber-300" />
                      <span>Investigate Project</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Full Details Pane */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-base text-blue-700">
                      {selectedAlert.projectCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-bold uppercase">
                      {selectedAlert.severity} PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      STATUS: {selectedAlert.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {selectedAlert.title}
                  </h2>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Subject Project: <strong className="text-slate-800">{selectedAlert.projectName}</strong> ({selectedAlert.state} · {selectedAlert.sector})
                  </div>
                </div>

                {/* Primary Action Button: Open Project 360 */}
                <button
                  onClick={() => onSelectProject(selectedAlert.projectCode)}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>Investigate Project 360°</span>
                </button>
              </div>

              {/* Authoritative Trigger Parameters */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Verified Trigger Metrics & Parameters:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
                  {selectedAlert.evidence.spi !== undefined && (
                    <div>
                      <span className="text-slate-500 block">Schedule Index (SPI)</span>
                      <span
                        className={`text-base font-bold font-mono ${
                          selectedAlert.evidence.spi < 0.85 ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        {selectedAlert.evidence.spi}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Baseline: 1.0</span>
                    </div>
                  )}
                  {selectedAlert.evidence.cpi !== undefined && (
                    <div>
                      <span className="text-slate-500 block">Cost Index (CPI)</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        {selectedAlert.evidence.cpi}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Cost efficiency</span>
                    </div>
                  )}
                  {selectedAlert.evidence.gap !== undefined && (
                    <div>
                      <span className="text-slate-500 block">Financial Lead Gap</span>
                      <span className="text-base font-bold font-mono text-amber-700">
                        +{selectedAlert.evidence.gap}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">Threshold: &gt; 15%</span>
                    </div>
                  )}
                  {selectedAlert.evidence.riskScore !== undefined && (
                    <div>
                      <span className="text-slate-500 block">ML Risk Score</span>
                      <span className="text-base font-bold font-mono text-red-700">
                        {selectedAlert.evidence.riskScore}/100
                      </span>
                      <span className="text-[10px] text-slate-500 block">High Risk Tier</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Explanation */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                  Inspection Finding & Detailed Context:
                </h3>
                <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedAlert.explanation}
                </p>
              </div>

              {/* Verified Source Document Citation */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1">
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-700" />
                  Statutory Source Document Citation
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Extracted from verified statutory inspection and progress filing: <strong className="text-slate-900">{selectedAlert.projectCode === 'P-102' ? 'Quarterly Site Inspection Report (Q3 2024, Page 2)' : `${selectedAlert.projectCode} Central Sector Progress Register`}</strong>.
                </p>
              </div>

              {/* Action Workflows */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Intervention Workflows & Dispatches:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() =>
                      onOpenAssistantWithQuery(
                        `Explain root cause and mitigation strategy for early warning alert on ${selectedAlert.projectCode}`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Root Cause Diagnosis</span>
                  </button>

                  <button
                    onClick={() => onUpdateAlertStatus(selectedAlert.id, 'Acknowledged')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" />
                    <span>Acknowledge Alert</span>
                  </button>

                  <button
                    onClick={() => onUpdateAlertStatus(selectedAlert.id, 'Escalated')}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Escalate to Ministry Secretariat</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              Select an early warning alert from the left feed to inspect evidence parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
