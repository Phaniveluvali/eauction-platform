import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
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
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown timer
  useEffect(() => {
    if (!auction?.endTime) return;
    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      if (diff === 0) {
        setTimeLeft('ENDED');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}D: ${hours}H: ${minutes}M: ${seconds}S`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const defaultImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';
  const displayImage = vehicle.mediaPaths && vehicle.mediaPaths.length > 0 ? vehicle.mediaPaths[0] : defaultImage;

  const currentBid = auction ? Number(auction.currentHighestBid || auction.startPrice || 0) : 0;
  const lotNumber = vehicle.lotNo || 101003;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-3.5 flex flex-col justify-between group">
      {/* Vehicle Image */}
      <div>
        <div 
          onClick={() => auction && onViewDetails(auction, vehicle)}
          className="relative h-44 w-full bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
        >
          <img
            src={displayImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        {/* Title & View Details Link (Matching Screenshot 4) */}
        <div className="mt-2.5">
          <h3 
            onClick={() => auction && onViewDetails(auction, vehicle)}
            className="text-base font-bold text-slate-900 hover:text-[#D32437] transition cursor-pointer"
          >
            {vehicle.make} {vehicle.model}
          </h3>
          <button
            type="button"
            onClick={() => auction && onViewDetails(auction, vehicle)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer block mt-0.5"
          >
            View Details
          </button>
        </div>

        {/* Countdown in Red (Matching Screenshot 4) */}
        <div className="text-xs font-bold text-[#D32437] mt-2.5 tracking-wide">
          {timeLeft || '67D: 10H: 13M: 19S'}
        </div>

        {/* Specifications Rows */}
        <div className="mt-2 text-xs space-y-1 text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lot#</span>
            <span className="font-semibold text-slate-800">{lotNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mileage</span>
            <span className="font-semibold text-slate-800">{Number(vehicle.odometerReadingKm).toLocaleString()} KM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Location</span>
            <span className="font-semibold text-slate-800">{vehicle.location || 'Abu Dhabi'}</span>
          </div>
        </div>

        {/* Bid Amount Row in Red Bold (Matching Screenshot 4) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Bid Amount</span>
          <span className="text-base font-extrabold text-[#D32437]">
            AED {currentBid.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom Action Row: Favorite Heart + Green BID NOW Button (Matching Screenshot 4) */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Heart Favorite Circle Button (Buyer Exclusive) */}
        <button
          type="button"
          onClick={() => {
            if (onToggleFavorite) {
              onToggleFavorite();
            }
          }}
          title={
            !isLoggedIn 
              ? "Sign in to save this vehicle to your Favorites"
              : !isBuyer
                ? "Favorites are exclusive to Buyer accounts"
                : isFavorite
                  ? "Remove from Favorites"
                  : "Save to Favorites"
          }
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition shrink-0 cursor-pointer ${
            isFavorite 
              ? 'border-[#D32437] bg-red-50 text-[#D32437] shadow-xs scale-105' 
              : 'border-slate-300 bg-white text-slate-400 hover:text-[#D32437] hover:border-[#D32437]/50 hover:bg-red-50/20'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-[#D32437] text-[#D32437]' : ''}`} />
        </button>

        {/* Green "BID NOW" Button (Opens Modal Directly!) */}
        {auction ? (
          <button
            type="button"
            onClick={() => onBidClick(auction)}
            className="flex-1 bg-[#4caf50] hover:bg-[#43a047] text-white font-extrabold py-2 px-5 rounded-lg text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center"
          >
            BID NOW
          </button>
        ) : (
          <span className="text-xs text-slate-400 italic">Closed</span>
        )}
      </div>
    </div>
  );
};
