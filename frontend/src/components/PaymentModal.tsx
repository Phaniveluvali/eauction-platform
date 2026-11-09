import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, RefreshCw, Wallet, Building2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { User, Auction } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  auction?: Auction | null;
  onDepositSuccess?: (newTotal: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  auction,
  onDepositSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'AJ_INTERNAL_ESCROW' | 'BANK_TRANSFER' | 'CARD'>('AJ_INTERNAL_ESCROW');
  const [amount, setAmount] = useState<number>(4000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('4000');
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { deposit: 1000, limit: 200000, label: '1,000 AED' },
    { deposit: 4000, limit: 800000, label: '4,000 AED', popular: true },
    { deposit: 10000, limit: 2000000, label: '10,000 AED' },
    { deposit: 25000, limit: 5000000, label: '25,000 AED', vip: true },
  ];

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmountInput(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
    setCustomAmountInput(e.target.value);
    setAmount(val > 0 ? val : 0);
  };

  const handleAuthorizeDeposit = async () => {
    if (amount <= 0) {
      setIsError(true);
      setStatusMessage('Please enter a valid deposit amount greater than zero.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const resp = await api.submitInternalDeposit({
        auctionId: auction?.id || 'GLOBAL_ESCROW_DEPOSIT',
        amount: amount,
        payerId: currentUser?.id || 'demo_buyer',
        paymentMethod: paymentMethod,
      });

      setOrderReference(resp.paymentId);
      setStatusMessage(
        `Payment of AED ${amount.toLocaleString()} approved! Your 200x bidding limit has been increased by AED ${(amount * 200).toLocaleString()}.`
      );

      if (onDepositSuccess) {
        onDepositSuccess(amount);
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err.message || 'Deposit authorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Security Deposit & Escrow
              </h2>
              <p className="text-xs text-slate-500">
                Powered by AJ Auctions Internal Broker • 0% Transaction Fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs ${
                isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              )}
              <div className="flex-1">
                <span>{statusMessage}</span>
                {orderReference && (
                  <span className="block mt-0.5 font-mono text-[11px] text-emerald-700 opacity-90">
                    Ref: {orderReference}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Value Proposition Callout */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">200x Bidding Leverage Unlocked</span>
              <p className="text-slate-500 mt-0.5">
                Every <strong className="text-slate-900">1 AED</strong> deposited unlocks <strong className="text-emerald-700 font-bold">200 AED</strong> in immediate tender power across all live & silent auctions.
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Settlement Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('AJ_INTERNAL_ESCROW')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'AJ_INTERNAL_ESCROW'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wallet className={`w-4 h-4 mb-1.5 ${paymentMethod === 'AJ_INTERNAL_ESCROW' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold leading-tight">AJ Wallet</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Instant (0%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className={`w-4 h-4 mb-1.5 ${paymentMethod === 'BANK_TRANSFER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold leading-tight">UAE Bank WPS</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Direct Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className={`w-4 h-4 mb-1.5 ${paymentMethod === 'CARD' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold leading-tight">Card / Corporate</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Instant Auth</span>
              </button>
            </div>
          </div>

          {/* Deposit Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Select Deposit Tier (AED)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.deposit}
                  type="button"
                  onClick={() => handlePresetSelect(preset.deposit)}
                  className={`p-3 rounded-xl border text-left transition relative ${
                    amount === preset.deposit
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {preset.popular && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  {preset.vip && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                      VIP
                    </span>
                  )}
                  <span className="block text-sm font-bold text-slate-900 font-mono">
                    {preset.label}
                  </span>
                  <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                    {(preset.limit / 1000).toLocaleString()}k AED Bidding Power
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Field */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Or Custom Deposit Amount (AED)
            </label>
            <div className="relative">
              <input
                type="text"
                value={customAmountInput}
                onChange={handleCustomChange}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                AED
              </span>
            </div>
            {amount > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                Unlocks <strong className="text-emerald-700 font-mono font-bold">AED {(amount * 200).toLocaleString()}</strong> in live bidding capacity.
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Refundable Deposit</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                AED {amount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAuthorizeDeposit}
              disabled={loading || amount <= 0}
              className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Authorize Internal Escrow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
