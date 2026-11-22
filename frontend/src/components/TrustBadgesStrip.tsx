import React from 'react';
import { ShieldCheck, RefreshCw, Lock, CheckCircle2, Headphones } from 'lucide-react';
import { Language } from './i18n';

interface TrustBadgesStripProps {
  isArabic?: boolean;
  lang?: Language;
}

export const TrustBadgesStrip: React.FC<TrustBadgesStripProps> = ({ isArabic: isArabicProp = false, lang = 'EN' }) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const badges = [
    {
      icon: CheckCircle2,
      title: isArabic ? 'مركبات مفحوصة وموثقة' : 'Verified Vehicles',
      desc: isArabic ? 'فحص فني شامل ومعتمد' : '150-Point Inspection',
    },
    {
      icon: RefreshCw,
      title: isArabic ? 'عملية شفافة' : 'Transparent Process',
      desc: isArabic ? 'مزايدة مباشرة دون رسوم خفية' : 'Zero Hidden Bidding Fees',
    },
    {
      icon: Lock,
      title: isArabic ? 'مدفوعات آمنة' : 'Secure Payments',
      desc: isArabic ? 'حساب ضمان مصرفي إماراتي' : 'UAE Central Bank Escrow',
    },
    {
      icon: ShieldCheck,
      title: isArabic ? 'فحص فني متعدد النقاط' : 'Multi-Point Inspection',
      desc: isArabic ? 'تقارير فنية دقيقة ومعتمدة' : 'RTA & Tasjeel Certified',
    },
    {
      icon: Headphones,
      title: isArabic ? 'دعم مخصص 24/7' : 'Dedicated Support',
      desc: isArabic ? 'فريق خدمة عملاء إماراتي متخصص' : 'VIP Concierge & Auction Support',
    },
  ];

  return (
    <div className="relative -mt-6 sm:-mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 lg:divide-x lg:divide-slate-100">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3 p-2 group hover:opacity-90 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-slate-900 text-xs sm:text-sm font-bold truncate">{b.title}</h4>
                  <p className="text-slate-500 text-[11px] truncate">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
