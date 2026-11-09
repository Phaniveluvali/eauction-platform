import React from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { X, Shield, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

interface SignInAndSignUpPageProps {
  onGoSignIn?: () => void;
  onGoSignUp?: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
}

export const SignInAndSignUpPage: React.FC<SignInAndSignUpPageProps> = ({
  onBackHome,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar */}
      <PortalSidebar currentView="SIGNIN_SIGNUP" onNavigate={onNavigate} />

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
            Sign in or Sign up
          </h1>
        </div>

        {/* Centered Auth Prompt Card */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16 text-center max-w-xl mx-auto px-4">
          
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#D32437] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
            <Shield className="w-8 h-8" />
          </div>

          {/* Main prompt heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#231F20] mb-3 leading-snug">
            Welcome to Al Wataneya Auctions
          </h2>
          <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">
            Access live bidding, manage security deposits, and explore the vehicle catalog via secure Keycloak Single Sign-On.
          </p>

          {/* Direct Keycloak SSO Options */}
          <div className="w-full space-y-3.5 max-w-md mx-auto mb-8">
            <button
              onClick={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
              className="w-full py-3.5 px-6 bg-[#D32437] hover:bg-[#b81d2f] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer text-sm uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In with Keycloak SSO</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={() => initiateKeycloakLogin({ action: 'register' })}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <UserPlus className="w-4 h-4 text-slate-600" />
              <span>Create New Account (Keycloak Registration)</span>
            </button>
          </div>

          {/* Green Go Back Button */}
          <button
            onClick={onBackHome}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer"
          >
            Return to Public Marketplace
          </button>

        </div>

      </main>

    </div>
  );
};
