import React from 'react';
import { Home, Search, Gavel, Heart, LayoutDashboard } from 'lucide-react';
import { PortalView } from './PortalSidebar';
import { Language } from './i18n';

interface MobileBottomNavProps {
  currentView: PortalView;
  onNavigate: (view: PortalView) => void;
  lang?: Language;
  activeBidsCount?: number;
  watchlistCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  lang = 'EN',
  activeBidsCount = 0,
  watchlistCount = 0,
}) => {
  const isArabic = lang === 'AR';

  const navItems: Array<{
    view: PortalView;
    label: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    {
      view: 'HOME',
      label: 'Home',
      labelAr: 'الرئيسية',
      icon: Home,
    },
    {
      view: 'ONLINE_AUCTIONS',
      label: 'Auctions',
      labelAr: 'المزادات',
      icon: Search,
    },
    {
      view: 'MY_BIDS',
      label: 'My Bids',
      labelAr: 'مزايداتي',
      icon: Gavel,
      count: activeBidsCount,
    },
    {
      view: 'FAVORITES',
      label: 'Watchlist',
      labelAr: 'المراقبة',
      icon: Heart,
      count: watchlistCount,
    },
    {
      view: 'BUYER_DASHBOARD',
      label: 'Dashboard',
      labelAr: 'لوحتي',
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const active = currentView === item.view;
        const Icon = item.icon;

        return (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer relative min-w-[56px] ${
              active
                ? 'text-[#0B132B]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${active ? 'bg-[#7ED321] text-[#0B132B]' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-black text-[#0B132B]' : 'font-medium'}`}>
              {isArabic ? item.labelAr : item.label}
            </span>

            {/* Dynamic badge */}
            {item.count !== undefined && item.count > 0 && (
              <span className="absolute top-0.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
