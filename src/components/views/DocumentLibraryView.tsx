import React, { useState, useMemo } from 'react';
import { SAMPLE_DOCUMENTS, ALL_PROJECTS } from '../../data/mockData';
import { DocumentSnippet, User } from '../../types';
import {
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Building2,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface DocumentLibraryViewProps {
  currentUser: User;
  onOpenAssistantWithQuery: (query: string) => void;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  currentUser,
  onOpenAssistantWithQuery
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDocId, setSelectedDocId] = useState<number>(SAMPLE_DOCUMENTS[0].id);

  const docTypes = [
    'All',
    'DPR',
    'Inspection Report',
    'Contractor Report',
    'Meeting Minutes',
    'Environmental Report',
    'Circular'
  ];

  const filteredDocs = useMemo(() => {
    return SAMPLE_DOCUMENTS.filter(d => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        d.title.toLowerCase().includes(term) ||
        d.projectCode.toLowerCase().includes(term) ||
        d.summary.toLowerCase().includes(term) ||
        d.content.toLowerCase().includes(term);

      let matchType = true;
      if (selectedType !== 'All') {
        if (selectedType === 'Circular') {
          matchType = d.docType === 'Circular' || d.docType === 'Review Report';
        } else {
          matchType = d.docType === selectedType;
        }
      }

      return matchSearch && matchType;
    });
  }, [searchTerm, selectedType]);

  const selectedDoc = useMemo(() => {
    return (
      SAMPLE_DOCUMENTS.find(d => d.id === selectedDocId) ||
      filteredDocs[0] ||
      SAMPLE_DOCUMENTS[0]
    );
  }, [selectedDocId, filteredDocs]);

  const relatedProject = useMemo(() => {
    return ALL_PROJECTS.find(p => p.projectCode === selectedDoc?.projectCode);
  }, [selectedDoc]);

  // Extract structured findings from document text
  const extractedFindings = useMemo(() => {
    if (!selectedDoc) return [];
    if (selectedDoc.chunks && selectedDoc.chunks.length > 0) {
      return selectedDoc.chunks.map(c => ({
        section: c.section,
        text: c.text
      }));
    }
    return [
      { section: 'Executive Finding', text: selectedDoc.summary }
    ];
  }, [selectedDoc]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-700 uppercase tracking-wider text-[11px]">
              Document Intelligence & Statutory Repository
            </span>
            <span aria-hidden="true">·</span>
            <span>12 Verified Project Records</span>
            <span aria-hidden="true">·</span>
            <span>Demonstration Benchmark Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1565C0]" />
            Project Documentation & Intelligence
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Verified project records, inspection reports, detailed project reports (DPRs), and AI-powered document analysis for evidence-based government decision support.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenAssistantWithQuery(
              `Summarize key inspection findings, statutory risks, and recommendations from document "${selectedDoc.title}" for ${selectedDoc.projectCode}`
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask AI About This Document</span>
        </button>
      </div>

      {/* Main Grid: Document List on Left (5 cols), Document Intelligence & Reader on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Selector Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 text-xs shadow-xs">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search documents, project codes, issues, contractors..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1.5 overflow-x-auto scrollbar-none pb-1">
              {docTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedType === t
                      ? 'bg-[#1565C0] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
                No verified documents found matching your filter criteria.
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = selectedDoc.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-blue-700">
                        {doc.projectCode}
                      </span>
                      <div className="flex items-center space-x-2 text-slate-500">
                        <span>{doc.docType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{doc.date}</span>
                      </div>
                    </div>

                    <h2 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {doc.title}
                    </h2>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-[#138808] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Record
                      </span>
                      <span>{doc.pages} Pages</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Document Intelligence & Summary Column */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-xs space-y-6">
          {/* Document Header */}
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedDoc.projectCode}
                </span>
                <span>{selectedDoc.docType}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-[#138808]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Statutory Document
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Record Date: {selectedDoc.date}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedDoc.title}
            </h2>

            {relatedProject && (
              <p className="text-xs text-slate-600">
                Associated Project: <strong className="text-slate-800">{relatedProject.name}</strong> ({relatedProject.state} · {relatedProject.sector})
              </p>
            )}
          </div>

          {/* Key Information & Project Context */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Project Code</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {selectedDoc.projectCode}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Document Type</span>
              <span className="font-semibold text-slate-800 text-sm">
                {selectedDoc.docType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Record Length</span>
              <span className="font-semibold text-slate-800 text-sm">
                {selectedDoc.pages} Pages
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Security Classification</span>
              <span className="font-semibold text-slate-800 text-sm">
                {selectedDoc.sensitivity || 'Official Use Only'}
              </span>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                AI Document Intelligence Insight
              </span>
              <span className="text-[10px] text-blue-700 font-mono">
                Grounded Analysis
              </span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">
              {selectedDoc.summary}
            </p>
            {relatedProject && (
              <div className="text-[11px] text-slate-600 pt-1.5 border-t border-blue-200/60 flex items-center justify-between">
                <span>
                  Delivery Status: <strong className={relatedProject.status === 'Delayed' ? 'text-red-700' : 'text-emerald-700'}>{relatedProject.status}</strong> (SPI: {relatedProject.evm.spi})
                </span>
                <span>
                  Physical: {relatedProject.actualPhysicalPct}% vs Planned {relatedProject.plannedPhysicalPct}%
                </span>
              </div>
            )}
          </div>

          {/* Key Findings & Evidence Points */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-700" />
              Key Findings & Document Evidence
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {extractedFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-800 space-y-1"
                >
                  <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{finding.section}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-3">
                    {finding.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Complete Record Text */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-700" />
                Verified Statutory Record Text
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Full Verbatim Content
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {selectedDoc.content}
            </div>
          </div>

          {/* Ask AI Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Citations are verified against statutory government documents and monitored project ledgers.
            </div>

            <button
              onClick={() =>
                onOpenAssistantWithQuery(
                  `Analyze root cause factors from document "${selectedDoc.title}" for ${selectedDoc.projectCode}`
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#1565C0] text-white font-semibold text-xs flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Query Document with AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
