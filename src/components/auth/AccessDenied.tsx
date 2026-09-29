import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, FileWarning } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedProps {
  requiredRole?: string;
  onReturnDashboard: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'Super Admin',
  onReturnDashboard
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-100 text-red-800 border border-red-200 inline-block mb-2">
          Statutory Clearance Required
        </span>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Access Denied
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          You are authenticated as <strong className="text-slate-900">{user?.name}</strong> with role{' '}
          <strong className="text-slate-900">{user?.role}</strong>. This administrative section requires{' '}
          <strong className="text-red-700">{requiredRole}</strong> statutory clearance under Government of India data governance protocols.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Authorization Scope Details</span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-1">
            <div>• <strong className="text-slate-700">Current Role:</strong> {user?.role || 'Authorized User'}</div>
            <div>• <strong className="text-slate-700">Assigned Jurisdiction:</strong> {user?.stateName || 'Regional'}</div>
            <div>• <strong className="text-slate-700">Security Clearance:</strong> Confidential (Project Authority)</div>
            <div>• <strong className="text-slate-700">Required Clearance:</strong> Top Secret (National Super Administrator)</div>
          </div>
        </div>

        <button
          onClick={onReturnDashboard}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#1565C0] text-white text-xs font-semibold shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
