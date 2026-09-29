import React, { useState } from 'react';
import {
  Layers,
  Database,
  Calculator,
  Activity,
  AlertTriangle,
  FileText,
  Search,
  Bot,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';

interface PipelineStep {
  id: string;
  number: number;
  name: string;
  category: 'Data' | 'Analytics' | 'Intelligence' | 'Action';
  oneLiner: string;
  technicalRole: string;
  input: string;
  output: string;
  icon: React.ElementType;
  exampleData: string;
}

export const HowItWorksView: React.FC<{ onNavigateToView?: (tab: string) => void }> = ({ onNavigateToView }) => {
  const [selectedStepId, setSelectedStepId] = useState<string>('rag');

  const pipelineSteps: PipelineStep[] = [
    {
      id: 'data',
      number: 1,
      name: 'Project Data',
      category: 'Data',
      oneLiner: 'Aggregates structured project master ledgers, approved budgets, and contractual milestones.',
      technicalRole: 'Relational database schema storing baseline capital outlay, implementing agencies, concessionaires, and geocoded corridor chainages.',
      input: 'MoSPI / Ministry central sector project master entries and EPC contractor contracts',
      output: 'Normalized project entities (P-101 to P-118) with financial and calendar baselines',
      icon: Database,
      exampleData: 'P-102: Four-Laning Highway, Approved Outlay ₹1,250.0 Cr, Planned 74.5%'
    },
    {
      id: 'evm',
      number: 2,
      name: 'EVM Analytics',
      category: 'Analytics',
      oneLiner: 'Measures schedule and cost performance strictly using Earned Value Management formulas.',
      technicalRole: 'Calculates SPI (EV/PV), CPI (EV/AC), Schedule Slippage, and Financial-Physical Lead Gap to remove subjective reporting bias.',
      input: 'Planned Value (PV), Earned Value (EV), Actual Cost (AC) from site inspections',
      output: 'Deterministic performance indices (SPI: 0.78, CPI: 0.85, Lead Gap: +25.8%)',
      icon: Calculator,
      exampleData: 'PV = ₹931.2 Cr, EV = ₹727.5 Cr, AC = ₹1,050.0 Cr → SPI: 0.78, Financial Gap: +25.8%'
    },
    {
      id: 'health',
      number: 3,
      name: 'Project Health',
      category: 'Analytics',
      oneLiner: 'Synthesizes composite execution status across delivery, liquidity, and schedule dimensions.',
      technicalRole: 'Combines SPI thresholds, milestone completion rates, and physical deficit into standard classification tiers.',
      input: 'EVM indices and active milestone delays from project ledger',
      output: 'Standardized Health Status: "At Risk" / "Delayed" / "On Track"',
      icon: Activity,
      exampleData: 'Health: At Risk | Critical Issues: 3 | Schedule Slippage: 92 calendar days'
    },
    {
      id: 'warning',
      number: 4,
      name: 'Early Warning',
      category: 'Analytics',
      oneLiner: 'Fires automated tripwires when performance dips below statutory thresholds.',
      technicalRole: 'Rule-based event trigger engine monitoring SPI < 0.85, Financial Gap > 15%, and ML Risk Score ≥ 60.',
      input: 'Automated continuous evaluation across portfolio metrics',
      output: 'Actionable intervention dispatches with severity ratings and stakeholder routing',
      icon: AlertTriangle,
      exampleData: 'Trigger: SPI 0.78 < 0.85 & Gap +25.8% > 15% → Severity: HIGH Priority Dispatch'
    },
    {
      id: 'docs',
      number: 5,
      name: 'Document Intelligence',
      category: 'Intelligence',
      oneLiner: 'Indexes and structures verified project documents, inspection reports, and DPRs.',
      technicalRole: 'Document intelligence repository maintaining full verbatim content, statutory classifications, and page-level metadata.',
      input: 'Detailed Project Reports (DPRs), Quarterly Inspection Notes, Forest Clearance Status Notes',
      output: 'Structured document repository with verified excerpts and audit citations',
      icon: FileText,
      exampleData: 'P-102 Q3 Inspection Report: Stage-II Forest Clearance blocked at Ch 52-61'
    },
    {
      id: 'rag',
      number: 6,
      name: 'RAG Retrieval',
      category: 'Intelligence',
      oneLiner: 'Retrieves relevant documentary evidence to ground all AI explanations in facts.',
      technicalRole: 'Semantic hybrid search indexing verified project records to retrieve exact verbatim citations for the LLM context.',
      input: 'Specific inquiry (e.g., "Why is P-102 delayed?") + Project scope filter',
      output: 'Relevant document excerpts with page numbers, dates, and authoring authorities',
      icon: Search,
      exampleData: 'Retrieved 3 source snippets: DPR p.2, Q3 Inspection p.2, TANGEDCO Minutes p.1'
    },
    {
      id: 'llm',
      number: 7,
      name: 'LLM Reasoning',
      category: 'Intelligence',
      oneLiner: 'Converts retrieved evidence into grounded, natural-language executive explanations.',
      technicalRole: 'Gemini 3.8 Flash model governed by strict guardrails that prohibit hallucination and mandate EVM figure verification.',
      input: 'Structured tool output (EVM, dates) + Retrieved document evidence snippets',
      output: '5-section briefing: Facts, AI Analysis, Evidence Citations, Uncertainty, Next Steps',
      icon: Bot,
      exampleData: 'Executive Briefing: Explains 8.8 km unhanded stretch & 33kV line shifting delay'
    },
    {
      id: 'ml',
      number: 8,
      name: 'ML Risk Prediction',
      category: 'Intelligence',
      oneLiner: 'Forecasts forward-looking risk scores, schedule slippage, and cost overruns using historical patterns.',
      technicalRole: 'GradientBoosting Regressor trained on infrastructure indicators, coupled with SHAP feature explainability.',
      input: 'Physical deficit %, Financial gap %, Land delay days, Pending statutory clearances',
      output: 'Risk Score (0–100), Predicted Delay Days, Forecast EAC Cost Overrun, SHAP Factor %',
      icon: Cpu,
      exampleData: 'ML Risk: 74.8/100 (High Band) | Forecast Delay: +142 Days | Cost Overrun: +10.4%'
    },
    {
      id: 'decision',
      number: 9,
      name: 'Executive Decision Support',
      category: 'Action',
      oneLiner: 'Delivers actionable briefs, bilateral intervention paths, and auditable governance for leadership.',
      technicalRole: 'Consolidated briefing generation integrating verified facts, documentary citations, and ML outlook into executive briefs.',
      input: 'Complete multi-agent synthesis from prior pipeline stages',
      output: 'One-click executive briefs, inter-departmental action items, and audit trail',
      icon: Sparkles,
      exampleData: 'Bilateral CS meeting agenda, TANGEDCO escrow deposit proposal, advance payment cap'
    }
  ];

  const selectedStep = pipelineSteps.find(s => s.id === selectedStepId) || pipelineSteps[5];

  const techStack = [
    {
      tech: 'EVM Analytics Engine',
      purpose: 'How is the project performing?',
      desc: 'Calculates contractual Earned Value indices (SPI, CPI, Financial-Physical divergence) to diagnose schedule slippage and cost escalation deterministically without guesswork.'
    },
    {
      tech: 'Early Warning Center',
      purpose: 'Which projects need attention?',
      desc: 'Monitors automated threshold tripwires across 18 states and dispatches urgent interventions when schedule or financial gaps exceed safe bounds.'
    },
    {
      tech: 'RAG (Retrieval-Augmented Generation)',
      purpose: 'What evidence exists?',
      desc: 'Extracts grounded evidence from authoritative inspection reports, DPRs, contractor claims, and ministry minutes before any AI analysis is generated.'
    },
    {
      tech: 'LLM (Large Language Model)',
      purpose: 'What does the evidence mean?',
      desc: 'Synthesizes complex technical documents into structured, human-readable executive briefings while strictly maintaining source citations and noting evidence discrepancies.'
    },
    {
      tech: 'ML Predictive Lab (GradientBoosting + SHAP)',
      purpose: 'What risks may occur in the future?',
      desc: 'Predicts probabilistic completion delays and cost overruns using multi-factor indicators, with SHAP attribution explaining which features drive the forecast.'
    },
    {
      tech: '3D Spatial GIS',
      purpose: 'Where is the problem located?',
      desc: 'Visualizes national infrastructure corridors, geographical distribution, regional bottlenecks, and state-level project density.'
    },
    {
      tech: 'LangGraph Multi-Agent Orchestration',
      purpose: 'How is the AI workflow controlled and governed?',
      desc: 'Coordinates an 11-node deterministic execution graph that enforces intent classification, RBAC security gates, EVM mathematical validation, and uncertainty checks.'
    },
    {
      tech: 'Audit & Governance Ledger',
      purpose: 'What happened, who accessed it, and when?',
      desc: 'Maintains tamper-evident provenance logging for all official actions, document retrievals, alert dispatches, and authentication events.'
    },
    {
      tech: 'Role-Based Access Control (RBAC)',
      purpose: 'Who is authorized to see which data?',
      desc: 'Restricts project data, state scopes, and admin capabilities based on official ministry roles (Super Admin, Senior Decision Maker, Project Authority, Public Auditor).'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-blue-700 uppercase tracking-wider text-[11px]">
                Platform Architecture & Methodology
              </span>
              <span aria-hidden="true">·</span>
              <span>Technical Evaluator Guide</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                End-to-End Grounded Workflow
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#1565C0]" />
              How Bharat Project Intelligence Works
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              An integrated, evidence-grounded decision support system that transforms raw infrastructure ledgers into auditable executive decisions. Every technology solves a specific operational question.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-900">
            <span className="font-bold block">One Integrated Workflow</span>
            <span className="text-[11px] text-blue-700 font-medium">Data → Monitor → Detect → Investigate → Explain → Predict → Decide</span>
          </div>
        </div>
      </div>

      {/* Visual Workflow Pipeline (9 Stages) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-700" />
              The Core Decision-Support Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage below to inspect its operational role, input/output contracts, and real project data flow:
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">9-STAGE FLOW</span>
        </div>

        {/* Pipeline Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {pipelineSteps.map(step => {
            const Icon = step.icon;
            const isSelected = selectedStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {step.number}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">
                  {step.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {step.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep Dive */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
                {React.createElement(selectedStep.icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    Stage {selectedStep.number} of 9 · {selectedStep.category}
                  </span>
                  <span className="font-bold text-base text-slate-900">
                    {selectedStep.name}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  "{selectedStep.oneLiner}"
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              Contract Flow: <span className="font-mono text-slate-800 font-semibold">{selectedStep.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Technical Mechanism:
              </span>
              <p className="text-slate-800 text-xs leading-relaxed">
                {selectedStep.technicalRole}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Input Contract:
                </span>
                <p className="text-slate-700 text-xs font-mono bg-slate-50 p-1.5 rounded border border-slate-100 mt-0.5">
                  {selectedStep.input}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Output Contract:
                </span>
                <p className="text-slate-700 text-xs font-mono bg-slate-50 p-1.5 rounded border border-slate-100 mt-0.5">
                  {selectedStep.output}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Worked Example (P-102 Corridor):
              </span>
              <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200/60 text-slate-800 text-[11px] leading-relaxed">
                {selectedStep.exampleData}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Technology Map: Why Every Tool Exists (Items 30 & 31) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-700" />
            Core Technology Roles — Purpose Over Novelty
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every technology in Bharat Project Intelligence answers one concrete operational question:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {techStack.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  {item.tech}
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Tool {idx + 1}
                </span>
              </div>

              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-200/70 text-blue-900 font-semibold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>"{item.purpose}"</span>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification & Synthetic Prototype Data Notice (Item 21) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 flex items-start space-x-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 block text-sm">
            Statutory Prototype & Synthetic Demonstration Baseline
          </span>
          <p className="text-amber-900/90 text-xs leading-relaxed max-w-4xl">
            Bharat Project Intelligence operates on realistic, synthetic demonstration infrastructure project records modeled after authentic Central Sector Projects (NHAI, Dedicated Freight Corridors, Metro Rails, Ultra Mega Solar, and Jal Jeevan Mission). The underlying EVM calculations, ML GradientBoosting regressions, LangGraph multi-agent flow, and RAG semantic verification execute live in this application.
          </p>
        </div>
      </div>
    </div>
  );
};
