import React, { useState } from 'react';
import { PortalView } from './PortalSidebar';
import { User } from '../types';
import { initiateKeycloakLogin } from '../utils/oidc';
import { api } from '../services/api';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, UserCheck, Key, ExternalLink } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

interface SignInPageProps {
  onSuccess: (user: User) => void;
  onGoSignUp: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
  oidcError?: string | null;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onBackHome,
  onNavigate,
  oidcError,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(oidcError || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email/username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email.trim(), password);
      localStorage.setItem('token', res.token);
      const user = await api.getMe();
      setSuccessMsg(`Welcome, ${user.fullName}!`);
      setTimeout(() => {
        onSuccess(user);
        if (user.role === 'ADMIN' || user.isSuperAdmin || (user as any).superAdmin) {
          onNavigate('ADMIN');
        } else {
          onNavigate('HOME');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials or use Keycloak SSO.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
    try {
      setLoading(true);
      const res = await api.login(quickEmail, quickPass);
      localStorage.setItem('token', res.token);
      const user = await api.getMe();
      setSuccessMsg(`Authenticated as ${user.fullName} (${user.role})`);
      setTimeout(() => {
        onSuccess(user);
        if (user.role === 'ADMIN' || user.isSuperAdmin || (user as any).superAdmin) {
          onNavigate('ADMIN');
        } else {
          onNavigate('HOME');
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1A1D20] to-black flex items-center justify-center p-4 selection:bg-[#D32437] selection:text-white">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Brand Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
          <img 
            src={getAssetUrl('/assets/main_logo.svg')} 
            alt="Al Wataneya Auctions" 
            className="h-10 mx-auto object-contain mb-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('/assets/logoawa.svg');
            }}
          />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Sign In to Al Wataneya Auctions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Single Sign-On (SSO) & Secure Credentials
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Feedback Banners */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Primary Option: Direct Keycloak SSO Redirect Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => initiateKeycloakLogin({ action: 'login' })}
              className="w-full py-3.5 px-4 bg-[#D32437] hover:bg-[#b81d2f] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>Log In with Keycloak SSO</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" /> PKCE S256 & Anti-CSRF
              </span>
              <a 
                href="https://tecnics-internal.online/auth/admin" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#D32437] flex items-center gap-1 transition text-slate-500 hover:underline"
              >
                Keycloak Admin Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              Or Sign In Directly
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* 2. Direct Credentials Form */}
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@eauction.in or vmxadmin@tecnics.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#D32437] transition"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: Password123! or Welcome@123
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#D32437] transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#231F20] hover:bg-black text-white text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-red-500" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
            </button>
          </form>

          {/* 3. One-Click Quick Login Presets */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Verified Demo Accounts:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@eauction.in', 'Password123!')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/40 transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#D32437]">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@eauction.in</div>
                <div className="text-[9px] font-mono text-slate-400">Password123!</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('vmxadmin@tecnics.com', 'Welcome@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/40 transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#D32437]">System Admin</div>
                <div className="text-[10px] text-slate-500 truncate">vmxadmin@tecnics.com</div>
                <div className="text-[9px] font-mono text-slate-400">Welcome@123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('buyer@sharmatransport.in', 'Password123!')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Fleet Buyer</div>
                <div className="text-[10px] text-slate-500 truncate">buyer@sharmatransport.in</div>
                <div className="text-[9px] font-mono text-slate-400">Password123!</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('awabuyer@gmail.com', 'Welcome@123')}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Private Buyer</div>
                <div className="text-[10px] text-slate-500 truncate">awabuyer@gmail.com</div>
                <div className="text-[9px] font-mono text-slate-400">Welcome@123</div>
              </button>
            </div>
          </div>

          {/* Back Home */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Marketplace</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Al Wataneya Auctions Platform • Single Sign-On Enabled
        </div>

      </div>
    </div>
  );
};
