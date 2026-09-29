import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Layers,
  FileText,
  Bookmark,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  AlertTriangle,
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { ChatMessage, Citation, User, LangGraphNodeTrace, Project } from '../../types';
import { executeLangGraphQuery } from '../../services/langGraphEngine';
import { isGeminiConfigured } from '../../services/geminiService';
import { ALL_PROJECTS, SAMPLE_DOCUMENTS } from '../../data/mockData';
import { LangGraphTraceViewer } from '../ai/LangGraphTraceViewer';
import { CitationModal } from '../modals/CitationModal';

interface AIAssistantViewProps {
  currentUser: User;
  selectedProjectCode?: string;
  onSelectProject: (code: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentUser,
  selectedProjectCode,
  onSelectProject
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Ready',
      text: `### Project Facts:
- **Assistant Status:** Active & Authorized under Government of India Statutory Scope
- **Officer Profile:** ${currentUser.name} (${currentUser.role} · ${currentUser.stateName || 'Pan-India'})
- **Knowledge Mandate:** Central Sector Projects Master Database (2026) · 12 Verified Documents

### AI Analysis:
The Bharat Project Intelligence Decision Support Assistant provides grounded briefings and root-cause diagnoses for senior officials. Queries are deterministically cross-referenced against authoritative EVM records and site inspection filings.

### Ground Evidence:
• **[1] Master Baseline Register:** Multi-project Earned Value indices and physical delivery metrics.
• **[2] Statutory Knowledge Base:** Detailed Project Reports, site inspection notes, and inter-departmental minutes.

### Evidence Status & Uncertainty:
Factual records extracted directly from official documents and inspections are strictly distinguished from forward-looking ML statistical predictions. If records contain conflicting contractor claims, human engineering review is noted.

### Recommended Attention:
Use the quick inquiry prompts on the right or ask natural-language questions regarding project status, delay causes, risk indicators, or document evidence.

### Sources:
• Central Sector Projects Master Database Register (2026)
• Statutory Infrastructure Knowledge Base (12 Verified Documents)`
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTraces, setCurrentTraces] = useState<LangGraphNodeTrace[]>([]);
  const [latestCompletedTraces, setLatestCompletedTraces] = useState<LangGraphNodeTrace[]>([]);
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [selectedContextProjectCode, setSelectedContextProjectCode] = useState<string>(
    selectedProjectCode || 'P-102'
  );

  // Sync if selectedProjectCode prop changes
  React.useEffect(() => {
    if (selectedProjectCode) {
      setSelectedContextProjectCode(selectedProjectCode);
    }
  }, [selectedProjectCode]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextProject: Project = useMemo(() => {
    return (
      ALL_PROJECTS.find(p => p.projectCode === selectedContextProjectCode) ||
      ALL_PROJECTS[0]
    );
  }, [selectedContextProjectCode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (customQuery?: string) => {
    const text = customQuery || inputValue;
    if (!text.trim() || isProcessing) return;

    const userMsgId = `user-${Date.now()}`;
    const asstMsgId = `asst-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text
      }
    ]);
    setInputValue('');
    setIsProcessing(true);
    setCurrentTraces([]);

    try {
      const result = await executeLangGraphQuery(
        text,
        currentUser,
        (trace) => {
          setCurrentTraces(prev => {
            const filtered = prev.filter(t => t.nodeId !== trace.nodeId);
            return [...filtered, trace];
          });
        },
        selectedContextProjectCode
      );

      setLatestCompletedTraces(result.traces);
      setMessages(prev => [
        ...prev,
        {
          id: asstMsgId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.answer,
          intent: result.intent,
          citations: result.citations,
          nodesExecuted: result.traces
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: asstMsgId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `### Project Status:
Error encountered during evaluation.

Key Findings:
• Unable to complete multi-agent reasoning for the submitted query.

Recommended Attention:
• Please check the inquiry format or project code and retry.`
        }
      ]);
    } finally {
      setIsProcessing(false);
      setCurrentTraces([]);
    }
  };

  const toggleTrace = (msgId: string) => {
    setExpandedTraces(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const recommendedInquiries = [
    'What is the current status of Project P-102?',
    'Why is Project P-102 delayed?',
    'What are the major risks for this project?',
    'Summarize the latest inspection report.',
    'Compare Project P-102 and P-103.',
    'Which project has the highest schedule risk?',
    'What are the major unresolved issues?',
    'Show the evidence for this risk.'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-700 uppercase tracking-wider text-[11px] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              AI Project Assistant
            </span>
            <span aria-hidden="true">·</span>
            <span>Evidence Search & Grounded Decision Support</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#138808] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Source-Grounded Evidence
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1565C0]" />
            AI Project Assistant
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Factual briefings, delay root-cause analysis, and project decision support grounded strictly in verified inspection records and statutory filings.
          </p>
        </div>

        <div className="text-xs text-slate-500 text-right">
          <div>Authorized Official: <strong className="text-slate-900">{currentUser.name}</strong></div>
          <div className="text-[11px] text-blue-700 font-semibold">{currentUser.role} • {currentUser.stateName || 'Pan-India'}</div>
        </div>
      </div>

      {/* Main Grid: Conversation Feed (8 cols) & Context / Prompt Library (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Conversation Stream */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl flex flex-col h-[740px] shadow-xs overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mb-1">
                  {msg.sender === 'assistant' ? (
                    <>
                      <Bot className="w-3 h-3 text-[#1565C0]" />
                      <span className="font-bold text-slate-800">Project Intelligence Assistant</span>
                    </>
                  ) : (
                    <span className="font-semibold text-slate-800">{currentUser.name}</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[95%] rounded-2xl p-4.5 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#1565C0] text-white rounded-tr-xs'
                      : 'bg-slate-50/90 border border-slate-200 text-slate-800 rounded-tl-xs space-y-3'
                  }`}
                >
                  <div className="prose prose-xs max-w-none space-y-2 leading-relaxed">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={i} className="text-sm font-bold text-slate-900 mt-2 mb-1 border-b border-slate-200/80 pb-1">
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h4 key={i} className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wide mt-2 mb-0.5">
                            {line.replace('#### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-bold text-slate-900">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={i} className="flex items-start space-x-2 ml-1">
                            <span className="text-blue-700 mt-0.5 font-bold">•</span>
                            <span className="text-slate-800">{line.replace(/^[•-]\s+/, '')}</span>
                          </div>
                        );
                      }
                      if (line.trim() === '---') {
                        return <hr key={i} className="border-slate-200 my-2" />;
                      }
                      return line ? <p key={i}>{line}</p> : <div key={i} className="h-1" />;
                    })}
                  </div>

                  {/* Sources & Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                        Verified Sources & Evidence:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitation(c)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 text-[10px] flex items-center space-x-1.5 transition font-medium cursor-pointer shadow-2xs"
                          >
                            <Bookmark className="w-3 h-3 text-[#1565C0]" />
                            <span>[{c.docType}: {c.projectCode} · Page {c.page}]</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsible Technical Workflow Trace for Technical Experts */}
                  {msg.nodesExecuted && msg.nodesExecuted.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => toggleTrace(msg.id)}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {expandedTraces[msg.id]
                            ? 'Hide Technical Trace'
                            : 'View Technical Trace'}
                        </span>
                      </button>
                      {expandedTraces[msg.id] && (
                        <div className="mt-2.5 animate-in fade-in duration-150">
                          <LangGraphTraceViewer traces={msg.nodesExecuted} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="bg-slate-50 border border-blue-200 rounded-2xl p-4.5 text-xs text-slate-800 space-y-3 animate-in fade-in duration-150 shadow-xs">
                <div className="flex items-center space-x-2.5 text-blue-900 font-bold border-b border-blue-100 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">AI PROCESSING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Understanding request</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Checking permissions</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-blue-700 font-medium animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>Retrieving evidence</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>Analyzing project data</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>Validating response</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>Preparing answer</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="bg-white border-t border-slate-200 p-4">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about project status, delay causes, risk indicators, or document evidence..."
                disabled={isProcessing}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs transition disabled:opacity-50 flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <span>Submit Query</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Decision Context & Recommended Inquiries (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Inquiry Library */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                Recommended Official Inquiries
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">1-CLICK</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Select an authoritative inquiry to generate grounded decision-support briefings:
            </p>

            <div className="space-y-1.5">
              {recommendedInquiries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isProcessing}
                  className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 text-slate-700 hover:text-blue-900 text-[11px] font-medium transition cursor-pointer flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="line-clamp-1">{q}</span>
                  <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Active Context Project Snapshot */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <h2 className="font-bold text-slate-900">
                  Active Subject Project
                </h2>
              </div>
              <select
                value={selectedContextProjectCode}
                onChange={e => setSelectedContextProjectCode(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 font-mono text-[11px] text-slate-900 font-bold focus:outline-none"
              >
                {ALL_PROJECTS.slice(0, 10).map(p => (
                  <option key={p.projectCode} value={p.projectCode}>
                    {p.projectCode} ({p.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">
                {contextProject.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {contextProject.ministry} · {contextProject.state}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] block">Delivery Status</span>
                <span className={`font-bold font-mono ${contextProject.status === 'Delayed' ? 'text-red-700' : 'text-emerald-700'}`}>
                  {contextProject.status} ({contextProject.delayDays}d)
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Schedule Index (SPI)</span>
                <span className={`font-bold font-mono ${contextProject.evm.spi < 0.85 ? 'text-red-700' : 'text-slate-900'}`}>
                  {contextProject.evm.spi}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Physical Progress</span>
                <span className="font-bold font-mono text-blue-700">
                  {contextProject.actualPhysicalPct}% / {contextProject.plannedPhysicalPct}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Financial Lead Gap</span>
                <span className="font-bold font-mono text-amber-700">
                  {contextProject.evm.financialPhysicalGap > 0 ? '+' : ''}{contextProject.evm.financialPhysicalGap}%
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectProject(contextProject.projectCode)}
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition text-center cursor-pointer"
            >
              Inspect Project 360° Profile
            </button>
          </div>

          {/* Verified Evidence Documents In Repository */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                Verified Document Evidence Pool
              </span>
              <span className="text-[10px] text-slate-500 font-mono">12 DOCS</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {SAMPLE_DOCUMENTS.slice(0, 6).map(doc => (
                <button
                  key={doc.id}
                  onClick={() =>
                    handleSendMessage(
                      `Summarize key inspection findings from "${doc.title}" for ${doc.projectCode}`
                    )
                  }
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-800 transition cursor-pointer text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-blue-700">
                    <span>{doc.projectCode}</span>
                    <span>{doc.docType}</span>
                  </div>
                  <div className="font-semibold text-slate-900 line-clamp-1">
                    {doc.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CitationModal citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </div>
  );
};
