import React, { useState, useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import {
  Search,
  Gavel,
  Lock,
  ArrowRight,
  ShieldCheck,
  Car,
  Wallet,
  HelpCircle,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Award,
  Sparkles,
  Heart,
  ShoppingBag,
} from 'lucide-react';

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
  onOpenDeposit,
  onOpenCreateVehicle,
  onNavigate,
  onRequireAuth,
  favoriteIds = [],
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const stats = useMemo(() => {
    const now = Date.now();
    const onlineActive = auctions.filter(
      (a) =>
        a.auctionType !== 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const silentActive = auctions.filter(
      (a) =>
        a.auctionType === 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const inspectedVehicles = vehicles.length;
    return { onlineActive, silentActive, inspectedVehicles };
  }, [auctions, vehicles]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('ONLINE_AUCTIONS');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* ============================================================ */}
      {/* 1. CLEAN INSTITUTIONAL HERO BANNER                           */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#10b981,transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AJ Auctions • UAE Verified Vehicle & Fleet Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Transparent Online &amp; Silent{' '}
              <span className="text-emerald-400">Vehicle Auctions</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Choose an auction channel below to explore 150-point inspected passenger cars, corporate fleets, and commercial vehicles — or submit your vehicle for verified consignment.
            </p>

            {/* Quick Search Bar -> routes into Online Auctions */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="mt-7 max-w-xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-white/20"
            >
              <div className="flex items-center flex-1 px-3">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search make, model, or lot number..."
                  className="w-full py-2 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0"
              >
                Explore Catalog
              </button>
            </form>

            {/* Real Live Database KPI Strip */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 backdrop-blur-xs">
                <div className="text-lg sm:text-2xl font-black text-emerald-400">{stats.onlineActive}</div>
                <div className="text-[11px] text-slate-300 font-semibold">Live Online Lots</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 backdrop-blur-xs">
                <div className="text-lg sm:text-2xl font-black text-amber-300">{stats.silentActive}</div>
                <div className="text-[11px] text-slate-300 font-semibold">Active Silent Lots</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 backdrop-blur-xs">
                <div className="text-lg sm:text-2xl font-black text-white">{stats.inspectedVehicles}</div>
                <div className="text-[11px] text-slate-300 font-semibold">Registered Fleet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PRIMARY AUCTION CHANNEL BOXES (dev-alwataneya.et.ae style) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BOX 1: ONLINE AUCTIONS */}
          <div
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="group bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-7 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Gavel className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{stats.onlineActive} Active Vehicles</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                Online Auctions
              </h2>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Participate in real-time competitive vehicle auctions with live countdowns, verified inspection reports, transparent bid history, and instant outbid notifications.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Live WebSocket Bidding</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">150-Point Reports</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">200x Deposit Power</span>
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-extrabold text-emerald-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                <span>Enter Online Auctions</span>
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs text-slate-400 font-semibold">Open Marketplace →</span>
            </div>
          </div>

          {/* BOX 2: SILENT AUCTIONS */}
          <div
            onClick={() => onNavigate('SILENT_AUCTIONS')}
            className="group bg-white border-2 border-slate-200 hover:border-slate-900 rounded-3xl p-7 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
                  <Lock className="w-3 h-3" />
                  <span>{stats.silentActive} Sealed Lots</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-slate-950 transition-colors">
                Silent Auctions
              </h2>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Submit private, confidential sealed offers on curated corporate &amp; government fleet batches. Competing bids stay hidden until auction closure and award review.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">100% Confidential Offers</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Editable Before Close</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Verified Batch Lots</span>
              </div>
            </div>

            <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                <span>Enter Silent Auctions</span>
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs text-slate-400 font-semibold">Sealed Bidding →</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. QUICK-ACTION PORTAL BOXES                                 */}
        {/* ============================================================ */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Sell Your Car (Auth-Guarded) */}
          <div
            onClick={onOpenCreateVehicle}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sell Your Car</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit your vehicle for inspection, admin verification, and inclusion in our next Online or Silent auction batch.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-3">
                <span>Submit Vehicle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Security Deposit / Buyer Quick Links */}
          {currentUser?.role === 'BUYER' ? (
            <div
              onClick={() => onNavigate('MY_PURCHASES')}
              className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">My Purchases &amp; Payments</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  View your won vehicles, pricing breakdowns, payment history, receipts, and active online or sealed bids.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-3">
                  <span>Open Buyer Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => (currentUser ? onOpenDeposit() : onRequireAuth())}
              className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Security Deposit &amp; 200x Limit</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Top up your 100% refundable security deposit to unlock up to 200x instant bidding power across all auctions.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-3">
                  <span>Manage Deposit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* Buyer Watchlist OR Help Center */}
          {currentUser?.role === 'BUYER' ? (
            <div
              onClick={() => onNavigate('FAVORITES')}
              className="bg-white border border-slate-200 hover:border-red-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-red-600 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  My Watchlist ({favoriteIds.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Track your saved vehicles across Online and Silent auctions in one dedicated buyer watchlist.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 mt-3">
                  <span>View Saved Vehicles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigate('HELP')}
              className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Inspection &amp; Bidding Guide</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Learn about 150-point technical inspections, Online vs Silent auction rules, deposits, and settlement.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-3">
                  <span>Read Help Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HOW AJ AUCTIONS WORKS (4 CLEAN STEPS)                     */}
      {/* ============================================================ */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Simple 4-Step Process</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How AJ Auctions Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                icon: UserPlus,
                title: 'Create Your Account',
                desc: 'Register as a verified Buyer or Seller in seconds with secure identity protection.',
              },
              {
                step: '02',
                icon: CreditCard,
                title: 'Add Security Deposit',
                desc: 'Deposit a 100% refundable security balance to activate 200x bidding power.',
              },
              {
                step: '03',
                icon: Gavel,
                title: 'Bid Online or Silent',
                desc: 'Join real-time Online Auctions or place confidential offers in Silent Auctions.',
              },
              {
                step: '04',
                icon: Award,
                title: 'Win & Settle Instantly',
                desc: 'Track won vehicles, download official receipts, and schedule yard collection.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-300">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
