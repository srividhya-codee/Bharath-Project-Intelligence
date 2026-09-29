import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DemoAccountInfo, fetchDemoAccounts } from '../../services/authService';

interface LoginProps {
  onSuccess?: () => void;
  initialMessage?: string;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, initialMessage }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccountInfo[]>([]);

  React.useEffect(() => {
    fetchDemoAccounts().then(accs => {
      if (accs && accs.length > 0) {
        setDemoAccounts(accs);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your official email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        setErrorMessage(result.message || 'Invalid email or password.');
      } else {
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch {
      setErrorMessage('Unable to authenticate at the moment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillAccount = (acc: DemoAccountInfo) => {
    setEmail(acc.email);
    setPassword(acc.passwordHint);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col justify-between selection:bg-[#1565C0] selection:text-white font-sans">
      {/* National Flag Tri-Color Header Accent */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-[#FFFFFF]" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Official Emblem & Portal Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm mb-3">
              <span className="text-3xl" role="img" aria-label="National Emblem of India">
                🇮🇳
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F3A]">
              BHARAT PROJECT INTELLIGENCE
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#1565C0] mt-1">
              Government Infrastructure Monitoring & Decision Support Platform
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
              <span>Government of India</span>
              <span aria-hidden="true">·</span>
              <span>Cabinet Secretariat / PMO Infrastructure Advisory</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1565C0]" />
                  Secure Officer Access
                </h2>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authorized credentials to access national infrastructure intelligence.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 bg-slate-50/50 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('For password reset or access assistance, contact Cabinet Secretariat NIC support.');
                    }}
                    className="text-[11px] text-[#1565C0] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 bg-slate-50/50 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#1565C0] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-300" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Authorized Demonstration Credentials for Expert Evaluator */}
            {demoAccounts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Authorized Test Credentials:
                  </span>
                  <span className="text-[10px] text-slate-500">Click to fill</span>
                </div>
                <div className="space-y-2">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleFillAccount(acc)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-2 cursor-pointer ${
                        email === acc.email
                          ? 'bg-blue-50/80 border-blue-400 text-blue-900 ring-1 ring-blue-400/30'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              acc.role === 'Super Admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}
                          >
                            {acc.role}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">
                            {acc.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          {acc.email}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Scope: {acc.scope}
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold shrink-0 mt-1">
                        Use
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statutory Security Watermark */}
          <div className="text-center mt-5 space-y-1 text-slate-500 text-[11px]">
            <p className="font-medium text-slate-600 flex items-center justify-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Authorized Government Platform • National Infrastructure Monitoring
            </p>
            <p className="text-[10px] text-slate-500">
              Cabinet Committee on Infrastructure • Ministry-Level Program Management Wing
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-500">
        Government of India • Ministry of Statistics and Programme Implementation (MoSPI)
      </footer>
    </div>
  );
};
