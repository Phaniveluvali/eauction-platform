import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Receipt,
  Gavel,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Printer,
  X,
  Lock,
  Search,
  Car,
  Upload,
} from 'lucide-react';
import { User, BuyerPurchase, BuyerPayment, BuyerBidItem } from '../types';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { api } from '../services/api';

interface MyPurchasesPageProps {
  currentUser: User;
  onNavigate: (view: PortalView) => void;
  onBackHome: () => void;
  onOpenPayment?: (purchase: BuyerPurchase) => void;
}

export const MyPurchasesPage: React.FC<MyPurchasesPageProps> = ({
  currentUser,
  onNavigate,
  onBackHome,
  onOpenPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'payments' | 'bids'>('purchases');
  const [purchases, setPurchases] = useState<BuyerPurchase[]>([]);
  const [payments, setPayments] = useState<BuyerPayment[]>([]);
  const [bids, setBids] = useState<BuyerBidItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [receiptTarget, setReceiptTarget] = useState<BuyerPurchase | BuyerPayment | null>(null);
  const [slipModalTarget, setSlipModalTarget] = useState<BuyerPurchase | null>(null);
  const [slipBankRef, setSlipBankRef] = useState<string>('');
  const [slipSubmitting, setSlipSubmitting] = useState<boolean>(false);
  const [slipSuccessMsg, setSlipSuccessMsg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.getBuyerPurchases().catch(() => []),
      api.getBuyerPayments().catch(() => []),
      api.getBuyerBids().catch(() => []),
    ]).then(([p, pay, b]) => {
      if (cancelled) return;
      setPurchases(Array.isArray(p) ? p : []);
      setPayments(Array.isArray(pay) ? pay : []);
      setBids(Array.isArray(b) ? b : []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  const totalSpent = payments
    .filter((p) => (p.status || '').toUpperCase() === 'COMPLETED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const pendingSettlements = purchases.filter(
    (p) => (p.paymentStatus || '').toUpperCase() !== 'COMPLETED' && (p.paymentStatus || '').toUpperCase() !== 'PAID'
  ).length;

  const activeBidsCount = bids.filter((b) => ['LEADING', 'OUTBID', 'SUBMITTED'].includes((b.bidState || '').toUpperCase())).length;

  const q = search.trim().toLowerCase();
  const filteredPurchases = purchases.filter(
    (p) => !q || `${p.make} ${p.model} ${p.vin} ${p.lotNo || ''} ${p.orderId || ''}`.toLowerCase().includes(q)
  );
  const filteredPayments = payments.filter(
    (p) => !q || `${p.vehicleTitle} ${p.orderId || ''} ${p.transactionId || ''} ${p.gateway || ''} ${p.status}`.toLowerCase().includes(q)
  );
  const filteredBids = bids.filter(
    (b) => !q || `${b.vehicleTitle} ${b.vin || ''} ${b.lotNo || ''} ${b.bidState}`.toLowerCase().includes(q)
  );

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const handleSlipSubmit = async () => {
    if (!slipModalTarget) return;
    if (!slipBankRef.trim()) {
      alert('Please enter a bank reference or transaction number.');
      return;
    }
    setSlipSubmitting(true);
    try {
      const mockSlipUrl = `https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com/slips/slip_${Date.now()}.pdf`;
      await api.uploadBuyerPaymentSlip(slipModalTarget.vehicleId, {
        amount: Number(slipModalTarget.winningPrice || 0),
        bankReference: slipBankRef.trim(),
        slipFileUrl: mockSlipUrl,
      });
      setSlipSuccessMsg('Payment slip submitted successfully! Finance/Operations team will verify and acknowledge.');
      setTimeout(() => {
        setSlipModalTarget(null);
        setSlipBankRef('');
        setSlipSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message || 'Error uploading payment slip'}`);
    } finally {
      setSlipSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-row font-sans">
      <PortalSidebar currentView="MY_PURCHASES" onNavigate={onNavigate} currentUser={currentUser} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
                <span>My Purchases & Payment History</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.fullName} ({currentUser.email}) — Purchased vehicles, settlement invoices, and bid history.
              </p>
            </div>
          </div>

          <div className="flex items-center border border-slate-200 bg-white rounded-xl px-3 py-2 w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VIN, lot, order ID..."
              className="w-full text-xs outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase text-slate-400">Purchased Vehicles</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{purchases.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Paid</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">AED {totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase text-slate-400">Pending Settlements</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingSettlements}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase text-slate-400">Active / Sealed Bids</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{activeBidsCount}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Purchased Vehicles ({purchases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payment History ({payments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'bids'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>My Bids ({bids.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-500">
            Loading your purchase records and payment ledger...
          </div>
        ) : activeTab === 'purchases' ? (
          filteredPurchases.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Purchased Vehicles Yet</h3>
              <p className="text-xs text-slate-500 mb-4">
                Vehicles you win in Online Auctions or Silent Auctions will appear here with full pricing and invoice details.
              </p>
              <button
                onClick={() => onNavigate('ONLINE_AUCTIONS')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Browse Online Auctions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPurchases.map((p) => {
                const isPaid = ['COMPLETED', 'PAID'].includes((p.paymentStatus || '').toUpperCase());
                return (
                  <div key={p.auctionId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
                    <div className="flex gap-4 p-4">
                      <div className="w-28 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {p.mediaPaths?.[0] ? (
                          <img src={p.mediaPaths[0]} alt={p.model} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Car className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 text-sm truncate">
                            {p.manufacturingYear} {p.make} {p.model}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPaid ? 'PAID' : 'PENDING PAYMENT'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          Lot #{p.lotNo || '—'} • VIN: {p.vin}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.location || 'UAE Yard'} • {p.auctionType} Auction • Won {formatDate(p.wonAt)}
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2">
                          <span className="text-lg font-black text-emerald-700">
                            AED {Number(p.winningPrice || 0).toLocaleString()}
                          </span>
                          {p.paidAmount && (
                            <span className="text-[11px] text-slate-500">
                              (Paid: {p.currency} {Number(p.paidAmount).toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {p.inspectionReportUrl && (
                          <a
                            href={p.inspectionReportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Inspection Report</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReceiptTarget(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice / Receipt</span>
                        </button>
                        {!isPaid && onOpenPayment && (
                          <button
                            onClick={() => onOpenPayment(p)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'payments' ? (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Order / Txn ID</th>
                    <th className="px-4 py-3">Vehicle & Lot</th>
                    <th className="px-4 py-3">Gateway</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">{formatDate(pay.createdAt)}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div className="font-bold text-slate-900">{pay.orderId}</div>
                          {pay.transactionId && <div className="text-slate-400">{pay.transactionId}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{pay.vehicleTitle}</div>
                          {pay.lotNo && <div className="text-[11px] text-slate-500">Lot #{pay.lotNo}</div>}
                        </td>
                        <td className="px-4 py-3 font-semibold">{pay.gateway}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          {pay.currency} {Number(pay.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pay.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : pay.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : pay.status === 'REFUNDED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setReceiptTarget(pay)}
                            className="text-emerald-700 hover:underline font-bold cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">My Bid</th>
                    <th className="px-4 py-3">Current Highest</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBids.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        You have not placed any bids yet.
                      </td>
                    </tr>
                  ) : (
                    filteredBids.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{b.vehicleTitle}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Lot #{b.lotNo || '—'} • {b.vin}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {b.auctionType === 'SILENT' && <Lock className="w-3 h-3" />}
                            {b.auctionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          AED {Number(b.myBidAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {b.auctionType === 'SILENT'
                            ? 'Confidential (Sealed)'
                            : `AED ${Number(b.currentHighestBid || 0).toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ['WON', 'LEADING'].includes(b.bidState)
                                ? 'bg-emerald-100 text-emerald-700'
                                : b.bidState === 'SUBMITTED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.bidState}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">{formatDate(b.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Payment Slip Upload Modal */}
      {slipModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSlipModalTarget(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Upload Bank Transfer Payment Slip</h3>
                <p className="text-[11px] text-slate-300">
                  Lot #{slipModalTarget.lotNo || '—'} • {slipModalTarget.make} {slipModalTarget.model}
                </p>
              </div>
              <button onClick={() => setSlipModalTarget(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {slipSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{slipSuccessMsg}</span>
                </div>
              ) : (
                <>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px]">
                    <span className="font-bold text-slate-900">AJ Auctions Bank Account Details:</span>
                    <div className="text-slate-600">Beneficiary: <strong className="text-slate-800">AJ Auctions LLC</strong></div>
                    <div className="text-slate-600">Bank: <strong className="text-slate-800">Abu Dhabi Islamic Bank (ADIB)</strong></div>
                    <div className="text-slate-600 font-mono">IBAN: <strong className="text-emerald-700">AE070331234567890123456</strong></div>
                    <div className="text-slate-600 font-mono">SWIFT: <strong className="text-slate-800">ADIBEAA</strong></div>
                    <div className="text-slate-600">Amount Due: <strong className="text-emerald-700 text-sm">AED {Number(slipModalTarget.winningPrice || 0).toLocaleString()}</strong></div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Transaction / Reference #</label>
                    <input
                      type="text"
                      placeholder="e.g. ADIB-TX-98234190"
                      value={slipBankRef}
                      onChange={(e) => setSlipBankRef(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Attach Wire Receipt / Deposit Slip</label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <span className="text-slate-600 font-medium text-[11px]">Click to choose payment slip (PDF, JPG, PNG)</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSlipSubmit}
                      disabled={slipSubmitting}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {slipSubmitting ? 'Uploading Slip...' : 'Submit Payment Slip for Acknowledgement'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setReceiptTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold">AJ Auctions — Official Settlement Receipt</h3>
                <p className="text-[11px] text-slate-300">Buyer: {currentUser.fullName}</p>
              </div>
              <button onClick={() => setReceiptTarget(null)} className="text-slate-300 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
              {'winningPrice' in receiptTarget ? (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold text-slate-900">
                      {receiptTarget.manufacturingYear} {receiptTarget.make} {receiptTarget.model}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Chassis (VIN)</span>
                    <span className="font-mono font-semibold">{receiptTarget.vin}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Lot #</span>
                    <span className="font-mono font-semibold">{receiptTarget.lotNo || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Auction Type</span>
                    <span className="font-bold">{receiptTarget.auctionType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Winning Price</span>
                    <span className="font-black text-emerald-700">
                      AED {Number(receiptTarget.winningPrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="font-bold">{receiptTarget.paymentStatus}</span>
                  </div>
                  {receiptTarget.orderId && (
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Order Reference</span>
                      <span className="font-mono">{receiptTarget.orderId}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-bold">{receiptTarget.orderId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold">{receiptTarget.vehicleTitle}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Gateway</span>
                    <span className="font-semibold">{receiptTarget.gateway}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-black text-emerald-700">
                      {receiptTarget.currency} {Number(receiptTarget.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold">{receiptTarget.status}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="font-mono">{formatDate(receiptTarget.createdAt)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setReceiptTarget(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
