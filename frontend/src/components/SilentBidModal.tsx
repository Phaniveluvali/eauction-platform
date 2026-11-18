import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Auction, User, Vehicle } from '../types';
import { api } from '../services/api';

interface SilentBidModalProps {
  isOpen: boolean;
  auction: Auction | null;
  vehicle?: Vehicle;
  currentUser: User | null;
  existingBidAmount?: number | null;
  onClose: () => void;
  onSuccess: (auctionId: string, bidAmount: number) => void;
  onOpenDeposit: () => void;
  onRequireAuth: () => void;
}

export const SilentBidModal: React.FC<SilentBidModalProps> = ({
  isOpen,
  auction,
  vehicle,
  currentUser,
  existingBidAmount,
  onClose,
  onSuccess,
  onOpenDeposit,
  onRequireAuth,
}) => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showLimitExceeded, setShowLimitExceeded] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && auction) {
      const minStart = Number(auction.startPrice || 1000);
      setBidAmount(existingBidAmount && existingBidAmount > 0 ? existingBidAmount : minStart);
      setTermsAccepted(false);
      setErrorMsg('');
      setSuccessMsg('');
      setShowLimitExceeded(false);
    }
  }, [isOpen, auction, existingBidAmount]);

  if (!isOpen || !auction) return null;

  const userDeposit = currentUser?.securityDeposit ?? 0;
  const userBiddingLimit = currentUser?.biddingLimit ?? userDeposit * 200;
  const usedLimit = currentUser?.usedBiddingLimit ?? 0;
  const availableLimit = Math.max(0, userBiddingLimit - usedLimit);
  const minPrice = Number(auction.startPrice || 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      onClose();
      onRequireAuth();
      return;
    }
    if (currentUser.role !== 'BUYER') {
      setErrorMsg('Only registered Buyer accounts can submit sealed bids.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the Silent Auction confidential bidding terms before submitting.');
      return;
    }
    if (!bidAmount || bidAmount < minPrice) {
      setErrorMsg(`Your sealed bid must be at least AED ${minPrice.toLocaleString()}.`);
      return;
    }
    if (bidAmount > availableLimit || availableLimit <= 0) {
      setShowLimitExceeded(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await api.submitSilentBid(auction.id, bidAmount);
      setSuccessMsg(resp.message || `Confidential sealed bid of AED ${bidAmount.toLocaleString()} submitted!`);
      onSuccess(auction.id, bidAmount);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit sealed bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Confidential Sealed Bid</h3>
              <p className="text-[11px] text-slate-300 truncate max-w-[260px]">
                {vehicle ? `${vehicle.manufacturingYear} ${vehicle.make} ${vehicle.model}` : `Lot #${auction.id.slice(0, 8)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showLimitExceeded ? (
          <div className="p-5 sm:p-6 text-center overflow-y-auto flex-1">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Bidding Power Exceeded</h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Your available 200x bidding power is <strong className="text-slate-900">AED {availableLimit.toLocaleString()}</strong> (Security Deposit: <strong className="text-slate-900">AED {userDeposit.toLocaleString()}</strong>).
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4 text-left flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Add or increase your refundable security deposit to unlock bidding power for Silent Auctions.</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Increase Security Deposit
              </button>
              <button
                type="button"
                onClick={() => setShowLimitExceeded(false)}
                className="w-full py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer"
              >
                Back to Bid Form
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your sealed offer is strictly confidential and hidden from all other bidders. You may revise your offer any time before closing.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Minimum Starting Bid</span>
                <span className="text-sm font-extrabold text-slate-900">AED {minPrice.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available 200x Power</span>
                <span className="text-sm font-extrabold text-emerald-800">AED {availableLimit.toLocaleString()}</span>
              </div>
            </div>

            {existingBidAmount && existingBidAmount > 0 && (
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-semibold">
                Your Current Sealed Offer: AED {existingBidAmount.toLocaleString()} (Submitting updates your offer)
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Sealed Offer Amount (AED)</label>
              <input
                type="number"
                min={minPrice}
                step="500"
                value={bidAmount || ''}
                onChange={(e) => {
                  setBidAmount(Number(e.target.value));
                  setErrorMsg('');
                }}
                placeholder={`Enter at least ${minPrice}`}
                className="w-full px-4 py-3 border-2 border-slate-200 focus:border-emerald-600 rounded-xl text-lg font-bold text-slate-900 outline-none"
                required
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 w-4 h-4 cursor-pointer"
              />
              <span>
                I confirm my sealed offer is binding if awarded by AJ Auctions upon silent auction closure.
              </span>
            </label>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : existingBidAmount ? 'Update Sealed Bid' : 'Submit Sealed Bid'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
