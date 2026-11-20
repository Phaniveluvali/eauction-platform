import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, CreditCard, Building2, AlertCircle, CheckCircle2, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  
  // UAE Identity Fields (D3)
  const [emiratesId, setEmiratesId] = useState('');
  const [trn, setTrn] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Validations & Async checks (D1)
  const [nameError, setNameError] = useState('');
  const [nameChecking, setNameChecking] = useState(false);
  const [nameValid, setNameValid] = useState(false);

  // Terms and Conditions Modal & Checkbox (D2)
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Forgot Password Modal (D4)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Registration Post-Guidance (D5)
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [registeredToken, setRegisteredToken] = useState<string>('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Format Emirates ID automatically as 784-YYYY-XXXXXXX-Z
  const handleEmiratesIdChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length > 3) formatted += '-' + digits.slice(3, 7);
    if (digits.length > 7) formatted += '-' + digits.slice(7, 14);
    if (digits.length > 14) formatted += '-' + digits.slice(14, 15);
    setEmiratesId(formatted);
  };

  // Check duplicate full legal name on blur (D1)
  const handleFullNameBlur = async () => {
    if (!fullName || fullName.trim().length < 3) {
      setNameError('');
      setNameValid(false);
      return;
    }
    setNameChecking(true);
    setNameError('');
    try {
      const exists = await api.checkFullNameDuplicate(fullName.trim());
      if (exists) {
        setNameError('This full legal name is already registered. Please enter your distinct legal name.');
        setNameValid(false);
      } else {
        setNameValid(true);
      }
    } catch {
      setNameError('');
    } finally {
      setNameChecking(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const resp = await api.forgotPassword(forgotEmail);
      setForgotMessage(resp.message || 'If this email is registered, a password reset link has been dispatched.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !agreedTerms) {
      setError('Please review and agree to the AJ Auctions Terms and Conditions to register.');
      return;
    }

    if (!isLogin && nameError) {
      setError('Please resolve full name validation before submitting.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const resp = await api.login(email, password);
        localStorage.setItem('token', resp.token);
        const profile = await api.getMe();
        onSuccess(profile, resp.token);
        onClose();
      } else {
        const cleanEmiratesId = emiratesId.replace(/\D/g, '');
        const resp = await api.register({
          email,
          password,
          fullName,
          phoneNumber,
          role,
          emiratesId: cleanEmiratesId || undefined,
          trn: trn || undefined,
          companyName: companyName || undefined,
        });
        localStorage.setItem('token', resp.token);
        const profile = await api.getMe();
        
        // Show post-registration onboarding guidance screen (D5)
        setRegisteredUser(profile);
        setRegisteredToken(resp.token);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = () => {
    if (registeredUser && registeredToken) {
      onSuccess(registeredUser, registeredToken);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Post-Registration Guidance Screen (D5) */}
        {registeredUser ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome to AJ Auctions!</h3>
            <p className="text-xs text-slate-400 mb-6">
              Your account has been created successfully. Follow these next steps to start trading:
            </p>

            <div className="space-y-3 text-left mb-6">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Deposit Security Escrow</h4>
                  <p className="text-[11px] text-slate-400">Unlock 200x bidding power with a 100% refundable security deposit.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Participate in Live Auctions</h4>
                  <p className="text-[11px] text-slate-400">Place bids on luxury and commercial vehicles in real-time online rooms.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Active Auctions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : showForgotPassword ? (
          /* Forgot Password View (D4) */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Reset Your Password</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {forgotMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center space-x-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@ajauctions.online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-1/2 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Main Login / Registration View */
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {isLogin ? 'Sign In to AJ Auctions' : 'Create UAE Bidding Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin
                  ? 'Access live bidding, manage security deposits, and participate in vehicle auctions.'
                  : 'Register securely with UAE Emirates ID and 200x bidding power.'}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`py-2 text-xs font-semibold rounded-md transition ${
                  isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`py-2 text-xs font-semibold rounded-md transition ${
                  !isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('BUYER')}
                        className={`py-2 px-3 text-xs rounded-lg border text-center font-medium transition ${
                          role === 'BUYER'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Buyer (Bidder)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('SELLER')}
                        className={`py-2 px-3 text-xs rounded-lg border text-center font-medium transition ${
                          role === 'SELLER'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Seller (Fleet Consignor)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setNameError('');
                        }}
                        onBlur={handleFullNameBlur}
                        placeholder="e.g. Mohammed Al Mansoori"
                        className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none ${
                          nameError ? 'border-red-500' : nameValid ? 'border-emerald-500' : 'border-slate-800 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {nameChecking && <p className="text-[10px] text-slate-400 mt-1">Verifying legal name uniqueness...</p>}
                    {nameError && <p className="text-[10px] text-red-400 mt-1">{nameError}</p>}
                    {nameValid && <p className="text-[10px] text-emerald-400 mt-1">Name available for registration.</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (+971)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+971501234567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* UAE Emirates ID (D3) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Emirates ID</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          maxLength={18}
                          value={emiratesId}
                          onChange={(e) => handleEmiratesIdChange(e.target.value)}
                          placeholder="784-1990-1234567-1"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">TRN (Optional)</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          maxLength={15}
                          value={trn}
                          onChange={(e) => setTrn(e.target.value.replace(/\D/g, ''))}
                          placeholder="100XXXXXXXXXXXX"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ajauctions.online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Terms and Conditions agreement checkbox (D2) */}
              {!isLogin && (
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-emerald-400 hover:underline font-medium inline"
                      >
                        Terms and Conditions
                      </button>{' '}
                      and UAE Vehicle Auction Regulations.
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create & Verify Account'}
              </button>
            </form>
          </>
        )}

        {/* Terms and Conditions Modal Popup (D2) */}
        {showTermsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-base font-bold text-white">AJ Auctions Terms & Conditions</h4>
                <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs space-y-3 text-slate-300 max-h-64 overflow-y-auto pr-2">
                <p>1. <strong>Bidding Agreement:</strong> Bids placed are binding contracts under UAE Commercial Law.</p>
                <p>2. <strong>Security Escrow:</strong> 200x bidding power is granted upon deposit receipt. Security deposits are 100% refundable upon account settlement.</p>
                <p>3. <strong>Inspection & Verification:</strong> All vehicles are sold with comprehensive 150-point technical inspection reports.</p>
                <p>4. <strong>Payment Settlement:</strong> Winning bidders must settle balance invoices within 48 hours of auction closing.</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAgreedTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold"
                >
                  I Understand & Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
