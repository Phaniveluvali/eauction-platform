import React from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { X, Shield, Lock, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

interface SignUpPageProps {
  onSuccess?: (user: any) => void;
  onGoSignIn: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onGoSignIn,
  onBackHome,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar */}
      <PortalSidebar currentView="SIGNUP" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center pb-4 border-b border-[#EBEBEB] mb-8">
          <button 
            onClick={onBackHome}
            className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer mr-3"
            title="Go back"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#231F20]">
            Buyer & Seller Registration
          </h1>
        </div>

        {/* Centered Auth Prompt Card */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16 text-center max-w-xl mx-auto px-4">
          
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#D32437] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
            <UserPlus className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#231F20] mb-3 leading-snug">
            Register for AJ Auctions
          </h2>
          <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
            Create your account securely via our Keycloak Single Sign-On service to participate in live vehicle auctions and manage bids.
          </p>

          {/* Keycloak Register CTA */}
          <div className="w-full space-y-3.5 max-w-md mx-auto mb-8">
            <button
              onClick={() => initiateKeycloakLogin({ action: 'register' })}
              className="w-full py-3.5 px-6 bg-[#D32437] hover:bg-[#b81d2f] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer text-sm uppercase tracking-wider"
            >
              <Shield className="w-4 h-4" />
              <span>Create Account with Keycloak SSO</span>
            </button>

            <button
              onClick={onGoSignIn}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Already have an account? Sign In</span>
            </button>
          </div>

          {/* Security Features Info */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-left max-w-md w-full mb-6 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enterprise Identity Provider Protection</span>
            </div>
            <p className="text-[11px] text-slate-500 pl-6">
              Zero-Trust credential verification powered by PKCE S256 and end-to-end token encryption.
            </p>
          </div>

          <button
            onClick={onBackHome}
            className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 mx-auto cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </button>

        </div>

      </main>

    </div>
  );
};
