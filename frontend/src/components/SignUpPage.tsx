import React, { useState } from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { api } from '../services/api';
import { User } from '../types';
import { X, UserPlus, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface SignUpPageProps {
  onSuccess: (user: User) => void;
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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [panOrEmiratesId, setPanOrEmiratesId] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Security Deposit & 200x Limit Options
  const [depositChoice, setDepositChoice] = useState<'NOW' | 'LATER'>('NOW');
  const [depositAmount, setDepositAmount] = useState<number>(4000);

  // WhatsApp & Email OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'WHATSAPP' | 'EMAIL' | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpNotice, setOtpNotice] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendWhatsAppOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter your mobile phone number first to receive WhatsApp OTP.');
      return;
    }
    setError('');
    setOtpLoading(true);
    setOtpNotice(null);
    try {
      const res = await api.sendWhatsAppOtp(phoneNumber.trim());
      setOtpSent(true);
      setOtpChannel('WHATSAPP');
      const codeInfo = res.otpCode ? ` [Code: ${res.otpCode}]` : '';
      setOtpNotice({ 
        type: 'SUCCESS', 
        message: (res.message || 'OTP dispatched to your WhatsApp.') + codeInfo 
      });
      if (res.otpCode) {
        setOtpCode(res.otpCode);
      }
    } catch (err: any) {
      setOtpNotice({ type: 'ERROR', message: err.message || 'Failed to dispatch WhatsApp OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email) {
      setError('Please enter your email address first to receive OTP.');
      return;
    }
    setError('');
    setOtpLoading(true);
    setOtpNotice(null);
    try {
      const res = await api.sendEmailOtp(email.trim(), fullName.trim());
      setOtpSent(true);
      setOtpChannel('EMAIL');
      const codeInfo = res.otpCode ? ` [Code: ${res.otpCode}]` : '';
      setOtpNotice({ 
        type: 'SUCCESS', 
        message: (res.message || 'Verification code sent to your email.') + codeInfo 
      });
      if (res.otpCode) {
        setOtpCode(res.otpCode);
      }
    } catch (err: any) {
      setOtpNotice({ type: 'ERROR', message: err.message || 'Failed to dispatch Email OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const dest = otpChannel === 'WHATSAPP' ? phoneNumber.trim() : email.trim();
    if (!otpCode || !dest) {
      setOtpNotice({ type: 'ERROR', message: 'Please enter the 6-digit code received.' });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.verifyOtp(dest, otpCode.trim());
      if (res.verified) {
        setOtpVerified(true);
        setOtpNotice({ type: 'SUCCESS', message: 'Identity successfully verified!' });
      }
    } catch (err: any) {
      setOtpNotice({ type: 'ERROR', message: err.message || 'Invalid or expired OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAzureB2cSignUp = () => {
    const tenant = 'etdevconsumeraccess.onmicrosoft.com';
    const host = 'etdevconsumeraccess.b2clogin.com';
    const flow = 'b2c_1_etsusi';
    const clientId = 'b407464f-b9ea-4c5d-a5d4-ee97320a424b';
    const scope = encodeURIComponent('openid offline_access https://etdevconsumeraccess.onmicrosoft.com/api/demo.read');
    const redirectUri = encodeURIComponent('https://dev-alwataneya.et.ae:443/oidcclient/etdx1');
    const state = 'b2c_signup_' + Date.now();

    window.location.href = `https://${host}/${tenant}/${flow}/oauth2/v2.0/authorize?response_type=code&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUri}`;
  };

  const handleTestAzureB2cSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await api.azureB2cLogin({
        email: 'et_bidder_' + Math.floor(1000 + Math.random() * 9000) + '@etdevconsumeraccess.onmicrosoft.com',
        fullName: 'Emirates Transport Fleet Bidder',
        phoneNumber: '+971-50-' + Math.floor(1000000 + Math.random() * 8999999),
        b2cObjectId: 'b2c_user_' + Math.random().toString(36).slice(2, 9),
      });
      localStorage.setItem('token', resp.token);
      const profile = await api.getMe();
      onSuccess(profile);
    } catch (err: any) {
      setError(err.message || 'Azure B2C registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !phoneNumber) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!termsAgreed) {
      setError('Please accept the Terms & Bidding Rules to register.');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.register({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        role: 'BUYER',
        panNumber: panOrEmiratesId.trim() || undefined,
      });

      localStorage.setItem('token', resp.token);
      const profile = await api.getMe();
      const chosenDeposit = depositChoice === 'NOW' ? depositAmount : 0;
      profile.securityDeposit = chosenDeposit;
      profile.biddingLimit = chosenDeposit * 200;
      profile.usedBiddingLimit = 0;
      localStorage.setItem('user_deposit_' + profile.id, String(chosenDeposit));
      localStorage.setItem('user_limit_' + profile.id, String(chosenDeposit * 200));
      localStorage.setItem('user_used_limit_' + profile.id, '0');
      onSuccess(profile);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details or try another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar */}
      <PortalSidebar currentView="SIGNUP" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center pb-4 border-b border-[#EBEBEB] mb-6">
          <button 
            onClick={onBackHome}
            className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer mr-3"
            title="Go back to Home"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#231F20]">
            Sign Up for Al Wataneya Auctions
          </h1>
        </div>

        {/* Form Container */}
        <div className="max-w-xl mx-auto w-full bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-50 text-[#D32437] rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#231F20]">
              Create Your Buyer Account
            </h2>
            <p className="text-xs text-[#8C8C8C] mt-1">
              Join 500+ verified fleet buyers and commercial bidders across UAE & India.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1">
                Full Name / Business Entity <span className="text-[#D32437]">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mohammed Al Mansoor / Sharma Transport"
                className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1">
                Email Address <span className="text-[#D32437]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. buyer@sharmatransport.in"
                className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
                required
              />
            </div>

            {/* Phone Number with WhatsApp & Email OTP Verification */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#231F20]">
                  Phone Number <span className="text-[#D32437]">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={otpLoading || otpVerified}
                    onClick={handleSendWhatsAppOtp}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer transition disabled:opacity-50"
                  >
                    Send WhatsApp OTP
                  </button>
                  <button
                    type="button"
                    disabled={otpLoading || otpVerified}
                    onClick={handleSendEmailOtp}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded cursor-pointer transition disabled:opacity-50"
                  >
                    Send Email OTP
                  </button>
                </div>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +971 50 123 4567 or +91 9876543210"
                className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
                required
              />
            </div>

            {/* OTP Verification Box */}
            {(otpSent || otpVerified) && (
              <div className={`p-3.5 rounded-xl border transition ${
                otpVerified
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50/80 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {otpVerified ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Identity Authenticated via {otpChannel} OTP</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Enter 6-digit OTP sent to {otpChannel === 'WHATSAPP' ? 'WhatsApp' : 'Email'}</span>
                      </>
                    )}
                  </span>
                  {otpNotice && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      otpNotice.type === 'SUCCESS' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {otpNotice.message}
                    </span>
                  )}
                </div>

                {!otpVerified && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 6-digit PIN"
                      className="flex-1 text-xs tracking-widest font-mono bg-white border border-[#D1D5DB] rounded-lg px-3 py-2 text-center text-[#231F20] focus:outline-none focus:border-[#D32437]"
                    />
                    <button
                      type="button"
                      disabled={otpLoading || otpCode.length < 6}
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 bg-[#D32437] hover:bg-[#b51a2b] text-white font-bold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#231F20] mb-1">
                  Password <span className="text-[#D32437]">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231F20] mb-1">
                  Confirm Password <span className="text-[#D32437]">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Emirates ID / PAN (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#231F20] mb-1">
                Emirates ID / PAN / Commercial License <span className="text-[#8C8C8C] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={panOrEmiratesId}
                onChange={(e) => setPanOrEmiratesId(e.target.value)}
                placeholder="e.g. 784-1985-1234567-1 / ABCDE1234F"
                className="w-full text-xs bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#231F20] focus:outline-none focus:border-[#D32437] focus:bg-white transition"
              />
            </div>

            {/* Security Deposit Selection (200x Bidding Limit) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-[#231F20] mb-2 flex items-center justify-between">
                <span>Security Deposit & Bidding Limit</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  200x Instant Leverage
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div
                  onClick={() => setDepositChoice('NOW')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    depositChoice === 'NOW'
                      ? 'border-[#D32437] bg-red-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="depositChoice"
                      checked={depositChoice === 'NOW'}
                      onChange={() => setDepositChoice('NOW')}
                      className="text-[#D32437] focus:ring-[#D32437]"
                    />
                    <span className="text-xs font-bold text-slate-900">Add Deposit Now</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Unlocks 200x bidding power immediately (e.g. 4k AED = 800k AED limit).
                  </p>
                </div>

                <div
                  onClick={() => setDepositChoice('LATER')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    depositChoice === 'LATER'
                      ? 'border-[#D32437] bg-red-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="depositChoice"
                      checked={depositChoice === 'LATER'}
                      onChange={() => setDepositChoice('LATER')}
                      className="text-[#D32437] focus:ring-[#D32437]"
                    />
                    <span className="text-xs font-bold text-slate-900">Deposit Later</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Complete signup now. You will be prompted to deposit before bidding.
                  </p>
                </div>
              </div>

              {depositChoice === 'NOW' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-3 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Select Security Deposit Amount:</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 4000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center ${
                          depositAmount === amt
                            ? 'border-[#D32437] bg-white text-[#D32437] shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>AED {amt.toLocaleString()}</span>
                        <span className="text-[10px] font-normal text-emerald-600 mt-0.5">
                          Limit: {(amt * 200 / 1000).toFixed(0)}k AED
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 200x Calculation Bar */}
                  <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-semibold">
                      Your 200x Bidding Limit:
                    </span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      AED {(depositAmount * 200).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    * Bidding deductions will be calculated against this 200x limit. Your deposit is 100% refundable to your registered UAE bank account via IBAN at any time.
                  </p>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#D32437] border-[#D1D5DB] rounded focus:ring-[#D32437]"
              />
              <label htmlFor="terms" className="text-xs text-[#525252] leading-relaxed cursor-pointer">
                I agree to the Al Wataneya Auctions Terms & Conditions, 5-minute extension rules, and bidding guidelines.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#D32437] hover:bg-[#b51a2b] text-white font-bold rounded-lg text-sm shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Buyer Account...</span>
                </>
              ) : (
                <span>Complete Registration & Start Bidding</span>
              )}
            </button>

          </form>

          {/* Azure AD B2C SSO Registration Option */}
          <div className="mt-5 pt-4 border-t border-[#F0F0F0] space-y-2.5">
            <span className="block text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider text-center">
              Emirates Transport Enterprise SSO
            </span>

            <button
              type="button"
              onClick={handleAzureB2cSignUp}
              className="w-full py-2.5 px-4 bg-[#0078D4] hover:bg-[#006cbd] text-white font-semibold rounded-lg text-xs shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" />
                <rect x="11" y="1" width="9" height="9" />
                <rect x="1" y="1" width="9" height="9" />
                <rect x="11" y="1" width="9" height="9" />
              </svg>
              <span>Sign Up with Emirates Transport (Azure B2C SSO)</span>
            </button>

            <button
              type="button"
              onClick={handleTestAzureB2cSignUp}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px] border border-slate-200 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Test Azure B2C Registration (1-Click Local Token Exchange)</span>
            </button>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-[#525252] pt-4 border-t border-[#F0F0F0]">
            Already have an account?{' '}
            <button
              onClick={onGoSignIn}
              className="text-[#0D74B5] font-semibold hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </div>

        </div>

      </main>

    </div>
  );
};
