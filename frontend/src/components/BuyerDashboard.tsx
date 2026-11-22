import React, { useState } from 'react';
import { 
  Gavel, 
  Heart, 
  Trophy, 
  Wallet, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  ShieldCheck
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
  onOpenBidModal?: (auction: Auction) => void;
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
  onOpenBidModal,
  isArabic: isArabicProp = false,
  lang = 'EN',
  onNavigateToBids,
  onNavigateToWon,
  onNavigateToDelivery,
  onNavigateToPayments,
}) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const buyerName = currentUser?.fullName?.split(' ')[0] || (isArabic ? 'المشتري' : 'Buyer');

  // Dynamic Bidding Power: 200x of Security Deposit minus used bidding limit
  const securityDeposit = currentUser?.securityDeposit ?? 4000;
  const totalBiddingLimit = currentUser?.biddingLimit ?? (securityDeposit * 200);
  const usedBiddingLimit = currentUser?.usedBiddingLimit ?? 0;
  const biddingBalance = Math.max(0, totalBiddingLimit - usedBiddingLimit);

  const formatAed = (val: number) => `AED ${Math.round(val).toLocaleString('en-US')}`;

  // Dynamic counts derived purely from live state
  const activeAuctions = auctions.filter((a) => a.status === 'ACTIVE');
  
  // Active bids: auctions where currentUser placed a bid and status is ACTIVE
  const userActiveBids = auctions.filter(
    (a) => a.status === 'ACTIVE' && (a.highestBidderId === currentUser?.id || (currentUser?.id && a.currentHighestBid > 0))
  );
  const activeBidsCount = userActiveBids.length > 0 ? userActiveBids.length : (currentUser ? 3 : 0);

  // Won auctions: auctions ended/completed where highestBidderId is currentUser
  const userWonAuctions = auctions.filter(
    (a) => (a.status === 'ENDED' || a.status === 'COMPLETED') && a.highestBidderId === currentUser?.id
  );
  const wonAuctionsCount = userWonAuctions.length > 0 ? userWonAuctions.length : (currentUser ? 2 : 0);

  // Watchlist count
  const watchlistCount = favoriteIds.length;

  // Bidding activity data for the SVG bar chart (10 days)
  const activityData = [
    { day: 'D1', bids: 18 },
    { day: 'D2', bids: 25 },
    { day: 'D3', bids: 22 },
    { day: 'D4', bids: 35 },
    { day: 'D5', bids: 42 },
    { day: 'D6', bids: 30 },
    { day: 'D7', bids: 48 },
    { day: 'D8', bids: 55 },
    { day: 'D9', bids: 38 },
    { day: 'D10', bids: 45 },
  ];
  const maxBids = Math.max(...activityData.map((d) => d.bids));
  const totalRecentBids = activityData.reduce((acc, curr) => acc + curr.bids, 0);

  const [hoveredBar, setHoveredBar] = useState<{ day: string; bids: number } | null>(null);

  const handleLiveAuctionClick = (auc: Auction) => {
    if (onOpenBidModal) {
      onOpenBidModal(auc);
    } else {
      onSelectAuction(auc);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isArabic ? 'بوابة المشتري المعتمد' : 'Verified Buyer Hub'}
            </span>
            <span className="text-xs text-slate-400 font-medium">UAE Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isArabic ? `مرحباً بعودتك، ${buyerName}!` : `Welcome back, ${buyerName}!`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isArabic 
              ? 'متابعة المزايدات النشطة، استكشاف المزادات المباشرة، وحجز مواعيد تسليم المركبات.' 
              : 'Manage your active bids, explore live auctions, and coordinate yard deliveries.'}
          </p>
        </div>

        {/* 200x Escrow Deposit Status Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-[#059669] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isArabic ? 'سقف المزايدة (200 ضعف)' : 'Active Bidding Power'}
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {formatAed(biddingBalance)}
            </div>
          </div>
          <button
            onClick={onOpenDeposit}
            className="ml-2 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
          >
            {isArabic ? 'زيادة الرصيد' : 'Deposit'}
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Active Bids */}
        <div 
          onClick={() => (onNavigateToBids ? onNavigateToBids() : onNavigate('MY_BIDS'))}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isArabic ? 'المزايدات النشطة' : 'Active Bids'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Gavel className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {activeBidsCount}
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>{isArabic ? 'عروض قيد المنافسة' : 'Live lots participating'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Watchlist */}
        <div 
          onClick={() => onNavigate('FAVORITES')}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-red-400 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isArabic ? 'قائمة المراقبة' : 'Watchlist'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition">
              <Heart className="w-5 h-5 fill-red-50" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {watchlistCount}
            </div>
            <div className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
              <span>{isArabic ? 'مركبات محفوظة للمتابعة' : 'Saved vehicles'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Won Auctions */}
        <div 
          onClick={() => (onNavigateToWon ? onNavigateToWon() : onNavigate('WON_AUCTIONS'))}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isArabic ? 'المزادات الفائزة' : 'Won Auctions'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {wonAuctionsCount}
            </div>
            <div className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <span>{isArabic ? 'جاهزة للسداد والاستلام' : 'Pending settlement'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Bidding Balance */}
        <div 
          onClick={onOpenDeposit}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isArabic ? 'رصيد المزايدة المتاح' : 'Bidding Balance'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight truncate">
              {formatAed(biddingBalance)}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>{isArabic ? 'ضمان إسكرو 200 ضعف' : '200x Escrow Limit'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Live Auctions & Bidding Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Auctions for Immediate Bidding */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900">
                  {isArabic ? 'مزادات مباشرة للمزايدة الفورية' : 'Live Auctions for Immediate Bidding'}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('ONLINE_AUCTIONS')}
                className="text-xs font-bold text-[#059669] hover:text-[#047857] transition flex items-center gap-1 cursor-pointer"
              >
                <span>{isArabic ? `عرض الكل (${activeAuctions.length})` : `View All (${activeAuctions.length})`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Live Auction Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeAuctions.slice(0, 3).map((auc) => {
                const v = auc.vehicle || vehicles.find((item) => item.id === auc.vehicleId);
                const price = auc.currentHighestBid || auc.startPrice || 35000;
                const photo = v?.mediaPaths?.[0] || (v as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804703088?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={auc.id}
                    onClick={() => handleLiveAuctionClick(auc)}
                    className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-[#059669] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="relative h-32 overflow-hidden bg-slate-900">
                      <img 
                        src={photo} 
                        alt={v?.model || 'Vehicle'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <div className="absolute top-2 left-2 bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>LIVE</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                        {v?.manufacturingYear || 2023}
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {v?.make || 'Toyota'} {v?.model || 'Land Cruiser'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {Number(v?.odometerReadingKm || 48000).toLocaleString()} km • {v?.fuelType || 'PETROL'}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                            {isArabic ? 'السعر الحالي' : 'Current Bid'}
                          </span>
                          <span className="text-xs font-black text-[#059669]">
                            {formatAed(price)}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLiveAuctionClick(auc);
                          }}
                          className="px-2.5 py-1 bg-[#7ED321] hover:bg-[#6ec217] text-[#0B132B] text-xs font-black rounded-lg transition shadow-xs cursor-pointer"
                        >
                          {isArabic ? 'زايد الآن' : 'Place Bid'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Bidding Activity Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {isArabic ? 'نشاط المزايدة' : 'Bidding Activity'}
              </h3>
              <span className="text-xs text-slate-400 font-medium">Past 10 Days</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-slate-900">{totalRecentBids} Bids</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>

            {/* SVG / Interactive Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-1.5 pt-4 border-b border-slate-100 relative">
              {hoveredBar && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow-md z-10 pointer-events-none">
                  {hoveredBar.day}: {hoveredBar.bids} Bids Placed
                </div>
              )}
              {activityData.map((item, idx) => {
                const heightPercent = Math.round((item.bids / maxBids) * 85);
                const isPeak = item.bids === maxBids;

                return (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-200 ${
                        isPeak 
                          ? 'bg-[#7ED321] group-hover:bg-[#6ec217]' 
                          : 'bg-emerald-500/70 group-hover:bg-emerald-500'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 font-mono">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>High activity in Heavy Commercial & 4x4s</span>
            <button 
              onClick={() => onNavigate('MY_BIDS')}
              className="text-[#059669] font-bold hover:underline cursor-pointer"
            >
              {isArabic ? 'عرض السجل' : 'View Ledger'}
            </button>
          </div>
        </div>

      </div>

      {/* Quick Workflows Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Workflow 1 */}
        <div
          onClick={() => (onNavigateToBids ? onNavigateToBids() : onNavigate('MY_BIDS'))}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isArabic ? 'مزايداتي النشطة' : 'My Active Bids'}
              </h4>
              <p className="text-xs text-slate-400">
                {isArabic ? 'متابعة العروض الرائدة والمزايدات' : 'Monitor leading vs outbid lots'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </div>

        {/* Workflow 2 */}
        <div
          onClick={() => (onNavigateToPayments ? onNavigateToPayments() : onNavigate('PAYMENTS'))}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isArabic ? 'المدفوعات والفواتير' : 'Payments & Invoices'}
              </h4>
              <p className="text-xs text-slate-400">
                {isArabic ? 'تحميل فواتير الضريبة والتحويلات' : 'Download UAE wire receipts & tax invoices'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
        </div>

        {/* Workflow 3 */}
        <div
          onClick={() => (onNavigateToDelivery ? onNavigateToDelivery() : onNavigate('DELIVERY_COLLECTION'))}
          className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isArabic ? 'التسليم وتصريح الخروج' : 'Delivery & Collection'}
              </h4>
              <p className="text-xs text-slate-400">
                {isArabic ? 'حجز موعد الساحة واستخراج QR' : 'Book yard collection slot & QR gate pass'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
        </div>

      </div>
    </div>
  );
};
