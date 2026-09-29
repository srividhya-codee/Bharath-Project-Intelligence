import React from 'react';
import { Project } from '../../types';
import { getStatusColor } from './3DTypes';
import {
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Building2,
  MapPin,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';

interface ProjectDetailsPanelProps {
  project: Project | null;
  onClose: () => void;
  onViewProject: (code: string) => void;
  onAIAnalysis: (query: string) => void;
  onViewTimeline?: (code: string) => void;
}

export const ProjectDetailsPanel: React.FC<ProjectDetailsPanelProps> = ({
  project,
  onClose,
  onViewProject,
  onAIAnalysis,
  onViewTimeline
}) => {
  if (!project) return null;

  const statusMeta = getStatusColor(project);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white/98 backdrop-blur-md border-l border-slate-200 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200 text-[#172033] text-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-[#F5F7FA] flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              PROJECT DETAILS
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono font-bold text-[#1565C0] text-xs">
              {project.projectCode}
            </span>
          </div>
          <h3 className="font-bold text-sm text-[#172033] mt-1 line-clamp-2 leading-snug">
            {project.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Metadata: Location, Category, Status */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
              Location:
            </span>
            <span className="font-semibold text-[#172033]">
              {project.state} {project.district ? `(${project.district})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1565C0]" />
              Category:
            </span>
            <span className="font-semibold text-[#172033]">{project.sector}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Status:</span>
            <span
              className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: statusMeta.color }}
            >
              {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
            <span className="text-[#64748B]">Implementing Agency:</span>
            <span className="font-medium text-slate-700 truncate max-w-[200px]" title={project.implementingAgency}>
              {project.implementingAgency}
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-[#172033] text-xs font-bold uppercase tracking-wide">Completion</span>
            <span className="font-mono text-sm font-bold text-[#1565C0]">{project.actualPhysicalPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, project.actualPhysicalPct)}%`,
                backgroundColor: statusMeta.color
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#64748B] pt-0.5">
            <span>Planned Target: {project.plannedPhysicalPct}%</span>
            <span>
              Variance: {Number((project.actualPhysicalPct - project.plannedPhysicalPct).toFixed(1))}%
            </span>
          </div>
        </div>

        {/* Schedule & Risk Block */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Schedule */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider block">
              Schedule
            </span>
            <span
              className={`font-bold text-xs block ${
                project.delayDays > 0 ? 'text-[#DC2626]' : 'text-[#138808]'
              }`}
            >
              {project.delayDays > 0 ? `Delayed by ${project.delayDays} days` : 'On Schedule'}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              Due: {project.expectedCompletionDate}
            </span>
          </div>

          {/* Risk */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider block">
              Risk
            </span>
            <span
              className={`font-bold text-xs block ${
                project.prediction.riskBand === 'Critical'
                  ? 'text-[#DC2626]'
                  : project.prediction.riskBand === 'High'
                  ? 'text-[#F59E0B]'
                  : 'text-[#138808]'
              }`}
            >
              {project.prediction.riskBand.toUpperCase()} ({project.prediction.riskScore}/100)
            </span>
            <span className="text-[10px] text-[#64748B] block truncate mt-0.5">
              SPI: {project.evm.spi} • CPI: {project.evm.cpi}
            </span>
          </div>
        </div>

        {/* Capital Outlay */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] font-medium">Capital Outlay:</span>
            <span className="font-mono font-bold text-sm text-[#172033]">
              ₹ {project.approvedCostCr.toLocaleString()} Crore
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Cumulative Expenditure:</span>
            <span className="font-mono font-semibold text-[#138808]">
              ₹ {project.expenditureCr.toLocaleString()} Crore ({project.financialSpendPct}%)
            </span>
          </div>
        </div>

        {/* Last Updated Date */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Last Updated
          </span>
          <span className="font-mono font-semibold text-[#172033]">
            28 September 2026
          </span>
        </div>

        {/* Critical Milestone Snapshot */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="space-y-1.5">
            <span className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] block">
              Active Milestone on Critical Path
            </span>
            <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white space-y-1">
              <div className="font-medium text-[#172033] text-xs">
                {project.milestones[0].name}
              </div>
              <div className="text-[11px] text-[#64748B] flex justify-between pt-1 border-t border-slate-100">
                <span>Target: {project.milestones[0].expectedDate}</span>
                <span className="font-semibold text-[#1565C0]">{project.milestones[0].status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 border-t border-slate-200 bg-[#F5F7FA] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewProject(project.projectCode)}
            className="py-2.5 px-3 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <span>View Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (onViewTimeline) onViewTimeline(project.projectCode);
              else onViewProject(project.projectCode);
            }}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#1565C0] border border-[#1565C0]/40 font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>View Timeline</span>
          </button>
        </div>

        <button
          onClick={() =>
            onAIAnalysis(
              `Provide comprehensive project intelligence, schedule delay diagnosis, and cost risk analysis for Project ${project.projectCode} (${project.name})`
            )
          }
          className="w-full py-2.5 px-3 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>AI Analysis</span>
        </button>
      </div>
    </div>
  );
};
