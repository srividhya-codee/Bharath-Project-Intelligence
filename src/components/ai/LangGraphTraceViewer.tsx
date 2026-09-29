import React, { useState } from 'react';
import { LangGraphNodeTrace } from '../../types';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ChevronRight,
  Code2,
  ShieldCheck,
  Search,
  Cpu,
  FileCheck,
  SendHorizontal
} from 'lucide-react';

interface LangGraphTraceViewerProps {
  traces: LangGraphNodeTrace[];
}

export const LangGraphTraceViewer: React.FC<LangGraphTraceViewerProps> = ({ traces }) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  const selectedNode = traces[selectedNodeIndex] || traces[0];

  const getNodeIcon = (nodeId: string) => {
    switch (nodeId) {
      case 'route_intent':
        return <Layers className="w-4 h-4" />;
      case 'deny_unauthorized':
        return <ShieldCheck className="w-4 h-4" />;
      case 'clarify_question':
        return <AlertOctagon className="w-4 h-4" />;
      case 'plan_steps':
        return <Clock className="w-4 h-4" />;
      case 'execute_tools':
        return <Code2 className="w-4 h-4" />;
      case 'retrieve_docs':
        return <Search className="w-4 h-4" />;
      case 'synthesize_answer':
        return <Cpu className="w-4 h-4" />;
      case 'validate_guardrails':
        return <FileCheck className="w-4 h-4" />;
      case 'escalate_uncertainty':
        return <AlertOctagon className="w-4 h-4" />;
      case 'format_response':
        return <SendHorizontal className="w-4 h-4" />;
      case 'log_audit':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: LangGraphNodeTrace['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">COMPLETED</span>;
      case 'running':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono animate-pulse">RUNNING</span>;
      case 'denied':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono">DENIED (RBAC)</span>;
      case 'skipped':
        return <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 text-[10px] font-mono">SKIPPED</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono">IDLE</span>;
    }
  };

  const totalLatency = traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">
            LangGraph 11-Node Multi-Agent Execution Flow
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            ({traces.length}/11 Nodes Executed)
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Total Latency: {totalLatency}ms</span>
        </div>
      </div>

      {/* Nodes Strip (Horizontal Scrollable) */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2.5 mb-3 scrollbar-none">
        {traces.map((trace, idx) => {
          const isSelected = selectedNodeIndex === idx;
          return (
            <button
              key={trace.nodeId}
              onClick={() => setSelectedNodeIndex(idx)}
              className={`px-2.5 py-1.5 rounded-lg border text-left shrink-0 transition flex items-center space-x-2 ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                  : trace.status === 'denied'
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
              }`}
            >
              <div
                className={`p-1 rounded ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {getNodeIcon(trace.nodeId)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[11px] truncate max-w-[120px]">
                  {trace.nodeName.split('. ')[1] || trace.nodeName}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {trace.latencyMs}ms
                </div>
              </div>
              {idx < traces.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Node Telemetry Inspector */}
      {selectedNode && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-sm">
                {selectedNode.nodeName}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                node_id: {selectedNode.nodeId}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400">
                Latency: {selectedNode.latencyMs}ms
              </span>
              {getStatusBadge(selectedNode.status)}
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            {selectedNode.description}
          </p>

          {selectedNode.notes && (
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800/80 text-[11px] text-amber-300/90 font-mono">
              💡 {selectedNode.notes}
            </div>
          )}

          {/* Payloads Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
            {selectedNode.inputPayload && (
              <div className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto max-h-40">
                <span className="font-mono text-slate-400 block font-semibold mb-1">
                  INPUT PAYLOAD / CONTEXT:
                </span>
                <pre className="text-slate-300 font-mono text-[10px] whitespace-pre-wrap">
                  {JSON.stringify(selectedNode.inputPayload, null, 2)}
                </pre>
              </div>
            )}
            {selectedNode.outputPayload && (
              <div className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto max-h-40">
                <span className="font-mono text-slate-400 block font-semibold mb-1">
                  OUTPUT RECORDS / ARTIFACTS:
                </span>
                <pre className="text-slate-300 font-mono text-[10px] whitespace-pre-wrap">
                  {JSON.stringify(selectedNode.outputPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
