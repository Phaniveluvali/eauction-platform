import React, { useState } from 'react';
import { PortalView } from './PortalSidebar';
import { User } from '../types';
import { initiateKeycloakLogin } from '../utils/oidc';
import { Shield, Lock, ArrowLeft, AlertCircle, ExternalLink, CheckCircle2, KeyRound, X, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Handle direct in-app login
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const resp = await api.login(email.trim().toLowerCase(), password);
      localStorage.setItem('token', resp.token);

      let userProfile: User;
      try {
        userProfile = await api.getMe();
      } catch {
        userProfile = {
          id: resp.userId,
          email: resp.email,
          fullName: resp.fullName,
          phoneNumber: (resp as any).phoneNumber || '+971 50 000 0000',
          role: resp.role as 'ADMIN' | 'BUYER' | 'SELLER',
          kycVerified: resp.kycVerified ?? true,
          isActive: true,
          isSuperAdmin: resp.role === 'ADMIN' || resp.email === 'admin@eauction.in',
        };
      }

      if (onSuccess) {
        onSuccess(userProfile);
      } else {
        if (userProfile.role === 'ADMIN') {
          onNavigate('ADMIN');
        } else if (userProfile.role === 'SELLER') {
          onNavigate('SELLER_DASHBOARD');
        } else {
          onNavigate('HOME');
        }
      }
    } catch (err: any) {
      console.error('Direct login error:', err);
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Keycloak SSO redirect
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

  // Quick fill helper for testing
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
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
            Access live commercial fleet bidding, settlements & dashboard
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
          {(errorMessage || oidcError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{errorMessage || oidcError}</span>
            </div>
          )}

          {/* Direct In-App Login Form */}
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eauction.in or your email"
                  autoComplete="email"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#059669] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMessage('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-[#059669] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#059669] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="pt-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@eauction.in', 'Admin@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('awaadmin@gmail.com', 'Admin@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer text-center"
              >
                AWA Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('awabuyer1@gmail.com', 'Buyer@123')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer text-center"
              >
                Buyer
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                Or Single Sign-On
              </span>
            </div>
          </div>

          {/* Keycloak SSO Action */}
          <button
            type="button"
            onClick={handleKeycloakLogin}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Shield className="w-4 h-4 text-[#059669]" />
            <span>Continue with Keycloak SSO</span>
          </button>

          {/* Switch to Sign Up */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleKeycloakRegister}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>Don't have an account? <strong className="text-emerald-700">Sign Up</strong></span>
            </button>
          </div>

          {/* Security Features Info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TLS 1.3 & Anti-CSRF
            </span>
            <span className="text-slate-400">
              Powered by AJTechnologies
            </span>
          </div>

          {/* Return to Marketplace */}
          <div className="text-center pt-1">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-[#059669]" />
                <h3>Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
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
                  className="w-full py-2.5 bg-[#059669] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered account email to receive password reset instructions.
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
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
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
