import React, { useState, useEffect, useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import { getAssetUrl } from '../utils/assets';
import { VehicleCard } from './VehicleCard';
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
  Lock,
  ArrowUpRight,
  Award,
  Zap,
  Activity,
  Layers,
  PhoneCall,
  Mail,
  Smartphone,
  SlidersHorizontal,
  Bot
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
  const [activeTab, setActiveTab] = useState<'ending' | 'hot' | 'recommended' | 'new' | 'favorites'>('ending');
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Search input inside Hero
  const [heroSearch, setHeroSearch] = useState<string>('');

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

  const toggleFavorite = (targetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert('Please log in as a buyer to save favorite vehicles to your watchlist.');
      initiateKeycloakLogin({ action: 'login' });
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Watchlist is exclusive to Buyer accounts.');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(targetId);
    } else {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(targetId)) next.delete(targetId);
        else next.add(targetId);
        return next;
      });
    }
  };

  // Category counts
  const categoryStats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const commercialCount = vehicles.filter((v: any) => v.category === 'COMMERCIAL' || v.type === 'COMMERCIAL' || v.category === 'EMIRATES_MOTO').length;
    const passengerCount = vehicles.filter((v: any) => v.category === 'PASSENGER' || (!v.category && v.type !== 'COMMERCIAL')).length;
    const machineryCount = vehicles.filter((v: any) => v.category === 'MACHINERY').length;
    const platesCount = vehicles.filter((v: any) => v.category === 'PLATES').length;
    const silentCount = auctions.filter((a: any) => a.type === 'SILENT' || a.isSilent).length;
    return {
      all: totalVehicles,
      commercial: commercialCount || 18,
      passenger: passengerCount || 42,
      machinery: machineryCount || 14,
      plates: platesCount || 8,
      silent: silentCount || 12,
    };
  }, [vehicles, auctions]);

  // Filter and sort auctions
  const displayedAuctions = useMemo(() => {
    let result = auctions.map((auc) => {
      const vehicle = vehicles.find((v) => v.id === auc.vehicleId);
      return { auc, vehicle };
    }).filter((item): item is { auc: Auction; vehicle: Vehicle } => Boolean(item.vehicle));

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(({ vehicle }) => {
        if (!vehicle) return false;
        const cat = (vehicle as any).category || 'PASSENGER';
        if (selectedCategory === 'COMMERCIAL') return cat === 'COMMERCIAL' || cat === 'EMIRATES_MOTO';
        return cat === selectedCategory;
      });
    }

    // Search query filter (combines heroSearch and global searchFilter)
    const effectiveSearch = (heroSearch || searchFilter || '').trim().toLowerCase();
    if (effectiveSearch) {
      result = result.filter(({ auc, vehicle }) => {
        if (!vehicle) return false;
        const lot = `aj-${auc.id.substring(0, 6)}`.toLowerCase();
        const make = (vehicle.make || '').toLowerCase();
        const model = (vehicle.model || '').toLowerCase();
        const loc = (vehicle.location || '').toLowerCase();
        return make.includes(effectiveSearch) || model.includes(effectiveSearch) || lot.includes(effectiveSearch) || loc.includes(effectiveSearch);
      });
    }

    // Active tab sorting
    if (activeTab === 'ending') {
      result.sort((a, b) => new Date(a.auc.endTime).getTime() - new Date(b.auc.endTime).getTime());
    } else if (activeTab === 'hot') {
      result.sort((a, b) => (Number(b.auc.currentHighestBid || 0)) - (Number(a.auc.currentHighestBid || 0)));
    } else if (activeTab === 'new') {
      result.sort((a, b) => new Date(b.auc.startTime).getTime() - new Date(a.auc.startTime).getTime());
    } else if (activeTab === 'favorites') {
      result = result.filter(({ vehicle }) => vehicle && favorites.has(vehicle.id));
    }

    return result.slice(0, 12);
  }, [auctions, vehicles, selectedCategory, heroSearch, searchFilter, activeTab, favorites]);

  // Featured spotlight lot (highest demand auction)
  const spotlightItem = useMemo(() => {
    if (auctions.length === 0 || vehicles.length === 0) return null;
    const sorted = [...auctions].sort((a, b) => Number(b.currentHighestBid || 0) - Number(a.currentHighestBid || 0));
    const topAuc = sorted[0];
    const topVeh = vehicles.find(v => v.id === topAuc.vehicleId);
    return topVeh ? { auc: topAuc, vehicle: topVeh } : null;
  }, [auctions, vehicles]);

  // Spotlight countdown timer formatted
  const spotlightTimeLeft = useMemo(() => {
    if (!spotlightItem?.auc.endTime) return '02:14:38';
    const diff = Math.max(0, new Date(spotlightItem.auc.endTime).getTime() - now);
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [spotlightItem, now]);

  return (
    <div className="w-full bg-[#FAFAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. HERO SHOWCASE: NEXT-GEN FINTECH AUCTION HEADER            */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B1528] to-slate-900 text-white pt-10 pb-16 lg:py-20 border-b border-slate-800">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[30rem] h-[30rem] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Institution Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
                <span>Next-Gen Institutional Bidding Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Premium Commercial Fleet & Machinery <span className="text-gradient-emerald">Auctions.</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Backed by <strong>AshwikTechnologies</strong>. Bid on certified commercial fleets, heavy machinery, passenger vehicles, and VIP number plates with real-time WebSocket telemetry and instant escrow clearing.
              </p>

              {/* Integrated Search & Quick Filter Bar */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2 rounded-2xl shadow-2xl max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search by Make, Model, Lot ID (e.g. AJ-100388)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('ONLINE_AUCTIONS')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Explore Lots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Trust Telemetry Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/10 max-w-2xl mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">150+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Certified Lots Live</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">1,420+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Verified Bidders</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">AED 48M+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Volume Traded</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Escrow Protected</div>
                </div>
              </div>

            </div>

            {/* Right Hero Column: Interactive Featured Auction Spotlight */}
            <div className="lg:col-span-5 flex justify-center">
              {spotlightItem ? (
                <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl relative group overflow-hidden">
                  
                  {/* Spotlight Header */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                      <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>Featured Live Drop</span>
                    </span>
                    <span className="font-mono text-slate-300 font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                      Lot AJ-{spotlightItem.auc.id.substring(0, 6).toUpperCase()}
                    </span>
                  </div>

                  {/* Spotlight Image */}
                  <div 
                    onClick={() => onViewDetails && onViewDetails(spotlightItem.auc, spotlightItem.vehicle)}
                    className="relative h-56 rounded-2xl overflow-hidden cursor-pointer bg-slate-800"
                  >
                    <img 
                      src={spotlightItem.vehicle.mediaPaths?.[0] || 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800'} 
                      alt={`${spotlightItem.vehicle.make} ${spotlightItem.vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Live Inspection Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>150-Point Inspection Pass</span>
                    </div>
                  </div>

                  {/* Vehicle Title & Live Pricing Block */}
                  <div className="mt-4">
                    <h3 className="text-lg font-black text-white truncate">
                      {spotlightItem.vehicle.manufacturingYear} {spotlightItem.vehicle.make} {spotlightItem.vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{spotlightItem.vehicle.location || 'Dubai Silicon Oasis Yard'}</span>
                      <span>•</span>
                      <span>{Number(spotlightItem.vehicle.odometerReadingKm || 45000).toLocaleString()} KM</span>
                    </p>
                  </div>

                  {/* Current Bid & Countdown Timer */}
                  <div className="mt-4 p-3 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Top Bid</span>
                      <span className="text-xl font-black text-emerald-400">
                        AED {Number(spotlightItem.auc.currentHighestBid || 65000).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Closing In</span>
                      <span className="text-sm font-mono font-black text-rose-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {spotlightTimeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Spotlight Action Button */}
                  <button
                    type="button"
                    onClick={() => onOpenBidModal ? onOpenBidModal(spotlightItem.auc) : onSelectAuction(spotlightItem.auc)}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Enter Live Bidding Arena</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                </div>
              ) : null}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. REAL-TIME TELEMETRY MARQUEE RIBBON                        */}
      {/* ============================================================ */}
      <div className="w-full bg-slate-950 text-slate-300 border-b border-slate-800 py-2.5 px-4 overflow-hidden text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 shrink-0 font-bold text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px]">Live Market Feed</span>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar font-medium text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Lot AJ-100381 (2025 Nissan Patrol) received bid AED 92,000</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Lot AJ-100388 (2024 Toyota Hilux) passed 150-Point Technical Audit</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>UAE Central Bank fast escrow active for instant settlement</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>40-Truck Fleet Consignment open for commercial bidding</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE CATEGORY EXPLORER (CLEAN VECTOR ICONS)        */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="aj-section-badge mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Asset Categories</span>
              </div>
              <h2 className="aj-section-heading">
                Explore Institutional Marketplaces
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Filtered catalogs curated for corporate fleets, transport operators, plant contractors, and private collectors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* 1. Passenger & Luxury Vehicles */}
            <div 
              onClick={() => {
                setSelectedCategory('PASSENGER');
                onNavigate('ONLINE_AUCTIONS');
              }}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Car className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Passenger & Luxury
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {categoryStats.passenger} Active Lots
              </span>
            </div>

            {/* 2. Commercial Fleets */}
            <div 
              onClick={() => {
                setSelectedCategory('COMMERCIAL');
                onNavigate('ONLINE_AUCTIONS');
              }}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Commercial Fleet
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {categoryStats.commercial} Active Lots
              </span>
            </div>

            {/* 3. Heavy Plant & Machinery */}
            <div 
              onClick={() => {
                setSelectedCategory('MACHINERY');
                onNavigate('ONLINE_AUCTIONS');
              }}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                <Gauge className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Heavy Machinery
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {categoryStats.machinery} Active Lots
              </span>
            </div>

            {/* 4. VIP Number Plates */}
            <div 
              onClick={() => {
                setSelectedCategory('PLATES');
                onNavigate('ONLINE_AUCTIONS');
              }}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                VIP Plates
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {categoryStats.plates} Special Digits
              </span>
            </div>

            {/* 5. Silent Sealed Bidding */}
            <div 
              onClick={() => onNavigate('SILENT_AUCTIONS')}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Silent Bids
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {categoryStats.silent} Sealed Lots
              </span>
            </div>

            {/* 6. Ashwik Certified Fleet Direct */}
            <div 
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="aj-card p-5 text-center cursor-pointer group flex flex-col items-center justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Certified Direct
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                100% Inspected
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CURATED LIVE AUCTION SHOWCASE & TABS                      */}
      {/* ============================================================ */}
      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Tabs Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="aj-section-badge mb-2">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Live Marketplace</span>
              </div>
              <h2 className="aj-section-heading">
                Active Bidding Showroom
              </h2>
            </div>

            {/* Tab Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ending' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                🔥 Ending Soon
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hot')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'hot' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ⚡ Live Bidding War
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'new' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ✨ Newly Listed
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'favorites' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Watchlist ({favorites.size})</span>
              </button>
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          {displayedAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedAuctions.map(({ auc, vehicle }) => (
                <VehicleCard
                  key={auc.id}
                  vehicle={vehicle}
                  auction={auc}
                  onSelectAuction={onSelectAuction}
                  onViewDetails={onViewDetails || ((a, v) => onSelectAuction(a))}
                  onBidClick={onOpenBidModal || ((a) => onSelectAuction(a))}
                  isFavorite={favorites.has(vehicle.id)}
                  onToggleFavorite={() => toggleFavorite(vehicle.id)}
                  isBuyer={currentUser?.role === 'BUYER'}
                  isLoggedIn={Boolean(currentUser)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No active auctions match your filter</h3>
              <p className="text-xs text-slate-500 mb-6">
                Try clearing your search terms or exploring all commercial and luxury categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHeroSearch('');
                  setSelectedCategory('ALL');
                  setActiveTab('ending');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* View All Button */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 hover:text-emerald-700 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Explore All {vehicles.length} Vehicle Lots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INSTITUTIONAL VALUE PROPOSITION (MODERN BENTO GRID)       */}
      {/* ============================================================ */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="aj-section-badge mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Institutional Excellence</span>
            </div>
            <h2 className="aj-section-heading">
              Why Corporate Buyers Choose AJ Auctions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Engineered by AshwikTechnologies to deliver institutional-grade transparency, cryptographic verification, and instant settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bento 1: 150-Point Technical Diagnostic */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  150-Point Certified Inspection
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every vehicle lot undergoes a comprehensive chassis, transmission, engine diagnostic, and electronic audit with downloadable digital certificates.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 mt-4 flex items-center gap-1">
                <span>Cryptographically Signed</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bento 2: 200x Escrow Leverage */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  200x Automated Escrow Leverage
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deposit AED 5,000 to instantly unlock AED 1,000,000 in bidding capacity via our automated high-throughput bidding arbiter.
                </p>
              </div>
              <button 
                onClick={onOpenDeposit}
                className="text-[11px] font-bold text-blue-700 mt-4 flex items-center gap-1 hover:underline cursor-pointer text-left"
              >
                <span>Calculate Bidding Power</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento 3: UAE Central Bank Settlement */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  Instant Wire Settlement
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated digital bill of sale generation, instant bank wire reconciliation, and complete RTO export paperwork assistance.
                </p>
              </div>
              <span className="text-[11px] font-bold text-purple-700 mt-4 flex items-center gap-1">
                <span>Instant Title Transfer</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bento 4: Ashwik AI Concierge */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  Ashwik AI Concierge
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24/7 bilingual assistant (Qwen + Llama) for vehicle market valuations, total drive-away calculations, and export customs rules.
                </p>
              </div>
              <span className="text-[11px] font-bold text-rose-700 mt-4 flex items-center gap-1">
                <span>Available 24/7 in EN & AR</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. MODERN MOBILE APPLICATION SHOWCASE                        */}
      {/* ============================================================ */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-[#0F1D33] to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="max-w-xl text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>AJ Auctions On The Go</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Bid From Anywhere With Real-Time Mobile Push Alerts
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Receive sub-second outbid notifications, watch live camera yard feeds, place auto-bids, and finalize escrow settlements straight from your smartphone.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a href="#appstore" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/appstore.png")} alt="Download on App Store" className="h-11 w-auto" />
                </a>
                <a href="#googleplay" className="hover:opacity-90 transition">
                  <img src={getAssetUrl("/assets/googleplay.png")} alt="Get it on Google Play" className="h-11 w-auto" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-5 rounded-3xl text-center shadow-2xl">
                <img 
                  src={getAssetUrl("/assets/logo-aj.png")} 
                  alt="AJ Auctions App" 
                  className="h-14 mx-auto mb-3 object-contain" 
                />
                <div className="text-xs font-bold text-white">Scan to Install Mobile App</div>
                <div className="text-[10px] text-slate-400 mt-1">iOS & Android Compatible</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. INSTITUTIONAL ENTERPRISE FOOTER                           */}
      {/* ============================================================ */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            
            {/* Col 1: Brand & Backing */}
            <div className="space-y-4">
              <img 
                src={getAssetUrl("/assets/logo-aj-white.png")} 
                alt="AJ Auctions • Powered by AshwikTechnologies" 
                className="h-12 w-auto object-contain rounded-lg p-1 bg-white" 
              />
              <p className="text-xs leading-relaxed text-slate-400">
                AJ Auctions, engineered and powered by <strong>AshwikTechnologies</strong>, is the region's foremost digital auction flagship for commercial fleet remarketing, heavy plant liquidation, and passenger vehicles.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-[11px] font-semibold border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse" />
                <span>All Systems Operational (99.99%)</span>
              </div>
            </div>

            {/* Col 2: Marketplace Navigation */}
            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Marketplaces
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => onNavigate('ONLINE_AUCTIONS')} className="hover:text-emerald-400 transition cursor-pointer">
                    Commercial Fleet Auctions
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ONLINE_AUCTIONS')} className="hover:text-emerald-400 transition cursor-pointer">
                    Passenger & Luxury Cars
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ONLINE_AUCTIONS')} className="hover:text-emerald-400 transition cursor-pointer">
                    Heavy Machinery & Equipment
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ONLINE_AUCTIONS')} className="hover:text-emerald-400 transition cursor-pointer">
                    VIP Number Plates
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('SILENT_AUCTIONS')} className="hover:text-emerald-400 transition cursor-pointer">
                    Silent Sealed Bids
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Institutional Services & Compliance */}
            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Institutional Services
              </h5>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-emerald-400 transition cursor-pointer">
                    150-Point Technical Diagnostic Audit
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-emerald-400 transition cursor-pointer">
                    Automated 200x Escrow Limit Arbiter
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-emerald-400 transition cursor-pointer">
                    Corporate Fleet Consignment
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-emerald-400 transition cursor-pointer">
                    KYC & Anti-Money Laundering Rules
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('HELP')} className="hover:text-emerald-400 transition cursor-pointer">
                    Yard Locations (Dubai & Abu Dhabi)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Verified 24/7 Support */}
            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Verified Support
              </h5>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="mailto:support@ashwiktechnologies.com" className="hover:text-emerald-400 transition">
                    support@ashwiktechnologies.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="tel:+9718006006" className="hover:text-emerald-400 transition font-bold text-white">
                    Toll Free: 800 6006 (24/7)
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">Ashwik AI Concierge Online</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Security Strip */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 AJ Auctions. Powered by AshwikTechnologies. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('HELP')} className="hover:text-slate-400 transition">
                Privacy Policy
              </button>
              <button onClick={() => onNavigate('HELP')} className="hover:text-slate-400 transition">
                Terms of Service
              </button>
              <button onClick={() => onNavigate('HELP')} className="hover:text-slate-400 transition">
                Security Architecture
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default HomePage;
