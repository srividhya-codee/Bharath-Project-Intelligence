import React, { useState } from 'react';
import { Project, AlertItem, User, Citation } from '../../types';
import { CitationModal } from '../modals/CitationModal';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  Compass,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Bookmark,
  ExternalLink
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  projects: Project[];
  alerts: AlertItem[];
  currentUser: User;
  onSelectProject: (code: string) => void;
  onOpenAssistantWithQuery: (query: string) => void;
  onNavigateToPortfolio: (stateFilter?: string) => void;
  onNavigateToAlerts: () => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  projects,
  alerts,
  currentUser,
  onSelectProject,
  onOpenAssistantWithQuery,
  onNavigateToPortfolio,
  onNavigateToAlerts
}) => {
  const [selectedRiskProjectCode, setSelectedRiskProjectCode] = useState<string>('P-102');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // 1. KPI Calculations (Exactly 4 Primary Metrics)
  const totalProjects = projects.length;
  const delayedProjects = projects.filter(
    p => p.status === 'Delayed' || p.evm.spi < 0.85 || p.delayDays > 30
  );
  const projectsAtRisk = projects.filter(
    p => p.prediction.riskBand === 'High' || p.prediction.riskBand === 'Critical' || p.evm.spi < 0.85
  );
  const onTrackProjects = projects.filter(
    p => p.status === 'Active' && p.evm.spi >= 0.85 && p.prediction.riskBand === 'Low'
  );

  // 2. Portfolio Health Calculations (Only 3 Metrics)
  const avgPhysicalDelivery = Number(
    (projects.reduce((acc, p) => acc + p.actualPhysicalPct, 0) / (totalProjects || 1)).toFixed(1)
  );
  const avgSpi = Number(
    (projects.reduce((acc, p) => acc + p.evm.spi, 0) / (totalProjects || 1)).toFixed(2)
  );
  const criticalIssuesCount =
    projects.reduce((acc, p) => acc + (p.issues ? p.issues.filter(i => i.severity === 'Critical').length : 0), 0) +
    alerts.filter(a => a.severity === 'Critical').length;

  // 3. Projects Requiring Attention (Top 3-5 Projects lagging or flagged)
  const priorityProjects = projects
    .filter(p => p.status === 'Delayed' || p.evm.spi < 0.90 || p.prediction.riskBand !== 'Low')
    .sort((a, b) => a.evm.spi - b.evm.spi)
    .slice(0, 4);

  // Fallback to top projects if none flagged
  const attentionProjects = priorityProjects.length > 0 ? priorityProjects : projects.slice(0, 4);

  // 4. Focus Project for "Why Are Projects At Risk?"
  const riskProject = projects.find(p => p.projectCode === selectedRiskProjectCode) || projects[1] || projects[0];

  const handleOpenEvidence = (docTitle: string, pageNumber: number, excerpt: string, projectCode: string) => {
    setSelectedCitation({
      citationId: `CIT-${Date.now()}`,
      docTitle,
      docType: 'Statutory Inspection Report',
      page: pageNumber,
      snippet: excerpt,
      projectCode,
      confidence: 0.98
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Government Infrastructure Monitoring & Decision Support
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F3A]">
            Bharat Project Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Which government infrastructure projects need attention, and why?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
              {currentUser.role} • {currentUser.agencyName || 'PMO Infrastructure Cell'}
            </div>
          </div>

          <button
            onClick={() => onOpenAssistantWithQuery('Which government infrastructure projects currently need urgent executive attention, and why?')}
            className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR PRIMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
            {totalProjects}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            Active Central Sector Portfolio
          </div>
        </div>

        {/* Card 2: Projects At Risk */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Projects At Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-600 mt-1">
            {projectsAtRisk.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-2 font-medium">
            High / Critical Multi-Factor Risk
          </div>
        </div>

        {/* Card 3: Delayed Projects */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Delayed Projects</span>
            <Clock className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-red-600 mt-1">
            {delayedProjects.length}
          </div>
          <div className="text-[11px] text-red-700 mt-2 font-medium">
            Schedule Index (SPI) &lt; 0.85
          </div>
        </div>

        {/* Card 4: Projects On Track */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Projects On Track</span>
            <CheckCircle2 className="w-4 h-4 text-[#138808]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#138808] mt-1">
            {onTrackProjects.length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">
            Meeting Baseline Milestones
          </div>
        </div>
      </div>

      {/* 3. PORTFOLIO HEALTH (Compact Statutory Barometer) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Portfolio Health Barometer
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Portfolio Delivery Benchmark • EVM Ground Truth
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Health Metric 1: Physical Delivery */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Physical Delivery</span>
              <span className="font-mono font-bold text-blue-700 text-base">{avgPhysicalDelivery}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${avgPhysicalDelivery}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Cumulative weighted on-site physical progress
            </span>
          </div>

          {/* Health Metric 2: Average SPI */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Average Schedule Index (SPI)</span>
              <span className={`font-mono font-bold text-base ${avgSpi < 0.85 ? 'text-red-700' : 'text-slate-900'}`}>
                {avgSpi}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${avgSpi < 0.85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, Math.round(avgSpi * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Baseline: 1.00 • Statutory Warning: &lt; 0.85
            </span>
          </div>

          {/* Health Metric 3: Critical Issues */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Critical Issues</span>
              <span className="font-mono font-bold text-red-700 text-base">{criticalIssuesCount}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-[11px] leading-snug">
                Pending forest clearances, utility shifting & right-of-way disputes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PROJECTS REQUIRING ATTENTION (3–5 Projects) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Projects Requiring Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Priority projects lagging schedule baselines, breaching EVM thresholds, or blocked by inter-departmental issues.
            </p>
          </div>

          <button
            onClick={() => onNavigateToPortfolio()}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Projects in Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {attentionProjects.map(project => {
            const isCritical = project.prediction.riskBand === 'Critical' || project.evm.spi < 0.80;
            const physicalDeficit = project.plannedPhysicalPct - project.actualPhysicalPct;

            // Authoritative main issue description based on project data
            let mainIssue = 'Statutory approvals and schedule lag pending review.';
            if (project.projectCode === 'P-102') {
              mainIssue = '8.8 km Dindigul forest clearance mutation pending; 33kV TANGEDCO power line shifting stalled 115 days.';
            } else if (project.projectCode === 'P-104') {
              mainIssue = '765 kV transformer import customs clearance delay; 138 days milestone lag.';
            } else if (project.projectCode === 'P-103') {
              mainIssue = 'Marine clay geotechnical soil stabilization required stone columns; 85 days ducting slippage.';
            } else if (project.projectCode === 'P-101') {
              mainIssue = 'Urban right-of-way easement handovers in JNPT port approach corridor.';
            } else if (project.issues && project.issues.length > 0) {
              mainIssue = project.issues[0].title;
            }

            return (
              <div
                key={project.projectCode}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition"
              >
                {/* Project Identity & Main Issue */}
                <div className="space-y-1 min-w-[280px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-700">
                      {project.projectCode}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {project.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {project.prediction.riskBand} Risk
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {project.ministry} ({project.state})
                    </span>
                    <span>Agency: <strong className="text-slate-700">{project.implementingAgency}</strong></span>
                  </div>

                  {/* Main Issue Callout */}
                  <div className="text-xs text-red-900/90 font-medium bg-red-50/60 border border-red-100 rounded-lg p-2 mt-1">
                    <strong className="text-red-700">Main Issue:</strong> {mainIssue}
                  </div>
                </div>

                {/* Progress & EVM Metrics */}
                <div className="flex items-center gap-6 shrink-0 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-semibold">
                      Progress
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {project.actualPhysicalPct}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        / {project.plannedPhysicalPct}%
                      </span>
                    </div>
                    <span className="text-[10px] text-red-600 font-mono block">
                      -{physicalDeficit.toFixed(1)}% lag
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-semibold">
                      SPI / CPI
                    </span>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      <span className={project.evm.spi < 0.85 ? 'text-red-700' : 'text-slate-900'}>
                        {project.evm.spi}
                      </span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-slate-700">{project.evm.cpi}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Delay: {project.delayDays}d
                    </span>
                  </div>

                  {/* Mandatory INVESTIGATE PROJECT Button */}
                  <button
                    onClick={() => onSelectProject(project.projectCode)}
                    className="px-3.5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-300" />
                    <span>INVESTIGATE PROJECT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. WHY ARE PROJECTS AT RISK? (Authoritative Root-Cause Diagnostic) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-red-700 uppercase tracking-wider text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Root Cause Analysis
              </span>
              <span className="text-slate-300">·</span>
              <h2 className="text-base font-bold text-slate-900">
                Why Are Projects At Risk?
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded diagnosis for the flagged priority project based on verified statutory inspection filings and EVM calculations.
            </p>
          </div>

          {/* Quick Toggle for Flagged Projects */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {['P-102', 'P-104', 'P-103'].map(code => (
              <button
                key={code}
                onClick={() => setSelectedRiskProjectCode(code)}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer ${
                  selectedRiskProjectCode === code
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Project Diagnostic Box */}
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200/80 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-blue-800">
                  {riskProject.projectCode}
                </span>
                <span className="text-red-300">·</span>
                <span className="font-bold text-slate-900 text-sm">
                  {riskProject.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold uppercase font-mono">
                  Schedule Risk • Critical
                </span>
              </div>
              <div className="text-[11px] text-red-900/80 mt-0.5">
                Statutory Trigger: <strong className="text-red-950">SPI: {riskProject.evm.spi}</strong> (Breached critical threshold of &lt; 0.85)
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handleOpenEvidence(
                    riskProject.projectCode === 'P-102'
                      ? 'P-102 Quarterly Site Inspection Report'
                      : `${riskProject.projectCode} Progress Review Record`,
                    2,
                    riskProject.projectCode === 'P-102'
                      ? 'Chainage 52+400 to 61+200 (8.8 km contiguous stretch) remains un-handed over to contractor due to pending Stage-II Forest Clearance from Regional Forest Bench, Chennai. High-tension utility relocation across 6 crossings stalled pending resolution of ₹3.2 Cr supervision charges demanded by TANGEDCO.'
                      : `Actual physical execution recorded at ${riskProject.actualPhysicalPct}%, lagging planned target of ${riskProject.plannedPhysicalPct}%. SPI of ${riskProject.evm.spi} triggered early warning alert.`,
                    riskProject.projectCode
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                <span>VIEW EVIDENCE</span>
              </button>

              <button
                onClick={() => onSelectProject(riskProject.projectCode)}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-blue-700" />
                <span>INVESTIGATE IN PROJECT 360°</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-white/80 p-3 rounded-lg border border-red-200/80">
              <span className="text-red-700 block font-semibold">Schedule Performance</span>
              <span className="font-mono font-bold text-red-950 text-base">SPI: {riskProject.evm.spi}</span>
              <span className="text-[10px] text-red-700 block mt-0.5">Threshold: &lt; 0.85 (92 days slippage)</span>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-red-200/80">
              <span className="text-red-700 block font-semibold">Physical vs Planned</span>
              <span className="font-mono font-bold text-red-950 text-base">{riskProject.actualPhysicalPct}% actual</span>
              <span className="text-[10px] text-red-700 block mt-0.5">Target: {riskProject.plannedPhysicalPct}% (-{(riskProject.plannedPhysicalPct - riskProject.actualPhysicalPct).toFixed(1)}% deficit)</span>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-red-200/80">
              <span className="text-red-700 block font-semibold">Verified Evidence Source</span>
              <span className="font-bold text-slate-900 block truncate">
                {riskProject.projectCode === 'P-102' ? 'Quarterly Site Inspection Report' : `${riskProject.projectCode} Progress Record`}
              </span>
              <span className="text-[10px] text-red-700 block mt-0.5">Page 2 · Verified Statutory Filing</span>
            </div>
          </div>

          {/* Root-Cause Contributing Issues List */}
          <div className="bg-white/80 p-4 rounded-lg border border-red-200/80 space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              Main Contributing Issues & Obstacles:
            </span>
            <ul className="space-y-1.5 text-slate-800 text-xs">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Physical progress below plan:</strong> Contractual delivery achieved is {riskProject.actualPhysicalPct}% against planned milestone of {riskProject.plannedPhysicalPct}%, creating a chronic delivery gap.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Forest clearance delay:</strong> {riskProject.projectCode === 'P-102' ? 'Chainage 52+400 to 61+200 (8.8 km contiguous corridor) remains un-handed over due to pending Stage-II Forest Clearance mutation in Dindigul District.' : 'Statutory environmental/forest clearance mutation pending before regional forest bench.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Utility shifting dispute:</strong> {riskProject.projectCode === 'P-102' ? 'Relocation of 33kV high-tension power line by TANGEDCO is delayed by 115 days due to inter-departmental disagreement over ₹3.2 Cr supervision charges.' : 'Inter-departmental coordination with state power utility delayed.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Contractor performance & plant output:</strong> {riskProject.projectCode === 'P-102' ? 'Concessionaire daily paving train output constrained to 42% of rated capacity due to unhanded right-of-way and local aggregate quarry moratoriums.' : 'Contractor mobilized capacity running below contractual delivery thresholds.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 6. RECENT ACTIVITY (4 Meaningful Verified Events) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Activity & Verified Statutory Events
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Latest Monitoring Updates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Activity 1: Latest Inspection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Latest Inspection
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Q3 2024</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs">
              P-102 Site Inspection Report Filed
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Official inspection verified 8.8 km contiguous right-of-way deficit at Dindigul stretch and 42% equipment output constraint.
            </p>
            <button
              onClick={() => onSelectProject('P-102')}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>Inspect P-102 360°</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Activity 2: Latest Warning */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Latest Warning
              </span>
              <span className="text-[10px] text-slate-400 font-mono">14 Sep 2024</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs">
              Early Warning Triggered for P-102
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Schedule Performance Index dropped to <strong>0.78</strong>, breaching the statutory 0.85 threshold with 92 days delay.
            </p>
            <button
              onClick={onNavigateToAlerts}
              className="text-[11px] font-semibold text-red-700 hover:text-red-900 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>View Early Warnings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Activity 3: Latest Document */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Latest Document
              </span>
              <span className="text-[10px] text-slate-400 font-mono">MoRTH Review</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs">
              High-Level Meeting Minutes Uploaded
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Recorded inter-departmental minutes regarding ₹3.2 Cr supervision charges dispute with TANGEDCO for power line shifting.
            </p>
            <button
              onClick={() => onOpenAssistantWithQuery('Summarize MoRTH High-Level Review Meeting Minutes regarding TANGEDCO utility shifting for Project P-102')}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>Review with AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Activity 4: Latest Project Update */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Latest Update
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Monthly Log</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs">
              Concessionaire Progress Ledger
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Physical completion logged at 58.2% across handed-over stretches. Aggregate procurement constrained by local quarry limits.
            </p>
            <button
              onClick={() => onSelectProject('P-102')}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>View Milestone Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Verified Ground Evidence Modal */}
      {selectedCitation && (
        <CitationModal
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
};
