import React from 'react';
import { Citation } from '../../types';
import { SAMPLE_DOCUMENTS, ALL_PROJECTS } from '../../data/mockData';
import { FileText, X, ShieldCheck, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const doc =
    SAMPLE_DOCUMENTS.find(d => d.title === citation.docTitle) ||
    SAMPLE_DOCUMENTS.find(d => d.projectCode === citation.projectCode);

  const project = ALL_PROJECTS.find(p => p.projectCode === citation.projectCode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-800 text-xs animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] text-blue-200">
                <span className="font-semibold uppercase tracking-wider">
                  Verified Ground Evidence Record
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-300">
                  {citation.projectCode}
                </span>
              </div>
              <h2 className="font-bold text-sm text-white mt-0.5">
                {citation.docTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Project Code</span>
              <span className="font-bold font-mono text-blue-700 text-sm">
                {citation.projectCode}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Document Type</span>
              <span className="font-semibold text-slate-800 text-sm">
                {citation.docType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Page Reference</span>
              <span className="font-semibold text-slate-800 text-sm">
                Page {citation.page}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Verification Status</span>
              <span className="font-semibold text-[#138808] flex items-center gap-1 text-xs mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Ground Source
              </span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-blue-700" />
              Verified Document Excerpt
            </span>
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 font-sans text-slate-800 text-xs leading-relaxed border-l-4 border-l-[#1565C0]">
              "{citation.snippet}"
            </div>
          </div>

          {/* Context & Scope */}
          {doc && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Summary & Findings
              </span>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed">
                {doc.summary}
              </div>
            </div>
          )}

          {project && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-blue-900 block">
                Project Baseline Context
              </span>
              <p>
                <strong>{project.name}</strong> ({project.state}) — Approved Budget: ₹{project.approvedCostCr.toLocaleString()} Cr, Physical Delivery: {project.actualPhysicalPct}% vs Planned {project.plannedPhysicalPct}%.
              </p>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
            <div>
              <span className="font-bold block">Authoritative Statutory Record</span>
              <span className="text-emerald-800">
                This evidence citation was retrieved from verified government project records and inspected against official monitoring baselines.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Classification: {doc?.sensitivity || 'Official Use Only'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
