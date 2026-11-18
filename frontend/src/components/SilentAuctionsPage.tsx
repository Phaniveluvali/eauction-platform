import React, { useState, useEffect, useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { SilentBidModal } from './SilentBidModal';
import { api } from '../services/api';
import {
  X,
  Home,
  Search,
  Lock,
  Image as ImageIcon,
  Heart,
  Clock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Gauge,
} from 'lucide-react';

interface SilentAuctionsPageProps {
  vehicles: Vehicle[];
  auctions: Auction[];
  currentUser: User | null;
  loading?: boolean;
  favoriteIds?: string[];
  onToggleFavorite?: (vehicleId: string) => void;
  onViewDetails?: (auction: Auction, vehicle: Vehicle) => void;
  onOpenDeposit?: () => void;
  onRequireAuth: () => void;
  onNavigate: (view: PortalView) => void;
  onBackHome: () => void;
}

export const SilentAuctionsPage: React.FC<SilentAuctionsPageProps> = ({
  vehicles,
  auctions = [],
  currentUser,
  loading = false,
  favoriteIds = [],
  onToggleFavorite,
  onViewDetails,
  onOpenDeposit,
  onRequireAuth,
  onNavigate,
  onBackHome,
}) => {
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [lotSearch, setLotSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'ENDED'>('ACTIVE');
  const [now, setNow] = useState<number>(Date.now());
  const [myBidsByAuction, setMyBidsByAuction] = useState<Record<string, { bidAmount: number; status: string }>>({});
  const [bidModalTarget, setBidModalTarget] = useState<{ auction: Auction; vehicle: Vehicle } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load buyer's own submitted sealed bids
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'BUYER') {
      setMyBidsByAuction({});
      return;
    }
    const silentList = auctions.filter((a) => a.auctionType === 'SILENT');
    if (silentList.length === 0) return;

    let cancelled = false;
    Promise.all(
      silentList.map(async (a) => {
        try {
          const r = await api.getMySilentBid(a.id);
          return r.hasBid && r.bidAmount ? [a.id, { bidAmount: Number(r.bidAmount), status: r.status || 'SUBMITTED' }] : null;
        } catch {
          return null;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      const map: Record<string, { bidAmount: number; status: string }> = {};
      for (const item of entries) {
        if (item) map[item[0] as string] = item[1] as { bidAmount: number; status: string };
      }
      setMyBidsByAuction(map);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, auctions.length]);

  const silentItems = useMemo(() => {
    return (auctions || [])
      .filter((a) => a.auctionType === 'SILENT')
      .map((a) => {
        const vehicle = a.vehicle || vehicles.find((v) => v.id === a.vehicleId);
        return vehicle ? { auction: a, vehicle } : null;
      })
      .filter((x): x is { auction: Auction; vehicle: Vehicle } => Boolean(x));
  }, [auctions, vehicles]);

  const activeItems = useMemo(
    () =>
      silentItems.filter(
        ({ auction }) =>
          auction.status === 'ACTIVE' && !(auction.endTime && new Date(auction.endTime).getTime() <= now)
      ),
    [silentItems, now]
  );

  const endedItems = useMemo(
    () =>
      silentItems.filter(
        ({ auction }) =>
          auction.status === 'ENDED' ||
          auction.status === 'COMPLETED' ||
          (auction.endTime && new Date(auction.endTime).getTime() <= now)
      ),
    [silentItems, now]
  );

  const tabItems = statusTab === 'ACTIVE' ? activeItems : endedItems;

  const makeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { vehicle } of tabItems) {
      const m = vehicle.make || 'Other';
      counts[m] = (counts[m] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tabItems]);

  const uniqueYears = useMemo(() => {
    const yrs = new Set<number>();
    for (const { vehicle } of tabItems) {
      if (vehicle.manufacturingYear) yrs.add(vehicle.manufacturingYear);
    }
    return Array.from(yrs).sort((a, b) => b - a);
  }, [tabItems]);

  const filteredItems = useMemo(() => {
    return tabItems.filter(({ auction, vehicle }) => {
      if (selectedMake !== 'ALL' && (vehicle.make || '').toLowerCase() !== selectedMake.toLowerCase()) return false;
      if (selectedYear !== 'ALL' && String(vehicle.manufacturingYear) !== selectedYear) return false;
      if (lotSearch.trim()) {
        const q = lotSearch.trim().toLowerCase();
        const hay = `${vehicle.lotNo || ''} ${vehicle.make} ${vehicle.model} ${vehicle.vin} ${vehicle.registrationNumber} ${auction.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const tA = a.auction.endTime ? new Date(a.auction.endTime).getTime() : 0;
      const tB = b.auction.endTime ? new Date(b.auction.endTime).getTime() : 0;
      return (tA - tB) || a.auction.id.localeCompare(b.auction.id);
    });
  }, [tabItems, selectedMake, selectedYear, lotSearch]);

  const formatCountdown = (endTimeStr: string) => {
    const end = new Date(endTimeStr).getTime();
    const diff = Math.max(0, end - now);
    if (diff <= 0) return 'Closed';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${d}D : ${String(h).padStart(2, '0')}H : ${String(m).padStart(2, '0')}M : ${String(s).padStart(2, '0')}S`;
  };

  const handleOpenSealedBid = (auction: Auction, vehicle: Vehicle) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Only Buyer accounts can submit sealed bids in Silent Auctions.');
      return;
    }
    setBidModalTarget({ auction, vehicle });
  };

  const handleHeartClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Watchlist is exclusive to Buyer accounts.');
      return;
    }
    onToggleFavorite?.(vehicleId);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      <PortalSidebar currentView="SILENT_AUCTIONS" onNavigate={onNavigate} currentUser={currentUser} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackHome}
              className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Close and return to Home"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#231F20] flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Silent Auctions (Sealed Bidding)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                All offers are confidential and reviewed by AJ Auctions upon batch closing.
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[#8C8C8C] mb-5">
          <button onClick={onBackHome} className="hover:text-[#231F20] flex items-center gap-1 cursor-pointer">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#231F20]">Silent Auctions</span>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-2 text-[#231F20] focus:outline-none"
              >
                <option value="ALL">All Makes</option>
                {makeCounts.map(([m, c]) => (
                  <option key={m} value={m}>
                    {m} ({c})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-2 text-[#231F20] focus:outline-none"
              >
                <option value="ALL">All Years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Search Lot / VIN / Model</label>
              <div className="flex items-center border border-[#D1D5DB] rounded-md overflow-hidden bg-white">
                <input
                  type="text"
                  value={lotSearch}
                  onChange={(e) => setLotSearch(e.target.value)}
                  placeholder="Lot No, VIN, or Model"
                  className="w-full text-xs px-3 py-2 text-[#231F20] placeholder-slate-400 focus:outline-none"
                />
                <span className="px-2.5 text-emerald-600">
                  <Search className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedMake('ALL');
                  setSelectedYear('ALL');
                  setLotSearch('');
                }}
                className="w-full px-3.5 py-2 bg-[#231F20] hover:bg-black text-white rounded-md text-xs font-bold transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs + Dynamic Make Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusTab('ACTIVE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusTab === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Active Silent Auctions ({activeItems.length})
            </button>
            <button
              onClick={() => setStatusTab('ENDED')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusTab === 'ENDED'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Closed Silent Auctions ({endedItems.length})
            </button>
          </div>

          {makeCounts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {makeCounts.slice(0, 6).map(([make, count]) => (
                <button
                  key={make}
                  onClick={() => setSelectedMake(selectedMake === make ? 'ALL' : make)}
                  className={`px-3 py-1 rounded-md border transition cursor-pointer ${
                    selectedMake === make
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-[#D1D5DB] text-[#231F20] hover:bg-slate-50'
                  }`}
                >
                  {make} ({count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Silent Auction Cards */}
        {loading && auctions.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs animate-pulse">
                <div className="w-full h-48 bg-slate-200 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-4" />
                <div className="h-10 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {statusTab === 'ACTIVE' ? 'No Active Silent Auctions Available' : 'No Closed Silent Auctions Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vehicles assigned by Administrators to a published <strong>SILENT</strong> Auction Batch will appear here automatically for confidential sealed bidding.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(({ auction, vehicle }) => {
              const imgUrl = vehicle.mediaPaths && vehicle.mediaPaths.length > 0 ? vehicle.mediaPaths[0] : null;
              const isLiked = favoriteIds.includes(vehicle.id);
              const myBid = myBidsByAuction[auction.id];
              const isClosed = Boolean(
                auction.status === 'ENDED' ||
                auction.status === 'COMPLETED' ||
                (auction.endTime && new Date(auction.endTime).getTime() <= now)
              );

              return (
                <div
                  key={auction.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Image */}
                  <div
                    onClick={() => onViewDetails?.(auction, vehicle)}
                    className="h-48 sm:h-52 w-full bg-[#EFEFEF] flex flex-col items-center justify-center text-slate-400 overflow-hidden relative shrink-0 cursor-pointer"
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <ImageIcon className="w-10 h-10 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-500 tracking-wider">IMAGE NOT AVAILABLE</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/85 text-white text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>SEALED BID</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleHeartClick(vehicle.id, e)}
                      title={isLiked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        isLiked
                          ? 'border-red-300 bg-red-50 text-red-600 shadow-xs'
                          : 'border-white/60 bg-white/90 text-slate-400 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {vehicle.manufacturingYear} {vehicle.make} {vehicle.model}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onViewDetails?.(auction, vehicle)}
                        className="text-xs text-[#0D74B5] font-semibold hover:underline block mb-2 cursor-pointer"
                      >
                        View Vehicle Details
                      </button>

                      <div className="text-xs text-emerald-700 font-bold mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatCountdown(auction.endTime)}</span>
                      </div>

                      <div className="space-y-1.5 text-xs border-t border-[#F0F0F0] pt-2.5 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">Lot #:</span>
                          <span className="font-semibold text-[#231F20] font-mono">
                            {vehicle.lotNo || vehicle.registrationNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B] flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> Mileage:
                          </span>
                          <span className="font-semibold text-[#231F20]">
                            {Number(vehicle.odometerReadingKm || 0).toLocaleString()} KM
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Location:
                          </span>
                          <span className="font-semibold text-[#231F20]">
                            {vehicle.location || vehicle.branch || 'Sharjah'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Min Start Bid:
                          </span>
                          <span className="font-bold text-slate-900">
                            AED {Number(auction.startPrice || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {myBid && (
                        <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Your Sealed Bid:
                          </span>
                          <span className="font-extrabold">AED {myBid.bidAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#F0F0F0] pt-3 mt-auto">
                      <button
                        type="button"
                        disabled={isClosed}
                        onClick={() => handleOpenSealedBid(auction, vehicle)}
                        className={`w-full font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition text-xs uppercase tracking-wider ${
                          isClosed
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {isClosed
                            ? 'SILENT AUCTION CLOSED'
                            : myBid
                            ? 'UPDATE SEALED BID'
                            : 'PLACE SEALED BID'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SilentBidModal
        isOpen={Boolean(bidModalTarget)}
        auction={bidModalTarget?.auction || null}
        vehicle={bidModalTarget?.vehicle}
        currentUser={currentUser}
        existingBidAmount={bidModalTarget ? myBidsByAuction[bidModalTarget.auction.id]?.bidAmount : null}
        onClose={() => setBidModalTarget(null)}
        onSuccess={(auctionId, bidAmount) => {
          setMyBidsByAuction((prev) => ({
            ...prev,
            [auctionId]: { bidAmount, status: 'SUBMITTED' },
          }));
        }}
        onOpenDeposit={() => onOpenDeposit?.()}
        onRequireAuth={onRequireAuth}
      />
    </div>
  );
};
