import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, ShieldCheck, X, Car } from 'lucide-react';

interface ServiceDegradedModalProps {
  isOpen: boolean;
  serviceName?: string;
  onClose: () => void;
  onRetry?: () => void;
  onBrowseVehicles?: () => void;
  errorCode?: string;
}

export const ServiceDegradedModal: React.FC<ServiceDegradedModalProps> = ({
  isOpen,
  serviceName = 'Live Bidding Engine',
  onClose,
  onRetry,
  onBrowseVehicles,
  errorCode = 'ERR_BID_ENGINE_DEGRADED_503',
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setIsRetrying(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleAutoRetry();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleAutoRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    if (onRetry) {
      try {
        await onRetry();
      } catch (err) {
        // Keep retrying
      }
    }
    setTimeout(() => setIsRetrying(false), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Banner */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>TEMPORARY SYSTEM LOAD RE-SYNC</span>
        </div>

        {/* Title & Core Friendly Message */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {serviceName} Temporarily Busy
        </h3>
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          We are currently experiencing high auction traffic on our live bidding cluster. Our automated resilience safeguards are actively re-synchronizing bid channels.
        </p>

        {/* Safety Guarantee Cards */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2 mb-5">
          <div className="flex items-start gap-2 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Your deposit &amp; balance are 100% safe.</strong> No funds or limits were debited.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>Zero downtime on other services:</strong> Vehicle catalog, 150-point inspection documents, and deposits remain fully available.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleAutoRetry}
            disabled={isRetrying}
            className="w-full py-3 px-4 bg-[#D32437] hover:bg-[#b51a2b] text-white font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking Live System...' : `Try Placing Bid Again (${countdown}s)`}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onBrowseVehicles) onBrowseVehicles();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <Car className="w-4 h-4" />
            <span>Keep Browsing Other Vehicles</span>
          </button>
        </div>

        {/* Error Reference Code */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Cluster Ref: {errorCode}</span>
          <span className="text-emerald-600 font-sans font-medium">Auto-Recovery Active</span>
        </div>
      </div>
    </div>
  );
};
