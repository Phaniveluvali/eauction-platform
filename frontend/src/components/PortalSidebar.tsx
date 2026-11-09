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
  Truck
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
      <nav className="p-4 space-y-6 flex-1 text-xs sm:text-sm">
        
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
            <span>Home</span>
          </button>
        </div>

        {/* Section: Vehicle Finder */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Vehicle Finder
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
            <span>Search Catalog</span>
          </button>
        </div>

        {/* Section: Auctions */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Marketplaces
          </div>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Gavel className="w-4 h-4 text-slate-400" />
            <span>Live Bidding</span>
          </button>

          <button
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Today's Drops</span>
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
            <span>Silent Auctions</span>
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
            <span>150-Point Inspection</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Buyer FAQs</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>About AJ Auctions</span>
          </button>

          <button
            onClick={() => onNavigate('HELP')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-emerald-600" />
            <span>Contact 24/7</span>
          </button>
        </div>

      </nav>

      {/* Footer Branding in Sidebar */}
      <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400">
        AJ Auctions • Powered by AshwikTechnologies © 2026
      </div>

    </aside>
  );
};
