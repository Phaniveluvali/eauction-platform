import React, { useState } from 'react';
import { User } from '../types';
import { PortalView } from './PortalSidebar';
import { getAssetUrl } from '../utils/assets';
import { 
  ChevronDown, 
  Search, 
  X, 
  User as UserIcon, 
  LogIn,
  Bell,
  Shield,
  Heart
} from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

export const hasAdminAccess = (user: User | null): boolean => {
  if (!user) return false;
  if (user.isSuperAdmin || (user as any).superAdmin) return true;
  if (user.role === 'ADMIN') return true;
  if (user.roles && (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'))) return true;
  if (user.permissions && (user.permissions.includes('ADMIN_PORTAL_ACCESS') || user.permissions.includes('SUPER_ADMIN_MANAGE_ALL'))) return true;
  return false;
};

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenCreateVehicle: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onQuickLogin?: (role: 'BUYER' | 'SELLER' | 'ADMIN') => void;
  onLiveNowClick?: () => void;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  onHomeClick?: () => void;
  onNavigate?: (view: PortalView) => void;
  onlineAuctionsCount?: number;
  silentAuctionsCount?: number;
  uaePlatesCount?: number;
  machineryCount?: number;
  emiratesMotoCount?: number;
  favoriteCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenCreateVehicle,
  onOpenAdmin,
  onLogout,
  onLiveNowClick,
  onSearchChange,
  onSelectCategory,
  onHomeClick,
  onNavigate,
  onlineAuctionsCount = 0,
  silentAuctionsCount = 0,
  uaePlatesCount = 0,
  machineryCount = 0,
  emiratesMotoCount = 0,
  favoriteCount = 0,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isAuctionsDropdownOpen, setIsAuctionsDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchValue);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <>
      {/* 96px Height Main Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EBEBEB] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          
          {/* AJ Auctions Brand Logo */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={onHomeClick}
              className="flex items-center text-left focus:outline-none transition hover:opacity-90 cursor-pointer"
            >
              <img 
                src={getAssetUrl('/assets/logo-aj.png')} 
                alt="AJ Auctions" 
                className="h-14 sm:h-16 w-auto object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');
                }}
              />
            </button>
          </div>

          {/* Desktop Navigation Links matching Image 1 exactly */}
          <nav className="hidden lg:flex items-center space-x-0 text-[14px] font-medium text-[#231F20]">
            
            {/* 1. LIVE NOW Indicator */}
            <button
              onClick={onLiveNowClick}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-[#E15B64] hover:text-[#D32437] font-bold text-sm tracking-wide transition cursor-pointer"
              title="Click to view live bidding auctions"
            >
              <img 
                src={getAssetUrl('/assets/hammer.svg')} 
                alt="Auction Hammer" 
                className="w-4 h-4 object-contain" 
              />
              <span>LIVE NOW</span>
            </button>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

            {/* Admin Link - ONLY VISIBLE WHEN USER HAS ADMIN/SUPERADMIN ACCESS */}
            {hasAdminAccess(currentUser) && (
              <>
                <button
                  onClick={onOpenAdmin}
                  className="px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer flex items-center gap-1.5"
                  title="Open Admin Module"
                >
                  <span>Admin</span>
                  {Boolean(currentUser?.isSuperAdmin || (currentUser as any)?.superAdmin) && (
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full uppercase">
                      Super
                    </span>
                  )}
                </button>
                <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />
              </>
            )}

            {/* 2. Home */}
            <button
              onClick={onHomeClick}
              className="px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer"
            >
              Home
            </button>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

            {/* 3. All Auctions with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsAuctionsDropdownOpen(true)}
              onMouseLeave={() => setIsAuctionsDropdownOpen(false)}
            >
              <button 
                className="flex items-center space-x-1 px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer"
                onClick={() => setIsAuctionsDropdownOpen(!isAuctionsDropdownOpen)}
              >
                <span>All Auctions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" />
              </button>

              {isAuctionsDropdownOpen && (
                <div className="absolute top-full left-0 w-60 bg-white border border-[#E5E7EB] rounded-b-xl shadow-xl py-2 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('ONLINE_AUCTIONS');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Online Auctions</span>
                    {onlineAuctionsCount > 0 && (
                      <span className="text-[11px] font-bold bg-red-100 text-[#D32437] px-2 py-0.5 rounded-full">
                        {onlineAuctionsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('SILENT_AUCTIONS');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Silent Auctions</span>
                    {silentAuctionsCount > 0 && (
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {silentAuctionsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('PLATES');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>UAE VIP Plates</span>
                    {uaePlatesCount > 0 && (
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {uaePlatesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('MACHINERY');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>Equipment & Machinery</span>
                    {machineryCount > 0 && (
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {machineryCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('EMIRATES_MOTO');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>AJ Commercial Fleet</span>
                    {emiratesMotoCount > 0 && (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {emiratesMotoCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

            {/* 4. Sell Your Car */}
            <button
              onClick={onOpenCreateVehicle}
              className="px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer"
            >
              Sell Your Car
            </button>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

            {/* Buyer Exclusive: Favorites Link */}
            {currentUser?.role === 'BUYER' && (
              <>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('FAVORITES');
                  }}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-[#231F20] hover:text-[#D32437] font-semibold transition cursor-pointer"
                  title="View your saved favorites"
                >
                  <Heart className="w-4 h-4 text-[#D32437] fill-[#D32437]" />
                  <span>Favorites</span>
                  {Number(favoriteCount) > 0 && (
                    <span className="text-[11px] font-bold bg-[#D32437] text-white px-2 py-0.5 rounded-full ml-0.5">
                      {favoriteCount}
                    </span>
                  )}
                </button>
                <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />
              </>
            )}

            {/* 5. Help Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsHelpDropdownOpen(true)}
              onMouseLeave={() => setIsHelpDropdownOpen(false)}
            >
              <button 
                className="flex items-center space-x-1 px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer"
                onClick={() => {
                  if (onNavigate) onNavigate('HELP');
                }}
              >
                <span>Help</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" />
              </button>

              {isHelpDropdownOpen && (
                <div className="absolute top-full left-0 w-52 bg-white border border-[#E5E7EB] rounded-b-xl shadow-xl py-2 z-50 animate-fadeIn">
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('HELP');
                      setIsHelpDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition cursor-pointer"
                  >
                    Help Center & Branches
                  </button>
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('HELP');
                      setIsHelpDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] border-b border-[#F3F4F6] transition cursor-pointer"
                  >
                    FAQs
                  </button>
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('HELP');
                      setIsHelpDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm text-[#231F20] hover:bg-[#FFF5F5] hover:text-[#D32437] transition cursor-pointer"
                  >
                    Contact Us (+971 8006006)
                  </button>
                </div>
              )}
            </div>

            {/* Right-Side Desktop Nav Items:
                When logged in (matching Screenshot 1):  | 👤 | 🔔 | 🔍
                When logged out: | العربية | 👤 Sign Up | 🚪 Log In | 🔍
            */}
            {currentUser ? (
              <>
                {/* 6. Profile Avatar in Circle */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer focus:outline-none"
                    title="My Account"
                  >
                    <div className="w-8 h-8 rounded-full border border-[#231F20] flex items-center justify-center text-[#231F20] bg-white shadow-xs">
                      <UserIcon className="w-4 h-4 text-slate-800" />
                    </div>
                  </button>

                  {/* Dropdown Menu matching Screenshot 5 */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-50 text-center animate-fadeIn">
                      <div className="w-16 h-16 rounded-full border-2 border-[#231F20] flex items-center justify-center mx-auto mb-2 text-[#231F20] bg-white">
                        <UserIcon className="w-10 h-10" />
                      </div>

                      <h4 className="font-bold text-[#231F20] text-base leading-tight">
                        {currentUser.fullName || 'Admin User'}
                      </h4>

                      <p className="text-xs text-[#8C8C8C] mb-2 font-mono">
                        {currentUser.email}
                      </p>

                      {/* RBAC Role & Super Admin Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                        {Boolean(currentUser.isSuperAdmin || (currentUser as any)?.superAdmin) && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            SUPER ADMIN
                          </span>
                        )}
                        <span className="text-[10px] font-bold bg-red-100 text-[#D32437] px-2 py-0.5 rounded-full">
                          ROLE: {currentUser.role}
                        </span>
                        {currentUser.kycVerified && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            KYC VERIFIED
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {hasAdminAccess(currentUser) && (
                          <button 
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenAdmin) onOpenAdmin();
                            }}
                            className="py-2 px-3 bg-red-50 border border-red-200 rounded-md text-[#D32437] font-bold hover:bg-red-100 transition cursor-pointer col-span-2"
                          >
                            Go to Admin Portal
                          </button>
                        )}

                        {currentUser.role === 'BUYER' && (
                          <button 
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onNavigate) onNavigate('FAVORITES');
                            }}
                            className="py-2 px-3 bg-red-50/80 border border-red-200 rounded-md text-[#D32437] font-bold hover:bg-red-100 transition cursor-pointer col-span-2 flex items-center justify-center gap-1.5"
                          >
                            <Heart className="w-3.5 h-3.5 fill-[#D32437]" />
                            <span>My Saved Favorites ({favoriteCount})</span>
                          </button>
                        )}

                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenAdmin) onOpenAdmin();
                          }}
                          className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          Settings
                        </button>

                        <button 
                          onClick={() => setLanguage(language === 'EN' ? 'AR' : 'EN')}
                          className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          {language === 'EN' ? 'العربية' : 'English'}
                        </button>

                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenAdmin) onOpenAdmin();
                          }}
                          className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          My Account
                        </button>

                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-red-50 hover:text-[#D32437] transition cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

                {/* 7. Notification Bell Icon */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileMenuOpen(false);
                    }}
                    className="p-1 text-[#231F20] hover:text-[#D32437] transition cursor-pointer relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4 stroke-[2]" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#D32437]" />
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn text-left">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                        <span className="text-xs font-bold text-[#231F20] uppercase tracking-wider">Notifications</span>
                        <span className="text-[10px] bg-red-100 text-[#D32437] font-bold px-2 py-0.5 rounded-full">Live Alerts</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-red-50/50 transition cursor-pointer">
                          <p className="font-semibold text-slate-800">Tata Signa 4825.TK Heavy Tipper</p>
                          <p className="text-[11px] text-slate-500">Live auction active at ₹28,00,000</p>
                          <span className="text-[10px] text-slate-400">2 mins ago</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-red-50/50 transition cursor-pointer">
                          <p className="font-semibold text-slate-800">Enterprise RBAC Session</p>
                          <p className="text-[11px] text-slate-500">
                            {Boolean(currentUser.isSuperAdmin || (currentUser as any)?.superAdmin)
                              ? 'Root Super Admin permissions verified'
                              : 'Standard role permissions active'}
                          </p>
                          <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 6. Language Switch: العربية */}
                <button
                  onClick={() => setLanguage(language === 'EN' ? 'AR' : 'EN')}
                  className="px-2.5 py-1 text-[#231F20] font-medium hover:text-[#D32437] transition cursor-pointer font-sans"
                  title="Switch language"
                >
                  {language === 'EN' ? 'العربية' : 'English'}
                </button>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

                {/* Sign Up with red person icon -> Direct Keycloak OIDC Registration */}
                <button
                  onClick={() => initiateKeycloakLogin({ action: 'register' })}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-[#231F20] hover:text-[#D32437] transition font-medium cursor-pointer"
                  title="Sign up with Keycloak Secure SSO"
                >
                  <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-[#D32437]">
                    <UserIcon className="w-3.5 h-3.5 text-[#D32437]" />
                  </span>
                  <span>Sign Up</span>
                </button>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

                {/* Log In with red door/arrow icon -> Direct Keycloak OIDC Authentication */}
                <button
                  onClick={() => initiateKeycloakLogin({ action: 'login' })}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-[#231F20] hover:text-[#D32437] transition font-medium cursor-pointer"
                  title="Log in with Keycloak Secure SSO"
                >
                  <span>Log In</span>
                  <LogIn className="w-4 h-4 text-[#D32437]" />
                </button>
              </>
            )}

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-[#D1D5DB] mx-2" />

            {/* 8. Search Icon Trigger in Red */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-[#D32437] hover:opacity-80 transition cursor-pointer"
              title="Search Auctions"
            >
              <Search className="w-4 h-4 text-[#D32437] stroke-[2.5]" />
            </button>

          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-[#D32437] focus:outline-none"
          >
            <div className="space-y-1.5 w-6">
              <span className="block h-0.5 w-6 bg-[#231F20]" />
              <span className="block h-0.5 w-6 bg-[#231F20]" />
              <span className="block h-0.5 w-6 bg-[#231F20]" />
            </div>
          </button>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5E7EB] px-6 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('ONLINE_AUCTIONS');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 bg-red-50 text-[#D32437] rounded-lg font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <img src={getAssetUrl('/assets/hammer.svg')} alt="Auction" className="w-4 h-4" />
                ONLINE AUCTIONS {onlineAuctionsCount > 0 && `(${onlineAuctionsCount})`}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#D32437] beacon-pulse" />
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('SILENT_AUCTIONS');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-slate-700 font-semibold"
            >
              Silent Auctions {silentAuctionsCount > 0 && `(${silentAuctionsCount})`}
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('HELP');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-slate-700 font-semibold"
            >
              Help & Branches
            </button>

            {currentUser ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {currentUser.role === 'BUYER' && (
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('FAVORITES');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-red-50/70 text-[#D32437] rounded-lg font-bold text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-[#D32437]" />
                      <span>My Saved Favorites</span>
                    </span>
                    <span className="bg-[#D32437] text-white text-[10px] px-2 py-0.5 rounded-full">
                      {favoriteCount}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 font-bold text-[#D32437]"
                >
                  Sign Out ({currentUser.fullName})
                </button>
              </div>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    initiateKeycloakLogin({ action: 'login' });
                  }}
                  className="py-2.5 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded text-[#231F20] transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    initiateKeycloakLogin({ action: 'register' });
                  }}
                  className="py-2.5 text-center text-xs font-bold bg-[#D32437] hover:bg-[#b81d2f] text-white rounded transition shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}

      </header>

      {/* Search Container Overlay */}
      {isSearchOpen && (
        <div className="relative z-30 w-full bg-black/40 backdrop-blur-xs py-4 px-4 shadow-lg border-b border-black/20 animate-fadeIn">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-white rounded-lg px-4 py-2.5 shadow-md">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Search vehicles by make, model, VIN, or body type..."
                className="w-full text-sm text-[#231F20] placeholder-slate-400 focus:outline-none"
                autoFocus
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2.5 bg-white text-slate-600 hover:text-[#D32437] rounded-lg shadow-md transition"
              title="Close Search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
