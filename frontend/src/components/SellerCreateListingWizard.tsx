import React, { useState } from 'react';
import { 
  Car, 
  FileText, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Calendar, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTranslation, Language } from './i18n';

interface SellerCreateListingWizardProps {
  lang?: Language;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
}

export const SellerCreateListingWizard: React.FC<SellerCreateListingWizardProps> = ({
  lang = 'EN',
  onCancel,
  onSubmitSuccess
}) => {
  const { t, formatAed } = useTranslation(lang);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Vehicle Details
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: '2024',
    mileageKm: '12,500',
    vin: 'WDB96321458921102',
    spec: 'GCC Spec',
    emirate: 'Dubai (DXB)',
    exteriorColor: 'Obsidian Black Metallic',
    interiorColor: 'Designo Bengal Red Leather',
    bodyType: 'SUV',
    transmission: 'Automatic 9G-TRONIC',

    // Step 2: Documents
    mulkiyaNumber: 'MK-DXB-992144',
    rtaCertificateNo: 'RTA-TAS-2026-7781',
    hasMortgage: 'NO',
    mulkiyaUploaded: true,
    rtaPassed: true,

    // Step 3: Inspection
    inspectionType: 'AJ_YARD_INSPECTION', // or 'UPLOAD_EXISTING'
    selectedYard: 'AJ Yard 4B - Dubai Industrial City (DIC)',
    inspectionDate: '2026-11-24',

    // Step 4: Auction Pricing & Schedule (AED)
    startingBidAed: 450000,
    reservePriceAed: 620000,
    buyNowPriceAed: 710000,
    auctionType: 'ONLINE',
    durationDays: 5,
  });

  const steps = [
    { number: 1, title: lang === 'AR' ? 'بيانات المركبة' : 'Vehicle Specifications', icon: Car },
    { number: 2, title: lang === 'AR' ? 'الملكية والوثائق' : 'Mulkiya & Ownership', icon: FileText },
    { number: 3, title: lang === 'AR' ? 'الفحص الفني 150 نقطة' : '150-Point Inspection', icon: ShieldCheck },
    { number: 4, title: lang === 'AR' ? 'التسعير بالدرهم والمزاد' : 'Pricing (AED) & Schedule', icon: DollarSign },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        setTimeout(onSubmitSuccess, 1800);
      }
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-emerald-200 text-center shadow-lg max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {lang === 'AR' ? 'تم إرسال المركبة للفحص والاعتماد بنجاح!' : 'Vehicle Listing Submitted for Approval!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {lang === 'AR'
            ? 'تم تسجيل المركبة برقم مرجعي LOT-DXB-9901. سيقوم فريق العمليات ومفتشو RTA بمطابقة الوثائق خلال ساعتين.'
            : 'Reference: LOT-DXB-9901. Our operations team and certified inspectors will verify the Mulkiya and schedule yard inspection.'}
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left font-mono space-y-1">
          <div><span className="text-slate-400">Make & Model:</span> <span className="font-bold text-slate-800">{formData.year} {formData.make} {formData.model}</span></div>
          <div><span className="text-slate-400">Starting Bid:</span> <span className="font-bold text-emerald-700">{formatAed(formData.startingBidAed)}</span></div>
          <div><span className="text-slate-400">Reserve Price:</span> <span className="font-bold text-slate-800">{formatAed(formData.reservePriceAed)}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {lang === 'AR' ? 'معالج إدراج مركبة جديدة' : 'Certified Seller Wizard'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {lang === 'AR' ? 'إضافة مركبة لمزاد AJ المباشر' : 'List Vehicle for Public / Silent Auction'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {lang === 'AR'
                ? 'إدراج معتمد طبقا لمعايير هيئة الطرق والمواصلات RTA والتسعير بالدرهم الإماراتي (AED).'
                : 'Compliant with UAE RTA regulations & official UAE Dirham (AED) auction pricing standard.'}
            </p>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              {lang === 'AR' ? 'إلغاء' : 'Cancel & Exit'}
            </button>
          )}
        </div>
      </div>

      {/* Stepper Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((st) => {
            const isCurrent = currentStep === st.number;
            const isDone = currentStep > st.number;
            const Icon = st.icon;
            return (
              <div 
                key={st.number}
                onClick={() => isDone && setCurrentStep(st.number)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                  isCurrent 
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' 
                    : isDone 
                    ? 'bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-white border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                  isCurrent 
                    ? 'bg-emerald-600 text-white' 
                    : isDone 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Step {st.number}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {st.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Step 1: Vehicle Specs */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'AR' ? 'البيانات الأساسية للمركبة والمواصفات' : 'Vehicle Specifications & Specs'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                <input 
                  type="text" 
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                <input 
                  type="text" 
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                <select 
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                  <option>2021</option>
                  <option>2020</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mileage (Kilometers)</label>
                <input 
                  type="text" 
                  value={formData.mileageKm}
                  onChange={(e) => setFormData({ ...formData, mileageKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 15,000 km"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chassis / VIN Number</label>
                <input 
                  type="text" 
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Regional Spec</label>
                <select 
                  value={formData.spec}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>GCC Spec (Gulf)</option>
                  <option>American Spec</option>
                  <option>European Spec</option>
                  <option>Japanese Spec</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Emirate</label>
                <select 
                  value={formData.emirate}
                  onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>Dubai (DXB)</option>
                  <option>Abu Dhabi (AUH)</option>
                  <option>Sharjah (SHJ)</option>
                  <option>Ajman (AJM)</option>
                  <option>Ras Al Khaimah (RAK)</option>
                  <option>Fujairah (FUJ)</option>
                  <option>Umm Al Quwain (UAQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exterior Color</label>
                <input 
                  type="text" 
                  value={formData.exteriorColor}
                  onChange={(e) => setFormData({ ...formData, exteriorColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Body Type</label>
                <select 
                  value={formData.bodyType}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option>SUV / 4x4</option>
                  <option>Sedan</option>
                  <option>Coupe / Sport</option>
                  <option>Supercar / Exotic</option>
                  <option>Heavy Equipment / Truck</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mulkiya & Ownership */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'AR' ? 'وثائق الملكية وشهادة الحيازة (Mulkiya)' : 'Mulkiya Registration & RTA Possession'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mulkiya (Registration Card) Number</label>
                <input 
                  type="text" 
                  value={formData.mulkiyaNumber}
                  onChange={(e) => setFormData({ ...formData, mulkiyaNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RTA / Tasjeel Inspection No.</label>
                <input 
                  type="text" 
                  value={formData.rtaCertificateNo}
                  onChange={(e) => setFormData({ ...formData, rtaCertificateNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Upload Mulkiya (Front & Back)</label>
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-50 transition">
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800">
                    Mulkiya_Front_Back_DXB992144.pdf (Uploaded & Verified)
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ Verified by RTA Smart Gate Integration
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 150-Point Inspection */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'AR' ? 'الفحص الفني الشامل المعتمد 150 نقطة' : '150-Point Certified Technical Inspection'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setFormData({ ...formData, inspectionType: 'AJ_YARD_INSPECTION' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                  formData.inspectionType === 'AJ_YARD_INSPECTION' 
                    ? 'border-emerald-600 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Book Free Yard Inspection</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Complimentary</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bring your vehicle to our certified technicians at AJ Yard in Dubai Industrial City or Sharjah. Full chassis, engine, and paint depth analysis.
                </p>
              </div>

              <div 
                onClick={() => setFormData({ ...formData, inspectionType: 'UPLOAD_EXISTING' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                  formData.inspectionType === 'UPLOAD_EXISTING' 
                    ? 'border-emerald-600 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Upload Tasjeel / RTA Report</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Pre-Inspected</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If you already hold a valid Tasjeel Comprehensive Pass certificate issued within the last 30 days, attach it directly.
                </p>
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800 mb-2">Selected Inspection Yard</div>
                <div className="text-xs text-slate-700 font-semibold">{formData.selectedYard}</div>
                <div className="text-[11px] text-slate-500 mt-1">Inspection Slot: 24 Nov 2026, 10:00 AM GST</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing in AED & Review */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'AR' ? 'تسعير المزاد بالدرهم الإماراتي وتحديد المدة' : 'Auction Pricing (AED) & Schedule'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Bid (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">AED</span>
                  <input 
                    type="number" 
                    value={formData.startingBidAed}
                    onChange={(e) => setFormData({ ...formData, startingBidAed: Number(e.target.value) })}
                    className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reserve Price (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">AED</span>
                  <input 
                    type="number" 
                    value={formData.reservePriceAed}
                    onChange={(e) => setFormData({ ...formData, reservePriceAed: Number(e.target.value) })}
                    className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Hidden minimum for winning hammer</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buy-Now Price (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">AED</span>
                  <input 
                    type="number" 
                    value={formData.buyNowPriceAed}
                    onChange={(e) => setFormData({ ...formData, buyNowPriceAed: Number(e.target.value) })}
                    className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Instant sale bypass</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auction Format</label>
                <select 
                  value={formData.auctionType}
                  onChange={(e) => setFormData({ ...formData, auctionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ONLINE">Public Live Online Bidding</option>
                  <option value="SILENT">Silent Sealed Bidding</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auction Duration</label>
                <select 
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value={3}>3 Days Drop</option>
                  <option value={5}>5 Days Regular</option>
                  <option value={7}>7 Days Extended</option>
                </select>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                {lang === 'AR' ? 'ملخص الإدراج قبل النشر' : 'Listing Confirmation Summary'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 pt-1">
                <div><span className="text-slate-400 block text-[10px]">VEHICLE:</span> <span className="font-bold text-slate-800">{formData.year} {formData.make} {formData.model}</span></div>
                <div><span className="text-slate-400 block text-[10px]">STARTING BID:</span> <span className="font-bold text-emerald-700">{formatAed(formData.startingBidAed)}</span></div>
                <div><span className="text-slate-400 block text-[10px]">RESERVE:</span> <span className="font-bold text-slate-800">{formatAed(formData.reservePriceAed)}</span></div>
                <div><span className="text-slate-400 block text-[10px]">SELLER PAYOUT:</span> <span className="font-bold text-blue-700">95% Hammer</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'AR' ? 'السابق' : 'Previous Step'}</span>
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <span>{lang === 'AR' ? 'التالي' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'AR' ? 'جاري الإرسال...' : 'Submitting...') : (lang === 'AR' ? 'تأكيد وإرسال للمراجعة والاعتماد' : 'Submit Listing to Operations')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
