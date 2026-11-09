import { getAssetUrl } from '../utils/assets';
import React, { useState, useEffect, useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import { 
  Clock, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Search, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Truck, 
  Car, 
  Flame, 
  Sparkles, 
  Calendar,
  Fuel,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  FileCheck,
  Lock
} from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

interface HomePageProps {
  vehicles: Vehicle[];
  auctions: Auction[];
  currentUser: User | null;
  onSelectAuction: (auction: Auction) => void;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
  onQuickLogin?: (role: 'BUYER' | 'SELLER' | 'ADMIN') => void;
  onOpenCreateVehicle: () => void;
  searchFilter: string;
  onNavigate: (view: PortalView) => void;
  onRequireAuth: () => void;
  onOpenBidModal?: (auction: Auction) => void;
  onViewDetails?: (auction: Auction, vehicle: Vehicle) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (vehicleId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  vehicles,
  auctions,
  currentUser,
  onSelectAuction,
  onOpenAuth,
  onOpenDeposit,
  onQuickLogin,
  onOpenCreateVehicle,
  searchFilter,
  onNavigate,
  onRequireAuth,
  onOpenBidModal,
  onViewDetails,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  // Tabs for Featured Auctions
  const [activeTab, setActiveTab] = useState<'recommended' | 'ending' | 'favorites' | 'new' | 'hot'>('ending');
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Local fallback Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteIds));

  // Sync with prop when favoriteIds changes
  useEffect(() => {
    setFavorites(new Set(favoriteIds));
  }, [favoriteIds]);

  // Real-time ticking timer for countdowns
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in as a buyer to save favorite vehicles to your watchlist.');
      initiateKeycloakLogin({ action: 'login' });
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Favorites are exclusive to Buyer accounts.');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(targetId);
    } else {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(targetId)) {
          next.delete(targetId);
        } else {
          next.add(targetId);
        }
        return next;
      });
    }
  };

  // Bid Button Handler with Authentication & Auction Expiry Validation
  const handleBidClick = (auc: Auction) => {
    const isEnded = auc.status === 'ENDED' || auc.status === 'COMPLETED' || (auc.endTime && new Date(auc.endTime).getTime() <= Date.now());
    if (isEnded) {
      alert('This auction has ended and is closed for bidding.');
      return;
    }
    if (!currentUser) {
      // Must be authenticated to bid -> Redirect to Auth modal
      onRequireAuth();
    } else {
      onSelectAuction(auc);
    }
  };

  // Dynamic Category Counts from Backend API Catalog Data
  const onlineAuctionsCount = auctions.filter(
    (a) => a.status === 'ACTIVE' && (!a.auctionType || a.auctionType === 'ONLINE')
  ).length;

  const silentAuctionsCount = auctions.filter(
    (a) => a.status === 'ACTIVE' && a.auctionType === 'SILENT'
  ).length;

  const uaePlatesCount = vehicles.filter(
    (v) => (v as any).category === 'PLATES'
  ).length;

  const machineryCount = vehicles.filter(
    (v) => (v as any).category === 'MACHINERY'
  ).length;

  const emiratesMotoCount = vehicles.filter(
    (v) => (v as any).category === 'EMIRATES_MOTO'
  ).length;

  // Currency Formatter: Dual AED & INR format
  const formatCurrency = (val: number) => {
    const aed = new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0,
    }).format(Math.round(val / 22.5)); // 1 AED ~ 22.5 INR

    const inr = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

    return { aed, inr };
  };

  // Format remaining time in DDd : HHh : MMm : SSs
  const formatCountdown = (endTimeStr: string) => {
    const end = new Date(endTimeStr).getTime();
    const diff = Math.max(0, end - now);
    if (diff <= 0) return '00h : 00m : 00s (Ended)';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  // Filtered auctions based on user inputs - dynamically sorted by bid activity and limited to avoid heavy browser load
  const filteredAuctions = useMemo(() => {
    let result = auctions.filter((auc) => {
      const v = auc.vehicle || vehicles.find((item) => item.id === auc.vehicleId);
      if (!v) return false;

      // Search query from Navbar
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matchesSearch =
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registrationNumber.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          auc.id.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Category Filter
      if (selectedCategory === 'TRUCK' && v.vehicleType !== 'TRUCK') return false;
      if (selectedCategory === 'CAR' && v.vehicleType !== 'CAR') return false;
      if (selectedCategory === 'ONLINE' && auc.status !== 'ACTIVE') return false;

      // Tab Filter
      if (activeTab === 'favorites') {
        return favorites.has(auc.id);
      }
      if (activeTab === 'ending') {
        return auc.status === 'ACTIVE';
      }

      return true;
    });

    // In Ending Soon tab: prioritize most bidded vehicles dynamically
    if (activeTab === 'ending') {
      result = [...result].sort((a, b) => {
        const aBidActivity = (a.currentHighestBid || a.startPrice || 0) - (a.startPrice || 0);
        const bBidActivity = (b.currentHighestBid || b.startPrice || 0) - (b.startPrice || 0);
        if (bBidActivity !== aBidActivity) {
          return bBidActivity - aBidActivity; // Most bidded vehicles first
        }
        const aEnd = a.endTime ? new Date(a.endTime).getTime() : Infinity;
        const bEnd = b.endTime ? new Date(b.endTime).getTime() : Infinity;
        return aEnd - bEnd; // Closest ending time next
      });
      return result.slice(0, 9);
    }

    if (activeTab === 'hot') {
      result = [...result].sort((a, b) => {
        const aDiff = (a.currentHighestBid || 0) - (a.startPrice || 0);
        const bDiff = (b.currentHighestBid || 0) - (b.startPrice || 0);
        return bDiff - aDiff;
      });
      return result.slice(0, 9);
    }

    if (activeTab === 'new') {
      result = [...result].sort((a, b) => {
        const aStart = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bStart = b.startTime ? new Date(b.startTime).getTime() : 0;
        return bStart - aStart;
      });
      return result.slice(0, 9);
    }

    // Default limit on homepage to avoid excessive DOM nodes and optimize performance
    return result.slice(0, 9);
  }, [auctions, vehicles, searchFilter, selectedCategory, activeTab, favorites]);

  return (
    <div className="w-full bg-white text-[#231F20] flex flex-col font-sans">
      
      {/* ============================================================ */}
      {/* 1. HERO BANNER SECTION (MATCHING Home.html & Screenshot 5)   */}
      {/* ============================================================ */}
      <section className="relative w-full bg-white">
        <div className="w-full relative">
          <img 
            src={getAssetUrl("/assets/banner-aj.png")} 
            alt="AJ Auctions Live Portal - Powered by AshwikTechnologies" 
            className="w-full h-auto object-cover object-center block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=2000';
            }}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. AUCTION CATEGORIES SECTION (MATCHING SCREENSHOT 4)        */}
      {/* ============================================================ */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h3 className="header-title">Auction Categories</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            
            {/* 1. Online Auctions -> Redirects to Screenshot 1 */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="category-box-card cursor-pointer transition hover:border-[#D32437] hover:shadow-lg"
              title="Click to view Online Auctions"
            >
              <img 
                src={getAssetUrl("/assets/fe269555-a276-4a8e-ae09-0086ce7182f4")} 
                alt="Online Auctions" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain" 
              />
              <div className="category-title text-[#231F20] font-bold text-base sm:text-lg">
                Online Auctions
              </div>
              {onlineAuctionsCount > 0 && (
                <span className="text-[#D32437] font-extrabold text-sm sm:text-base mt-1">
                  {onlineAuctionsCount}
                </span>
              )}
            </div>

            {/* 2. Silent Auctions -> Redirects to Screenshot 2 */}
            <div 
              onClick={() => onNavigate('SILENT_AUCTIONS')}
              className="category-box-card cursor-pointer transition hover:border-[#D32437] hover:shadow-lg"
              title="Click to view Silent Auctions"
            >
              <img 
                src={getAssetUrl("/assets/bce339dd-501f-4cc7-bd91-26f4631313fe")} 
                alt="Silent Auctions" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain" 
              />
              <div className="category-title text-[#231F20] font-bold text-base sm:text-lg">
                Silent Auctions
              </div>
              {silentAuctionsCount > 0 && (
                <span className="text-[#D32437] font-extrabold text-sm sm:text-base mt-1">
                  {silentAuctionsCount}
                </span>
              )}
            </div>

            {/* 3. UAE Plates */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="category-box-card cursor-pointer transition hover:border-[#D32437] hover:shadow-lg"
              title="Click to view UAE Plates"
            >
              <img 
                src={getAssetUrl("/assets/5ef79d4a-517b-4611-803f-ef1f1d525bad")} 
                alt="UAE Plates" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain" 
              />
              <div className="category-title text-[#231F20] font-bold text-base sm:text-lg">
                UAE Plates
              </div>
              {uaePlatesCount > 0 && (
                <span className="text-[#D32437] font-extrabold text-sm sm:text-base mt-1">
                  {uaePlatesCount}
                </span>
              )}
            </div>

            {/* 4. Equipment & Machinery */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="category-box-card cursor-pointer transition hover:border-[#D32437] hover:shadow-lg"
              title="Click to view Equipment & Machinery"
            >
              <img 
                src={getAssetUrl("/assets/86a1f35d-21a6-456a-9def-afdda7c00db1")} 
                alt="Equipment & Machinery" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain" 
              />
              <div className="category-title text-[#231F20] font-bold text-base sm:text-lg">
                Equipment & Machinery
              </div>
              {machineryCount > 0 && (
                <span className="text-[#D32437] font-extrabold text-sm sm:text-base mt-1">
                  {machineryCount}
                </span>
              )}
            </div>

            {/* 5. AJ Commercial Fleet */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="category-box-card cursor-pointer transition hover:border-[#D32437] hover:shadow-lg"
              title="Click to view AJ Commercial Fleet"
            >
              <img 
                src={getAssetUrl("/assets/675669d9-9129-4db2-abf2-61290e96e4da")} 
                alt="AJ Commercial Fleet" 
                className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain" 
              />
              <div className="category-title text-[#231F20] font-bold text-base sm:text-lg">
                AJ Commercial Fleet
              </div>
              {emiratesMotoCount > 0 && (
                <span className="text-[#D32437] font-extrabold text-sm sm:text-base mt-1">
                  {emiratesMotoCount}
                </span>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Signature Home Divider */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 3. FEATURED AUCTIONS SECTION (CORE ENGINE HOOK)              */}
      {/* ============================================================ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row with View All */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="header-title">Featured Auctions</h3>
            <button
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="text-[#D32437] font-bold text-base sm:text-lg hover:underline cursor-pointer"
            >
              VIEW ALL &rarr;
            </button>
          </div>

          {/* Navigation Filter Tabs matching Home.html */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 mb-6 scrollbar-none">
            
            <button
              onClick={() => setActiveTab('ending')}
              className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'ending'
                  ? 'bg-[#D32437] text-white shadow-md'
                  : 'bg-[#EBEBEB] text-[#5F5F5F] hover:bg-slate-200'
              }`}
            >
              Ending Soon ({activeTab === 'ending' ? filteredAuctions.length : Math.min(9, auctions.filter(a => a.status === 'ACTIVE').length)})
            </button>

            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'recommended'
                  ? 'bg-[#D32437] text-white shadow-md'
                  : 'bg-[#EBEBEB] text-[#5F5F5F] hover:bg-slate-200'
              }`}
            >
              Recommended
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-[#D32437] text-white shadow-md'
                  : 'bg-[#EBEBEB] text-[#5F5F5F] hover:bg-slate-200'
              }`}
            >
              Newly Listed ({vehicles.length})
            </button>

            <button
              onClick={() => setActiveTab('hot')}
              className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'hot'
                  ? 'bg-[#D32437] text-white shadow-md'
                  : 'bg-[#EBEBEB] text-[#5F5F5F] hover:bg-slate-200'
              }`}
            >
              Hot Items
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'BUYER') {
                  onNavigate('FAVORITES');
                } else {
                  setActiveTab('favorites');
                }
              }}
              className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-[#D32437] text-white shadow-md'
                  : 'bg-[#EBEBEB] text-[#5F5F5F] hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-white' : ''}`} />
              <span>Your Favorites ({favoriteIds.length > 0 ? favoriteIds.length : favorites.size})</span>
            </button>

          </div>

          {/* Auction Cards Grid */}
          {filteredAuctions.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#D1D5DB] rounded-2xl bg-[#F9FAFB]">
              <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-[#231F20]">No Auctions Found</h4>
              <p className="text-sm text-[#6B6B6B] mt-1 max-w-md mx-auto">
                No vehicles match the selected criteria or filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setActiveTab('ending');
                }}
                className="mt-4 px-4 py-2 bg-[#D32437] text-white rounded-lg text-xs font-bold hover:bg-[#b51a2b] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAuctions.map((auc) => {
                const vehicle = auc.vehicle || vehicles.find((v) => v.id === auc.vehicleId);
                if (!vehicle) return null;

                const isTruck = vehicle.vehicleType === 'TRUCK';
                const isLiked = favoriteIds.includes(vehicle.id) || favoriteIds.includes(auc.id) || favorites.has(auc.id) || favorites.has(vehicle.id);
                const currentBid = auc.currentHighestBid || auc.startPrice;
                const priceObj = formatCurrency(currentBid);
                const isEnded = auc.status === 'ENDED' || auc.status === 'COMPLETED' || (new Date(auc.endTime).getTime() <= now);
                const isLeading = Boolean(
                  currentUser && (
                    auc.highestBidderId === currentUser.id ||
                    auc.highestBidderId === currentUser.email ||
                    (auc.highestBidderId && currentUser.email && auc.highestBidderId.toLowerCase() === currentUser.email.toLowerCase()) ||
                    (auc.highestBidderId && (currentUser as any).username && auc.highestBidderId === (currentUser as any).username)
                  )
                );

                const fallbackImg = isTruck
                  ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
                  : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';

                const displayImg = vehicle.mediaPaths && vehicle.mediaPaths.length > 0
                  ? vehicle.mediaPaths[0]
                  : fallbackImg;

                return (
                  <div 
                    key={auc.id} 
                    className={`awa-car-card group flex flex-col justify-between transition-all duration-300 ${
                      isLeading 
                        ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-100/50 bg-emerald-50/10' 
                        : 'bg-white'
                    }`}
                  >
                    
                    {/* Media Thumbnail & Badges */}
                    <div 
                      onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                      className="relative overflow-hidden bg-slate-100 cursor-pointer"
                    >
                      <img 
                        src={displayImg} 
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        className="car-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImg;
                        }}
                      />

                      {/* Live vs Ended Badge */}
                      {isEnded ? (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-white rounded-md shadow-xs border border-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span className="text-[11px] font-bold text-slate-200 tracking-wider">
                            AUCTION ENDED
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-md shadow-xs border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-[#D32437] beacon-pulse" />
                          <span className="text-[11px] font-bold text-[#D32437] tracking-wider">
                            LIVE
                          </span>
                        </div>
                      )}

                      {/* Leading Bidder Badge */}
                      {isLeading && (
                        <div className="absolute top-3 right-16 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-md shadow-md font-bold text-[10px] tracking-wide animate-pulse z-10">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>YOU ARE WINNING</span>
                        </div>
                      )}

                      {/* Vehicle Type Pill */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded uppercase">
                        {vehicle.vehicleType}
                      </div>

                      {/* Registration Plate Tag */}
                      <div className="absolute bottom-2 left-3 bg-black/70 text-white font-mono text-[11px] px-2 py-0.5 rounded backdrop-blur-xs">
                        {vehicle.registrationNumber}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      
                      <div>
                        {/* Title */}
                        <h4 
                          onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                          className="awa-car-title cursor-pointer hover:text-[#D32437] transition" 
                          title={`${vehicle.manufacturingYear} ${vehicle.make} ${vehicle.model}`}
                        >
                          {vehicle.manufacturingYear} {vehicle.make} {vehicle.model}
                        </h4>

                        {/* View Details Link */}
                        <div className="mb-2">
                          <button
                            onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                            className="text-xs text-[#0D74B5] font-semibold hover:underline cursor-pointer"
                          >
                            View Details & Inspection Report &rarr;
                          </button>
                        </div>

                        {/* Real-time Countdown or Ended Notice */}
                        {isEnded ? (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold mb-3 bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Auction Closed (00h : 00m : 00s)</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-xs text-[#D32437] font-bold mb-3 bg-red-50 px-2.5 py-1.5 rounded-md">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            <span>Ends in: {formatCountdown(auc.endTime)}</span>
                          </div>
                        )}

                        {/* Spec Table */}
                        <div className="space-y-1.5 text-xs border-t border-[#F0F0F0] pt-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B]">Lot#:</span>
                            <span className="font-semibold text-[#231F20] font-mono">
                              AJ-{auc.id.substring(0, 6).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B]">Odometer:</span>
                            <span className="font-semibold text-[#231F20]">
                              {Number(vehicle.odometerReadingKm).toLocaleString()} KM
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B]">Location:</span>
                            <span className="font-semibold text-[#231F20]">
                              Dubai Yard 4 / Central Hub
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B]">Min Increment:</span>
                            <span className="font-semibold text-[#231F20]">
                              +₹{auc.minBidIncrement.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Bid Actions */}
                      <div className="border-t border-[#F0F0F0] pt-3 mt-auto">
                        
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                            Current Bid
                          </span>
                          <div className="text-right">
                            <div className={isLeading ? "text-lg font-extrabold text-emerald-600" : "awa-price"}>
                              {priceObj.aed}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 font-mono">
                              ({priceObj.inr})
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-between gap-3">
                          
                          {/* Heart Like Button (Buyer Exclusive) */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(vehicle.id || auc.id, e)}
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                              isLiked 
                                ? 'border-[#D32437] bg-red-50 text-[#D32437] shadow-xs scale-105' 
                                : 'border-[#D1D5DB] text-slate-400 hover:border-[#D32437] hover:text-[#D32437] hover:bg-red-50/20'
                            }`}
                            title={
                              !currentUser
                                ? 'Sign in to add to favorites'
                                : currentUser.role !== 'BUYER'
                                  ? 'Favorites are exclusive to Buyer accounts'
                                  : isLiked
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                            }
                          >
                            <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-[#D32437] text-[#D32437]' : ''}`} />
                          </button>

                          {/* Green BID NOW Button or Disabled AUCTION ENDED button or WINNING (RAISE) button */}
                          {isEnded ? (
                            <button
                              disabled
                              className="flex-1 bg-slate-200 text-slate-500 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-90 text-sm"
                              title="This auction has concluded"
                            >
                              <Lock className="w-4 h-4 mr-1 text-slate-500" />
                              <span>AUCTION ENDED</span>
                            </button>
                          ) : isLeading ? (
                            <button
                              onClick={() => onOpenBidModal ? onOpenBidModal(auc) : handleBidClick(auc)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer transition text-sm"
                              title="You are currently leading this auction! Click to raise your bid."
                            >
                              <CheckCircle className="w-4 h-4 mr-1 text-white" />
                              <span>WINNING (RAISE)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenBidModal ? onOpenBidModal(auc) : handleBidClick(auc)}
                              className="flex-1 awa-bidnow-btn flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                            >
                              <span>BID NOW</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Signature Home Divider */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 4. HOW IT WORKS SECTION (WITH DASHED CONNECTOR LINES)        */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h3 className="header-title">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div 
              onClick={() => onNavigate('SIGNUP')}
              className="relative flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-2xl bg-[#FFF0F0] border border-[#D8D8D8] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition duration-300">
                <img 
                  src={getAssetUrl("/assets/00c7c84b-d9f1-4983-ac01-a7d747c1ff25")} 
                  alt="Sign Up" 
                  className="w-12 h-12 object-contain" 
                />
              </div>

              {/* Dashed line to next step (desktop only) */}
              <div className="hidden lg:block awa-step-line">
                <div className="awa-dot left-0" />
                <div className="awa-dot right-0" />
              </div>

              <h5 className="text-xl font-bold text-[#231F20] mb-2 group-hover:text-[#D32437] transition">
                Sign Up & Verify Account
              </h5>
              <p className="text-sm text-[#525252] leading-relaxed max-w-xs">
                Create your account and complete verification in minutes to start bidding on verified commercial fleets.
              </p>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="relative flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-2xl bg-[#D32437] text-white flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-105 transition duration-300">
                <img 
                  src={getAssetUrl("/assets/cb350ffd-8d57-4009-adce-8aba2c411f4f")} 
                  alt="Browse & Bid" 
                  className="w-12 h-12 object-contain brightness-0 invert" 
                />
              </div>

              {/* Dashed line */}
              <div className="hidden lg:block awa-step-line">
                <div className="awa-dot left-0" />
                <div className="awa-dot right-0" />
              </div>

              <h5 className="text-xl font-bold text-[#231F20] mb-2 group-hover:text-[#D32437] transition">
                Browse & Place Bids
              </h5>
              <p className="text-sm text-[#525252] leading-relaxed max-w-xs">
                Explore our extensive inventory and place competitive bids in real time through our ultra low-latency engine.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[#FFF0F0] border border-[#D8D8D8] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition duration-300">
                <img 
                  src={getAssetUrl("/assets/07c7207b-3c38-41cf-9e31-57f80dcc12db")} 
                  alt="Win & Pay" 
                  className="w-12 h-12 object-contain" 
                />
              </div>

              {/* Dashed line */}
              <div className="hidden lg:block awa-step-line">
                <div className="awa-dot left-0" />
                <div className="awa-dot right-0" />
              </div>

              <h5 className="text-xl font-bold text-[#231F20] mb-2">
                Win & Make Payment
              </h5>
              <p className="text-sm text-[#525252] leading-relaxed max-w-xs">
                Won the auction? Complete your payment securely through our audited multi-gateway payment broker.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[#D32437] text-white flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-105 transition duration-300">
                <img 
                  src={getAssetUrl("/assets/5fd3594e-0310-4495-acd4-d589cd227541")} 
                  alt="Get Delivered" 
                  className="w-12 h-12 object-contain brightness-0 invert" 
                />
              </div>

              <h5 className="text-xl font-bold text-[#231F20] mb-2">
                Get Your Car Delivered
              </h5>
              <p className="text-sm text-[#525252] leading-relaxed max-w-xs">
                Sit back and relax as our certified logistics partners handle delivery right to your facility or doorstep.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Signature Home Divider */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 5. VALUE - ADDED SERVICES SECTION                            */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h3 className="header-title">Value - Added Services</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            
            {/* 1. Vehicle Inspection */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/b5b6d6da-3df8-4516-a4aa-66abfe19451e")} 
                alt="Vehicle Inspection" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                Vehicle Inspection
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">150-Point Check</span>
            </div>

            {/* 2. Vehicle Delivery */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/b0419777-c596-4c0d-a3b9-e8c436133492")} 
                alt="Vehicle Delivery" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                Vehicle Delivery
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">Insured Flatbed</span>
            </div>

            {/* 3. Ownership Transfer */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/d718d82f-1747-4777-89d8-46abe84eaa5c")} 
                alt="Ownership Transfer" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                Ownership Transfer
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">RTA / RTO Clearance</span>
            </div>

            {/* 4. Polishing & Detailing */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/bcbbbad9-537a-4188-a17c-378965a58b5f")} 
                alt="Polishing & Detailing" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                Polishing & Detailing
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">Ceramic Restore</span>
            </div>

            {/* 5. Maintenance & Repairs */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/e2b1f032-a2cb-400c-81b9-ca877f8db85d")} 
                alt="Maintenance & Repairs" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                Maintenance & Repairs
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">Certified Overhaul</span>
            </div>

            {/* 6. More Services */}
            <div 
              onClick={() => onNavigate('HELP')}
              className="category-box-card group cursor-pointer hover:border-[#D32437]"
            >
              <img 
                src={getAssetUrl("/assets/1ca9a478-4a75-4ee6-91de-f6b97023ece9")} 
                alt="More Services" 
                className="w-14 h-14 mb-4 object-contain group-hover:scale-110 transition" 
              />
              <div className="text-sm font-bold text-[#231F20] text-center">
                More Services
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1">Financing & Trade-in</span>
            </div>

          </div>

        </div>
      </section>

      {/* Signature Home Divider */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 6. TESTIMONIALS & TRUST SECTION                              */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="header-title">Customer Testimonials</h3>
            <span className="text-sm font-bold text-[#D32437] flex items-center gap-1 cursor-pointer hover:underline">
              <span>5.0 Star Rated (4,820+ Reviews)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
              <h5 className="font-bold text-[#231F20] text-base mb-2">
                "Smooth Bidding, Great Finds at AJ Auctions!"
              </h5>
              <p className="text-xs text-[#525252] leading-relaxed mb-4">
                "I had a fantastic buying experience with AJ Auctions! The platform was user-friendly, offering a wide variety of commercial vehicles. The bidding process was smooth, and the AshwikTechnologies team provided excellent support."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-[#F3F4F6]">
                <div className="w-9 h-9 rounded-full bg-red-100 text-[#D32437] font-bold flex items-center justify-center text-sm">
                  MA
                </div>
                <div>
                  <div className="text-xs font-bold text-[#231F20]">Mohammed Al-Mansoor</div>
                  <div className="text-[10px] text-[#6B6B6B]">Fleet Director, Gulf Logistics LLC</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
              <h5 className="font-bold text-[#231F20] text-base mb-2">
                "Effortless Selling & Fast Settlements"
              </h5>
              <p className="text-xs text-[#525252] leading-relaxed mb-4">
                "Selling through AJ Auctions was a breeze! Listing our 40-truck fleet was simple, and the bidding process attracted serious corporate buyers quickly. The team’s support was top-notch throughout."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-[#F3F4F6]">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-[#231F20]">Rajesh Sharma</div>
                  <div className="text-[10px] text-[#6B6B6B]">Managing Partner, Sharma Transport</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
              <h5 className="font-bold text-[#231F20] text-base mb-2">
                "Outstanding Support & Transparent History"
              </h5>
              <p className="text-xs text-[#525252] leading-relaxed mb-4">
                "AJ Auctions provided exceptional customer service! Every lot had detailed 150-point inspection documentation. Real-time WebSocket bids updated without a single hiccup. Highly recommended!"
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-[#F3F4F6]">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  TK
                </div>
                <div>
                  <div className="text-xs font-bold text-[#231F20]">Tariq Khan</div>
                  <div className="text-[10px] text-[#6B6B6B]">Operations Lead, Apex Logistics & Haulage</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Signature Home Divider */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 7. MOBILE APP DOWNLOAD SECTION                               */}
      {/* ============================================================ */}
      <section className="py-14 bg-[#FFF0F0]/50 border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 rounded-full text-xs font-bold text-[#D32437] mb-3">
                <span>AJ Auctions On The Go</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#231F20] mb-3">
                Bid From Anywhere With Our Mobile App
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed mb-6">
                Receive real-time outbid notifications, watch live camera streams, place auto-bids, and manage payments straight from your smartphone.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href="#appstore" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/appstore.png")} alt="Download on App Store" className="h-11 w-auto" />
                </a>
                <a href="#googleplay" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/googleplay.png")} alt="Get it on Google Play" className="h-11 w-auto" />
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="bg-white p-4 rounded-2xl shadow-md border border-red-100 text-center">
                <img 
                  src={getAssetUrl("/assets/main_logo-aj.png")} 
                  alt="AJ Auctions Mobile App" 
                  className="h-10 mx-auto mb-2" 
                />
                <div className="text-xs font-bold text-[#231F20]">Scan to Download</div>
                <div className="text-[10px] text-[#6B6B6B]">iOS & Android Compatible</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. ENTERPRISE FOOTER MATCHING Home.html                     */}
      {/* ============================================================ */}
      <footer className="bg-[#F5F6F7] border-t border-[#E5E7EB] pt-14 pb-8 text-[#6B6B6B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1: Brand & About */}
            <div>
              <img 
                src={getAssetUrl("/assets/main_logo-aj.png")} 
                alt="AJ Auctions • Powered by AshwikTechnologies" 
                className="h-11 w-auto mb-4" 
              />
              <p className="text-sm leading-relaxed text-[#6B6B6B] mb-4">
                AJ Auctions, powered by AshwikTechnologies, is a premier UAE & international commercial vehicle and heavy equipment auction platform, offering high-throughput digital bidding solutions for enterprises, fleets, and individual buyers.
              </p>
              <div className="text-xs text-slate-500">
                Licensed & powered by AshwikTechnologies Enterprise Platform.
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h5 className="text-base font-bold text-[#231F20] mb-4">
                Quick Links
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer">
                    About AJ Auctions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ONLINE_AUCTIONS')} className="hover:text-[#D32437] transition cursor-pointer">
                    Active Commercial Auctions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer">
                    Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer">
                    Bidding Rules & KYC Compliance
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer">
                    Yard Locations (Dubai, Abu Dhabi, Delhi)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Support & Contact */}
            <div>
              <h5 className="text-base font-bold text-[#231F20] mb-4">
                Support & Inquiries
              </h5>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2.5">
                  <img src={getAssetUrl("/assets/wtsapp.png")} alt="WhatsApp" className="w-5 h-5" />
                  <a href="tel:+9718006006" className="hover:text-[#D32437] font-semibold text-[#231F20] transition">
                    +971 8006006 (WhatsApp 24/7)
                  </a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <img src={getAssetUrl("/assets/email.png")} alt="Email" className="w-5 h-5" />
                  <a href="mailto:support@ashwiktechnologies.com" className="hover:text-[#D32437] transition">
                    support@ashwiktechnologies.com
                  </a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <img src={getAssetUrl("/assets/phone.png")} alt="Phone" className="w-5 h-5" />
                  <a href="tel:+9718006006" className="hover:text-[#D32437] transition">
                    Toll Free: 800 6006
                  </a>
                </li>
                <li className="flex items-center space-x-2.5">
                  <img src={getAssetUrl("/assets/headphone.png")} alt="Helpdesk" className="w-5 h-5" />
                  <button onClick={() => onNavigate('HELP')} className="hover:text-[#D32437] transition cursor-pointer text-left">
                    Live Bidding Helpdesk
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Follow Us & Mobile Apps */}
            <div>
              <h5 className="text-base font-bold text-[#231F20] mb-4">
                Follow Us
              </h5>
              
              <div className="flex items-center space-x-3 mb-6">
                <a href="https://www.facebook.com/ashwiktechnologies/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition">
                  <img src={getAssetUrl("/assets/logos_facebook.png")} alt="Facebook" className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/ashwiktechnologies.auctions" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition">
                  <img src={getAssetUrl("/assets/instagram.png")} alt="Instagram" className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/channel/UCGtQXjGZIfmGNb-67TnYS4g" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition">
                  <img src={getAssetUrl("/assets/youtube.png")} alt="YouTube" className="w-4 h-4" />
                </a>
              </div>

              <h6 className="text-xs font-bold text-[#231F20] mb-2 uppercase tracking-wider">
                Download Mobile App
              </h6>
              <div className="flex flex-col space-y-2">
                <a href="#appstore" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/appstore.png")} alt="App Store" className="h-9 w-auto" />
                </a>
                <a href="#googleplay" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/googleplay.png")} alt="Google Play" className="h-9 w-auto" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-[#E5E7EB] text-center text-xs text-[#6B6B6B]">
            <p>© 2026 AJ Auctions. Powered by AshwikTechnologies. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default HomePage;
