import React from 'react';
import { 
  Home, 
  Search, 
  Gavel, 
  Zap, 
  Clock, 
  HelpCircle, 
  Heart, 
  CreditCard, 
  LayoutDashboard, 
  Trophy, 
  Receipt, 
  Truck, 
  Bell, 
  User as UserIcon, 
  Settings as SettingsIcon,
  Bookmark,
  ChevronRight,
  Shield,
  PlusCircle,
  TrendingUp,
  X,
  Menu
} from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { User } from '../types';
import { Language, useTranslation } from './i18n';

export type PortalView = 
  | 'HOME' 
  | 'ONLINE_AUCTIONS' 
  | 'SILENT_AUCTIONS' 
  | 'HELP' 
  | 'SIGNIN_SIGNUP' 
  | 'SIGNUP' 
  | 'SIGNIN' 
  | 'ADMIN'
  | 'AUCTION_ROOM'
  | 'VEHICLE_DETAILS'
  | 'SECURITY_DEPOSIT'
  | 'FAVORITES'
  | 'BUYER_DASHBOARD'
  | 'MY_BIDS'
  | 'WON_AUCTIONS'
  | 'DELIVERY_COLLECTION'
  | 'PAYMENTS'
  | 'SELLER_DASHBOARD'
  | 'SELLER_CREATE_LISTING';

interface PortalSidebarProps {
  currentView: PortalView;
  onNavigate: (view: PortalView) => void;
  currentUser?: User | null;
  lang?: Language;
  counts?: {
    allAuctions?: number;
    activeAuctions?: number;
    silentAuctions?: number;
    myBids?: number;
    watchlist?: number;
    wonAuctions?: number;
  };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  lang = 'EN',
  counts = {},
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isArabic = lang === 'AR';
  const isBuyer = currentUser?.role === 'BUYER';
  const isSeller = currentUser?.role === 'SELLER';
  const isAdmin = currentUser?.role === 'ADMIN' || Boolean(currentUser?.isSuperAdmin || (currentUser as any)?.superAdmin);

  // Dynamic counts fallback to 0
  const allCount = counts.allAuctions ?? 0;
  const activeCount = counts.activeAuctions ?? 0;
  const silentCount = counts.silentAuctions ?? 0;
  const myBidsCount = counts.myBids ?? 0;
  const watchlistCount = counts.watchlist ?? 0;
  const wonCount = counts.wonAuctions ?? 0;

  interface MenuItem {
    id: PortalView | 'SAVED_SEARCHES' | 'NOTIFICATIONS' | 'PROFILE' | 'SETTINGS';
    label: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    targetView?: PortalView;
    category?: 'buyer' | 'general' | 'seller' | 'admin';
  }

  const menuItems: MenuItem[] = [
    {
      id: 'BUYER_DASHBOARD',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: LayoutDashboard,
      targetView: 'BUYER_DASHBOARD',
      category: 'buyer',
    },
    {
      id: 'ONLINE_AUCTIONS',
      label: 'Browse Auctions',
      labelAr: 'تصفح المزادات',
      icon: Search,
      count: allCount,
      targetView: 'ONLINE_AUCTIONS',
      category: 'buyer',
    },
    {
      id: 'ONLINE_AUCTIONS',
      label: 'Active Auctions',
      labelAr: 'المزادات النشطة',
      icon: Gavel,
      count: activeCount,
      targetView: 'ONLINE_AUCTIONS',
      category: 'buyer',
    },
    {
      id: 'SILENT_AUCTIONS',
      label: 'Silent Auctions',
      labelAr: 'المزادات الصامتة',
      icon: Zap,
      count: silentCount,
      targetView: 'SILENT_AUCTIONS',
      category: 'buyer',
    },
    {
      id: 'MY_BIDS',
      label: 'My Bids',
      labelAr: 'مزايداتي',
      icon: Clock,
      count: myBidsCount,
      targetView: 'MY_BIDS',
      category: 'buyer',
    },
    {
      id: 'FAVORITES',
      label: 'Watchlist',
      labelAr: 'قائمة المراقبة',
      icon: Heart,
      count: watchlistCount,
      targetView: 'FAVORITES',
      category: 'buyer',
    },
    {
      id: 'WON_AUCTIONS',
      label: 'Won Auctions',
      labelAr: 'المزادات الفائزة',
      icon: Trophy,
      count: wonCount,
      targetView: 'WON_AUCTIONS',
      category: 'buyer',
    },
    {
      id: 'SAVED_SEARCHES',
      label: 'Saved Searches',
      labelAr: 'عمليات البحث المحفوظة',
      icon: Bookmark,
      targetView: 'ONLINE_AUCTIONS',
      category: 'buyer',
    },
    {
      id: 'PAYMENTS',
      label: 'Payments',
      labelAr: 'المدفوعات',
      icon: CreditCard,
      targetView: 'PAYMENTS',
      category: 'buyer',
    },
    {
      id: 'PAYMENTS',
      label: 'Invoices & Ledger',
      labelAr: 'الفواتير والسجل',
      icon: Receipt,
      targetView: 'PAYMENTS',
      category: 'buyer',
    },
    {
      id: 'DELIVERY_COLLECTION',
      label: 'Delivery / Collection',
      labelAr: 'التسليم والاستلام',
      icon: Truck,
      targetView: 'DELIVERY_COLLECTION',
      category: 'buyer',
    },
    {
      id: 'NOTIFICATIONS',
      label: 'Notifications',
      labelAr: 'الإشعارات',
      icon: Bell,
      category: 'general',
    },
    {
      id: 'PROFILE',
      label: 'Profile',
      labelAr: 'الملف الشخصي',
      icon: UserIcon,
      category: 'general',
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      labelAr: 'الإعدادات',
      icon: SettingsIcon,
      category: 'general',
    },
    {
      id: 'HELP',
      label: 'Help & Support',
      labelAr: 'المساعدة والدعم',
      icon: HelpCircle,
      targetView: 'HELP',
      category: 'general',
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.targetView) {
      onNavigate(item.targetView);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isItemActive = (item: MenuItem) => {
    if (item.id === 'BUYER_DASHBOARD' && currentView === 'BUYER_DASHBOARD') return true;
    if (item.id === 'MY_BIDS' && currentView === 'MY_BIDS') return true;
    if (item.id === 'FAVORITES' && currentView === 'FAVORITES') return true;
    if (item.id === 'WON_AUCTIONS' && currentView === 'WON_AUCTIONS') return true;
    if (item.id === 'DELIVERY_COLLECTION' && currentView === 'DELIVERY_COLLECTION') return true;
    if (item.id === 'PAYMENTS' && currentView === 'PAYMENTS') return true;
    if (item.id === 'ONLINE_AUCTIONS' && currentView === 'ONLINE_AUCTIONS') return true;
    if (item.id === 'SILENT_AUCTIONS' && currentView === 'SILENT_AUCTIONS') return true;
    if (item.id === 'HELP' && currentView === 'HELP') return true;
    return false;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#0B132B] text-slate-300 select-none">
      {/* Brand Header */}
      <div 
        onClick={() => onNavigate('HOME')}
        className="p-4 lg:p-5 border-b border-slate-800/80 cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <img 
            src={getAssetUrl('/assets/nav-logo-exact-v3.png')} 
            alt="AJ Auctions" 
            className="h-8 lg:h-9 w-auto object-contain brightness-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('/assets/logo-aj.png');
            }}
          />
        </div>
        {onCloseMobile && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onCloseMobile();
            }} 
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Telemetry Pill (Compact) */}
      {currentUser && (
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7ED321] text-[#0B132B] font-black text-xs flex items-center justify-center shrink-0">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="hidden lg:block min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser.fullName || 'Verified Bidder'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser.role || 'BUYER'} • UAE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 lg:px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item, idx) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => handleItemClick(item)}
              title={isArabic ? item.labelAr : item.label}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                active 
                  ? 'bg-[#7ED321] text-[#0B132B] shadow-md shadow-[#7ED321]/20 font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition ${active ? 'text-[#0B132B]' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="hidden lg:inline truncate">
                  {isArabic ? item.labelAr : item.label}
                </span>
              </div>

              {/* Dynamic Count Badge */}
              {item.count !== undefined && item.count > 0 && (
                <span className={`hidden lg:inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active 
                    ? 'bg-[#0B132B] text-[#7ED321]' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Seller Shortcut if logged in as SELLER */}
        {isSeller && (
          <div className="pt-3 mt-3 border-t border-slate-800/60">
            <div className="hidden lg:block px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Seller Hub
            </div>
            <button
              onClick={() => onNavigate('SELLER_DASHBOARD')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'SELLER_DASHBOARD'
                  ? 'bg-[#7ED321] text-[#0B132B] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="hidden lg:inline">Seller Dashboard</span>
              </div>
            </button>
          </div>
        )}

        {/* Admin Shortcut if Admin */}
        {isAdmin && (
          <div className="pt-2">
            <button
              onClick={() => onNavigate('ADMIN')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'ADMIN'
                  ? 'bg-[#7ED321] text-[#0B132B] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="hidden lg:inline">Admin Console</span>
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-500">
        <div className="hidden lg:block font-medium text-slate-400">AJ Auctions • UAE</div>
        <div className="hidden lg:block text-slate-500 text-[9px] mt-0.5">Powered by AshwikTechnologies</div>
        <div className="lg:hidden text-center font-bold text-slate-400">AJ</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Persistent Sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 w-16 lg:w-64 min-h-screen border-r border-slate-800/80 sticky top-0 h-screen z-30 transition-all duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (When Open) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
