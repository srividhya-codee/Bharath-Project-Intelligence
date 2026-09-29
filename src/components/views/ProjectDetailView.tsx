import React, { useState } from 'react';
import { Project, User, Citation } from '../../types';
import { SCurveChart } from '../charts/SCurveChart';
import { EVMDashboard } from '../charts/EVMDashboard';
import { RiskMatrix } from '../charts/RiskMatrix';
import { CitationModal } from '../modals/CitationModal';
import {
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Printer,
  GitCompare,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  Activity,
  Cpu
} from 'lucide-react';

interface ProjectDetailViewProps {
  projects: Project[];
  selectedProjectCode: string;
  onSelectProjectCode: (code: string) => void;
  currentUser: User;
  onOpenAssistantWithQuery: (query: string) => void;
  onNavigateToTab?: (tab: string, projectCode?: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projects,
  selectedProjectCode,
  onSelectProjectCode,
  currentUser,
  onOpenAssistantWithQuery,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scurve' | 'milestones' | 'risks' | 'documents'>('overview');
  const [showEVMFormulas, setShowEVMFormulas] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const project = projects.find(p => p.projectCode === selectedProjectCode) || projects[0];

  const physicalDeficit = Math.max(0, project.plannedPhysicalPct - project.actualPhysicalPct);
  const isDelayed = project.status === 'Delayed' || project.evm.spi < 0.85;

  // Specific categorized risk evidence for P-102 and dynamic for others
  const riskCategories = React.useMemo(() => {
    if (project.projectCode === 'P-102') {
      return [
        {
          category: 'Forest Clearance & Statutory Approvals',
          status: 'Critical Block',
          severity: 'Critical',
          description: 'Chainage 52+400 to 61+200 (8.8 km contiguous corridor stretch) remains un-handed over due to pending Stage-II Forest Clearance mutation in Dindigul District.',
          sourceDoc: 'P-102 Quarterly Site Inspection Report',
          sourcePage: 2,
          snippet: 'Chainage 52+400 to 61+200 (8.8 km contiguous stretch) remains un-handed over to contractor due to pending Stage-II Forest Clearance from Regional Forest Bench, Chennai.'
        },
        {
          category: 'Utility Shifting',
          status: 'Delayed 115 Days',
          severity: 'High',
          description: 'Relocation of 33kV high-tension power line by TANGEDCO is delayed by 115 days due to inter-departmental dispute regarding departmental supervision fees (₹3.2 Cr).',
          sourceDoc: 'MoRTH High-Level Review Meeting Minutes',
          sourcePage: 1,
          snippet: 'High-tension utility relocation across 6 crossings stalled pending resolution of ₹3.2 Cr departmental supervision charges demanded by TANGEDCO.'
        },
        {
          category: 'Contractor Execution & Plant Output',
          status: 'Operating at 42% Capacity',
          severity: 'High',
          description: 'Concessionaire daily paving output constrained to 42% of rated capacity due to un-handed over right-of-way and local aggregate quarry moratoriums.',
          sourceDoc: 'Contractor Monthly Executive Progress Report',
          sourcePage: 3,
          snippet: 'Contractor mobilised 4 paving trains but only 1.7 trains operational on handed-over stretches. Aggregate procurement impacted by district quarry environmental restrictions.'
        },
        {
          category: 'Physical Progress Deficit',
          status: `${physicalDeficit.toFixed(1)}% Deficit`,
          severity: 'High',
          description: `Contractual delivery achieved is ${project.actualPhysicalPct}% against statutory schedule baseline of ${project.plannedPhysicalPct}%, yielding an acute SPI of ${project.evm.spi}.`,
          sourceDoc: 'Detailed Project Report (DPR) Baseline Schedule',
          sourcePage: 1,
          snippet: `Planned cumulative progress target of ${project.plannedPhysicalPct}% by Q3 2024 breached. Actual physical execution recorded at ${project.actualPhysicalPct}%.`
        },
        {
          category: 'Financial-Physical Divergence',
          status: `+${project.evm.financialPhysicalGap}% Lead Gap`,
          severity: 'Medium',
          description: `Cumulative capital expenditure stands at ₹${project.expenditureCr.toLocaleString()} Cr (${project.financialSpendPct}%) against ${project.actualPhysicalPct}% physical delivery, creating fiscal exposure.`,
          sourceDoc: 'Central Sector Projects Master Financial Register',
          sourcePage: 1,
          snippet: `Disbursed capital leads verified physical delivery by +${project.evm.financialPhysicalGap} percentage points under advance mobilization allowances.`
        }
      ];
    }

    // Generic dynamic mapping for other projects
    return [
      {
        category: 'Schedule Slippage',
        status: `${project.delayDays} Days Delay`,
        severity: project.delayDays > 60 ? 'Critical' : 'High',
        description: `Project is lagging contractual schedule by ${project.delayDays} days with SPI of ${project.evm.spi}.`,
        sourceDoc: `${project.projectCode} Progress Review Record`,
        sourcePage: 1,
        snippet: `Contractual completion delayed from ${project.plannedCompletionDate} to expected ${project.expectedCompletionDate}.`
      },
      {
        category: 'Physical-Planned Progress Gap',
        status: `${physicalDeficit.toFixed(1)}% Deficit`,
        severity: physicalDeficit > 10 ? 'High' : 'Medium',
        description: `Achieved ${project.actualPhysicalPct}% physical delivery against planned target of ${project.plannedPhysicalPct}%.`,
        sourceDoc: `${project.projectCode} Monitoring Baseline`,
        sourcePage: 1,
        snippet: `Current physical completion is ${project.actualPhysicalPct}%, lagging planned target of ${project.plannedPhysicalPct}%.`
      },
      {
        category: 'Financial Lead Gap',
        status: `${project.evm.financialPhysicalGap > 0 ? '+' : ''}${project.evm.financialPhysicalGap}% Gap`,
        severity: project.evm.financialPhysicalGap > 15 ? 'High' : 'Medium',
        description: `Expenditure (${project.financialSpendPct}%) leads physical delivery (${project.actualPhysicalPct}%) by ${project.evm.financialPhysicalGap} percentage points.`,
        sourceDoc: `${project.projectCode} Expenditure Ledger`,
        sourcePage: 1,
        snippet: `Expenditure of ₹${project.expenditureCr.toLocaleString()} Cr against approved ₹${project.approvedCostCr.toLocaleString()} Cr outlay.`
      }
    ];
  }, [project, physicalDeficit]);

  const handleOpenDocEvidence = (docTitle: string, page: number, snippet: string) => {
    setSelectedCitation({
      citationId: `CIT-${project.projectCode}-${page}`,
      docTitle,
      docType: 'Official Record',
      page,
      projectCode: project.projectCode,
      snippet,
      confidence: 0.95
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Project 360° Header & Selector */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              PROJECT 360°
            </span>
            <div className="relative">
              <select
                value={project.projectCode}
                onChange={e => onSelectProjectCode(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-700 cursor-pointer shadow-2xs"
              >
                <optgroup label="Key Strategic Corridors">
                  <option value="P-102">P-102 (MoRTH - Tamil Nadu Highway 4-Laning)</option>
                  <option value="P-101">P-101 (Railways - Western Dedicated Freight Corridor)</option>
                  <option value="P-103">P-103 (MoCI - Dholera Industrial Corridor Trunk)</option>
                  <option value="P-104">P-104 (MNRE - Bhadla Solar Substation)</option>
                  <option value="P-105">P-105 (MoJS - Jal Jeevan Bundelkhand Water)</option>
                  <option value="P-106">P-106 (MoHUA - Bengaluru Metro ORR Line)</option>
                </optgroup>
                <optgroup label="All Monitored Projects">
                  {projects.filter(p => !['P-101', 'P-102', 'P-103', 'P-104', 'P-105', 'P-106'].includes(p.projectCode)).map(p => (
                    <option key={p.projectCode} value={p.projectCode}>
                      {p.projectCode} ({p.state} - {p.name.slice(0, 32)}...)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenAssistantWithQuery(`Why is Project ${project.projectCode} delayed?`)}
              className="px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI About {project.projectCode}</span>
            </button>

            {onNavigateToTab && (
              <>
                <button
                  onClick={() => onNavigateToTab('reports', project.projectCode)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Generate Brief</span>
                </button>

                <button
                  onClick={() => onNavigateToTab('ml_lab', project.projectCode)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-700" />
                  <span>ML What-If Lab</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Meta Details */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xl text-blue-700">
                {project.projectCode}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-base font-bold text-slate-900">
                {project.name}
              </span>
            </div>

            <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                {project.ministry}
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {project.state} {project.district ? `(${project.district})` : ''}
              </span>
              <span>
                Agency: <strong className="text-slate-800">{project.implementingAgency}</strong>
              </span>
              <span>
                Concessionaire: <strong className="text-slate-800">{project.contractorName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. IMMEDIATE MANDATORY 6-METRIC HERO ROW (Item 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Project Status */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Project Status
            </span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${
              project.status === 'Delayed' ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {project.status === 'Delayed' ? 'At Risk' : project.status}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Risk: {project.prediction.riskBand}
            </span>
          </div>

          {/* Physical Progress */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Physical Progress
            </span>
            <span className="text-base font-bold font-mono text-blue-700 mt-0.5 block">
              {project.actualPhysicalPct}%
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Actual On-Site
            </span>
          </div>

          {/* Planned Progress */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Planned Progress
            </span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
              {project.plannedPhysicalPct}%
            </span>
            <span className="text-[10px] text-red-600 font-mono mt-0.5 block">
              Deficit: -{physicalDeficit.toFixed(1)}%
            </span>
          </div>

          {/* Schedule Performance Index */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Schedule Index (SPI)
            </span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${
              project.evm.spi < 0.85 ? 'text-red-700' : 'text-slate-900'
            }`}>
              {project.evm.spi}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Threshold: &lt; 0.85
            </span>
          </div>

          {/* Financial-Physical Gap */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Financial Lead Gap
            </span>
            <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">
              +{project.evm.financialPhysicalGap}%
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Spent {project.financialSpendPct}% vs {project.actualPhysicalPct}%
            </span>
          </div>

          {/* Schedule Slippage */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">
              Schedule Slippage
            </span>
            <span className="text-base font-bold font-mono text-red-700 mt-0.5 block">
              {project.delayDays} Days
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Est: {project.expectedCompletionDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. WHY IS THIS PROJECT AT RISK? (Mandatory Item 4) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-red-700 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Root Cause Diagnostic
              </span>
              <span className="text-slate-300">·</span>
              <h2 className="text-base font-bold text-slate-900">
                Why Is This Project At Risk?
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded in official inspection notes, contractor reports, and EVM ledgers. Every risk item is backed by verified evidence.
            </p>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('documents')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore All Verified Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Flagged Executive Callout (Item 5) */}
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-xs text-red-950 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200/80 pb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              WHY THIS PROJECT IS FLAGGED
            </span>
            <button
              onClick={() => handleOpenDocEvidence(
                project.projectCode === 'P-102' ? 'P-102 Quarterly Site Inspection Report' : `${project.projectCode} Progress Review Record`,
                2,
                `Actual physical execution recorded at ${project.actualPhysicalPct}%, lagging planned target of ${project.plannedPhysicalPct}%. SPI of ${project.evm.spi} is below critical threshold of 0.85.`
              )}
              className="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-[11px] flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3 h-3 text-amber-300" />
              <span>VIEW EVIDENCE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
            <div>
              <span className="text-red-700 block font-semibold">Schedule Performance:</span>
              <span className="font-mono font-bold text-red-950 text-sm">SPI = {project.evm.spi}</span>
              <span className="text-[10px] text-red-700 block">Statutory Threshold: 0.85</span>
            </div>
            <div>
              <span className="text-red-700 block font-semibold">Physical Progress:</span>
              <span className="font-mono font-bold text-red-950 text-sm">{project.actualPhysicalPct}% actual</span>
              <span className="text-[10px] text-red-700 block">{project.plannedPhysicalPct}% planned (-{physicalDeficit.toFixed(1)}% deficit)</span>
            </div>
            <div>
              <span className="text-red-700 block font-semibold">Primary Evidence:</span>
              <span className="font-bold text-red-950 block">Quarterly Site Inspection Report</span>
              <span className="text-[10px] text-red-700 block">Page 2 · Verified Statutory Filing</span>
            </div>
          </div>

          <div className="pt-2 border-t border-red-200/80">
            <span className="font-bold text-[11px] text-red-900 block mb-1">Additional Contributing Factors:</span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-red-900/90 list-disc list-inside">
              <li>Forest clearance delay (8.8 km contiguous corridor blocked at Ch 52–61)</li>
              <li>Utility shifting delay (33kV TANGEDCO power line delayed 115 days)</li>
              <li>Contractor performance issue (paving output running at 42% capacity)</li>
              <li>Financial-physical lead gap (+{project.evm.financialPhysicalGap}% expenditure divergence)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          {riskCategories.map((risk, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {risk.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    risk.severity === 'Critical'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {risk.status}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenDocEvidence(risk.sourceDoc, risk.sourcePage, risk.snippet)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-slate-200 text-[11px] font-medium flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Bookmark className="w-3 h-3 text-blue-600" />
                  <span>Evidence: {risk.sourceDoc} (p.{risk.sourcePage})</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-700 text-xs leading-relaxed">
                {risk.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CLEAR PROJECT HEALTH SECTION (Mandatory Item 5) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Project Health & Performance Barometer
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">
              Overall Status: <strong className={isDelayed ? 'text-red-700' : 'text-emerald-700'}>
                {isDelayed ? 'At Risk' : 'On Track'}
              </strong>
            </span>

            <button
              onClick={() => setShowEVMFormulas(!showEVMFormulas)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <span>{showEVMFormulas ? 'Hide EVM Formulas' : 'View EVM Details'}</span>
              {showEVMFormulas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Simple Visual Hierarchy: Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Schedule Health */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Schedule</span>
              <span className={`font-mono font-bold ${project.evm.spi < 0.85 ? 'text-red-700' : 'text-slate-900'}`}>
                SPI: {project.evm.spi}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${project.evm.spi < 0.85 ? 'bg-red-600' : 'bg-emerald-600'}`}
                style={{ width: `${Math.min(100, Math.round(project.evm.spi * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              {project.evm.spi < 0.85 ? '⚠️ Acute slippage below 0.85' : 'Aligned with plan'}
            </span>
          </div>

          {/* Physical Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Physical Progress</span>
              <span className="font-mono font-bold text-blue-700">
                {project.actualPhysicalPct}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${project.actualPhysicalPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Planned target: <strong>{project.plannedPhysicalPct}%</strong>
            </span>
          </div>

          {/* Financial Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Financial Progress</span>
              <span className="font-mono font-bold text-amber-700">
                {project.financialSpendPct}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${project.financialSpendPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              ₹{project.expenditureCr.toLocaleString()} Cr of ₹{project.approvedCostCr.toLocaleString()} Cr
            </span>
          </div>

          {/* Critical Issues */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Critical Issues</span>
              <span className="font-mono font-bold text-red-700 text-sm">
                {project.issues.length}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 pt-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{project.issues[0]?.title || 'Pending forest & utility clearances'}</span>
            </div>
          </div>
        </div>

        {/* Collapsible EVM Formulas Details Panel */}
        {showEVMFormulas && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in duration-150">
            <EVMDashboard
              evm={project.evm}
              approvedCostCr={project.approvedCostCr}
              revisedCostCr={project.revisedCostCr}
            />
          </div>
        )}
      </div>

      {/* 5. UNIFIED PROJECT NARRATIVE: EVIDENCE → AI ANALYSIS → PREDICTIVE ANALYSIS → EXECUTIVE ACTION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-700 uppercase tracking-wider text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Integrated Project Intelligence
              </span>
              <span className="text-slate-300">·</span>
              <h3 className="text-base font-bold text-slate-900">
                Evidence, AI Analysis & Predictive Risk Outlook
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified diagnostic journey from statutory evidence to predictive forecasting and decision support.
            </p>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('reports', project.projectCode)}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>GENERATE EXECUTIVE BRIEF</span>
            </button>
          )}
        </div>

        {/* Part A: Evidence (DPR, Inspection Report, Contractor Report) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-blue-700" />
              1. Ground Evidence & Official Sources
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">Click source to inspect excerpt</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* DPR */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Detailed Project Report (DPR)</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">Baseline</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Statutory DPR baseline planned physical completion target of {project.plannedPhysicalPct}% by Q3 2024.
              </p>
              <button
                onClick={() => handleOpenDocEvidence('Detailed Project Report (DPR) Baseline Schedule', 1, `Planned cumulative progress target of ${project.plannedPhysicalPct}% by Q3 2024 breached. Actual physical execution recorded at ${project.actualPhysicalPct}%.`)}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Open Source (Page 1)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Inspection Report */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Site Inspection Report</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-mono">Q3 2024</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Verified 8.8 km contiguous stretch un-handed over at Dindigul; 33kV high-tension power line delayed 115 days.
              </p>
              <button
                onClick={() => handleOpenDocEvidence('P-102 Quarterly Site Inspection Report', 2, 'Chainage 52+400 to 61+200 (8.8 km contiguous stretch) remains un-handed over to contractor due to pending Stage-II Forest Clearance from Regional Forest Bench, Chennai.')}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Open Source (Page 2)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Contractor Report */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Contractor Progress Report</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono">Monthly Log</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Concessionaire paving trains operating at 42% rated output due to fragmented corridor access and quarry moratoriums.
              </p>
              <button
                onClick={() => handleOpenDocEvidence('Contractor Monthly Executive Progress Report', 3, 'Contractor mobilised 4 paving trains but only 1.7 trains operational on handed-over stretches. Aggregate procurement impacted by district quarry environmental restrictions.')}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Open Source (Page 3)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Part B: AI Analysis (Simple, Clear Language) */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-700" />
              2. AI Analysis & Situation Summary
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              Clear Language Briefing
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            Project <strong>{project.projectCode}</strong> ({project.name}) is experiencing acute schedule slippage primarily driven by external statutory and inter-departmental dependencies rather than contractor insolvency. The critical impediment is an un-handed over 8.8 km contiguous stretch (Chainage 52+400 to 61+200) awaiting Stage-II Forest Clearance in Dindigul District, coupled with an unresolved ₹3.2 Cr supervision charge dispute stalling 33kV high-tension power line relocation by TANGEDCO.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            Because equipment cannot operate across contiguous right-of-way, daily paving output is restricted to 42% capacity. This has dropped the Schedule Performance Index to <strong>{project.evm.spi}</strong> and widened the financial-physical lead gap to <strong>+{project.evm.financialPhysicalGap}%</strong>, as advance mobilization disbursements outpace verified physical execution.
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px]">
            <span className="font-medium text-blue-800">Recommended Executive Action:</span>
            <button
              onClick={() => onOpenAssistantWithQuery(`Recommend inter-departmental intervention roadmap for Project ${project.projectCode}`)}
              className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Ask AI For Intervention Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Part C: Predictive Analysis (What Could Happen Next?) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-700" />
              <h4 className="font-bold text-sm text-slate-900">
                3. Predictive Analysis — What Could Happen Next?
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Forward-Looking Forecast
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Predicted Schedule Risk
              </span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-red-700">
                  {project.prediction.riskScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <span className="text-[10px] font-bold text-red-700 uppercase mt-0.5 block">
                {project.prediction.riskBand} Risk Band
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Potential Expected Delay
              </span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                +{project.prediction.predictedDelayDays} Days
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                90% CI: [{project.prediction.confidenceLowerDelayDays} - {project.prediction.confidenceUpperDelayDays} days]
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Cost-Overrun Risk (EAC)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                ₹{project.prediction.predictedFinalCostCr.toLocaleString()} Cr
              </div>
              <span className="text-[10px] font-semibold text-red-700 block mt-0.5">
                Overrun: +{project.prediction.predictedCostOverrunPct}% (Approved: ₹{project.approvedCostCr.toLocaleString()} Cr)
              </span>
            </div>
          </div>

          {/* Key Contributing Factors with Why this prediction? */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Why This Prediction? (Key Contributing Factors):
              </span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('ml_lab', project.projectCode)}
                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Interactive What-If Simulator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {project.prediction.topFactors.map((factor, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-800 block">{factor.label}</span>
                    <span className="text-[10px] text-slate-500">{factor.description}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700 shrink-0 ml-2">
                    {factor.contributionPct}% Impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Part D: Bottom Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Export decision-ready appraisal dossier for ministerial leadership:
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenAssistantWithQuery(`Draft executive summary and talking points for Project ${project.projectCode}`)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>Draft Talking Points</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('reports', project.projectCode)}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>GENERATE EXECUTIVE BRIEF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6. Deep Tabs: S-Curve, Milestones, Risks, Verified Documents */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex space-x-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Detailed S-Curve & Trajectory' },
            { id: 'milestones', label: `Milestones (${project.milestones.length})` },
            { id: 'risks', label: `Risk Matrix & Register (${project.risks.length})` },
            { id: 'documents', label: `Verified Records (${project.documents.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <SCurveChart project={project} />

            {/* AI / ML Forward Risk Outlook */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    ML Predictive Outlook & Probabilistic Forecast
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Model: {project.prediction.modelVersion}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block font-medium">Predictive Risk Score</span>
                  <span className="text-2xl font-bold font-mono text-red-700">
                    {project.prediction.riskScore} / 100
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Band: <strong>{project.prediction.riskBand}</strong>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block font-medium">Forecast Schedule Delay</span>
                  <span className="text-2xl font-bold font-mono text-amber-700">
                    +{project.prediction.predictedDelayDays} Days
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    90% CI: [{project.prediction.confidenceLowerDelayDays} - {project.prediction.confidenceUpperDelayDays} days]
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block font-medium">Forecast Final Outlay (EAC)</span>
                  <span className="text-2xl font-bold font-mono text-emerald-700">
                    ₹{project.prediction.predictedFinalCostCr.toLocaleString()} Cr
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Forecast Overrun: <strong>+{project.prediction.predictedCostOverrunPct}%</strong>
                  </span>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Top Contributing Risk Drivers:
                </h4>
                {project.prediction.topFactors.map((f, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{f.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          f.direction === 'Increases Risk'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {f.direction}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{f.description}</div>
                    </div>
                    <div className="text-right shrink-0 font-mono font-bold text-amber-800">
                      {f.contributionPct}% Impact
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                Statutory Contractual Milestones & Execution Tracking
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Weighted Physical Baseline
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2.5 px-3">Milestone Task</th>
                    <th className="py-2.5 px-3 text-center">Weight</th>
                    <th className="py-2.5 px-3">Planned Date</th>
                    <th className="py-2.5 px-3">Expected Date</th>
                    <th className="py-2.5 px-3">Actual Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.milestones.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-900">{m.name}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">{m.weightPct}%</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{m.plannedDate}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{m.expectedDate}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{m.actualDate || '—'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          m.status === 'Completed'
                            ? 'bg-emerald-50 text-[#138808] border border-emerald-200'
                            : m.status === 'Delayed'
                            ? 'bg-red-50 text-[#DC2626] border border-red-200'
                            : m.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <RiskMatrix risks={project.risks} />

            {project.issues.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Active Inter-Departmental Escalations
                </h3>
                <div className="space-y-2.5">
                  {project.issues.map(issue => (
                    <div key={issue.id} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{issue.title}</span>
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-bold">
                          {issue.status}
                        </span>
                      </div>
                      <div className="text-slate-700">{issue.description}</div>
                      {issue.escalatedTo && (
                        <div className="text-blue-800 text-[11px] font-semibold pt-1">
                          Escalated to: {issue.escalatedTo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Verified Project Documents & Site Inspection Records
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Authoritative records indexed for retrieval and factual verification.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {project.documents.map(doc => (
                <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono">
                        {doc.docType}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">{doc.date}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{doc.summary}</p>

                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Verified Document Citations:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {doc.chunks.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => handleOpenDocEvidence(doc.title, c.page, c.text)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 text-[11px] transition text-left cursor-pointer shadow-2xs"
                        >
                          <span className="font-bold block text-blue-700">Page {c.page}: {c.section}</span>
                          <span className="text-[10px] text-slate-600 line-clamp-1">"{c.text}"</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CitationModal citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
    </div>
  );
};
