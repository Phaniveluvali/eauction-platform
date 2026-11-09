import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Sparkles, X, ArrowRight, Clock, Tag } from 'lucide-react';

interface PromotionalBroadcastModalProps {
  onNavigateToLot?: (auctionId?: string) => void;
  onNavigateToCatalog?: () => void;
}

export const PromotionalBroadcastModal: React.FC<PromotionalBroadcastModalProps> = ({
  onNavigateToCatalog,
}) => {
  const [activePromo, setActivePromo] = useState<any>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(() => {
    return sessionStorage.getItem('aj_dismissed_promo_id') || null;
  });

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await api.getActivePromo();
        if (res?.active_promotion) {
          const promo = res.active_promotion;
          if (promo.campaign_id !== dismissedId) {
            setActivePromo(promo);
          }
        } else {
          setActivePromo(null);
        }
      } catch {
        // Silently ignore background polling errors
      }
    };

    fetchPromo();
    const interval = setInterval(fetchPromo, 12000); // Check every 12 seconds
    return () => clearInterval(interval);
  }, [dismissedId]);

  if (!activePromo) return null;

  const handleDismiss = () => {
    if (activePromo?.campaign_id) {
      sessionStorage.setItem('aj_dismissed_promo_id', activePromo.campaign_id);
      setDismissedId(activePromo.campaign_id);
    }
    setActivePromo(null);
  };

  const handleClaim = () => {
    handleDismiss();
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-br from-slate-900 via-[#181A1D] to-black text-white p-5 rounded-2xl shadow-2xl border border-red-500/30 backdrop-blur-md relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Badges & Close Button */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#059669] text-white text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              {activePromo.badge_en || '⚡ FLASH OFFER'}
            </span>
            {activePromo.badge_ar && (
              <span className="px-2 py-0.5 bg-red-950/80 border border-red-800/50 text-red-300 text-[10px] font-bold rounded-full">
                {activePromo.badge_ar}
              </span>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bilingual Titles */}
        <div className="mb-2 relative z-10">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-100 tracking-tight leading-snug">
            {activePromo.title_en}
          </h4>
          {activePromo.title_ar && (
            <p className="text-xs text-red-300/90 font-medium text-right mt-0.5 dir-rtl">
              {activePromo.title_ar}
            </p>
          )}
        </div>

        {/* Marketing Hook */}
        <p className="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed relative z-10">
          {activePromo.hook_en}
        </p>

        {/* Promo Code & Expiry Pill */}
        <div className="flex items-center justify-between bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-1.5 mb-3 relative z-10 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Code:</span>
            <span className="font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40">
              {activePromo.discount_code || 'FLASH50'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-red-400" />
            <span>{activePromo.duration_hours || 2}h Flash Window</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer relative z-10"
        >
          <span>{activePromo.cta_label_en || 'Claim Discount & Start Bidding'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
