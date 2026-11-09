import React, { useState, useEffect, useRef } from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { 
  X, 
  Shield, 
  Lock, 
  UserPlus, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Check, 
  Car, 
  Store, 
  ArrowRight,
  Send
} from 'lucide-react';
import { authApi } from '../services/api/authApi';
import { initiateKeycloakLogin } from '../utils/oidc';
import { getAssetUrl } from '../utils/assets';
import { User } from '../types';

interface SignUpPageProps {
  onSuccess?: (user: User) => void;
  onGoSignIn: () => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSuccess,
  onGoSignIn,
  onBackHome,
  onNavigate,
}) => {
  // Wizard steps: 1 = Details, 2 = Email OTP Verification, 3 = Complete
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (min 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    // International Phone number regex (+ and digits, 7 to 18 digits)
    const phoneClean = phoneNumber.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[0-9]{7,18}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      errors.phoneNumber = 'Please enter a valid mobile number with country code (e.g. +971 50 123 4567)';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must include uppercase, lowercase letters, and at least one number';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service & Auction Participation Rules';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Request Email Verification Code
  const handleRequestVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    try {
      // Dispatch email verification OTP via catalog-identity-service
      await authApi.sendEmailOtp(email.trim().toLowerCase(), fullName.trim());
      
      // Move to step 2
      setStep(2);
      setOtpTimer(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setServerError(err.message || 'Failed to dispatch verification code. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal && val !== '') return;

    const newCode = [...otpCode];
    newCode[index] = cleanVal.slice(-1);
    setOtpCode(newCode);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newCode = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setOtpCode(newCode);
    const targetIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setServerError(null);
    try {
      await authApi.sendEmailOtp(email.trim().toLowerCase(), fullName.trim());
      setOtpTimer(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setServerError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code and Finalize Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP
      await authApi.verifyOtp(email.trim().toLowerCase(), fullCode);

      // 2. Register User Account
      const authResp = await authApi.register({
        email: email.trim().toLowerCase(),
        password: password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        role: role,
        verificationCode: fullCode,
        panNumber: panNumber.trim() ? panNumber.trim() : undefined,
        gstNumber: gstNumber.trim() ? gstNumber.trim() : undefined,
      });

      // 3. Store authentication session
      if (authResp.token) {
        localStorage.setItem('token', authResp.token);
      }

      const createdUser: User = {
        id: authResp.userId,
        email: authResp.email,
        fullName: authResp.fullName,
        phoneNumber: phoneNumber.trim(),
        role: authResp.role as any,
        kycVerified: authResp.kycVerified,
        isActive: true,
        securityDeposit: 4000,
        biddingLimit: 800000,
        usedBiddingLimit: 0,
      };

      setRegisteredUser(createdUser);
      setStep(3);

      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. The code may have expired or user details are already registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-row font-sans">
      {/* Left Sidebar */}
      <PortalSidebar currentView="SIGNUP" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center">
            <button 
              onClick={onBackHome}
              className="p-1.5 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer mr-3"
              title="Return to marketplace"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500">
                Register as a Buyer or Seller on AJ Auctions
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              1. Details
            </span>
            <span className="text-slate-300">→</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              2. Email Code
            </span>
            <span className="text-slate-300">→</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              3. Ready
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-2 sm:px-4">
          
          {/* Card Container */}
          <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            
            {/* Top Brand Banner */}
            <div className="p-6 bg-slate-900 text-white text-center relative">
              <img 
                src={getAssetUrl('/assets/logo-aj.png')} 
                alt="AJ Auctions" 
                className="h-10 mx-auto object-contain mb-2 filter brightness-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');
                }}
              />
              <p className="text-xs text-slate-300 tracking-wider font-medium uppercase">
                Enterprise Fleet & Commercial Auctions
              </p>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <strong className="font-bold block mb-0.5">Registration Alert:</strong>
                  {serverError}
                </div>
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {step === 1 && (
              <form onSubmit={handleRequestVerificationCode} className="p-6 sm:p-8 space-y-6">
                
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Account Classification *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('BUYER')}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                        role === 'BUYER' 
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${role === 'BUYER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          Buyer Account
                          {role === 'BUYER' && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Participate in live bidding and purchase fleet inventory
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('SELLER')}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                        role === 'SELLER' 
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${role === 'SELLER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          Seller / Consignor
                          {role === 'SELLER' && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          List commercial vehicles and manage auction sales
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          formErrors.fullName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          formErrors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+971 50 123 4567 or +91 98765 43210"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                        formErrors.phoneNumber ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Include country code (e.g., UAE: +971 5X XXX XXXX, India: +91 XXXXX XXXXX).
                  </p>
                  {formErrors.phoneNumber && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className={`w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          formErrors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className={`w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          formErrors.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Optional KYC / Tax info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      PAN / Emirates ID / National ID <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      GST / VAT / Tax ID <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="Tax or Commercial License #"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                </div>

                {/* Terms Agreement */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-600 leading-normal">
                      I agree to the <span className="font-semibold text-emerald-700 underline">Terms of Service</span>,{' '}
                      <span className="font-semibold text-emerald-700 underline">Privacy Policy</span>, and Auction Bidding Rules.
                    </span>
                  </label>
                  {formErrors.agreeTerms && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.agreeTerms}</p>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Email Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Footer Link to Sign In */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
                  <span>Already have an active account?</span>
                  <button
                    type="button"
                    onClick={onGoSignIn}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Sign In to Console →
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: Email OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndRegister} className="p-6 sm:p-8 space-y-6 text-center">
                
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                  <Mail className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                    Verify Your Email Address
                  </h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    We sent a 6-digit security verification code to:
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full font-bold text-xs text-slate-800">
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-emerald-700 hover:underline font-normal text-[11px] cursor-pointer"
                    >
                      (Edit)
                    </button>
                  </div>
                </div>

                {/* 6-Digit Code Inputs */}
                <div className="py-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Check your spam or junk folder if the email doesn't arrive within 1 minute.
                  </p>
                </div>

                {/* Timer & Resend */}
                <div className="text-xs text-slate-500">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </button>
                  ) : (
                    <span>
                      Resend code available in <strong className="text-slate-800 font-mono">{otpTimer}s</strong>
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.join('').length !== 6}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying & Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Complete Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Account Details</span>
                  </button>
                </div>

              </form>
            )}

            {/* STEP 3: Registration Success */}
            {step === 3 && (
              <div className="p-8 sm:p-10 space-y-6 text-center">
                
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-in zoom-in-75">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
                    Email Verified & Active
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome to AJ Auctions!
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Hello <strong className="text-slate-800">{registeredUser?.fullName || fullName}</strong>, your account has been verified and registered as a{' '}
                    <strong className="text-emerald-700">{role === 'BUYER' ? 'Verified Buyer' : 'Registered Seller'}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-md mx-auto space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Account ID:</span>
                    <span className="font-mono font-medium text-slate-800">{registeredUser?.id?.slice(0, 13)}...</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Registered Email:</span>
                    <span className="font-medium text-slate-800">{email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Security Clearance:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Email Two-Factor Certified
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-w-md mx-auto pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSuccess && registeredUser) {
                        onSuccess(registeredUser);
                      } else {
                        onNavigate('HOME');
                      }
                    }}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                  >
                    <span>Enter Auction Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onBackHome}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium cursor-pointer"
                  >
                    Return to Homepage
                  </button>
                </div>

              </div>
            )}

            {/* Keycloak SSO Secondary Option (Step 1 only) */}
            {step === 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-2">
                  Have an enterprise corporate account?
                </p>
                <button
                  type="button"
                  onClick={() => initiateKeycloakLogin({ action: 'register' })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Register via Keycloak Corporate SSO</span>
                </button>
              </div>
            )}

          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 mt-6">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit TLS Encryption
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mandatory Email OTP Validation
            </span>
            <span>•</span>
            <span>AJ Auctions v2.1</span>
          </div>

        </div>
      </main>
    </div>
  );
};
