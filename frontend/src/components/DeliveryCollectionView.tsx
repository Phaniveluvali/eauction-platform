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
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useTranslation, Language } from './i18n';
import { PortalView } from './PortalSidebar';

interface DeliveryCollectionViewProps {
  lang?: Language;
  onBackToWon?: () => void;
  onNavigate?: (view: PortalView) => void;
}

export const DeliveryCollectionView: React.FC<DeliveryCollectionViewProps> = ({
  lang = 'EN',
  onBackToWon,
  onNavigate = () => {}
}) => {
  const isArabic = lang === 'AR';

  const [selectedDate, setSelectedDate] = useState('2026-11-23');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 01:00 PM GST');
  const [collectorName, setCollectorName] = useState('Tariq Al-Mansouri');
  const [emiratesId, setEmiratesId] = useState('784-1988-1234567-1');
  const [recoveryPlate, setRecoveryPlate] = useState('DXB-REC-9941');
  const [gatePassGenerated, setGatePassGenerated] = useState(true);
  const [gatePassSuccessNotice, setGatePassSuccessNotice] = useState(false);

  // 4 Stepper stages
  const steps = [
    {
      id: 1,
      title: isArabic ? 'سداد كامل المبلغ' : 'Settlement Paid',
      desc: isArabic ? 'تم استلام الحوالة البنكية بنجاح' : 'AED 720,962.50 Verified by Accounts',
      status: 'COMPLETED'
    },
    {
      id: 2,
      title: isArabic ? 'نقل الملكية وفحص RTA' : 'Documents & Mulkiya',
      desc: isArabic ? 'شهادة الحيازة وتصريح التسجيل معتمد' : 'RTA Possession Certificate Ready',
      status: 'COMPLETED'
    },
    {
      id: 3,
      title: isArabic ? 'حجز موعد الاستلام' : 'Ready for Collection',
      desc: isArabic ? 'المركبة جاهزة في ساحة دبي الصناعية' : 'Yard 4B Bay #12 Inspection Cleared',
      status: gatePassGenerated ? 'COMPLETED' : 'ACTIVE'
    },
    {
      id: 4,
      title: isArabic ? 'خروج المركبة من البوابة' : 'Handover & Gate Exit',
      desc: isArabic ? 'مسح تصريح الدخول ومطابقة الهوية' : 'Security Check & Physical Release',
      status: gatePassGenerated ? 'ACTIVE' : 'PENDING'
    }
  ];

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    setGatePassGenerated(true);
    setGatePassSuccessNotice(true);
    setTimeout(() => setGatePassSuccessNotice(false), 5000);
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Banner Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('WON_AUCTIONS')}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Back to Won Auctions"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-[#059669]">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#059669]">
                {isArabic ? 'إجراءات التسليم وتصريح الخروج' : 'Vehicle Delivery & Gate Pass Dispatch'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {isArabic ? 'حجز موعد الاستلام وتصريح البوابة' : 'Yard Collection & Gate Pass Issuance'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Lot: <span className="font-bold text-[#059669]">LOT-DXB-9021</span> • 2023 Mercedes-Benz G63 AMG 4MATIC V8 Biturbo
            </p>
          </div>
        </div>

        {onBackToWon && (
          <button
            onClick={onBackToWon}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            {isArabic ? '← العودة للمزادات الفائزة' : '← Back to Won Lots'}
          </button>
        )}
      </div>

      {gatePassSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Official QR Gate Pass successfully generated and registered with Yard Security!</span>
        </div>
      )}

      {/* 4-Stage Stepper Progress Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          {isArabic ? 'مراحل تسليم المركبة' : 'Delivery & Release Progression'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((st) => {
            const isCompleted = st.status === 'COMPLETED';
            const isActive = st.status === 'ACTIVE';

            return (
              <div 
                key={st.id} 
                className={`p-4 rounded-xl border transition ${
                  isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' 
                    : isActive 
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted 
                      ? 'bg-[#059669] text-white' 
                      : isActive 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.id}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isActive 
                      ? 'bg-amber-100 text-amber-800 animate-pulse' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {st.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-0.5">{st.title}</h3>
                <p className="text-[11px] opacity-80 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Columns: Yard Details & Gate Pass Card | Appointment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Yard Location & Gate Pass View */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Yard Location & Working Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#059669]" />
              <span>{isArabic ? 'بيانات الساحة ومواعيد العمل' : 'Designated Yard & Working Hours'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <Navigation className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">AJ Yard 4B - Dubai Industrial City (DIC)</div>
                  <div className="text-slate-500 mt-0.5">Plot 598-1120, Saih Shuaib 2, Near Al Maktoum Int Airport, Dubai, UAE</div>
                  <div className="mt-2 flex items-center gap-4 text-[11px]">
                    <span className="text-[#059669] font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Mon - Sat: 08:00 AM - 06:00 PM GST
                    </span>
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Yard Dispatch: +971 4 800 2528
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Printable QR Gate Pass */}
          {gatePassGenerated && (
            <div className="bg-white p-6 rounded-2xl border-2 border-[#059669] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-[#059669]" />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      {isArabic ? 'تصريح خروج المركبة المعتمد (QR Gate Pass)' : 'Official AJ Gate Pass • QR Clearance'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">PASS-DXB-9021-SECURE</span>
                  </div>
                </div>
                <button
                  onClick={handlePrintPass}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isArabic ? 'طباعة التصريح' : 'Print Pass'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Authorized Collector</span>
                  <div className="font-bold text-slate-900 mt-0.5">{collectorName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Emirates ID: {emiratesId}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Recovery / Transport Vehicle</span>
                  <div className="font-bold text-slate-900 mt-0.5">{recoveryPlate}</div>
                  <div className="text-[10px] text-slate-500">Flatbed Recovery Truck</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Scheduled Slot</span>
                  <div className="font-bold text-[#059669] mt-0.5">{selectedDate}</div>
                  <div className="text-[10px] text-slate-500">{selectedSlot}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Bay</span>
                  <div className="font-bold text-slate-900 mt-0.5">Yard 4B - Bay #12 (Pre-Staged)</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">150-Point Pre-Delivery Cleared</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Present this QR pass and original Emirates ID at Gate 2 Security Booth upon arrival.</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (5 cols): Appointment Booking Card */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#059669]" />
              <span>{isArabic ? 'تحديث موعد الاستلام وبيانات السائق' : 'Book / Reschedule Collection Slot'}</span>
            </h3>

            <form onSubmit={handleGeneratePass} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isArabic ? 'تاريخ الاستلام' : 'Collection Date (UAE Working Days)'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-11-22"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#059669]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isArabic ? 'الفترة الزمنية' : 'Collection Time Slot'}
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#059669]"
                >
                  <option value="09:00 AM - 11:00 AM GST">09:00 AM - 11:00 AM GST (Morning)</option>
                  <option value="11:00 AM - 01:00 PM GST">11:00 AM - 01:00 PM GST (Midday)</option>
                  <option value="02:00 PM - 04:00 PM GST">02:00 PM - 04:00 PM GST (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM GST">04:00 PM - 06:00 PM GST (Evening)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isArabic ? 'اسم السائق أو المفوض بالاستلام' : 'Authorized Collector / Driver Full Name'}
                </label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#059669]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isArabic ? 'رقم الهوية الإماراتية للمستلم' : 'Collector Emirates ID (784-XXXX-XXXXXXX-X)'}
                </label>
                <input
                  type="text"
                  value={emiratesId}
                  onChange={(e) => setEmiratesId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#059669]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isArabic ? 'رقم لوحة شاحنة الريكفري / النقل' : 'Recovery / Flatbed Plate Number'}
                </label>
                <input
                  type="text"
                  value={recoveryPlate}
                  onChange={(e) => setRecoveryPlate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#059669]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#7ED321] hover:bg-[#6ec217] text-[#0B132B] font-black rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isArabic ? 'توليد وتحديث تصريح البوابة (QR Pass)' : 'Confirm Slot & Issue QR Gate Pass'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
