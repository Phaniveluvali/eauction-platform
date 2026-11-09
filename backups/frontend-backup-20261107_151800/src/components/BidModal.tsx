import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Shield, ArrowUpRight, Award } from 'lucide-react';
import { Auction, Vehicle, User } from '../types';
import { api, isServiceDegraded } from '../services/api';
import { ServiceDegradedModal } from './ServiceDegradedModal';

interface BidModalProps {
  isOpen: boolean;
  auction: Auction | null;
  currentUser: User | null;
  onClose: () => void;
  onSuccessBid: (auctionId: string, newBidAmount: number) => void;
  onOpenDeposit: () => void;
  onRequireAuth: () => void;
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  auction,
  currentUser,
  onClose,
  onSuccessBid,
  onOpenDeposit,
  onRequireAuth,
}) => {
  if (!isOpen || !auction) return null;

  const currentPrice = Number(auction.currentHighestBid || auction.startPrice || 0);
  const minInc = Number(auction.minBidIncrement || 5000);

  // Quick increment amounts
  const incrementOptions = [5000, 10000, 15000, 20000, 25000, 50000];

  const [selectedIncrement, setSelectedIncrement] = useState<number>(minInc);
  const [customBidAmount, setCustomBidAmount] = useState<number>(currentPrice + minInc);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showLimitExceededModal, setShowLimitExceededModal] = useState<boolean>(false);
  const [showSelfOutbidWarning, setShowSelfOutbidWarning] = useState<boolean>(false);
  const [showDegradedModal, setShowDegradedModal] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if current authenticated user is already the leading highest bidder
  const isLeadingBidder = Boolean(
    currentUser && (
      (auction.highestBidderId && auction.highestBidderId.toLowerCase() === currentUser.id.toLowerCase()) ||
      (currentUser.email && auction.highestBidderId && auction.highestBidderId.toLowerCase() === currentUser.email.toLowerCase())
    )
  );

  // Sync default bid amount when auction changes
  useEffect(() => {
    const nextBid = currentPrice + (selectedIncrement || minInc);
    setCustomBidAmount(nextBid);
    setErrorMsg('');
    setSuccessMsg('');
    setShowLimitExceededModal(false);
    setShowSelfOutbidWarning(false);
  }, [auction.id, currentPrice, selectedIncrement, minInc]);

  const handleSelectIncrement = (inc: number) => {
    setSelectedIncrement(inc);
    setCustomBidAmount(currentPrice + inc);
    setErrorMsg('');
    setShowSelfOutbidWarning(false);
  };

  const scrollIncrements = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -120 : 120,
        behavior: 'smooth',
      });
    }
  };

  // 200x Security Deposit Limit Logic
  const userDeposit = currentUser?.securityDeposit ?? 4000;
  const userBiddingLimit = currentUser?.biddingLimit ?? (userDeposit * 200);
  const usedLimit = currentUser?.usedBiddingLimit ?? 0;
  const availableBiddingLimit = Math.max(0, userBiddingLimit - usedLimit);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      onClose();
      onRequireAuth();
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Please acknowledge and accept the inspection and terms condition to proceed.');
      return;
    }

    if (!customBidAmount || customBidAmount <= currentPrice) {
      setErrorMsg(`Your bid of AED ${(customBidAmount || 0).toLocaleString()} is less than or equal to the existing bid of AED ${currentPrice.toLocaleString()}. Please enter a higher bid.`);
      return;
    }

    // Check 200x security deposit limit constraint
    if (customBidAmount > availableBiddingLimit || availableBiddingLimit <= 0) {
      setShowLimitExceededModal(true);
      return;
    }

    // Safety guard: prompt user if they are already the highest bidder
    if (isLeadingBidder && !showSelfOutbidWarning) {
      setShowSelfOutbidWarning(true);
      return;
    }

    await executeBidSubmission(false);
  };

  const executeBidSubmission = async (confirmSelfOutbid: boolean) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Execute live bid against platform backend
      const resp = await api.placeBid(auction.id, customBidAmount, confirmSelfOutbid);

      setSuccessMsg(`Bid of AED ${customBidAmount.toLocaleString()} placed successfully!`);
      onSuccessBid(auction.id, customBidAmount);
      setShowSelfOutbidWarning(false);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      if (err.code === 'ALREADY_HIGHEST_BIDDER') {
        setShowSelfOutbidWarning(true);
      } else if (isServiceDegraded(err)) {
        setShowDegradedModal(true);
      } else {
        setErrorMsg(err.message || 'Failed to place bid. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Select the Increment Amount
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Bid: <span className="font-semibold text-slate-800">AED {currentPrice.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highest Bidder Banner */}
        {isLeadingBidder && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">You are the Highest Bidder!</p>
              <p className="text-[11px] text-emerald-800">Your current leading bid is AED {currentPrice.toLocaleString()}.</p>
            </div>
          </div>
        )}

        {/* Self Outbid Warning Popup */}
        {showSelfOutbidWarning && (
          <div className="mx-4 sm:mx-5 mt-4 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col gap-2.5 text-xs text-amber-900 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 text-sm">You are already the highest bidder!</p>
                <p className="mt-1 text-amber-900 leading-relaxed">
                  You are currently leading this auction with <strong className="text-amber-950">AED {currentPrice.toLocaleString()}</strong>.
                  Submitting will raise your own winning bid to <strong className="text-amber-950">AED {customBidAmount.toLocaleString()}</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/80">
              <button
                type="button"
                onClick={() => setShowSelfOutbidWarning(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Current Bid
              </button>
              <button
                type="button"
                onClick={() => executeBidSubmission(true)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Raising Bid...' : 'Confirm & Raise Bid'}
              </button>
            </div>
          </div>
        )}

        {/* Limit Exceeded Alert Modal Popup */}
        {showLimitExceededModal ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              You Have Used the Maximum Limit
            </h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              You have reached your maximum <strong className="text-slate-900">200x bidding limit</strong> (AED {userBiddingLimit.toLocaleString()}) based on your current security deposit of <strong className="text-slate-900">AED {userDeposit.toLocaleString()}</strong>.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-5 text-left flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                To participate in further bidding, please increase your security deposit. Your security deposit is 100% refundable to your registered bank account at any time.
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-3 bg-[#D32437] hover:bg-[#b51f30] text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                Increase Security Deposit
              </button>
              <button
                type="button"
                onClick={() => setShowLimitExceededModal(false)}
                className="w-full py-2.5 text-slate-600 hover:text-slate-800 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={handleBidSubmit} className="p-4 sm:p-5">
            {/* Quick Increment Chips with Navigation Arrows */}
            <div className="flex items-center gap-1 mb-4 select-none">
              <button
                type="button"
                onClick={() => scrollIncrements('left')}
                className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {incrementOptions.map((inc) => {
                  const isSelected = selectedIncrement === inc;
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleSelectIncrement(inc)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'border-[#D32437] bg-red-50 text-[#D32437] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      + {inc.toLocaleString()} AED
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollIncrements('right')}
                className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Input Row with Integrated Red "BID NOW" Button (Matching Screenshot 2) */}
            <div className="relative flex items-center rounded-xl border-2 border-slate-200 focus-within:border-[#D32437] bg-slate-50 transition overflow-hidden mb-4">
              <input
                type="number"
                value={customBidAmount || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setCustomBidAmount(val);
                  setErrorMsg('');
                }}
                step="any"
                placeholder="Enter bid amount"
                className="w-full py-3 px-4 text-xl font-bold text-slate-900 bg-transparent outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-white font-extrabold px-5 sm:px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition shrink-0 cursor-pointer disabled:opacity-50 ${
                  isLeadingBidder ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#D32437] hover:bg-[#b51f30]'
                }`}
              >
                {isSubmitting ? 'Submitting...' : isLeadingBidder ? 'RAISE BID' : 'BID NOW'}
              </button>
            </div>

            {/* Bidding Limit Indicator Bar */}
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>200x Bidding Limit:</span>
              </div>
              <div className="font-bold text-slate-900">
                AED {availableBiddingLimit.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">avail.</span>
              </div>
            </div>

            {/* Acknowledgment Checkbox (Matching Screenshot 2) */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 mb-4 select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#D32437] focus:ring-[#D32437] w-4 h-4 cursor-pointer"
              />
              <span className="leading-relaxed">
                I acknowledge that I have inspected the vehicle, accept its current condition, and agree to the{' '}
                <a href="/seller-buyer/help" target="_blank" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>{' '}
                associated with it.
              </span>
            </label>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Graceful Degradation Modal for Microservice Outages */}
      <ServiceDegradedModal
        isOpen={showDegradedModal}
        serviceName="Live Bidding Microservice"
        onClose={() => setShowDegradedModal(false)}
        onRetry={() => {
          setShowDegradedModal(false);
          executeBidSubmission(showSelfOutbidWarning);
        }}
        onBrowseVehicles={() => {
          setShowDegradedModal(false);
          onClose();
        }}
        errorCode="ERR_BID_ENGINE_DEGRADED_503"
      />
    </div>
  );
};
