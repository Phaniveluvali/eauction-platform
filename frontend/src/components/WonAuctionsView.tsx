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
  Building
} from 'lucide-react';
import { useTranslation, Language } from './i18n';
import { getAssetUrl } from '../utils/assets';

interface WonLot {
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
  lang?: Language;
  onNavigateToDelivery?: (lotId: string) => void;
  onNavigateToPayments?: () => void;
}

const MOCK_WON_LOTS: WonLot[] = [
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
  lang = 'EN',
  onNavigateToDelivery,
  onNavigateToPayments
}) => {
  const { t, formatAed } = useTranslation(lang);
  const [lots] = useState<WonLot[]>(MOCK_WON_LOTS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = (lot: WonLot) => {
    setDownloadingId(lot.id);
    setTimeout(() => {
      setDownloadingId(null);
      // Trigger instant sample receipt download
      const content = `AJ AUCTIONS - OFFICIAL LOT SETTLEMENT RECEIPT\n` +
        `-----------------------------------------------------\n` +
        `Lot Number: ${lot.lotNumber}\n` +
        `Vehicle: ${lot.vehicleTitle}\n` +
        `VIN: ${lot.vin}\n` +
        `Hammer Price: AED ${lot.hammerPriceAed.toLocaleString()}\n` +
        `Buyer Premium (5%): AED ${lot.buyerPremiumAed.toLocaleString()}\n` +
        `VAT (5% on Premium): AED ${lot.vatAed.toLocaleString()}\n` +
        `TOTAL PAYABLE: AED ${lot.totalPayableAed.toLocaleString()}\n` +
        `Payment Status: ${lot.paymentStatus}\n` +
        `Delivery Yard: ${lot.yardLocation}\n` +
        `Date: ${lot.winDate}\n` +
        `Issuer: AJ Auctions FZ-LLC, Dubai, United Arab Emirates\n` +
        `Tax Registration Number (TRN): 100482910400003\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AJ-Invoice-${lot.lotNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Trophy className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                {lang === 'AR' ? 'المزادات الفائزة والترسيات' : 'Winning Lots & Settlements'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'AR' ? 'المركبات التي تمت ترسيتها عليك' : 'Your Won Vehicles & Lots'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {lang === 'AR' 
                ? 'تهانينا! فيما يلي تفاصيل المركبات التي فزت بها، أسعار المطرقة بالدرهم الإماراتي، وتصاريح بوابة الاستلام من ساحات الفحص.'
                : 'Congratulations! Track your winning lots, settle final balances in UAE Dirham (AED), and schedule your vehicle collection gate pass.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-center">
              <div className="text-xs text-slate-400">{lang === 'AR' ? 'إجمالي المشتريات' : 'Total Lots Won'}</div>
              <div className="text-xl font-black text-emerald-400">{lots.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-center">
              <div className="text-xs text-slate-400">{lang === 'AR' ? 'المبلغ الإجمالي' : 'Total Hammer Value'}</div>
              <div className="text-xl font-black text-white">
                {formatAed(lots.reduce((acc, l) => acc + l.totalPayableAed, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Won Lots List */}
      <div className="space-y-4">
        {lots.map((lot) => {
          const isPaid = lot.paymentStatus === 'PAID';
          return (
            <div 
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 items-center">
                
                {/* Vehicle Thumbnail & Badges */}
                <div className="lg:col-span-3 flex sm:flex-col items-center gap-4">
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={lot.imageUrl} 
                      alt={lot.vehicleTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                      {lot.lotNumber}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-300" />
                      <span>{lang === 'AR' ? 'تمت الترسية' : 'WON LOT'}</span>
                    </div>
                  </div>
                </div>

                {/* Lot Details */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">VIN: {lot.vin}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {lot.winDate}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {lot.vehicleTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{lot.yardLocation}</span>
                  </div>

                  {/* Badges for Settlement and Delivery */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {lot.paymentStatus === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'AR' ? 'تم سداد كامل المبلغ' : 'Settlement Paid (AED)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {lang === 'AR' ? 'في انتظار السداد' : 'Payment Pending'}
                      </span>
                    )}

                    {lot.deliveryStatus === 'GATE_PASS_ISSUED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {lang === 'AR' ? 'تصريح البوابة صادر' : 'Gate Pass Ready'}
                      </span>
                    )}

                    {lot.deliveryStatus === 'READY_FOR_PICKUP' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        {lang === 'AR' ? 'جاهز للاستلام' : 'Ready for Pickup'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Summary & Actions */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      {lang === 'AR' ? 'سعر المطرقة الصافي' : 'Hammer Price'}
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {formatAed(lot.hammerPriceAed)}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>{lang === 'AR' ? 'عمولة المشتري (5%) + الضريبة' : 'Buyer Premium (5%) + VAT'}:</span>
                      <span className="font-semibold text-slate-700">
                        {formatAed(lot.buyerPremiumAed + lot.vatAed)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-1.5 mt-1.5 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-800">{lang === 'AR' ? 'الإجمالي النهائي' : 'Total Amount'}:</span>
                      <span className="text-sm font-black text-emerald-700">{formatAed(lot.totalPayableAed)}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-1">
                    {isPaid ? (
                      <button
                        onClick={() => onNavigateToDelivery && onNavigateToDelivery(lot.id)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{lang === 'AR' ? 'حجز موعد واستخراج تصريح' : 'Book Yard Collection'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateToPayments && onNavigateToPayments()}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{lang === 'AR' ? 'سداد الفاتورة الآن' : 'Complete Wire / Card Payment'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadInvoice(lot)}
                      disabled={downloadingId === lot.id}
                      className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      <Download className={`w-3.5 h-3.5 text-slate-500 ${downloadingId === lot.id ? 'animate-bounce' : ''}`} />
                      <span>{downloadingId === lot.id ? (lang === 'AR' ? 'جاري التحميل...' : 'Downloading...') : (lang === 'AR' ? 'تحميل الفاتورة الضريبية' : 'Tax Invoice (PDF)')}</span>
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
