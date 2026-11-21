import React, { useState } from 'react';
import { 
  Car, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Eye, 
  AlertCircle, 
  ArrowUpRight,
  Filter,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { useTranslation, Language } from './i18n';

interface SellerListing {
  id: string;
  lotNumber: string;
  title: string;
  year: number;
  vin: string;
  imageUrl: string;
  reservePriceAed: number;
  currentBidAed: number;
  bidsCount: number;
  viewsCount: number;
  status: 'LIVE' | 'SCHEDULED' | 'INSPECTION' | 'SOLD' | 'DRAFT';
  endDate: string;
}

interface SellerDashboardProps {
  lang?: Language;
  onCreateListing?: () => void;
  onViewAllListings?: () => void;
}

const MOCK_SELLER_LISTINGS: SellerListing[] = [
  {
    id: 'sel-1',
    lotNumber: 'LOT-DXB-9021',
    title: '2023 Mercedes-Benz G63 AMG 4MATIC V8',
    year: 2023,
    vin: 'WDB96321458921102',
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=600&q=80',
    reservePriceAed: 650000,
    currentBidAed: 685000,
    bidsCount: 38,
    viewsCount: 1420,
    status: 'SOLD',
    endDate: '20 Nov 2026'
  },
  {
    id: 'sel-2',
    lotNumber: 'LOT-DXB-9440',
    title: '2024 Range Rover P530 First Edition',
    year: 2024,
    vin: 'SALWR2V48PA892104',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=600&q=80',
    reservePriceAed: 520000,
    currentBidAed: 485000,
    bidsCount: 22,
    viewsCount: 980,
    status: 'LIVE',
    endDate: '22 Nov 2026, 18:00 GST'
  },
  {
    id: 'sel-3',
    lotNumber: 'LOT-DXB-9511',
    title: '2023 BMW M8 Competition Gran Coupe',
    year: 2023,
    vin: 'WBA8E1C59NCH77123',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    reservePriceAed: 390000,
    currentBidAed: 0,
    bidsCount: 0,
    viewsCount: 340,
    status: 'SCHEDULED',
    endDate: '24 Nov 2026, 15:00 GST'
  },
  {
    id: 'sel-4',
    lotNumber: 'LOT-SHJ-1102',
    title: '2022 Nissan Patrol Nismo 5.6L V8',
    year: 2022,
    vin: 'JN6BA01T8P0391280',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    reservePriceAed: 295000,
    currentBidAed: 0,
    bidsCount: 0,
    viewsCount: 88,
    status: 'INSPECTION',
    endDate: 'Under 150-Point Inspection'
  }
];

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  lang = 'EN',
  onCreateListing,
  onViewAllListings
}) => {
  const { t, formatAed } = useTranslation(lang);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'SOLD'>('ALL');

  const filteredListings = MOCK_SELLER_LISTINGS.filter(l => {
    if (activeFilter === 'ALL') return true;
    return l.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Car className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                {lang === 'AR' ? 'بوابة البائع المعتمد' : 'Certified Seller Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'AR' ? 'لوحة تحكم مبيعات المركبات' : 'Seller Performance & Inventory'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {lang === 'AR'
                ? 'إدارة مركباتك المعروضة، متابعة عروض الأسعار اللحظية بالدرهم الإماراتي، واستلام مستحقات البيع المباشرة.'
                : 'Monitor active auctions, live bidding velocity in UAE Dirham (AED), and fast automated bank payouts.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateListing}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'AR' ? '+ إضافة مركبة للمزاد' : '+ Create New Listing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards in AED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'المركبات المدرجة' : 'Total Listed'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">28</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+4 this month</span>
          </span>
        </div>

        {/* Vehicles Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'المركبات المباعة' : 'Vehicles Sold'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">24</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <span>85.7% Clearance Rate</span>
          </span>
        </div>

        {/* Gross Sales Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'إجمالي المبيعات (درهم)' : 'Gross Volume (AED)'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatAed(5420000)}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
            {lang === 'AR' ? 'متوسط سعر البيع 225,833 درهم' : 'Avg AED 225,833 / unit'}
          </span>
        </div>

        {/* Settled Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'المستحقات المحولة للبنك' : 'Settled Payouts (AED)'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {formatAed(5149000)}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {lang === 'AR' ? 'صافي الحوالة بعد عمولة المزاد 5%' : 'Net of 5% Seller Commission'}
          </span>
        </div>
      </div>

      {/* Sales Trend SVG Curve */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'AR' ? 'منحنى أداء المبيعات الشهري (درهم إماراتي)' : 'Monthly Sales Velocity & Clearance (AED)'}
            </h3>
            <p className="text-xs text-slate-500">
              Last 6 Months: June - November 2026
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>{lang === 'AR' ? 'المبيعات الفعلية (درهم)' : 'Gross Volume (AED)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>{lang === 'AR' ? 'نسبة الإنجاز %' : 'Clearance %'}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-48 relative">
          <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sellerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="70" x2="700" y2="70" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="110" x2="700" y2="110" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="150" x2="700" y2="150" stroke="#e2e8f0" strokeWidth="1" />

            {/* Area Fill */}
            <path
              d="M 50 130 C 130 115, 200 90, 290 85 C 380 80, 470 50, 560 40 C 620 35, 660 25, 680 20 L 680 150 L 50 150 Z"
              fill="url(#sellerGrad)"
            />

            {/* Emerald Line */}
            <path
              d="M 50 130 C 130 115, 200 90, 290 85 C 380 80, 470 50, 560 40 C 620 35, 660 25, 680 20"
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {[
              { x: 50, y: 130, val: 'AED 420K' },
              { x: 170, y: 105, val: 'AED 610K' },
              { x: 290, y: 85, val: 'AED 820K' },
              { x: 410, y: 65, val: 'AED 1.1M' },
              { x: 530, y: 45, val: 'AED 1.45M' },
              { x: 650, y: 22, val: 'AED 1.95M' },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="3" />
                <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="bold">
                  {pt.val}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-6">
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov 2026</span>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'AR' ? 'قائمة مركباتك الحالية' : 'Your Inventory & Lot Status'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'AR' ? 'متابعة السعر الاحتياطي وأعلى مزايدة لحظية' : 'Real-time bids and reserve price threshold'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'LIVE', 'SCHEDULED', 'SOLD'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeFilter === tab 
                    ? 'bg-white text-emerald-700 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? (lang === 'AR' ? 'الكل' : 'All') : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{lang === 'AR' ? 'المركبة' : 'Vehicle / Lot'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'السعر الاحتياطي' : 'Reserve Price'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'أعلى مزايدة حالية' : 'Current High Bid'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'المزايدات / المشاهدات' : 'Bids / Views'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{lang === 'AR' ? 'الإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredListings.map((item) => {
                const reserveMet = item.currentBidAed >= item.reservePriceAed;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.lotNumber} • VIN: {item.vin.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatAed(item.reservePriceAed)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.currentBidAed > 0 ? (
                        <div>
                          <span className="font-black text-emerald-700">{formatAed(item.currentBidAed)}</span>
                          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            reserveMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reserveMet ? 'Reserve Met' : 'Under Reserve'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No bids yet</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{item.bidsCount} bids</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.viewsCount}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'LIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                          : item.status === 'SOLD'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.status === 'SCHEDULED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button 
                        onClick={onViewAllListings}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                      >
                        {lang === 'AR' ? 'عرض اللوت' : 'Manage Lot →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
