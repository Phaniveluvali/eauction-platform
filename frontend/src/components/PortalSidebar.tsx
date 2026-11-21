import React from 'react';
import { 
  Home, 
  Search, 
  Gavel, 
  Zap, 
  Calendar, 
  HelpCircle, 
  MessageSquare, 
  Info, 
  Headphones,
  ShieldCheck,
  Truck,
  Heart,
  CreditCard,
  LayoutDashboard,
  Trophy,
  Receipt,
  Car,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Shield
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
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  lang = 'EN',
}) => {
  const { t } = useTranslation(lang);
  const isBuyer = currentUser?.role === 'BUYER';
  const isSeller = currentUser?.role === 'SELLER';
  const isAdmin = currentUser?.role === 'ADMIN' || Boolean(currentUser?.isSuperAdmin || (currentUser as any)?.superAdmin);

  return (
    <aside className="w-56 sm:w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col shrink-0 select-none">
      
      {/* Top AJ Logo */}
      <div 
        onClick={() => onNavigate('HOME')}
        className="p-5 border-b border-slate-100 cursor-pointer hover:opacity-90 transition flex items-center justify-start"
      >
        <img 
          src={getAssetUrl('/assets/logo-aj.png')} 
          alt="AJ Auctions • Powered by AshwikTechnologies" 
          className="h-10 w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');
          }}
        />
      </div>

      {/* Navigation List */}
      <nav className="p-4 space-y-6 flex-1 text-xs sm:text-sm overflow-y-auto">
        
        {/* Home */}
        <div>
          <button
            onClick={() => onNavigate('HOME')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              currentView === 'HOME'
                ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'AR' ? 'الرئيسية' : 'Home'}</span>
          </button>
        </div>

        {/* Section: Buyer Portal (When logged in as BUYER or visiting buyer pages) */}
        {(isBuyer || currentView === 'BUYER_DASHBOARD' || currentView === 'MY_BIDS' || currentView === 'WON_AUCTIONS' || currentView === 'DELIVERY_COLLECTION' || currentView === 'PAYMENTS') && (
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'AR' ? 'بوابة المشتري' : 'Buyer Hub'}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">AED</span>
            </div>

            <button
              onClick={() => onNavigate('BUYER_DASHBOARD')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'BUYER_DASHBOARD'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'AR' ? 'لوحة تحكم المزايد' : 'Buyer Overview'}</span>
            </button>

            <button
              onClick={() => onNavigate('MY_BIDS')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'MY_BIDS'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Gavel className="w-4 h-4 text-slate-500" />
              <span>{lang === 'AR' ? 'مزايداتي النشطة' : 'My Active Bids'}</span>
            </button>

            <button
              onClick={() => onNavigate('WON_AUCTIONS')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'WON_AUCTIONS'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{lang === 'AR' ? 'المركبات الفائزة' : 'Won Auctions'}</span>
            </button>

            <button
              onClick={() => onNavigate('DELIVERY_COLLECTION')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'DELIVERY_COLLECTION'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4 text-blue-600" />
              <span>{lang === 'AR' ? 'حجز الاستلام وتصريح البوابة' : 'Yard Collection & Pass'}</span>
            </button>

            <button
              onClick={() => onNavigate('PAYMENTS')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'PAYMENTS'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>{lang === 'AR' ? 'الفواتير والمدفوعات (AED)' : 'Invoices & Ledger'}</span>
            </button>
          </div>
        )}

        {/* Section: Seller Portal (When logged in as SELLER or visiting seller pages) */}
        {(isSeller || currentView === 'SELLER_DASHBOARD' || currentView === 'SELLER_CREATE_LISTING') && (
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'AR' ? 'بوابة البائع' : 'Seller Hub'}</span>
              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Consignor</span>
            </div>

            <button
              onClick={() => onNavigate('SELLER_DASHBOARD')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'SELLER_DASHBOARD'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'AR' ? 'أداء المبيعات والمخزون' : 'Seller Dashboard'}</span>
            </button>

            <button
              onClick={() => onNavigate('SELLER_CREATE_LISTING')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'SELLER_CREATE_LISTING'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>{lang === 'AR' ? '+ إضافة مركبة للمزاد' : '+ List Vehicle (AED)'}</span>
            </button>
          </div>
        )}

        {/* Section: Admin Shortcut (if Admin) */}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              {lang === 'AR' ? 'الإدارة والعمليات' : 'Administration'}
            </div>
            <button
              onClick={() => onNavigate('ADMIN')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                currentView === 'ADMIN'
                  ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>{lang === 'AR' ? 'لوحة التحكم المركزية' : 'Admin Operations'}</span>
            </button>
          </div>
        )}

        {/* Section: Vehicle Finder */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'AR' ? 'البحث في الكتالوج' : 'Vehicle Finder'}
          </div>
          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              currentView === 'ONLINE_AUCTIONS'
                ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'بحث الكتالوج المباشر' : 'Search Catalog (300+)'}</span>
          </button>
        </div>

        {/* Section: Auctions */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'AR' ? 'أسواق المزادات' : 'Marketplaces'}
          </div>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Gavel className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'المزايدة المباشرة' : 'Live Bidding'}</span>
          </button>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{lang === 'AR' ? 'فرص اليوم' : "Today's Drops"}</span>
          </button>

          <button
            onClick={() => onNavigate('SILENT_AUCTIONS')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              currentView === 'SILENT_AUCTIONS'
                ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'المزادات الصامتة' : 'Silent Auctions (50)'}</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
              currentView === 'HELP'
                ? 'text-emerald-700 bg-emerald-50 font-bold border-r-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'فحص 150 نقطة' : '150-Point Inspection'}</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'الأسئلة الشائعة' : 'Buyer FAQs'}</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>{lang === 'AR' ? 'عن AJ للمزادات' : 'About AJ Auctions'}</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'AR' ? 'الدعم على مدار الساعة' : 'Contact 24/7 (UAE)'}</span>
          </button>
        </div>

      </nav>

      {/* Footer Branding in Sidebar */}
      <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 flex flex-col gap-1">
        <div className="font-semibold text-slate-600">AJ Auctions • UAE</div>
        <div>Powered by AshwikTechnologies © 2026</div>
      </div>

    </aside>
  );
};
