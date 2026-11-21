import React from 'react';
import { 
  Gavel, 
  Heart, 
  Trophy, 
  Wallet, 
  TrendingUp, 
  Search, 
  ArrowRight, 
  Clock, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import { Language } from './i18n';

interface BuyerDashboardProps {
  currentUser: User | null;
  auctions?: Auction[];
  vehicles?: Vehicle[];
  favoriteIds?: string[];
  onNavigate?: (view: PortalView, auctionId?: string) => void;
  onSelectAuction?: (auction: Auction) => void;
  onOpenDeposit?: () => void;
  isArabic?: boolean;
  lang?: Language;
  onNavigateToBids?: () => void;
  onNavigateToWon?: () => void;
  onNavigateToDelivery?: () => void;
  onNavigateToPayments?: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  auctions = [],
  vehicles = [],
  favoriteIds = [],
  onNavigate = () => {},
  onSelectAuction = () => {},
  onOpenDeposit = () => {},
  isArabic: isArabicProp = false,
  lang = 'EN',
  onNavigateToBids,
  onNavigateToWon,
  onNavigateToDelivery,
  onNavigateToPayments,
}) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const buyerName = currentUser?.fullName?.split(' ')[0] || 'Buyer';
  const biddingBalance = currentUser?.biddingLimit 
    ? (currentUser.biddingLimit - (currentUser.usedBiddingLimit || 0))
    : (currentUser?.securityDeposit ? currentUser.securityDeposit * 200 : 425000);

  // Derive counts
  const activeAuctions = auctions.filter((a) => a.status === 'ACTIVE');
  const userActiveBids = 12; // derived or mock
  const userWonAuctions = 5;

  const formatAed = (amount: number) => `AED ${Number(amount).toLocaleString('en-US')}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified Buyer Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isArabic ? `مرحباً بك، ${buyerName}!` : `Welcome back, ${buyerName}!`}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {isArabic 
              ? 'تابع مزايداتك المباشرة، رصيد الضمان البنكي، ومواعيد استلام المركبات الرابحة.'
              : 'Track your real-time bids, UAE escrow limit, and delivery appointments.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            Browse Auctions
          </button>
          <button
            onClick={onOpenDeposit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Add Escrow Deposit
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Card 1: Active Bids */}
        <div 
          onClick={onNavigateToBids || (() => onNavigate('MY_BIDS'))}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition shadow-sm hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Bids</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <Gavel className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{userActiveBids}</div>
          <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 8 Leading • 4 Outbid
          </div>
        </div>

        {/* Card 2: Watchlist */}
        <div 
          onClick={() => onNavigate('FAVORITES')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition shadow-sm hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Watchlist</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition">
              <Heart className="w-5 h-5 fill-red-400/20" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{favoriteIds.length || 3}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Saved lots ending soon
          </div>
        </div>

        {/* Card 3: Won Auctions */}
        <div 
          onClick={onNavigateToWon || (() => onNavigate('WON_AUCTIONS'))}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition shadow-sm hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Won Auctions</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{userWonAuctions}</div>
          <div className="text-xs text-amber-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 3 Ready for Collection
          </div>
        </div>

        {/* Card 4: Bidding Balance */}
        <div 
          onClick={onOpenDeposit}
          className="bg-gradient-to-br from-slate-800 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 cursor-pointer transition shadow-sm hover:border-emerald-400 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Bidding Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {formatAed(biddingBalance)}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            UAE Escrow Deposit Limit
          </div>
        </div>
      </div>

      {/* Middle Row: Live Auctions & Bidding Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Cols: Live Auctions Quick Grid */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Live Auctions for Immediate Bidding</h3>
            </div>
            <button
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
            >
              View All (300) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeAuctions.slice(0, 3).map((auc) => {
              const v = auc.vehicle || vehicles.find((item) => item.id === auc.vehicleId);
              const price = auc.currentHighestBid || auc.startPrice || 35000;
              const photo = v?.mediaPaths?.[0] || (v as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804703088?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={auc.id}
                  onClick={() => onSelectAuction(auc)}
                  className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-950">
                    <img 
                      src={photo} 
                      alt={v?.model || 'Vehicle'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition" 
                    />
                    <div className="absolute top-2 left-2 bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      LIVE
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-bold text-white text-xs truncate">
                      {v?.manufacturingYear || (v as any)?.year || 2023} {v?.make || 'Toyota'} {v?.model || 'Fortuner 4x4'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {Number(v?.odometerReadingKm || (v as any)?.mileage || 48000).toLocaleString()} km • {v?.fuelType || 'PETROL'}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Bid</span>
                        <span className="text-sm font-extrabold text-emerald-400">{formatAed(price)}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAuction(auc);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Bidding Activity Chart */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bidding Activity</h3>
              <span className="text-xs text-slate-400">Nov 01 - Nov 21</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-white">42 Bids</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4%
              </span>
            </div>

            {/* Visual SVG Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-slate-700">
              {[25, 40, 30, 55, 70, 45, 80, 95, 60, 85].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-400 transition"
                    title={`Day ${idx + 1}: ${val} bids`}
                  />
                  <span className="text-[9px] text-slate-500 font-mono">D{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>High activity in Commercial & SUVs</span>
            <button 
              onClick={() => onNavigate('MY_BIDS')}
              className="text-emerald-400 font-bold hover:underline"
            >
              View Bid Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Quick Workflows Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('MY_BIDS')}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">My Active Bids</h4>
              <p className="text-xs text-slate-400">Monitor leading vs outbid lots</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('PAYMENTS')}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Payments & Invoices</h4>
              <p className="text-xs text-slate-400">Download UAE wire receipts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('DELIVERY_COLLECTION')}
          className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Delivery & Collection</h4>
              <p className="text-xs text-slate-400">Book yard collection slot & QR gate pass</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
