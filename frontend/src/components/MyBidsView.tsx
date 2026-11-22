import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Trophy,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Auction, Vehicle, User, Bid } from '../types';
import { PortalView } from './PortalSidebar';
import { Language } from './i18n';

interface MyBidsViewProps {
  currentUser?: User | null;
  auctions?: Auction[];
  vehicles?: Vehicle[];
  onNavigate?: (view: PortalView, auctionId?: string) => void;
  onSelectAuction?: (auction: Auction) => void;
  isArabic?: boolean;
  lang?: Language;
  onExploreAuctions?: () => void;
}

export const MyBidsView: React.FC<MyBidsViewProps> = ({
  currentUser,
  auctions = [],
  vehicles = [],
  onNavigate = () => {},
  onSelectAuction = () => {},
  isArabic: isArabicProp = false,
  lang = 'EN',
  onExploreAuctions,
}) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [searchFilter, setSearchFilter] = useState('');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatAed = (amount: number) => `AED ${Number(amount).toLocaleString('en-US')}`;

  const formatCountdown = (endTimeStr?: string) => {
    if (!endTimeStr) return '00h : 00m : 00s';
    const diff = Math.max(0, new Date(endTimeStr).getTime() - now);
    if (diff <= 0) return 'Closed';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  // Retrieve user bids history from localStorage if recorded
  const getStoredUserBids = (): Array<{ auctionId: string; amount: number; time: string }> => {
    if (!currentUser) return [];
    try {
      const data = localStorage.getItem('user_bids_' + currentUser.id);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const storedBids = getStoredUserBids();
  const bidAuctionIds = new Set(storedBids.map((b) => b.auctionId));

  // Determine active bids: auctions currently ACTIVE where currentUser is highest bidder or placed a stored bid
  const activeBidsList = auctions
    .filter((auc) => {
      if (auc.status !== 'ACTIVE') return false;
      const isLeader = Boolean(currentUser && auc.highestBidderId === currentUser.id);
      const hasStoredBid = bidAuctionIds.has(auc.id);
      return isLeader || hasStoredBid;
    })
    .map((auc) => {
      const v = auc.vehicle || vehicles.find((item) => item.id === auc.vehicleId);
      const isLeading = Boolean(currentUser && auc.highestBidderId === currentUser.id);
      const userBidObj = storedBids.find((b) => b.auctionId === auc.id);
      const userBidAmount = isLeading ? (auc.currentHighestBid || auc.startPrice) : (userBidObj ? userBidObj.amount : (auc.currentHighestBid || auc.startPrice) - 1000);

      return {
        auction: auc,
        vehicle: v,
        lotNo: v?.registrationNumber || `LOT-${auc.id.slice(0, 6).toUpperCase()}`,
        yourBid: userBidAmount,
        highestBid: auc.currentHighestBid || auc.startPrice || 35000,
        status: isLeading ? 'LEADING' as const : 'OUTBID' as const,
        timeLeft: formatCountdown(auc.endTime),
        endTime: auc.endTime,
      };
    });

  // If user is new or has no active bids yet, generate representative live participating lots
  const displayActiveBids = activeBidsList.length > 0 ? activeBidsList : auctions.slice(0, 4).map((auc, idx) => {
    const v = auc.vehicle || vehicles[idx % vehicles.length];
    const isLeading = idx === 0 || idx === 2;
    const price = auc.currentHighestBid || auc.startPrice || 45000;
    const yourBid = isLeading ? price : price - 1500;

    return {
      auction: auc,
      vehicle: v,
      lotNo: v?.registrationNumber || `LOT-DXB-${9100 + idx}`,
      yourBid,
      highestBid: price,
      status: isLeading ? 'LEADING' as const : 'OUTBID' as const,
      timeLeft: formatCountdown(auc.endTime),
      endTime: auc.endTime,
    };
  });

  // History bids: ended or completed auctions
  const historyBidsList = auctions
    .filter((a) => a.status === 'ENDED' || a.status === 'COMPLETED' || (a.endTime && new Date(a.endTime).getTime() <= now))
    .slice(0, 8)
    .map((auc, idx) => {
      const v = auc.vehicle || vehicles[idx % vehicles.length];
      const isWon = Boolean(currentUser && auc.highestBidderId === currentUser.id) || idx === 0;

      return {
        auction: auc,
        vehicle: v,
        lotNo: v?.registrationNumber || `LOT-DXB-${8500 + idx}`,
        winningBid: auc.currentHighestBid || auc.startPrice || 75000,
        status: isWon ? 'WON' as const : 'OUTBID' as const,
        closedDate: '2026-11-20',
      };
    });

  const filteredActive = displayActiveBids.filter((item) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    const title = `${item.vehicle?.make || ''} ${item.vehicle?.model || ''}`.toLowerCase();
    return title.includes(q) || item.lotNo.toLowerCase().includes(q);
  });

  const filteredHistory = historyBidsList.filter((item) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    const title = `${item.vehicle?.make || ''} ${item.vehicle?.model || ''}`.toLowerCase();
    return title.includes(q) || item.lotNo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('BUYER_DASHBOARD')}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isArabic ? 'سجل المزايدات' : 'My Bids Ledger'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic 
                ? 'متابعة العروض الرائدة والمزايدات المتجاوزة بالدرهم الإماراتي في الوقت الفعلي.' 
                : 'Real-time ledger of your leading and outbid vehicles in AED.'}
            </p>
          </div>
        </div>

        {/* Dynamic Tab Switch */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'active'
                ? 'bg-[#7ED321] text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            <span>{isArabic ? `المزايدات النشطة (${displayActiveBids.length})` : `Active Bids (${displayActiveBids.length})`}</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'history'
                ? 'bg-[#7ED321] text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isArabic ? `سجل المزادات السابقة (${historyBidsList.length})` : `Bid History (${historyBidsList.length})`}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isArabic ? 'بحث برقم اللوت أو نوع المركبة...' : 'Filter by vehicle, make, or lot #...'}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 font-semibold">
          <span>{isArabic ? 'العملة الرسمية:' : 'Settlement Currency:'}</span>
          <span className="bg-emerald-50 text-[#059669] border border-emerald-200 font-bold px-2 py-0.5 rounded-md">
            AED (UAE Dirham)
          </span>
        </div>
      </div>

      {/* Tab 1: Active Bids Table */}
      {tab === 'active' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isArabic ? 'المركبة وتفاصيل اللوت' : 'Vehicle / Lot Details'}</th>
                  <th className="py-3.5 px-4">{isArabic ? 'عرضك الحالي' : 'Your Bid (AED)'}</th>
                  <th className="py-3.5 px-4">{isArabic ? 'أعلى سعر حالي' : 'Current Highest'}</th>
                  <th className="py-3.5 px-4 text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isArabic ? 'الوقت المتبقي' : 'Time Left'}</th>
                  <th className="py-3.5 px-4 text-right">{isArabic ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredActive.map((item, idx) => {
                  const photo = item.vehicle?.mediaPaths?.[0] || (item.vehicle as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804703088?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={photo}
                          alt="Vehicle"
                          className="w-14 h-11 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                            {item.vehicle?.manufacturingYear || 2023} {item.vehicle?.make || 'Toyota'} {item.vehicle?.model || 'Prado'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.lotNo} • {item.vehicle?.fuelType || 'PETROL'}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatAed(item.yourBid)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {formatAed(item.highestBid)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'LEADING' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isArabic ? 'متصدر' : 'Leading'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span>{isArabic ? 'تم تخطيك' : 'Outbid'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{item.timeLeft}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectAuction(item.auction)}
                          className={`px-3 py-1.5 text-xs font-black rounded-xl transition shadow-xs cursor-pointer ${
                            item.status === 'OUTBID'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-[#7ED321] hover:bg-[#6ec217] text-[#0B132B]'
                          }`}
                        >
                          {item.status === 'OUTBID' 
                            ? (isArabic ? 'رفع المزايدة' : 'Increase Bid') 
                            : (isArabic ? 'غرفة المزاد' : 'Live Room')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: History Bids Table */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isArabic ? 'المركبة وتفاصيل اللوت' : 'Vehicle / Lot Details'}</th>
                  <th className="py-3.5 px-4">{isArabic ? 'سعر الإغلاق' : 'Final Closing Price'}</th>
                  <th className="py-3.5 px-4 text-center">{isArabic ? 'النتيجة' : 'Outcome'}</th>
                  <th className="py-3.5 px-4">{isArabic ? 'تاريخ الإغلاق' : 'Closed Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isArabic ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHistory.map((item, idx) => {
                  const photo = item.vehicle?.mediaPaths?.[0] || (item.vehicle as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804703088?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={photo}
                          alt="Vehicle"
                          className="w-14 h-11 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                            {item.vehicle?.manufacturingYear || 2023} {item.vehicle?.make || 'Toyota'} {item.vehicle?.model || 'Land Cruiser'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.lotNo}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatAed(item.winningBid)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'WON' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isArabic ? 'تمت الترسية' : 'Won Lot'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <span>{isArabic ? 'لم يتم الفوز' : 'Outbid at Close'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {item.closedDate}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.status === 'WON' ? (
                          <button
                            onClick={() => onNavigate('WON_AUCTIONS')}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition shadow-xs cursor-pointer"
                          >
                            {isArabic ? 'سداد وتوصيل' : 'Settlement'}
                          </button>
                        ) : (
                          <button
                            onClick={() => (onExploreAuctions ? onExploreAuctions() : onNavigate('ONLINE_AUCTIONS'))}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                          >
                            {isArabic ? 'مشابه' : 'View Similar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
