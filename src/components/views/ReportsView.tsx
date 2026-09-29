import React, { useState } from 'react';
import { Project, User } from '../../types';
import {
  Printer,
  FileCheck2,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  Cpu,
  HelpCircle
} from 'lucide-react';

interface ReportsViewProps {
  projects: Project[];
  currentUser: User;
  onOpenAssistantWithQuery: (query: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  currentUser,
  onOpenAssistantWithQuery
}) => {
  const [reportType, setReportType] = useState<string>('cci');
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('P-102');

  const project = projects.find(p => p.projectCode === selectedProjectCode) || projects[0];

  const handlePrint = () => {
    window.print();
  };

  const physicalDeficit = Math.max(0, project.plannedPhysicalPct - project.actualPhysicalPct);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-700 uppercase tracking-wider text-[11px] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Executive Decision Output
            </span>
            <span aria-hidden="true">·</span>
            <span>Comprehensive Multi-Source Dossier</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-700" />
            Executive Brief Generator
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Generate formal cabinet notes, inter-ministerial appraisal dossiers, and parliamentary briefs with verified EVM performance, documentary citations, and ML predictive risk outlooks.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-amber-300" />
          <span>Print / Export Executive Brief</span>
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Briefing Template Format:</label>
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-700 cursor-pointer shadow-2xs"
          >
            <option value="cci">Cabinet Committee on Infrastructure (CCI) Executive Note</option>
            <option value="parliament">Parliamentary Starred Question Response Draft</option>
            <option value="pmg">Project Monitoring Group (PMG) Delay Appraisal Dossier</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1.5">Subject Project:</label>
          <select
            value={selectedProjectCode}
            onChange={e => setSelectedProjectCode(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-700 cursor-pointer shadow-2xs"
          >
            {projects.map(p => (
              <option key={p.projectCode} value={p.projectCode}>
                {p.projectCode}: {p.name.slice(0, 42)}... ({p.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Government Formatted Document Preview Paper */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 sm:p-12 max-w-4xl mx-auto border border-slate-200 text-xs font-serif leading-relaxed">
        {/* Emblem & Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xl text-slate-800 mb-2">
            🏛️
          </div>
          <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">
            Government of India
          </h2>
          <h3 className="text-sm font-semibold text-slate-700">
            {project.ministry.toUpperCase()}
          </h3>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            SECRETARIAT • INFRASTRUCTURE MONITORING WING
          </div>
        </div>

        {/* Reference & Date */}
        <div className="flex justify-between items-center text-xs font-sans mb-6">
          <div>
            <span className="font-bold">File No:</span> GOI/INFRA/2026/EVM/{project.projectCode}
          </div>
          <div>
            <span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-4 font-sans">
          <h3 className="text-sm font-bold uppercase underline text-slate-900">
            {reportType === 'cci' && `EXECUTIVE NOTE FOR THE CABINET COMMITTEE ON INFRASTRUCTURE (CCI)`}
            {reportType === 'parliament' && `DRAFT REPLY TO PARLIAMENTARY QUESTION ON SCHEDULE SLIPPAGE`}
            {reportType === 'pmg' && `PROJECT MONITORING GROUP (PMG) INTER-MINISTERIAL REMEDIAL DOSSIER`}
          </h3>
          <h4 className="text-xs font-semibold text-slate-700 mt-1">
            SUBJECT: Project {project.projectCode} — Comprehensive Delivery, Cost Overrun & Evidence Appraisal
          </h4>
        </div>

        {/* Content Paragraphs following exact 10 sections */}
        <div className="space-y-5 font-sans text-xs">
          {/* 1. PROJECT & IDENTIFICATION */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              1. Project Identification
            </h5>
            <p className="text-slate-700 leading-relaxed">
              <strong>{project.name}</strong> (Code: <code>{project.projectCode}</code>), executed under the jurisdiction of the <strong>{project.ministry}</strong> in the State of <strong>{project.state}</strong>. Implementing Authority: <strong>{project.implementingAgency}</strong>; Concessionaire: <strong>{project.contractorName}</strong>.
            </p>
          </div>

          {/* 2. CURRENT STATUS */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              2. Current Status
            </h5>
            <p className="text-slate-700">
              The project is currently classified as <strong className={project.status === 'Delayed' ? 'text-red-700' : 'text-emerald-700'}>{project.status === 'Delayed' ? 'At Risk / Delayed' : 'Active On Track'}</strong> with a recorded schedule slippage of <strong>{project.delayDays} calendar days</strong> against contractual completion targets.
            </p>
          </div>

          {/* 3. PHYSICAL PROGRESS & SCHEDULE STATUS */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              3. Physical Progress & Schedule Status
            </h5>
            <table className="w-full border-collapse border border-slate-300 text-left my-2 font-mono text-[11px]">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2">EVM Parameter</th>
                  <th className="border border-slate-300 p-2">Target Baseline</th>
                  <th className="border border-slate-300 p-2">Actual Certified</th>
                  <th className="border border-slate-300 p-2">Variance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-sans font-medium">Physical Delivery</td>
                  <td className="border border-slate-300 p-2">{project.plannedPhysicalPct}%</td>
                  <td className="border border-slate-300 p-2 font-bold text-blue-700">{project.actualPhysicalPct}%</td>
                  <td className="border border-slate-300 p-2 text-red-700 font-bold">-{physicalDeficit.toFixed(1)}% deficit</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-sans font-medium">Schedule Index (SPI)</td>
                  <td className="border border-slate-300 p-2">1.00 (Parity)</td>
                  <td className="border border-slate-300 p-2 font-bold">{project.evm.spi}</td>
                  <td className="border border-slate-300 p-2 font-bold text-red-700">{project.evm.spi < 0.85 ? 'Critical Slippage' : 'Normal'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 font-sans font-medium">Contract Completion Target</td>
                  <td className="border border-slate-300 p-2">{project.plannedCompletionDate}</td>
                  <td className="border border-slate-300 p-2">{project.expectedCompletionDate}</td>
                  <td className="border border-slate-300 p-2 text-red-700 font-bold">+{project.delayDays} days delay</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. FINANCIAL STATUS */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              4. Financial Status & Disbursement Lead
            </h5>
            <p className="text-slate-700 leading-relaxed">
              Approved Capital Outlay: <strong>₹{project.approvedCostCr.toLocaleString()} Crore</strong>. Cumulative financial expenditure disbursed: <strong>₹{project.expenditureCr.toLocaleString()} Crore ({project.financialSpendPct}%)</strong>. Disbursed funds currently lead verified physical on-site delivery by <strong>+{project.evm.financialPhysicalGap} percentage points</strong>.
            </p>
          </div>

          {/* 5. KEY RISKS */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              5. Key Execution Risks & Bottlenecks
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong>Statutory & Environmental Handovers:</strong> Un-handed over contiguous corridor stretches due to pending Stage-II Forest clearances.</li>
              <li><strong>Utility Relocations:</strong> High-tension electrical power line and water trunk shifting disputes over supervision charges.</li>
              <li><strong>Concessionaire Capacity:</strong> Contractor plant output running below rated capacity on non-contiguous work fronts.</li>
            </ul>
          </div>

          {/* 6. EVIDENCE */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              6. Ground Documentary Evidence & Sources
            </h5>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
              <div>• <strong>Detailed Project Report (DPR):</strong> Executive Summary establishes baseline environmental and chainage requirements.</div>
              <div>• <strong>Quarterly Site Inspection Report (Q3 2024):</strong> Confirms contiguous 8.8 km un-handed over stretch and contractor plant constraints.</div>
              <div>• <strong>MoRTH Inter-Ministerial Review Minutes:</strong> Cites ₹3.2 Cr disputed supervision fees with TANGEDCO as primary utility delay factor.</div>
            </div>
          </div>

          {/* 7. ML FORECAST (AI Generated - Clearly Labeled) */}
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h5 className="font-bold uppercase text-[11px] text-blue-900 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-700" />
                7. ML Predictive Forecast Outlook (AI Model Generated)
              </h5>
              <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Advisory Forecast
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-800 pt-1">
              <div>Risk Rating: <strong className="text-red-700">{project.prediction.riskScore} / 100</strong></div>
              <div>Forecast Delay: <strong className="text-amber-700">+{project.prediction.predictedDelayDays} Days</strong></div>
              <div>Forecast Outlay (EAC): <strong className="text-emerald-700">₹{project.prediction.predictedFinalCostCr.toLocaleString()} Cr</strong></div>
            </div>
            <p className="text-[10px] text-slate-500 italic pt-1">
              * Notice: This section is generated via machine learning tree regression algorithms for advisory risk planning. It does not represent an official administrative determination.
            </p>
          </div>

          {/* 8. UNRESOLVED ISSUES */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              8. Unresolved Inter-Departmental Escalations
            </h5>
            <p className="text-slate-700">
              {project.issues.length > 0 ? (
                <span>Active escalations pending: <strong>{project.issues.map(i => i.title).join('; ')}</strong>.</span>
              ) : (
                <span>No pending administrative escalations recorded in the monitoring ledger.</span>
              )}
            </p>
          </div>

          {/* 9. MANAGEMENT ATTENTION */}
          <div>
            <h5 className="font-bold uppercase text-[11px] text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              9. Management Attention & Recommended Interventions
            </h5>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700">
              <li>Direct State Chief Secretary coordination meeting within 14 calendar days to finalize pending forest land mutation.</li>
              <li>Deposit disputed departmental supervision charges in escrow to enable immediate utility transmission line shifting.</li>
              <li>Institute milestone-based escrow conditions, capping further mobilization advances until physical delivery achieves 65%.</li>
            </ol>
          </div>
        </div>

        {/* Official Sign-off Box */}
        <div className="pt-8 mt-8 border-t border-slate-300 flex justify-between font-sans text-xs">
          <div>
            <span className="font-bold block">Verified by Platform:</span>
            <span className="text-slate-700">Bharat Project Intelligence (Decision Support Engine)</span>
            <span className="text-[10px] text-slate-500 block font-mono">Ledger Hash: BPI-2026-{project.projectCode}-SEC</span>
          </div>

          <div className="text-right">
            <span className="font-bold block">{currentUser.name}</span>
            <span className="text-slate-700">{currentUser.role}</span>
            <span className="text-slate-500 block">{currentUser.stateName || 'Pan-India'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
