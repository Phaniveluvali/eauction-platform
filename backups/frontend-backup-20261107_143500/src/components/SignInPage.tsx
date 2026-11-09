import React from 'react';
import { PortalView } from './PortalSidebar';
import { User } from '../types';
import { initiateKeycloakLogin } from '../utils/oidc';
import { Shield, Lock, ArrowLeft, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

interface SignInPageProps {
  onSuccess?: (user: User) => void;
  onGoSignUp?: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
  oidcError?: string | null;
  securityNotice?: string | null;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onBackHome,
  oidcError,
  securityNotice,
}) => {
  const handleKeycloakLogin = () => {
    const isTargetingAdmin = Boolean(securityNotice?.includes('Administrator') || securityNotice?.includes('Admin'));
    initiateKeycloakLogin({
      action: 'login',
      prompt: 'login',
      returnView: isTargetingAdmin ? 'ADMIN' : undefined,
    });
  };

  const handleKeycloakRegister = () => {
    initiateKeycloakLogin({
      action: 'register',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1A1D20] to-black flex items-center justify-center p-4 selection:bg-[#D32437] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
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
            Enterprise Single Sign-On (SSO) Portal
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Security Notice Banner */}
          {securityNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>{securityNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {oidcError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{oidcError}</span>
            </div>
          )}

          {/* Explanation Text */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-[#D32437] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Zero-Trust Identity Provider
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All buyers, sellers, and administrators authenticate securely through our centralized Keycloak SSO service.
            </p>
          </div>

          {/* Primary Action: Direct Keycloak SSO Button */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleKeycloakLogin}
              className="w-full py-3.5 px-4 bg-[#D32437] hover:bg-[#b81d2f] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Log In with Keycloak SSO</span>
            </button>

            <button
              type="button"
              onClick={handleKeycloakRegister}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>Don't have an account? Sign Up with Keycloak</span>
            </button>
          </div>

          {/* Security Features Info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PKCE S256 & Anti-CSRF
            </span>
            <a 
              href="https://tecnics-internal.online/auth/admin" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#D32437] flex items-center gap-1 transition text-slate-500 hover:underline"
            >
              Keycloak Admin <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Return to Marketplace */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Al Wataneya Auctions Platform • Single Sign-On Enabled
        </div>

      </div>
    </div>
  );
};
