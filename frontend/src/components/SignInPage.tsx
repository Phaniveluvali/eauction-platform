import React, { useState } from 'react';
import { PortalView } from './PortalSidebar';
import { User } from '../types';
import { initiateKeycloakLogin } from '../utils/oidc';
import { Shield, Lock, ArrowLeft, AlertCircle, ExternalLink, CheckCircle2, KeyRound, X, Mail } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { api } from '../services/api';

interface SignInPageProps {
  onSuccess?: (user: User) => void;
  onGoSignUp?: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
  oidcError?: string | null;
  securityNotice?: string | null;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccess,
  onGoSignUp,
  onBackHome,
  onNavigate,
  oidcError,
  securityNotice,
}) => {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleKeycloakLogin = () => {
    const isTargetingAdmin = Boolean(securityNotice?.includes('Administrator') || securityNotice?.includes('Admin'));
    initiateKeycloakLogin({
      action: 'login',
      prompt: 'login',
      returnView: isTargetingAdmin ? 'ADMIN' : undefined,
    });
  };

  const handleKeycloakRegister = () => {
    if (onGoSignUp) {
      onGoSignUp();
    } else if (onNavigate) {
      onNavigate('SIGNUP');
    } else {
      window.location.href = '/seller-buyer/signup';
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const resp = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(resp.message || 'If this email is registered, password reset instructions have been sent.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Password reset request dispatched.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1A1D20] to-black flex items-center justify-center p-4 selection:bg-[#059669] selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
          <img 
            src={getAssetUrl('/assets/logo-aj.png')} 
            alt="AJ Auctions" 
            className="h-10 mx-auto object-contain mb-3"
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

          {/* Explanation Text */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto mb-3 shadow-xs">
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
              className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Log In with Keycloak SSO</span>
            </button>

            <button
              type="button"
              onClick={handleKeycloakRegister}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>Don't have an account? Sign Up</span>
            </button>
          </div>

          {/* Forgot Password Action (D4) */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setForgotMessage('');
                setShowForgotModal(true);
              }}
              className="text-xs text-[#059669] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Forgot Password?</span>
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
              className="hover:text-[#059669] flex items-center gap-1 transition text-slate-500 hover:underline"
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

      </div>

      {/* Forgot Password Modal (D4) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-[#059669]" />
                <h3>Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotMessage ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-[#059669] text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered account email to receive a password reset link.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="user@ajauctions.online"
                      className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
