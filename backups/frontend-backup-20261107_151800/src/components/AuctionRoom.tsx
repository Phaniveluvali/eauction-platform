import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Clock, Zap, AlertTriangle, CheckCircle2, ShieldAlert, Radio, DollarSign, Wallet, Lock } from 'lucide-react';
import { Auction, Bid, BidResponse, User } from '../types';
import { AuctionSocket } from '../services/websocket';
import { api } from '../services/api';
import { ServiceDegradedModal } from './ServiceDegradedModal';

interface AuctionRoomProps {
  auction: Auction;
  currentUser: User | null;
  onBack: () => void;
  onOpenDeposit: () => void;
  onRequireAuth: () => void;
}

export const AuctionRoom: React.FC<AuctionRoomProps> = ({
  auction,
  currentUser,
  onBack,
  onOpenDeposit,
  onRequireAuth,
}) => {
  const [currentHighestBid, setCurrentHighestBid] = useState<number>(
    auction.currentHighestBid > 0 ? auction.currentHighestBid : auction.startPrice
  );
  const [highestBidderId, setHighestBidderId] = useState<string | undefined>(auction.highestBidderId);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [socketStatus, setSocketStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [alertNotice, setAlertNotice] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const socketRef = useRef<AuctionSocket | null>(null);

  const minIncrement = Number(auction.minBidIncrement) || 10000;
  const minRequiredNextBid = currentHighestBid + minIncrement;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Initial Data Fetch & Countdown Timer
  useEffect(() => {
    api.getAuctionBids(auction.id)
      .then((bids) => setBidHistory(bids))
      .catch((err) => console.error('Failed to load past bid ledger:', err));

    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, end - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.id, auction.endTime]);

  // 2. Establish Gorilla WebSocket Connection
  useEffect(() => {
    const token = localStorage.getItem('token') || '';

    const socket = new AuctionSocket(
      auction.id,
      token,
      (data: BidResponse) => {
        console.log('[AuctionRoom] Received real-time broadcast:', data);

        if (data.status === 'SUCCESS') {
          setCurrentHighestBid(data.currentHighestBid);
          if (data.bidderId) setHighestBidderId(data.bidderId);

          setAlertNotice({
            type: 'SUCCESS',
            message: `New Highest Bid: ${formatINR(data.currentHighestBid)}!`,
          });

          // Prepend new immutable ledger item
          const newLedgerItem: Bid = {
            id: `live_${Date.now()}`,
            auctionId: auction.id,
            bidderId: data.bidderId || 'Anonymous',
            bidAmount: data.currentHighestBid,
            status: 'ACCEPTED',
            createdAt: new Date().toISOString(),
          };
          setBidHistory((prev) => [newLedgerItem, ...prev]);
        } else if (data.status === 'REJECTED') {
          setAlertNotice({
            type: 'ERROR',
            message: data.message || 'Bid rejected by Redis synchronization check',
          });
        }
      },
      (status) => setSocketStatus(status)
    );

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [auction.id, currentUser]);

  const [showSelfOutbidModal, setShowSelfOutbidModal] = useState(false);
  const [selfOutbidConfirmed, setSelfOutbidConfirmed] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState<number | null>(null);
  const [showDegradedModal, setShowDegradedModal] = useState(false);

  const isAuctionEnded = auction.status === 'ENDED' || auction.status === 'COMPLETED' || (new Date(auction.endTime).getTime() <= Date.now());

  // 3. Dispatch Bid Handler
  const handlePlaceBid = (proposedAmount: number) => {
    setAlertNotice(null);

    if (isAuctionEnded) {
      setAlertNotice({
        type: 'ERROR',
        message: 'This auction has ended and is closed for bidding.',
      });
      return;
    }

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (proposedAmount < minRequiredNextBid) {
      setAlertNotice({
        type: 'ERROR',
        message: `Proposed bid must be at least ${formatINR(minRequiredNextBid)} (Baseline condition violated)`,
      });
      return;
    }

    // =========================================================================
    // CRITICAL LOGIC: PREVENTING SELF-OUTBIDDING (HIGHEST BIDDER SAFETY GUARD)
    // =========================================================================
    // When a buyer is already holding the winning bid, submitting a higher bid
    // wastes their capital. We intercept the action and present a safety modal
    // requiring an explicit checkbox acknowledgment before releasing the bid.
    if (isLeadingBidder) {
      setPendingBidAmount(proposedAmount);
      setSelfOutbidConfirmed(false);
      setShowSelfOutbidModal(true);
      return;
    }

    executeBidSubmission(proposedAmount);
  };

  /**
   * Dispatches the validated bid over the real-time WebSocket connection.
   * Generates a unique client-side idempotency key to protect against double-clicks
   * and network retransmissions.
   */
  const executeBidSubmission = (proposedAmount: number) => {
    if (socketStatus !== 'CONNECTED' || !socketRef.current) {
      setShowDegradedModal(true);
      return;
    }
    try {
      if (socketRef.current) {
        // Unique idempotency key (timestamp + random nonce)
        const idempotencyKey = 'idemp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
        socketRef.current.sendBid(proposedAmount, idempotencyKey);
        setCustomBidAmount('');
        setShowSelfOutbidModal(false);
        setPendingBidAmount(null);
      }
    } catch (err: any) {
      setShowDegradedModal(true);
    }
  };

  const isLeadingBidder = currentUser && highestBidderId === currentUser.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Socket Health Indicator */}
          <button
            onClick={() => {
              if (socketStatus !== 'CONNECTED') {
                socketRef.current?.connect();
              }
            }}
            title={socketStatus !== 'CONNECTED' ? 'Click to reconnect' : 'Connected to Bidding Engine'}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                socketStatus === 'CONNECTED'
                  ? 'text-emerald-400 animate-pulse'
                  : socketStatus === 'CONNECTING'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            />
            <span className="text-slate-300 font-mono">
              Engine: {socketStatus} {socketStatus !== 'CONNECTED' && '(Retry)'}
            </span>
          </button>

          <button
            onClick={onOpenDeposit}
            className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>Escrow Deposit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Stage (Visuals & Control) | Right Stage (Live Ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visuals & Live Bid Pad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="h-64 sm:h-80 w-full relative">
              <img
                src={
                  auction.vehicle?.mediaPaths && auction.vehicle.mediaPaths.length > 0
                    ? auction.vehicle.mediaPaths[0]
                    : 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200'
                }
                alt="Vehicle in Auction"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {auction.vehicle?.vehicleType || 'COMMERCIAL TRUCK'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {auction.vehicle?.make} {auction.vehicle?.model}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    Reg No: {auction.vehicle?.registrationNumber} | VIN: {auction.vehicle?.vin}
                  </p>
                </div>

                {/* Countdown Box */}
                <div className="bg-slate-950/90 border border-slate-800 backdrop-blur-md px-4 py-3 rounded-xl flex items-center space-x-3 shadow-xl">
                  {isAuctionEnded ? (
                    <>
                      <Lock className="w-5 h-5 text-red-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Status</span>
                        <span className="text-base font-bold text-red-400 font-mono">
                          AUCTION ENDED
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Time Left</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Status & Alert Notifications */}
          {alertNotice && (
            <div
              className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium border ${
                alertNotice.type === 'SUCCESS'
                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/50 border-red-500/30 text-red-300'
              }`}
            >
              {alertNotice.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span>{alertNotice.message}</span>
            </div>
          )}

          {/* Real-time Bid Pad */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            {isAuctionEnded && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-center space-x-2 text-red-300 font-bold">
                <Lock className="w-5 h-5 text-red-400" />
                <span>Bidding Closed - This auction has ended</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Current Price Leader</span>
                <div className="text-3xl font-extrabold text-brand-400 font-mono mt-1">
                  {formatINR(currentHighestBid)}
                </div>
                {isLeadingBidder && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    You hold the highest bid!
                  </span>
                )}
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Minimum Required Bid</span>
                <div className="text-2xl font-bold text-slate-200 font-mono mt-1">
                  {formatINR(minRequiredNextBid)}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Mandatory Increment: +{formatINR(minIncrement)}
                </span>
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Instant Quick Bids
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  disabled={isAuctionEnded}
                  onClick={() => handlePlaceBid(currentHighestBid + minIncrement)}
                  className={`py-3 px-2 border rounded-xl text-center font-bold text-sm transition group ${
                    isAuctionEnded
                      ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-brand-600 hover:text-white border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 group-hover:text-brand-100">+ Increment</span>
                  +{formatINR(minIncrement)}
                </button>

                <button
                  disabled={isAuctionEnded}
                  onClick={() => handlePlaceBid(currentHighestBid + minIncrement * 2)}
                  className={`py-3 px-2 border rounded-xl text-center font-bold text-sm transition group ${
                    isAuctionEnded
                      ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-brand-600 hover:text-white border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 group-hover:text-brand-100">+ Double</span>
                  +{formatINR(minIncrement * 2)}
                </button>

                <button
                  disabled={isAuctionEnded}
                  onClick={() => handlePlaceBid(currentHighestBid + minIncrement * 5)}
                  className={`py-3 px-2 border rounded-xl text-center font-bold text-sm transition group ${
                    isAuctionEnded
                      ? 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-brand-600 hover:text-white border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 group-hover:text-brand-100">+ Aggressive</span>
                  +{formatINR(minIncrement * 5)}
                </button>
              </div>
            </div>

            {/* Custom Bid Submission Form */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Or Propose Custom Bid (INR)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    disabled={isAuctionEnded}
                    step={minIncrement}
                    min={minRequiredNextBid}
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(e.target.value)}
                    placeholder={isAuctionEnded ? 'Auction Concluded' : `Min: ${minRequiredNextBid}`}
                    className={`w-full border rounded-xl pl-8 pr-4 py-3 font-mono text-base focus:outline-none ${
                      isAuctionEnded
                        ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600 focus:border-brand-500'
                    }`}
                  />
                </div>
                <button
                  disabled={isAuctionEnded}
                  onClick={() => handlePlaceBid(Number(customBidAmount))}
                  className={`px-6 py-3 font-bold rounded-xl shadow-lg transition flex items-center gap-2 ${
                    isAuctionEnded
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Submit Bid</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Bid Ledger (Real-time Stream) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 beacon-pulse" />
              <h2 className="text-base font-bold text-white">Live Audit Ledger</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {bidHistory.length} Total Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
            {bidHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm">
                No bids recorded yet. Place the opening bid!
              </div>
            ) : (
              bidHistory.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className={`p-3.5 rounded-xl border transition ${
                    idx === 0
                      ? 'bg-slate-800/90 border-brand-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono">
                      {formatINR(Number(b.bidAmount))}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        idx === 0
                          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx === 0 ? 'HIGHEST' : 'OUTBID'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Bidder: {b.bidderId.substring(0, 8)}...</span>
                    <span>{new Date(b.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Synchronized via Redis Lua Engine & Kafka SERIALIZABLE Ledger
          </div>
        </div>
      </div>

      {/* Self-Outbid Warning Modal */}
      {showSelfOutbidModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Leading Bidder Confirmation</h3>
                <p className="text-xs text-amber-400 font-medium mt-0.5">
                  You are already the highest bidder for this vehicle
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Your Current Winning Bid:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatINR(currentHighestBid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Proposed Bid:</span>
                <span className="font-bold text-brand-400 font-mono">{formatINR(pendingBidAmount || 0)}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                Submitting this bid will increase your own commitment without anyone outbidding you.
              </p>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition">
              <input
                type="checkbox"
                checked={selfOutbidConfirmed}
                onChange={(e) => setSelfOutbidConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-brand-500 focus:ring-brand-400 border-slate-700 bg-slate-900 cursor-pointer"
              />
              <span className="text-xs text-slate-200 select-none">
                I understand that I am already leading this auction and still wish to increase my bid.
              </span>
            </label>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSelfOutbidModal(false);
                  setPendingBidAmount(null);
                  setSelfOutbidConfirmed(false);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selfOutbidConfirmed}
                onClick={() => {
                  if (pendingBidAmount) {
                    executeBidSubmission(pendingBidAmount);
                  }
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selfOutbidConfirmed
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>Confirm & Place Bid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graceful Degradation Modal for Live Bidding Outages */}
      <ServiceDegradedModal
        isOpen={showDegradedModal}
        serviceName="Gorilla WebSocket Bidding Engine"
        onClose={() => setShowDegradedModal(false)}
        onRetry={() => {
          setShowDegradedModal(false);
          socketRef.current?.connect();
          if (pendingBidAmount) {
            executeBidSubmission(pendingBidAmount);
          }
        }}
        onBrowseVehicles={onBack}
        errorCode="ERR_WSS_BID_DISCONNECTED_503"
      />
    </div>
  );
};
