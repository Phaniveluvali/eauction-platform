import React, { useState } from 'react';
import { Gavel, Clock, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Auction, Vehicle, User } from '../types';
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

  const formatAed = (amount: number) => `AED ${Number(amount).toLocaleString('en-US')}`;

  // Build active bids list from auctions
  const activeBidsList = auctions.slice(0, 8).map((auc, idx) => {
    const v = auc.vehicle || vehicles[idx % vehicles.length];
    const isLeading = idx % 3 !== 0; // realistic distribution
    const yourBid = (auc.currentHighestBid || auc.startPrice || 30000) - (isLeading ? 0 : 2500);

    return {
      auction: auc,
      vehicle: v,
      lotNo: v?.registrationNumber || `AJ-PT-${80000 + idx}`,
      yourBid,
      highestBid: auc.currentHighestBid || auc.startPrice || 35000,
      status: isLeading ? 'LEADING' : 'OUTBID',
      timeLeft: '00:14:22',
    };
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('BUYER_DASHBOARD')}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isArabic ? 'سجل المزايدات والمزادات' : 'My Bids Ledger'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {isArabic ? 'متابعة العروض الرائدة والمزايدات السابقة بالدرهم الإماراتي' : 'Track your active leading and outbid vehicles in AED'}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              tab === 'active'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Bids (12)
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
              tab === 'history'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bid History (46)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Vehicle / Lot Details</th>
                <th className="py-3.5 px-4">Your Bid (AED)</th>
                <th className="py-3.5 px-4">Current Highest</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Time Left</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {activeBidsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={item.vehicle?.mediaPaths?.[0] || (item.vehicle as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1590362891988-f77804703088?auto=format&fit=crop&w=200&q=80'}
                      alt="Car"
                      className="w-12 h-10 object-cover rounded-lg bg-slate-900 border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">
                        {item.vehicle?.manufacturingYear || (item.vehicle as any)?.year || 2023} {item.vehicle?.make || 'Toyota'} {item.vehicle?.model || 'Fortuner'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{item.lotNo}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-white">
                    {formatAed(item.yourBid)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-300">
                    {formatAed(item.highestBid)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'LEADING' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Leading
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Outbid
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                    {item.timeLeft}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectAuction(item.auction)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        item.status === 'OUTBID'
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {item.status === 'OUTBID' ? 'Increase Bid' : 'View Room'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
