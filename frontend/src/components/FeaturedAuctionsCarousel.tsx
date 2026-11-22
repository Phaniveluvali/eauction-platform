import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, ShieldCheck, Heart } from 'lucide-react';
import { Auction, Vehicle } from '../types';
import { Language } from './i18n';

interface FeaturedAuctionsCarouselProps {
  auctions: Auction[];
  vehicles: Vehicle[];
  onSelectAuction?: (auction: Auction) => void;
  onViewDetails?: (auction: Auction, vehicle: Vehicle) => void;
  onOpenBidModal?: (auction: Auction) => void;
  onViewAll?: () => void;
  favoriteIds?: string[];
  onToggleFavorite?: (vehicleId: string) => void;
  isArabic?: boolean;
  lang?: Language;
}

export const FeaturedAuctionsCarousel: React.FC<FeaturedAuctionsCarouselProps> = ({
  auctions = [],
  vehicles = [],
  onSelectAuction = () => {},
  onViewDetails,
  onOpenBidModal,
  onViewAll,
  favoriteIds = [],
  onToggleFavorite,
  isArabic: isArabicProp = false,
  lang = 'EN',
}) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter top active & upcoming auctions, or fallback to top vehicles matching Image 1
  const activeAuctions = auctions
    .filter((a) => a.status === 'ACTIVE' || a.status === 'PENDING')
    .slice(0, 12);

  const fallbackAuctions: Auction[] = [
    {
      id: 'feat-1',
      vehicleId: 'v-feat-1',
      auctionType: 'ONLINE',
      status: 'ACTIVE',
      startPrice: 65000,
      currentHighestBid: 78500,
      endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      vehicle: {
        id: 'v-feat-1',
        make: 'Toyota',
        model: 'Fortuner 4.0L EXR 4x4',
        manufacturingYear: 2023,
        odometerReadingKm: 34000,
        fuelType: 'PETROL',
        registrationNumber: 'DXB-L-54219',
        mediaPaths: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
      } as any,
    } as any,
    {
      id: 'feat-2',
      vehicleId: 'v-feat-2',
      auctionType: 'ONLINE',
      status: 'ACTIVE',
      startPrice: 38000,
      currentHighestBid: 42500,
      endTime: new Date(Date.now() + 86400000 * 1.5).toISOString(),
      vehicle: {
        id: 'v-feat-2',
        make: 'Hyundai',
        model: 'Creta 1.5L Smart Plus',
        manufacturingYear: 2024,
        odometerReadingKm: 18000,
        fuelType: 'PETROL',
        registrationNumber: 'AUH-14-8832',
        mediaPaths: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
      } as any,
    } as any,
    {
      id: 'feat-3',
      vehicleId: 'v-feat-3',
      auctionType: 'ONLINE',
      status: 'ACTIVE',
      startPrice: 85000,
      currentHighestBid: 96000,
      endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      vehicle: {
        id: 'v-feat-3',
        make: 'Tata',
        model: 'Prima 2528.K Heavy Tipper 6x4',
        manufacturingYear: 2023,
        odometerReadingKm: 62000,
        fuelType: 'DIESEL',
        registrationNumber: 'SHJ-COMM-9012',
        mediaPaths: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'],
      } as any,
    } as any,
    {
      id: 'feat-4',
      vehicleId: 'v-feat-4',
      auctionType: 'ONLINE',
      status: 'ACTIVE',
      startPrice: 110000,
      currentHighestBid: 125000,
      endTime: new Date(Date.now() + 86400000 * 4).toISOString(),
      vehicle: {
        id: 'v-feat-4',
        make: 'JCB',
        model: '3DX EcoXcellence Backhoe Loader',
        manufacturingYear: 2022,
        odometerReadingKm: 4200,
        fuelType: 'DIESEL',
        registrationNumber: 'AJM-HE-3310',
        mediaPaths: ['https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?auto=format&fit=crop&w=800&q=80'],
      } as any,
    } as any,
  ];

  const displayAuctions = activeAuctions.length > 0 ? activeAuctions : fallbackAuctions;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const formatCountdown = (endTime?: string) => {
    if (!endTime) return '00:00:00';
    const diff = Math.max(0, new Date(endTime).getTime() - now);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatAed = (amount?: number) => {
    if (amount === undefined || amount === null) return 'AED 0';
    return `AED ${Number(amount).toLocaleString('en-US')}`;
  };

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title with View All & Arrows (Matching Image 1) */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? 'المزادات المميزة' : 'Featured Auctions'}
            </h3>
            <div className="w-12 h-1 bg-[#7ED321] rounded-full mt-2" />
          </div>

          <div className="flex items-center space-x-3">
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-emerald-700 font-bold text-sm hover:text-emerald-800 transition flex items-center gap-1 mr-2 cursor-pointer"
              >
                {isArabic ? 'عرض كل المزادات ←' : 'View All Auctions →'}
              </button>
            )}
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayAuctions.map((auction) => {
            const vehicle =
              auction.vehicle ||
              vehicles.find((v) => v.id === auction.vehicleId);

            const vehicleMake = vehicle?.make || 'Toyota';
            const vehicleModel = vehicle?.model || 'Fortuner EXR 4x4';
            const vehicleYear = vehicle?.manufacturingYear || (vehicle as any)?.year || 2023;
            const vehicleMileage = vehicle?.odometerReadingKm || (vehicle as any)?.mileage || 34000;
            const vehicleFuel = vehicle?.fuelType || 'PETROL';
            const vehiclePlate = vehicle?.registrationNumber || (vehicle?.lotNo ? `LOT #AJ-${vehicle.lotNo}` : `LOT #AJ-${auction.id.substring(0, 6).toUpperCase()}`);
            const vehicleId = vehicle?.id || auction.vehicleId;

            const photoUrl =
              vehicle?.mediaPaths && vehicle.mediaPaths.length > 0
                ? vehicle.mediaPaths[0]
                : (vehicle as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

            const isFav = favoriteIds.includes(vehicleId);
            const isLive = auction.status === 'ACTIVE';
            const priceLabel = auction.currentHighestBid ? 'Current Bid' : 'Starting Bid';
            const displayPrice = auction.currentHighestBid || auction.startPrice || 45000;

            return (
              <div
                key={auction.id}
                onClick={() => onViewDetails && vehicle ? onViewDetails(auction, vehicle) : onSelectAuction(auction)}
                className="w-[280px] sm:w-[310px] bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 shrink-0 overflow-hidden cursor-pointer snap-start flex flex-col group"
              >
                {/* Photo & Badges */}
                <div className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`${vehicleMake} ${vehicleModel}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-600/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        LIVE AUCTION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        SCHEDULED
                      </span>
                    )}

                    {auction.auctionType === 'SILENT' && (
                      <span className="bg-slate-900/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SILENT
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(vehicleId);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
                      title="Save to Watchlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`}
                      />
                    </button>
                  )}

                  {/* Lot & Plate Badge */}
                  <div className="absolute bottom-2.5 left-3 bg-slate-950/80 text-slate-200 text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                    {vehiclePlate}
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition line-clamp-1">
                      {vehicleYear} {vehicleMake} {vehicleModel}
                    </h4>

                    {/* Metadata pills */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span>{vehicleFuel}</span>
                      <span>•</span>
                      <span>{Number(vehicleMileage).toLocaleString()} km</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" /> 150-Point
                      </span>
                    </div>
                  </div>

                  {/* Price & Countdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {priceLabel}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-700 tracking-tight">
                        {formatAed(displayPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-red-500" /> Time Left
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-red-600 font-mono">
                        {formatCountdown(auction.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectAuction(auction)}
                    className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLive ? 'Place Bid' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
