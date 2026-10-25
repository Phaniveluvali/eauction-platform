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
  Headphones 
} from 'lucide-react';

import { getAssetUrl } from '../utils/assets';

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
  | 'FAVORITES';

interface PortalSidebarProps {
  currentView: PortalView;
  onNavigate: (view: PortalView) => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentView,
  onNavigate,
}) => {
  return (
    <aside className="w-56 sm:w-64 bg-white border-r border-[#EBEBEB] min-h-screen flex flex-col shrink-0 select-none">
      
      {/* Top AWA Logo */}
      <div 
        onClick={() => onNavigate('HOME')}
        className="p-5 border-b border-[#F0F0F0] cursor-pointer hover:opacity-90 transition flex items-center justify-start"
      >
        <img 
          src={getAssetUrl('/assets/logoawa.svg')} 
          alt="AWA Logo" 
          className="h-7 w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo.svg');
          }}
        />
      </div>

      {/* Navigation List matching reference screenshots */}
      <nav className="p-4 space-y-6 flex-1 text-xs sm:text-sm">
        
        {/* Home */}
        <div>
          <button
            onClick={() => onNavigate('HOME')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'HOME'
                ? 'text-[#D32437] bg-red-50 font-bold'
                : 'text-[#525252] hover:text-[#231F20] hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </button>
        </div>

        {/* Section: Vehicle Finder */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">
            Vehicle Finder
          </div>
          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'ONLINE_AUCTIONS'
                ? 'text-[#D32437] bg-red-50 font-bold'
                : 'text-[#525252] hover:text-[#231F20] hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search</span>
          </button>
        </div>

        {/* Section: Auctions */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">
            Auctions
          </div>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'ONLINE_AUCTIONS'
                ? 'text-[#D32437] bg-red-50 font-bold'
                : 'text-[#525252] hover:text-[#231F20] hover:bg-slate-50'
            }`}
          >
            <Gavel className="w-4 h-4 text-slate-500" />
            <span>My Bids</span>
          </button>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'ONLINE_AUCTIONS'
                ? 'text-[#D32437] bg-red-50 font-bold'
                : 'text-[#525252] hover:text-[#231F20] hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 text-slate-500" />
            <span>Today's Auctions</span>
          </button>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-[#525252] hover:text-[#231F20] hover:bg-slate-50 transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Auctions Calendar</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'HELP'
                ? 'text-[#D32437] bg-red-50 font-bold'
                : 'text-[#525252] hover:text-[#231F20] hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Help</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-[#525252] hover:text-[#231F20] hover:bg-slate-50 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>FAQs</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-[#525252] hover:text-[#231F20] hover:bg-slate-50 transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-[#525252] hover:text-[#231F20] hover:bg-slate-50 transition cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-slate-500" />
            <span>Contact Us</span>
          </button>
        </div>

      </nav>

      {/* Footer Branding in Sidebar */}
      <div className="p-4 border-t border-[#F0F0F0] text-[11px] text-slate-400">
        Al Wataneya Auctions © 2026
      </div>

    </aside>
  );
};
