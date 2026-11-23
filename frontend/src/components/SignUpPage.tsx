import React, { useState } from 'react';
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
  FileText,
  Building2,
  CreditCard
} from 'lucide-react';
import { authApi } from '../services/api/authApi';
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
  // Wizard steps: 1 = Details, 2 = Complete (direct in-app registration)
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emiratesId, setEmiratesId] = useState('');
  const [trn, setTrn] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  // Check duplicate full name on blur (D3)
  const handleFullNameBlur = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) return;
    try {
      const exists = await authApi.checkFullNameDuplicate(fullName.trim());
      if (exists) {
        setNameWarning('A registered member already exists with this name. Please ensure your name matches your official ID.');
      } else {
        setNameWarning(null);
      }
    } catch {
      setNameWarning(null);
    }
  };

  // Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full legal name is required (min 2 characters)';
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
      errors.agreeTerms = 'You must agree to the Terms of Service & UAE Escrow Bidding Regulations';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Direct Registration (syncs PostgreSQL + Keycloak)
  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    try {
      const authResp = await authApi.register({
        email: email.trim().toLowerCase(),
        password: password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        role: role,
        emiratesId: emiratesId.trim() ? emiratesId.trim() : undefined,
        panNumber: emiratesId.trim() ? emiratesId.trim() : undefined,
        trn: trn.trim() ? trn.trim() : undefined,
        gstNumber: trn.trim() ? trn.trim() : undefined,
        companyName: companyName.trim() ? companyName.trim() : undefined,
      });

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
        emiratesId: emiratesId.trim() || undefined,
        trn: trn.trim() || undefined,
        companyName: companyName.trim() || undefined,
        isActive: true,
        securityDeposit: 0,
        biddingLimit: 0,
        usedBiddingLimit: 0,
      };

      setRegisteredUser(createdUser);
      setStep(2);

      if (onSuccess) {
        onSuccess(createdUser);
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. The email or phone number may already be registered.');
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
                Register directly as a Buyer or Seller on AJ Auctions
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              1. Account Details
            </span>
            <span className="text-slate-300">→</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              2. Complete
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
              <form onSubmit={handleDirectRegister} className="p-6 sm:p-8 space-y-6">
                
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
                          Seller Account
                          {role === 'SELLER' && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          List and auction your fleet, commercial, and passenger vehicles
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
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (nameWarning) setNameWarning(null);
                        }}
                        onBlur={handleFullNameBlur}
                        placeholder="John Doe / Mohammed Al-Mansoor"
                        className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          formErrors.fullName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.fullName}</p>
                    )}
                    {nameWarning && (
                      <p className="text-[11px] text-amber-600 mt-1">{nameWarning}</p>
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

                {/* Optional UAE Regulatory & Business Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Emirates ID / PAN <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={emiratesId}
                        onChange={(e) => setEmiratesId(e.target.value.toUpperCase())}
                        placeholder="784-YYYY-XXXXXXX-Z"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      VAT TRN / Tax ID <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={trn}
                      onChange={(e) => setTrn(e.target.value.toUpperCase())}
                      placeholder="15-digit Tax ID"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Company / Dealership <span className="text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Legal Entity Name"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
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
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTerms(true);
                        }}
                        className="font-semibold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTerms(true);
                        }}
                        className="font-semibold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
                      >
                        UAE Escrow Bidding Regulations
                      </button>.
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
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

            {/* STEP 2: Registration Success */}
            {step === 2 && (
              <div className="p-8 sm:p-10 space-y-6 text-center">
                
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-in zoom-in-75">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
                    Account Created & Active
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome to AJ Auctions!
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Hello <strong className="text-slate-800">{registeredUser?.fullName || fullName}</strong>, your account has been registered and verified as a{' '}
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
                      <Check className="w-3.5 h-3.5" /> Active Verified Account
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-w-md mx-auto pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (role === 'SELLER') {
                        onNavigate('SELLER_DASHBOARD');
                      } else {
                        onNavigate('HOME');
                      }
                    }}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                  >
                    <span>{role === 'SELLER' ? 'Enter Seller Portal' : 'Explore Vehicle Auctions'}</span>
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

          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 mt-6">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit TLS Encryption
            </span>
            <span>•</span>
            <span>Zero-Trust Identity</span>
            <span>•</span>
            <span>AJ Auctions v2.1</span>
          </div>

        </div>
      </main>

      {/* Terms and Conditions Modal Popup (D2) */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3>AJ Auctions Terms & Conditions</h3>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 max-h-64 overflow-y-auto pr-2 leading-relaxed">
              <p>1. <strong>Binding Bids:</strong> Every bid submitted on AJ Auctions constitutes an irrevocable offer to purchase the vehicle under UAE Federal Law.</p>
              <p>2. <strong>Security Deposit Escrow:</strong> Bidders must place a refundable security deposit to unlock 200x bidding leverage. Deposits are returned in full within 2 business days upon request if no outstanding bid liabilities exist.</p>
              <p>3. <strong>Inspection & Warranty:</strong> Vehicles are cataloged with genuine high-resolution photo sets and official 150-point technical inspection certificates.</p>
              <p>4. <strong>Settlement Terms:</strong> The winning bidder agrees to pay the final purchase price plus administrative fees within 48 hours of auction completion.</p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
