import React from 'react';
import { User, AuditLogItem } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import {
  ShieldCheck,
  UserCheck,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';

interface AdminAuditViewProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  auditLogs: AuditLogItem[];
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({
  currentUser,
  onSelectUser,
  auditLogs
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              ADMINISTRATIVE SECURITY & GOVERNANCE
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Compliance Audit Ledger & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full auditability for all user queries, administrative overrides, and multi-tenant security fences.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>RBAC ENFORCEMENT: ACTIVE</span>
        </div>
      </div>

      {/* Authorized Profile Roles */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-700" />
            Authorized Official Scopes & RBAC Permissions Matrix
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Active: <strong className="text-blue-900">{currentUser.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_USERS.map(u => {
            const isSelected = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-2 relative ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-blue-700 text-white font-mono text-[9px] font-bold">
                    ACTIVE
                  </div>
                )}
                <div className="font-bold text-sm text-slate-900">{u.name}</div>
                <div className="text-blue-700 font-semibold text-[11px]">{u.role}</div>
                <div className="text-slate-500 text-[11px]">{u.agencyName}</div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{u.ministryName || 'National Scope'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{u.stateName || 'Pan-India Jurisdiction'}</span>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelectUser(u);
                  }}
                  className={`w-full py-1.5 rounded-lg font-semibold text-xs transition mt-2 ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isSelected ? 'Active Scope' : 'Select Scope'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Authoritative Registry</span>
            <Database className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">PostgreSQL Relational DB</div>
          <div className="text-[10px] text-slate-500 mt-1">78 Projects • 285 Milestones</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Vector Corpus</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">ChromaDB Indexed</div>
          <div className="text-[10px] text-slate-500 mt-1">12 Documents • 36 Chunks</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Predictive Model</span>
            <Cpu className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-700">v1.2.0-gbr</div>
          <div className="text-[10px] text-slate-500 mt-1">Test R²: 0.892 • MAE: 4.8d</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Agent Engine</span>
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-lg font-bold font-mono text-indigo-700">LangGraph 11-Node</div>
          <div className="text-[10px] text-slate-500 mt-1">Numerical Accuracy Gating</div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs text-xs">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              Statutory Security Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Append-only tamper-evident log of all system inquiries, model executions, and user role switches.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-medium">
            TOTAL RECORDS: {auditLogs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-4">Timestamp (IST)</th>
                <th className="py-2.5 px-3">User & Scope</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Entity Target</th>
                <th className="py-2.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-blue-700 font-mono">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[10px] font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                    {log.entityId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
