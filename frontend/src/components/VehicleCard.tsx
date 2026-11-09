import React, { useState, useEffect } from 'react';
import { Heart, Gauge, MapPin, ShieldCheck, Flame, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { Auction, Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  auction?: Auction;
  onSelectAuction?: (auction: Auction) => void;
  onViewDetails: (auction: Auction, vehicle: Vehicle) => void;
  onBidClick: (auction: Auction) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isBuyer?: boolean;
  isLoggedIn?: boolean;
  isLeading?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  auction,
  onViewDetails,
  onBidClick,
  isFavorite = false,
  onToggleFavorite,
  isBuyer = false,
  isLoggedIn = false,
  isLeading = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  // Real-time countdown timer
  useEffect(() => {
    if (!auction?.endTime) {
      if (auction?.status === 'ENDED' || auction?.status === 'COMPLETED') {
        setIsEnded(true);
        setTimeLeft('Auction Closed');
      }
      return;
    }

    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      if (diff === 0 || auction.status === 'ENDED' || auction.status === 'COMPLETED') {
        setTimeLeft('Auction Closed');
        setIsUrgent(false);
        setIsEnded(true);
        return;
      }

      setIsEnded(false);
      // Flag urgent when under 2 hours
      setIsUrgent(diff < 1000 * 60 * 60 * 2);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime, auction?.status]);

  const defaultImage = vehicle.vehicleType === 'TRUCK'
    ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';

  const displayImage = vehicle.mediaPaths && vehicle.mediaPaths.length > 0 ? vehicle.mediaPaths[0] : defaultImage;
  const currentBid = auction ? Number(auction.currentHighestBid || auction.startPrice || 0) : 0;
  const lotNumber = vehicle.lotNo ? `AJ-${vehicle.lotNo}` : `AJ-${auction?.id ? auction.id.substring(0, 6).toUpperCase() : '101003'}`;

  // Currency estimate in INR (1 AED ~ 22.5 INR)
  const inrEstimate = Math.round(currentBid * 22.5);

  return (
    <div className={`aj-card h-full flex flex-col justify-between group relative border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
      isLeading 
        ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-100/50 border-emerald-500/80' 
        : 'border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl'
    }`}>
      
      {/* 1. Fixed-Height Image Container with Framed Overlay Badges */}
      <div className="shrink-0">
        <div 
          onClick={() => auction && onViewDetails(auction, vehicle)}
          className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden cursor-pointer"
        >
          <img
            src={displayImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />

          {/* Top Status & Lot Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {isEnded ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/85 backdrop-blur-md text-slate-300 shadow-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>AUCTION CLOSED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/85 backdrop-blur-md text-white shadow-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
                <span className="tracking-wide">LIVE BIDDING</span>
              </div>
            )}

            {isLeading ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-full shadow-md font-bold text-[10px] tracking-wider animate-pulse border border-emerald-400 pointer-events-auto">
                <CheckCircle className="w-3 h-3" />
                <span>WINNING</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-slate-200">
                {lotNumber}
              </div>
            )}
          </div>

          {/* Bottom Badges: Plate Registration & Certified Checkmark */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
            {vehicle.registrationNumber ? (
              <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-xs">
                {vehicle.registrationNumber}
              </div>
            ) : <div />}

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>150-Pt Inspected</span>
            </div>
          </div>
        </div>

        {/* 2. Structured Vehicle Metadata & Title (Consistent Height) */}
        <div className="p-4 pb-2">
          
          {/* Year Pill & Title Header with Heart Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {vehicle.manufacturingYear || '2024'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {vehicle.vehicleType || 'PASSENGER'}
                </span>
              </div>
              <h3 
                onClick={() => auction && onViewDetails(auction, vehicle)}
                className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-emerald-700 transition cursor-pointer line-clamp-1 truncate"
                title={`${vehicle.make} ${vehicle.model}`}
              >
                {vehicle.make} {vehicle.model}
              </h3>
            </div>

            {/* Watchlist Heart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite();
              }}
              title={
                !isLoggedIn 
                  ? "Sign in to save this vehicle to your Watchlist"
                  : !isBuyer
                    ? "Watchlist is exclusive to Buyer accounts"
                    : isFavorite
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"
              }
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition shrink-0 cursor-pointer ${
                isFavorite 
                  ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-xs scale-105' 
                  : 'border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Vehicle Specs Chips: Mileage & Yard Location */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 truncate text-[11px]">
                {Number(vehicle.odometerReadingKm || 45000).toLocaleString()} KM
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 truncate text-[11px]">
                {vehicle.location || 'Dubai Central Hub'}
              </span>
            </div>
          </div>

          {/* Real-Time Countdown Timer Banner */}
          <div className={`mt-2.5 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-between border ${
            isEnded
              ? 'bg-slate-100 text-slate-500 border-slate-200'
              : isUrgent 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-emerald-50/70 text-emerald-800 border-emerald-100'
          }`}>
            <span className="text-[10px] uppercase font-sans tracking-wider text-slate-500 flex items-center gap-1">
              {isEnded ? (
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Flame className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500 animate-bounce' : 'text-emerald-500'}`} />
              )}
              {isEnded ? 'Status' : isUrgent ? 'Ends Soon' : 'Remaining'}
            </span>
            <span className="text-[11px]">{timeLeft || '00h : 00m : 00s'}</span>
          </div>

          {/* Current High Bid Pricing & Inspect Link */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isEnded ? 'Final Closing Bid' : 'Current High Bid'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  AED {currentBid.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                ≈ ₹{inrEstimate.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Quick Inspection Link */}
            <button
              type="button"
              onClick={() => auction && onViewDetails(auction, vehicle)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer pb-0.5"
            >
              <span>Inspect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Action Footer (Directly Aligned at Bottom) */}
      <div className="p-4 pt-2">
        {isEnded ? (
          <div className="w-full py-2.5 text-center text-xs font-bold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 select-none">
            Auction Closed
          </div>
        ) : isLeading ? (
          <button
            type="button"
            onClick={() => auction && onBidClick(auction)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            title="You are currently leading! Click to raise your bid."
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>WINNING (RAISE BID)</span>
          </button>
        ) : auction ? (
          <button
            type="button"
            onClick={() => onBidClick(auction)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>Place Live Bid</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full py-2.5 text-center text-xs font-medium text-slate-400 bg-slate-100 rounded-xl">
            Not Available
          </div>
        )}
      </div>

    </div>
  );
};
