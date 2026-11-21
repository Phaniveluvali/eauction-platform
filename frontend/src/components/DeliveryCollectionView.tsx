import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  QrCode, 
  FileCheck, 
  User, 
  ShieldCheck, 
  Download, 
  Printer, 
  AlertCircle,
  Navigation,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useTranslation, Language } from './i18n';

interface DeliveryCollectionViewProps {
  lang?: Language;
  onBackToWon?: () => void;
}

export const DeliveryCollectionView: React.FC<DeliveryCollectionViewProps> = ({
  lang = 'EN',
  onBackToWon
}) => {
  const { t } = useTranslation(lang);

  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 01:00 PM GST');
  const [collectorName, setCollectorName] = useState('Tariq Al-Mansouri');
  const [emiratesId, setEmiratesId] = useState('784-1988-1234567-1');
  const [recoveryPlate, setRecoveryPlate] = useState('DXB-REC-9941');
  const [gatePassGenerated, setGatePassGenerated] = useState(true);

  // 4 Stepper stages
  const steps = [
    {
      id: 1,
      title: lang === 'AR' ? 'سداد كامل المبلغ' : 'Settlement Paid',
      desc: lang === 'AR' ? 'تم استلام الحوالة البنكية بنجاح' : 'AED 720,962.50 Verified by Accounts',
      status: 'COMPLETED'
    },
    {
      id: 2,
      title: lang === 'AR' ? 'نقل الملكية وفحص RTA' : 'Documents & Mulkiya',
      desc: lang === 'AR' ? 'شهادة الحيازة وتصريح التسجيل معتمد' : 'RTA Possession Certificate Ready',
      status: 'COMPLETED'
    },
    {
      id: 3,
      title: lang === 'AR' ? 'حجز موعد الاستلام' : 'Ready for Collection',
      desc: lang === 'AR' ? 'المركبة جاهزة في ساحة دبي الصناعية' : 'Yard 4B Bay #12 Inspection Cleared',
      status: 'ACTIVE'
    },
    {
      id: 4,
      title: lang === 'AR' ? 'خروج المركبة من البوابة' : 'Handover & Gate Exit',
      desc: lang === 'AR' ? 'مسح تصريح الدخول ومطابقة الهوية' : 'Security Check & Physical Release',
      status: 'PENDING'
    }
  ];

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Truck className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                {lang === 'AR' ? 'إجراءات التسليم وتصريح الخروج' : 'Vehicle Delivery & Gate Pass Dispatch'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'AR' ? 'حجز موعد الاستلام وتصريح البوابة' : 'Yard Collection & Gate Pass Issuance'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Lot: <span className="font-bold text-emerald-400">LOT-DXB-9021</span> • 2023 Mercedes-Benz G63 AMG 4MATIC V8 Biturbo
            </p>
          </div>

          {onBackToWon && (
            <button
              onClick={onBackToWon}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              {lang === 'AR' ? '← العودة للمزادات الفائزة' : '← Back to Won Lots'}
            </button>
          )}
        </div>
      </div>

      {/* 4-Stage Stepper Progress Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          {lang === 'AR' ? 'مراحل تسليم المركبة' : 'Delivery & Release Progression'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((st, idx) => {
            const isCompleted = st.status === 'COMPLETED';
            const isActive = st.status === 'ACTIVE';
            return (
              <div 
                key={st.id} 
                className={`p-4 rounded-xl border relative transition ${
                  isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' 
                    : isActive 
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isActive 
                      ? 'bg-amber-500 text-white animate-pulse' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.id}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    isCompleted 
                      ? 'bg-emerald-200/60 text-emerald-800' 
                      : isActive 
                      ? 'bg-amber-200/60 text-amber-800' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? (lang === 'AR' ? 'مكتمل' : 'Cleared') : isActive ? (lang === 'AR' ? 'جاري التنفيذ' : 'Action Required') : (lang === 'AR' ? 'قيد الانتظار' : 'Pending')}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">{st.title}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{st.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Scheduler & Gate Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Pickup Yard Info & Scheduler Form */}
        <div className="lg:col-span-7 space-y-6">

          {/* Yard Location & Operating Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {lang === 'AR' ? 'ساحة الاستلام المعتمدة' : 'Official Storage Yard'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  AJ Yard 4B - Dubai Industrial City (DIC)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saih Shuaib 2, Near Al Maktoum International Airport (DWC), Dubai, UAE
                </p>
              </div>

              <a 
                href="https://maps.google.com/?q=Dubai+Industrial+City" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'AR' ? 'فتح في خرائط Google' : 'Google Maps'}</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">{lang === 'AR' ? 'أوقات العمل' : 'Working Hours'}</div>
                  <div className="text-slate-500">Sun - Thu: 08:00 AM - 06:00 PM GST</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">{lang === 'AR' ? 'مكتب أمن الساحة' : 'Yard Security Desk'}</div>
                  <div className="text-slate-500">+971 4 800 2528 / Yard Ext 104</div>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Scheduler Inputs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'AR' ? 'تحديد موعد الاستلام وتفاصيل الناقل' : 'Schedule Pickup & Authorized Transporter'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'AR' ? 'تاريخ الحضور' : 'Collection Date'}
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'AR' ? 'فترة الحضور (الوقت)' : 'Time Slot'}
                </label>
                <select 
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>08:30 AM - 10:30 AM GST</option>
                  <option>11:00 AM - 01:00 PM GST</option>
                  <option>02:00 PM - 04:00 PM GST</option>
                  <option>04:00 PM - 06:00 PM GST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'AR' ? 'اسم المستلم / السائق المصرح له' : 'Authorized Collector / Driver Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Full Name as per Emirates ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'AR' ? 'رقم الهوية الإماراتية (Emirates ID)' : 'Emirates ID of Driver'}
                </label>
                <input 
                  type="text" 
                  value={emiratesId}
                  onChange={(e) => setEmiratesId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="784-XXXX-XXXXXXX-X"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'AR' ? 'لوحة سيارة الاسترجاع / الريكفري (اختياري)' : 'Recovery Truck / Transporter Plate (Optional)'}
                </label>
                <input 
                  type="text" 
                  value={recoveryPlate}
                  onChange={(e) => setRecoveryPlate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                  placeholder="e.g. DXB-REC-9941"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setGatePassGenerated(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                {lang === 'AR' ? 'تأكيد الموعد وتحديث تصريح البوابة' : 'Update & Confirm Yard Booking'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Digital Gate Pass (QR Code & Details) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {lang === 'AR' ? 'تصريح خروج رقمي رسمي' : 'OFFICIAL DIGITAL GATE PASS'}
                </span>
                <div className="text-xs font-mono text-slate-400 mt-1">PASS: GP-DXB-2026-8841</div>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>

            {/* QR Code Presentation */}
            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center my-4 text-slate-950">
              <div className="w-44 h-44 bg-slate-950 rounded-lg p-2 flex items-center justify-center">
                {/* Visual SVG QR Code Matrix */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  <rect x="0" y="0" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="5" y="5" width="20" height="20" rx="2" fill="#090d16" />
                  <rect x="10" y="10" width="10" height="10" fill="#ffffff" />

                  <rect x="70" y="0" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="75" y="5" width="20" height="20" rx="2" fill="#090d16" />
                  <rect x="80" y="10" width="10" height="10" fill="#ffffff" />

                  <rect x="0" y="70" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="5" y="75" width="20" height="20" rx="2" fill="#090d16" />
                  <rect x="10" y="80" width="10" height="10" fill="#ffffff" />

                  <rect x="36" y="10" width="8" height="8" fill="#ffffff" />
                  <rect x="48" y="10" width="14" height="8" fill="#ffffff" />
                  <rect x="36" y="24" width="26" height="8" fill="#ffffff" />

                  <rect x="36" y="40" width="8" height="20" fill="#ffffff" />
                  <rect x="50" y="40" width="16" height="10" fill="#ffffff" />
                  <rect x="70" y="40" width="20" height="8" fill="#ffffff" />
                  <rect x="50" y="56" width="36" height="12" fill="#ffffff" />

                  <rect x="10" y="40" width="14" height="20" fill="#ffffff" />
                  <rect x="36" y="70" width="12" height="20" fill="#ffffff" />
                  <rect x="56" y="76" width="34" height="14" fill="#ffffff" />
                </svg>
              </div>
              <div className="text-[11px] font-bold text-slate-700 mt-2">
                Scan at Main Security Checkpoint
              </div>
            </div>

            {/* Pass Metadata List */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Lot:</span>
                <span className="font-bold text-white">LOT-DXB-9021</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-bold text-white">2023 Mercedes G63</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yard Location:</span>
                <span className="font-bold text-emerald-400">Yard 4B, Bay 12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Date:</span>
                <span className="font-mono text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Window:</span>
                <span className="font-mono text-white">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Driver:</span>
                <span className="font-bold text-white">{collectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emirates ID:</span>
                <span className="font-mono text-white">{emiratesId}</span>
              </div>
              {recoveryPlate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovery Plate:</span>
                  <span className="font-mono text-amber-400">{recoveryPlate}</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'AR'
                  ? 'يجب إبراز أصل بطاقة الهوية الإماراتية وتصريح البوابة عند مدخل الساحة للاستلام.'
                  : 'Physical Emirates ID must match this gate pass at the yard gate before the vehicle is physically unlocked.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handlePrintPass}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'AR' ? 'طباعة التصريح' : 'Print Pass'}</span>
              </button>

              <button
                onClick={handlePrintPass}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'AR' ? 'حفظ PDF' : 'Save PDF'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
