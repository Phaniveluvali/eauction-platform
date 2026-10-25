import React from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { X } from 'lucide-react';

interface SignInAndSignUpPageProps {
  onGoSignIn: () => void;
  onGoSignUp: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
}

export const SignInAndSignUpPage: React.FC<SignInAndSignUpPageProps> = ({
  onGoSignIn,
  onGoSignUp,
  onBackHome,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar matching Screenshot 4 */}
      <PortalSidebar currentView="SIGNIN_SIGNUP" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {/* Header matching Screenshot 4: ✕ Sign in or Sign up */}
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

        {/* Centered Auth Prompt Card matching Screenshot 4 */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16 text-center max-w-2xl mx-auto px-4">
          
          {/* Main prompt heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#231F20] mb-8 leading-snug">
            You must be a registered buyer to bid in Al Wataneya Auctions.
          </h2>

          {/* Already registered row */}
          <p className="text-base text-[#231F20] mb-6">
            Already registered?{' '}
            <button
              onClick={onGoSignIn}
              className="text-[#0D74B5] font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>{' '}
            to our Al Wataneya Auctions platform.
          </p>

          {/* Not registered yet row */}
          <p className="text-base text-[#231F20] mb-10">
            Not registered yet?{' '}
            <button
              onClick={onGoSignUp}
              className="text-[#0D74B5] font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>

          {/* Green Go Back Button matching Screenshot 4 */}
          <button
            onClick={onBackHome}
            className="px-8 py-2.5 bg-[#5cb85c] hover:bg-[#4ea249] text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            Go back to the Home Page
          </button>

        </div>

      </main>

    </div>
  );
};
