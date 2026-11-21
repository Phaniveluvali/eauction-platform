import React from 'react';
import { Truck, Users, Store, Award, Shield } from 'lucide-react';
import { Language } from './i18n';

interface StatsCounterStripProps {
  isArabic?: boolean;
  lang?: Language;
}

export const StatsCounterStrip: React.FC<StatsCounterStripProps> = ({ isArabic: isArabicProp = false, lang = 'EN' }) => {
  const isArabic = lang === 'AR' || isArabicProp;
  const stats = [
    {
      icon: Truck,
      val: '15K+',
      label: isArabic ? 'مركبة مباعة بنجاح' : 'Vehicles Auctioned',
    },
    {
      icon: Users,
      val: '12K+',
      label: isArabic ? 'مشترٍ مسجل ومعتمد' : 'Registered Buyers',
    },
    {
      icon: Store,
      val: '3K+',
      label: isArabic ? 'بائع وتاجر موثق' : 'Verified Sellers',
    },
    {
      icon: Award,
      val: '99.5%',
      label: isArabic ? 'نسبة نجاح المزادات' : 'Successful Auctions',
    },
    {
      icon: Shield,
      val: '100%',
      label: isArabic ? 'آمن ومتوافق قانونياً' : 'Secure & Compliant',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-[#031525] via-[#052b21] to-[#031525] border-y border-emerald-900/40 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {s.val}
                </div>
                <div className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
