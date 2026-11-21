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
    <section className="bg-slate-900 border-y border-slate-800/80 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/40 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white text-xs sm:text-sm font-semibold truncate">{b.title}</h4>
                  <p className="text-slate-400 text-[11px] truncate">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
