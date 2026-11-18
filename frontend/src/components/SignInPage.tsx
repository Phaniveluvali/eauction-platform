import React from 'react';
import { PortalView } from './PortalSidebar';
import { User } from '../types';
import { initiateKeycloakLogin } from '../utils/oidc';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
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
  onNavigate,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1A1D20] to-black flex items-center justify-center p-4 selection:bg-[#059669] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* Brand Header */}
        <div className="px-6 pt-8 pb-6 bg-slate-50 border-b border-slate-100 text-center">
          <img
            src={getAssetUrl('/assets/logo-aj.png')}
            alt="AJ Auctions"
            className="h-11 mx-auto object-contain mb-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');
            }}
          />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Sign In to AJ Auctions
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

          {/* Primary Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleKeycloakLogin}
              className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Log In with Keycloak SSO</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('SIGNUP') : (window.location.href = '/signup')}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>Don't have an account? Sign Up</span>
            </button>
          </div>

          {/* Return to Marketplace */}
          <div className="text-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          AJ Auctions Platform • Single Sign-On Enabled • Powered by AshwikTechnologies
        </div>

      </div>
    </div>
  );
};
