import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, CreditCard, Building2, AlertCircle } from 'lucide-react';
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
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const resp = await api.login(email, password);
        localStorage.setItem('token', resp.token);
        const profile = await api.getMe();
        onSuccess(profile, resp.token);
        onClose();
      } else {
        const resp = await api.register({
          email,
          password,
          fullName,
          phoneNumber,
          role,
          panNumber: panNumber || undefined,
          gstNumber: gstNumber || undefined,
        });
        localStorage.setItem('token', resp.token);
        const profile = await api.getMe();
        onSuccess(profile, resp.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAzureB2cRedirect = () => {
    const tenant = 'etdevconsumeraccess.onmicrosoft.com';
    const host = 'etdevconsumeraccess.b2clogin.com';
    const flow = 'b2c_1_etsusi';
    const clientId = 'b407464f-b9ea-4c5d-a5d4-ee97320a424b';
    const scope = encodeURIComponent('openid offline_access https://etdevconsumeraccess.onmicrosoft.com/api/demo.read');
    const redirectUri = encodeURIComponent('https://dev-alwataneya.et.ae:443/oidcclient/etdx1');
    const state = 'b2c_modal_' + Date.now();

    window.location.href = `https://${host}/${tenant}/${flow}/oauth2/v2.0/authorize?response_type=code&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUri}`;
  };

  const handleTestAzureB2cLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await api.azureB2cLogin({
        email: 'awabuyer@gmail.com',
        fullName: 'AWA Azure B2C Buyer',
        phoneNumber: '+971-50-1982736',
        b2cObjectId: 'b2c_user_awabuyer',
      });
      localStorage.setItem('token', resp.token);
      const profile = await api.getMe();
      onSuccess(profile, resp.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Azure B2C test login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Sign In to Bharat E-Auction' : 'Register New Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access secure live bidding backed by HS256 tokens and Indian KYC verification.
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
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
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
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Seller (Fleet Owner)
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
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (+91)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PAN Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white uppercase placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN (Optional)</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="27ABCDE1234F1Z5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white uppercase placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
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
                placeholder="name@company.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create & Verify Account'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={handleAzureB2cRedirect}
            className="w-full py-2 px-3 bg-[#0078D4] hover:bg-[#006cbd] text-white font-medium rounded-lg text-xs shadow transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" />
              <rect x="11" y="1" width="9" height="9" />
              <rect x="1" y="11" width="9" height="9" />
              <rect x="11" y="11" width="9" height="9" />
            </svg>
            <span>Sign In with Emirates Transport (Azure B2C)</span>
          </button>
          <button
            type="button"
            onClick={handleTestAzureB2cLogin}
            className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-[11px] border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Test Azure B2C SSO Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
