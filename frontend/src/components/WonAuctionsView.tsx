import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle2, 
  Truck, 
  FileText, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  CreditCard,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useTranslation, Language } from './i18n';
import { getAssetUrl } from '../utils/assets';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';

export interface WonLot {
  id: string;
  lotNumber: string;
  vehicleTitle: string;
  year: number;
  vin: string;
  imageUrl: string;
  hammerPriceAed: number;
  buyerPremiumAed: number;
  vatAed: number;
  totalPayableAed: number;
  winDate: string;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  deliveryStatus: 'READY_FOR_PICKUP' | 'DOCS_PENDING' | 'COLLECTED' | 'GATE_PASS_ISSUED';
  yardLocation: string;
}

interface WonAuctionsViewProps {
  currentUser?: User | null;
  auctions?: Auction[];
  vehicles?: Vehicle[];
  lang?: Language;
  onNavigate?: (view: PortalView, auctionId?: string) => void;
  onNavigateToDelivery?: (lotId: string) => void;
  onNavigateToPayments?: () => void;
}

const DEFAULT_WON_LOTS: WonLot[] = [
  {
    id: 'won-1',
    lotNumber: 'LOT-DXB-9021',
    vehicleTitle: '2023 Mercedes-Benz G63 AMG 4MATIC V8 Biturbo',
    year: 2023,
    vin: 'WDB96321458921102',
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=600&q=80',
    hammerPriceAed: 685000,
    buyerPremiumAed: 34250,
    vatAed: 1712.50,
    totalPayableAed: 720962.50,
    winDate: '20 Nov 2026, 17:30 GST',
    paymentStatus: 'PAID',
    deliveryStatus: 'GATE_PASS_ISSUED',
    yardLocation: 'AJ Yard 4B - Dubai Industrial City (DIC)'
  },
  {
    id: 'won-2',
    lotNumber: 'LOT-AUH-7734',
    vehicleTitle: '2022 Porsche 911 Carrera S Coupe (GCC Spec)',
    year: 2022,
    vin: 'WP0AB2A99NS219904',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80',
    hammerPriceAed: 430000,
    buyerPremiumAed: 21500,
    vatAed: 1075.00,
    totalPayableAed: 452575.00,
    winDate: '19 Nov 2026, 14:15 GST',
    paymentStatus: 'PAID',
    deliveryStatus: 'READY_FOR_PICKUP',
    yardLocation: 'AJ Yard 4B - Dubai Industrial City (DIC)'
  },
  {
    id: 'won-3',
    lotNumber: 'LOT-SHJ-3012',
    vehicleTitle: '2021 Toyota Land Cruiser VXR 5.7L Twin Turbo',
    year: 2021,
    vin: 'JTMCY7AJ9M4092183',
    imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80',
    hammerPriceAed: 265000,
    buyerPremiumAed: 13250,
    vatAed: 662.50,
    totalPayableAed: 278912.50,
    winDate: '18 Nov 2026, 11:00 GST',
    paymentStatus: 'PENDING',
    deliveryStatus: 'DOCS_PENDING',
    yardLocation: 'AJ Yard 2A - Sharjah Al Sajaa'
  }
];

export const WonAuctionsView: React.FC<WonAuctionsViewProps> = ({
  currentUser,
  auctions = [],
  vehicles = [],
  lang = 'EN',
  onNavigate = () => {},
  onNavigateToDelivery,
  onNavigateToPayments
}) => {
  const isArabic = lang === 'AR';
  const formatAed = (amount: number) => `AED ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Check if any invoice was paid in this session
  const paidInvoiceIds = (() => {
    try {
      const stored = localStorage.getItem('paid_invoices');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  // Derive dynamic won lots from auctions where currentUser is winner, or use default
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const lots: WonLot[] = DEFAULT_WON_LOTS.map((lot) => {
    if (paidInvoiceIds.includes(lot.id) || paidInvoiceIds.includes('inv-3') && lot.id === 'won-3') {
      return {
        ...lot,
        paymentStatus: 'PAID' as const,
        deliveryStatus: 'READY_FOR_PICKUP' as const,
      };
    }
    return lot;
  });

  const filteredLots = lots.filter((lot) => {
    if (filterStatus === 'PAID') return lot.paymentStatus === 'PAID';
    if (filterStatus === 'PENDING') return lot.paymentStatus === 'PENDING';
    return true;
  });

  const paidCount = lots.filter((l) => l.paymentStatus === 'PAID').length;
  const pendingCount = lots.filter((l) => l.paymentStatus === 'PENDING').length;

  const handleDownloadInvoice = (lot: WonLot) => {
    setDownloadingId(lot.id);
    setTimeout(() => {
      setDownloadingId(null);
      const invoiceData = `AJ AUCTIONS FZ-LLC - TAX INVOICE
TRN: 100482910400003
Invoice Date: ${lot.winDate}
Lot Number: ${lot.lotNumber}
Vehicle: ${lot.vehicleTitle}
VIN: ${lot.vin}
Yard: ${lot.yardLocation}
----------------------------------------
Hammer Price: AED ${lot.hammerPriceAed.toLocaleString()}
Buyer's Premium (5%): AED ${lot.buyerPremiumAed.toLocaleString()}
UAE VAT (5%): AED ${lot.vatAed.toLocaleString()}
----------------------------------------
TOTAL PAYABLE: AED ${lot.totalPayableAed.toLocaleString()}
Status: ${lot.paymentStatus}
Authorized by AJ Auctions UAE`;

      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${lot.lotNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Banner Navigation */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>{isArabic ? 'المزادات الفائزة' : 'Won Auctions & Settlements'}</span>
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {lots.length} {lots.length === 1 ? 'Lot' : 'Lots'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic 
                ? 'إدارة تسوية المبالغ، إصدار الفواتير الضريبية، وحجز مواعيد تسليم المركبات الفائزة.' 
                : 'Manage financial settlement, download official tax invoices, and schedule yard collection.'}
            </p>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-[#7ED321] text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? `الكل (${lots.length})` : `All Won (${lots.length})`}
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filterStatus === 'PAID'
                ? 'bg-[#7ED321] text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? `تم السداد (${paidCount})` : `Settled (${paidCount})`}
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filterStatus === 'PENDING'
                ? 'bg-[#7ED321] text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isArabic ? `في انتظار السداد (${pendingCount})` : `Pending (${pendingCount})`}
          </button>
        </div>
      </div>

      {/* Won Lots List */}
      <div className="space-y-4">
        {filteredLots.map((lot) => {
          const isPaid = lot.paymentStatus === 'PAID';

          return (
            <div 
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 items-center">
                
                {/* Vehicle Thumbnail & Badges */}
                <div className="lg:col-span-3 flex sm:flex-col items-center gap-4">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={lot.imageUrl} 
                      alt={lot.vehicleTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20">
                      {lot.lotNumber}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Trophy className="w-3 h-3 text-amber-300" />
                      <span>{isArabic ? 'تمت الترسية' : 'WON LOT'}</span>
                    </div>
                  </div>
                </div>

                {/* Lot Details */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">VIN: {lot.vin}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {lot.winDate}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {lot.vehicleTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <Building className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{lot.yardLocation}</span>
                  </div>

                  {/* Badges for Settlement and Delivery */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {isArabic ? 'تم سداد كامل المبلغ' : 'Settlement Paid (AED)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {isArabic ? 'في انتظار السداد' : 'Payment Pending'}
                      </span>
                    )}

                    {lot.deliveryStatus === 'GATE_PASS_ISSUED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {isArabic ? 'تصريح البوابة صادر' : 'Gate Pass Ready'}
                      </span>
                    )}

                    {lot.deliveryStatus === 'READY_FOR_PICKUP' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        {isArabic ? 'جاهز للاستلام' : 'Ready for Pickup'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                      {isArabic ? 'سعر المطرقة الصافي' : 'Hammer Price'}
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {formatAed(lot.hammerPriceAed)}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>{isArabic ? 'عمولة المشتري (5%) + الضريبة' : 'Buyer Premium (5%) + VAT'}:</span>
                      <span className="font-semibold text-slate-700">
                        {formatAed(lot.buyerPremiumAed + lot.vatAed)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-baseline">
                      <span className="text-xs font-extrabold text-slate-800">{isArabic ? 'الإجمالي النهائي' : 'Total Payable'}:</span>
                      <span className="text-base font-black text-[#059669]">{formatAed(lot.totalPayableAed)}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-1">
                    {isPaid ? (
                      <button
                        onClick={() => {
                          if (onNavigateToDelivery) {
                            onNavigateToDelivery(lot.id);
                          } else {
                            onNavigate('DELIVERY_COLLECTION');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#7ED321] hover:bg-[#6ec217] text-[#0B132B] font-black py-2.5 px-3 rounded-xl text-xs transition shadow-xs cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{isArabic ? 'حجز موعد واستخراج تصريح' : 'Book Yard Collection'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onNavigateToPayments) {
                            onNavigateToPayments();
                          } else {
                            onNavigate('PAYMENTS');
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 px-3 rounded-xl text-xs transition shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{isArabic ? 'سداد الفاتورة الآن' : 'Complete Wire / Card Payment'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadInvoice(lot)}
                      disabled={downloadingId === lot.id}
                      className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      <Download className={`w-3.5 h-3.5 text-slate-500 ${downloadingId === lot.id ? 'animate-bounce' : ''}`} />
                      <span>{downloadingId === lot.id ? (isArabic ? 'جاري التحميل...' : 'Downloading...') : (isArabic ? 'تحميل الفاتورة الضريبية (PDF)' : 'Tax Invoice (PDF)')}</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
