import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Layers,
  FileText,
  Bookmark,
  Bot,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, Citation, User, LangGraphNodeTrace } from '../../types';
import { executeLangGraphQuery } from '../../services/langGraphEngine';
import { isGeminiConfigured } from '../../services/geminiService';
import { LangGraphTraceViewer } from './LangGraphTraceViewer';
import { CitationModal } from '../modals/CitationModal';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  initialQuery?: string;
  selectedProjectCode?: string;
  onSelectProject?: (code: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialQuery,
  selectedProjectCode,
  onSelectProject
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `### Project Facts:
- **Assistant Status:** Active & Authorized under Government of India Statutory Scope
- **Officer Profile:** ${currentUser.name} (${currentUser.role})
- **Active Subject Context:** ${selectedProjectCode || 'P-102'} (Tamil Nadu Highway Corridor)

### AI Analysis:
I provide grounded decision-support intelligence across national infrastructure projects. Every inquiry is deterministically cross-referenced against authoritative EVM records and site inspection filings.

### Ground Evidence:
• **[1] Master Baseline Register:** Multi-project Earned Value indices and physical delivery metrics.
• **[2] Statutory Knowledge Base:** Detailed Project Reports, site inspection notes, and inter-departmental minutes.

### Suggested Inquiries:
- *"Why is Project P-102 delayed?"*
- *"What are the major risks for this project?"*
- *"Summarize the latest inspection report."*
- *"Compare P-101 and P-102 metrics"*
- *"Show all critical risk early warning alerts"*`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTraces, setCurrentTraces] = useState<LangGraphNodeTrace[]>([]);
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleTrace = (msgId: string) => {
    setExpandedTraces(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTraces]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInputValue(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputValue;
    if (!text.trim() || isProcessing) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `asst-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
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
        selectedProjectCode
      );

      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.answer,
          intent: result.intent,
          citations: result.citations,
          nodesExecuted: result.traces
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `### ⚠️ Notice
An error occurred during query evaluation. Please check your query or project code.`
        }
      ]);
    } finally {
      setIsProcessing(false);
      setCurrentTraces([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">
                  Project Intelligence Assistant
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isGeminiConfigured() ? 'Gemini 3.8 Flash' : 'Grounded Decision Engine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Authorized: <span className="text-amber-300 font-semibold">{currentUser.name}</span> ({currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-1">
                {msg.sender === 'assistant' ? (
                  <>
                    <Bot className="w-3 h-3 text-blue-700" />
                    <span className="font-bold text-slate-700">Project Intelligence Agent</span>
                  </>
                ) : (
                  <span className="font-semibold text-slate-700">{currentUser.name}</span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[95%] rounded-2xl p-4 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1565C0] text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs space-y-3'
                }`}
              >
                <div className="prose prose-xs max-w-none space-y-2 leading-relaxed">
                  {msg.text.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h4 key={i} className="text-xs font-bold text-blue-900 uppercase tracking-wide mt-2 mb-0.5">{line.replace('#### ', '')}</h4>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold text-slate-900">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={i} className="flex items-start space-x-1.5 ml-1">
                          <span className="text-blue-700 mt-0.5">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    if (line.trim() === '---') {
                      return <hr key={i} className="border-slate-200 my-2" />;
                    }
                    return line ? <p key={i}>{line}</p> : <div key={i} className="h-1" />;
                  })}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                      Ground Evidence Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCitation(c)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 text-[10px] font-mono flex items-center space-x-1 transition font-medium"
                        >
                          <Bookmark className="w-2.5 h-2.5 text-blue-700" />
                          <span>[{c.docType}: {c.projectCode} p.{c.page}]</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.nodesExecuted && msg.nodesExecuted.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => toggleTrace(msg.id)}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1.5 transition"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {expandedTraces[msg.id]
                          ? 'Hide Multi-Agent Workflow Trace'
                          : `Inspect Multi-Agent Workflow Trace (${msg.nodesExecuted.length} Nodes)`}
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
            <div className="bg-slate-50 border border-blue-200 rounded-2xl p-4 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-150 shadow-xs">
              <div className="flex items-center space-x-2 text-blue-900 font-bold border-b border-blue-100 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
                <span className="uppercase tracking-wider text-[10px]">AI PROCESSING</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Understanding request</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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

        {/* Suggested Prompts */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 overflow-x-auto scrollbar-none flex space-x-2">
          {[
            'Why is Project P-102 delayed?',
            'Compare P-101 and P-102',
            'Explain EVM metrics for P-102',
            'Delayed projects in Tamil Nadu',
            'Top early warning alerts'
          ].map(p => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium whitespace-nowrap transition border border-slate-200 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-slate-200 p-3.5">
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
              placeholder="Ask about project delays, EVM metrics, or document evidence..."
              disabled={isProcessing}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B1F3A] text-white font-semibold text-xs transition disabled:opacity-50 flex items-center space-x-1.5 shadow-xs"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-slate-500 text-center mt-1.5 font-medium">
            Authoritative Decision Support: All figures grounded in ministry database records.
          </div>
        </div>
      </div>

      <CitationModal citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </div>
  );
};
