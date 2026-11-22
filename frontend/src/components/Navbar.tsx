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
  Heart,
  Menu
} from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

export const hasAdminAccess = (user: User | null): boolean => {
  if (!user) return false;
  if (user.isSuperAdmin || (user as any)?.superAdmin) return true;
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
  lang?: 'EN' | 'AR';
  onToggleLanguage?: () => void;
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
  lang = 'EN',
  onToggleLanguage,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isAuctionsDropdownOpen, setIsAuctionsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    if (onToggleLanguage) {
      onToggleLanguage();
    }
  };

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
      {/* Exact Dark Navy Header matching Screenshot 1 */}
      <header className="sticky top-0 z-40 w-full bg-[#0B132B] border-b border-slate-800/80 shadow-md backdrop-blur-md bg-[#0B132B]/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          
          {/* AJ Auctions Brand Logo - EXACT CLONE OF IMAGE 3 */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onHomeClick}
              className="flex items-center text-left focus:outline-none transition hover:opacity-95 cursor-pointer"
            >
              <img 
                src={getAssetUrl('/assets/nav-logo-exact-v3.png?v=3.2')} 
                alt="AJ Auctions" 
                className="h-10 sm:h-12 w-auto object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl('/assets/logo-aj-transparent.png');
                }}
              />
            </button>
          </div>

          {/* Center Navigation Links - EXACT CLONE OF SCREENSHOT 1 */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[14px] font-medium text-slate-200">
            
            {/* 1. Home Link with Lime Green Underline Active State */}
            <button
              onClick={onHomeClick}
              className="text-white font-semibold border-b-2 border-[#7ED321] pb-1 transition cursor-pointer"
            >
              {lang === 'AR' ? 'الرئيسية' : 'Home'}
            </button>

            {/* 2. Auctions ⌵ with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsAuctionsDropdownOpen(true)}
              onMouseLeave={() => setIsAuctionsDropdownOpen(false)}
            >
              <button 
                className="flex items-center space-x-1 text-slate-200 hover:text-white transition cursor-pointer pb-1"
                onClick={() => setIsAuctionsDropdownOpen(!isAuctionsDropdownOpen)}
              >
                <span>{lang === 'AR' ? 'المزادات' : 'Auctions'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
              </button>

              {isAuctionsDropdownOpen && (
                <div className="absolute top-full left-0 w-60 bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn text-left">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('ONLINE_AUCTIONS');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-white border-b border-slate-800 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{lang === 'AR' ? 'مزادات مباشرة' : 'Online Auctions'}</span>
                    <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      {onlineAuctionsCount || 300}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('SILENT_AUCTIONS');
                      setIsAuctionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-white border-b border-slate-800 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{lang === 'AR' ? 'مزادات صامتة' : 'Silent Auctions'}</span>
                    <span className="text-[11px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      {silentAuctionsCount || 50}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Sell a Vehicle */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('SELLER_CREATE_LISTING');
              }}
              className="text-slate-200 hover:text-white transition cursor-pointer pb-1"
            >
              {lang === 'AR' ? 'اعرض مركبتك' : 'Sell a Vehicle'}
            </button>

            {/* 4. How it Works */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('HELP');
              }}
              className="text-slate-200 hover:text-white transition cursor-pointer pb-1"
            >
              {lang === 'AR' ? 'كيف يعمل' : 'How it Works'}
            </button>

            {/* 5. About Us (Matching Image 1) */}
            <button
              onClick={() => {
                const testim = document.getElementById('testimonials-section');
                if (testim) {
                  testim.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-slate-200 hover:text-white transition cursor-pointer pb-1"
            >
              {lang === 'AR' ? 'معلومات عنا' : 'About Us'}
            </button>

            {/* 6. Support */}
            <button
              onClick={() => {
                const footer = document.querySelector('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                } else if (onNavigate) {
                  onNavigate('HELP');
                }
              }}
              className="text-slate-200 hover:text-white transition cursor-pointer pb-1"
            >
              {lang === 'AR' ? 'الدعم' : 'Support'}
            </button>

            {/* Admin Link if authorized */}
            {hasAdminAccess(currentUser) && (
              <button
                onClick={onOpenAdmin}
                className="px-2.5 py-1 text-amber-300 font-semibold hover:text-amber-200 transition cursor-pointer flex items-center gap-1.5"
                title="Open Admin Module"
              >
                <span>Admin</span>
                <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full uppercase">
                  Portal
                </span>
              </button>
            )}
          </nav>

          {/* Right-Side Controls: Currency, Language & Login/Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* UAE Currency Pill & Bilingual Switcher hidden on desktop to match Image 3 */}
            <div className="hidden items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-400 font-bold text-xs">
              <span>AED</span>
              <span className="text-[10px] text-emerald-500 font-sans">د.إ</span>
            </div>

            <button
              onClick={toggleLanguage}
              className="hidden px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 rounded-lg border border-slate-700/60 transition cursor-pointer"
              title="Switch language"
            >
              {lang === 'EN' ? 'العربية' : 'EN'}
            </button>

            {/* When Logged In: User Profile Menu */}
            {currentUser ? (
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer focus:outline-none border border-slate-700"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline text-xs text-slate-200 font-semibold max-w-[100px] truncate">
                    {currentUser.fullName || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F172A] rounded-xl shadow-2xl border border-slate-700 p-5 z-50 text-center animate-fadeIn">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl">
                      {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                    </div>

                    <h4 className="font-bold text-white text-base leading-tight">
                      {currentUser.fullName || 'User'}
                    </h4>

                    <p className="text-xs text-slate-400 mb-2 font-mono">
                      {currentUser.email}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        ROLE: {currentUser.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {currentUser.role === 'BUYER' && (
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onNavigate) onNavigate('BUYER_DASHBOARD');
                          }}
                          className="py-2.5 px-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Buyer Hub (Dashboard &amp; Bids)
                        </button>
                      )}

                      {currentUser.role === 'SELLER' && (
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onNavigate) onNavigate('SELLER_DASHBOARD');
                          }}
                          className="py-2.5 px-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Seller Hub (Listings &amp; Sales)
                        </button>
                      )}

                      {hasAdminAccess(currentUser) && (
                        <button 
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenAdmin) onOpenAdmin();
                          }}
                          className="py-2.5 px-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition cursor-pointer"
                        >
                          Admin Portal
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="py-2.5 px-3 border border-slate-700 rounded-lg text-rose-400 font-semibold hover:bg-slate-800 transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Exact Rounded Border Login Button matching Image 3 */
              <button
                onClick={() => initiateKeycloakLogin({ action: 'login' })}
                className="bg-transparent border border-slate-500 hover:border-white text-white font-medium px-5 py-1.5 rounded-full text-sm transition cursor-pointer"
                title="Log in to AJ Auctions"
              >
                {lang === 'AR' ? 'تسجيل الدخول' : 'Login'}
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0A1128] border-t border-slate-800 px-4 pt-3 pb-5 space-y-3">
            <button
              onClick={() => {
                if (onHomeClick) onHomeClick();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-white font-medium"
            >
              Home
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('ONLINE_AUCTIONS');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              Online Auctions ({onlineAuctionsCount || 300})
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('SILENT_AUCTIONS');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              Silent Auctions ({silentAuctionsCount || 50})
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('SELLER_CREATE_LISTING');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              Sell a Vehicle
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('HELP');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              How it Works
            </button>
            <button
              onClick={() => {
                const testim = document.getElementById('testimonials-section');
                if (testim) {
                  testim.scrollIntoView({ behavior: 'smooth' });
                }
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              About Us
            </button>
            <button
              onClick={() => {
                const footer = document.querySelector('footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                }
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              Support
            </button>
          </div>
        )}
      </header>
    </>
  );
};
