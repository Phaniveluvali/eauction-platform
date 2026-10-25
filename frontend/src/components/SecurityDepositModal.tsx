import React, { useState } from 'react';
import { X, Shield, ArrowUpRight, CheckCircle2, CreditCard, Building2, AlertCircle, RefreshCw, Landmark } from 'lucide-react';
import { User } from '../types';

interface SecurityDepositModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onUpdateDeposit: (newDeposit: number) => void;
}

export const SecurityDepositModal: React.FC<SecurityDepositModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateDeposit,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'deposit' | 'refund'>('deposit');

  // Deposit state
  const currentDeposit = currentUser?.securityDeposit ?? 4000;
  const currentLimit = currentUser?.biddingLimit ?? (currentDeposit * 200);
  const usedLimit = currentUser?.usedBiddingLimit ?? 0;
  const availableLimit = Math.max(0, currentLimit - usedLimit);

  const [selectedPreset, setSelectedPreset] = useState<number>(4000);
  const [customAmount, setCustomAmount] = useState<number>(4000);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');

  // Refund state
  const [bankName, setBankName] = useState<string>(currentUser?.bankName || 'Emirates NBD');
  const [iban, setIban] = useState<string>(currentUser?.iban || 'AE070330000000012345678');
  const [accountHolder, setAccountHolder] = useState<string>(currentUser?.fullName || 'Registered Buyer');
  const [refundAmount, setRefundAmount] = useState<number>(currentDeposit);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string>('');
  const [refundErrorMsg, setRefundErrorMsg] = useState<string>('');

  const presetAmounts = [
    { deposit: 1000, limit: 200000, label: '1,000 AED' },
    { deposit: 4000, limit: 800000, label: '4,000 AED', popular: true },
    { deposit: 10000, limit: 2000000, label: '10,000 AED' },
    { deposit: 25000, limit: 5000000, label: '25,000 AED' },
  ];

  const handlePresetSelect = (amt: number) => {
    setSelectedPreset(amt);
    setCustomAmount(amt);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setDepositSuccessMsg('');

    setTimeout(() => {
      const newTotal = currentDeposit + customAmount;
      onUpdateDeposit(newTotal);
      setIsProcessing(false);
      setDepositSuccessMsg(`Payment of AED ${customAmount.toLocaleString()} approved! Your 200x bidding limit increased by AED ${(customAmount * 200).toLocaleString()}.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundErrorMsg('');
    setRefundSuccessMsg('');

    if (refundAmount <= 0) {
      setRefundErrorMsg('Please enter a valid refund amount.');
      return;
    }

    if (refundAmount > currentDeposit) {
      setRefundErrorMsg(`Maximum refundable amount is AED ${currentDeposit.toLocaleString()}.`);
      return;
    }

    if (!iban.trim().startsWith('AE') || iban.trim().length < 15) {
      setRefundErrorMsg('Please provide a valid UAE IBAN starting with AE (e.g. AE07...).');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newTotal = currentDeposit - refundAmount;
      onUpdateDeposit(newTotal);
      setIsProcessing(false);
      setRefundSuccessMsg(`Refund of AED ${refundAmount.toLocaleString()} has been initiated to ${bankName} (IBAN: ${iban.trim()}). Funds will credit your account within 2-3 business days.`);
      setTimeout(() => {
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-[#D32437]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Security Deposit & 200x Limit
              </h3>
              <p className="text-xs text-slate-500">
                Al Wataneya Automated Bidding Limit Arbiter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Summary Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Current Security Deposit</span>
            <span className="text-lg font-extrabold text-white">AED {currentDeposit.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-400 block uppercase tracking-wider font-semibold">200x Bidding Power</span>
            <span className="text-lg font-extrabold text-emerald-400">AED {availableLimit.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'deposit'
                ? 'border-b-2 border-[#D32437] text-[#D32437] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Security Deposit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'refund'
                ? 'border-b-2 border-[#D32437] text-[#D32437] bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Return to Bank Account</span>
          </button>
        </div>

        {/* Tab 1: Add Security Deposit */}
        {activeTab === 'deposit' ? (
          <form onSubmit={handleDepositSubmit} className="p-5">
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Select or enter your deposit amount. Every <strong className="text-slate-900">1 AED</strong> uploaded unlocks <strong className="text-emerald-700">200 AED</strong> in immediate bidding power.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.deposit}
                  type="button"
                  onClick={() => handlePresetSelect(preset.deposit)}
                  className={`p-3 rounded-xl border text-left transition relative ${
                    selectedPreset === preset.deposit
                      ? 'border-[#D32437] bg-red-50 text-slate-900 ring-2 ring-[#D32437]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {preset.popular && (
                    <span className="absolute top-2 right-2 text-[10px] bg-[#D32437] text-white px-1.5 py-0.5 rounded font-bold">
                      Popular
                    </span>
                  )}
                  <div className="font-extrabold text-sm">{preset.label}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    +{preset.limit.toLocaleString()} Limit
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deposit Amount (AED)
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomAmount(val);
                  setSelectedPreset(val);
                }}
                min={500}
                step={500}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D32437]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Calculated 200x Limit: <strong className="text-emerald-600 font-bold">AED {(customAmount * 200).toLocaleString()}</strong>
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'card' ? 'border-[#D32437] bg-red-50 text-[#D32437] font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Credit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'applepay' ? 'border-[#D32437] bg-red-50 text-[#D32437] font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-bold"> Pay</span>
                  <span>Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'bank' ? 'border-[#D32437] bg-red-50 text-[#D32437] font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Wire Transfer</span>
                </button>
              </div>
            </div>

            {depositSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{depositSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#D32437] hover:bg-[#b01e2e] text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Deposit AED ${customAmount.toLocaleString()}`}
            </button>
          </form>
        ) : (
          /* Tab 2: Return Deposit to Bank Account */
          <form onSubmit={handleRefundSubmit} className="p-5">
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Your security deposit can be refunded to your UAE bank account at any time, provided you have no active winning bids pending settlement.
            </p>

            <div className="space-y-3.5 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#D32437]"
                >
                  <option value="Emirates NBD">Emirates NBD</option>
                  <option value="First Abu Dhabi Bank (FAB)">First Abu Dhabi Bank (FAB)</option>
                  <option value="Abu Dhabi Commercial Bank (ADCB)">Abu Dhabi Commercial Bank (ADCB)</option>
                  <option value="Dubai Islamic Bank (DIB)">Dubai Islamic Bank (DIB)</option>
                  <option value="Mashreq Bank">Mashreq Bank</option>
                  <option value="RAKBANK">RAKBANK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UAE IBAN (International Bank Account Number)
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  placeholder="AE070330000000012345678"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#D32437]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#D32437]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Refund Amount (AED)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  max={currentDeposit}
                  min={100}
                  step={100}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#D32437]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Available to Refund: <strong className="text-slate-800">AED {currentDeposit.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {refundErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{refundErrorMsg}</span>
              </div>
            )}

            {refundSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{refundSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Submitting Wire Request...' : `Return AED ${refundAmount.toLocaleString()} to Bank`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
