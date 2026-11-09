import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, ExternalLink, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AccessDeniedSecurityScreenProps {
  currentUser: User | null;
  requiredRole?: string;
  onLogin: () => void;
  onGoHome: () => void;
}

export const AccessDeniedSecurityScreen: React.FC<AccessDeniedSecurityScreenProps> = ({
  currentUser,
  requiredRole = 'ADMIN',
  onLogin,
  onGoHome,
}) => {
  const isUnauthenticated = !currentUser;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 selection:bg-[#059669] selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#059669] shadow-[0_0_40px_10px_rgba(211,36,55,0.6)]" />

        {/* Security Shield Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-[#059669] shadow-lg">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-[11px] font-bold tracking-wider uppercase mb-3">
          <Lock className="w-3 h-3" />
          <span>403 Forbidden • Security Guard</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          {isUnauthenticated ? 'Authentication Required' : 'Access Restricted'}
        </h1>

        {/* Context-Specific Message */}
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          {isUnauthenticated ? (
            <>
              The requested route <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-red-300">/seller-buyer/admin</code> is strictly protected. You must validate your credentials before access can be granted.
            </>
          ) : (
            <>
              Your account is signed in as <strong className="text-slate-200">{currentUser.fullName}</strong> (<span className="font-mono text-slate-300">{currentUser.email}</span>) with role <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">{currentUser.role}</span>. Administrative privileges (<span className="font-mono text-red-300">{requiredRole}</span>) are required.
            </>
          )}
        </p>

        {/* Security Audit Telemetry Box */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left text-xs text-slate-400 mb-6 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Security Rule:</span>
            <span className="font-mono text-slate-300 font-bold">RBAC_STRICT_TOKEN_VERIFY</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Cryptographic Check:</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Zero-Bypass
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Access Policy:</span>
            <span className="font-mono text-amber-400">Zero-Trust Authorization</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{isUnauthenticated ? 'Sign In to Authenticate' : 'Sign In as Administrator'}</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
