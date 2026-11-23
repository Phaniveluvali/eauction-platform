import React, { useState, useEffect, useRef } from 'react';
import { 
  Home,
  LogOut,
  LayoutDashboard, 
  Car, 
  PlusSquare, 
  Zap, 
  TrendingUp, 
  FileCheck, 
  CreditCard, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  Upload, 
  MoreVertical, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Download, 
  Eye, 
  MessageSquare, 
  Menu, 
  X, 
  Coins, 
  Gavel, 
  Handshake, 
  Calendar, 
  FileSpreadsheet, 
  Lock, 
  Building2, 
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';
import { User } from '../types';
import { getAssetUrl } from '../utils/assets';

type SellerSubScreen = 
  | 'dashboard' 
  | 'listings' 
  | 'create-listing' 
  | 'auction-details' 
  | 'bids' 
  | 'sales' 
  | 'payments' 
  | 'documents' 
  | 'inspections' 
  | 'analytics' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'help';

interface SellerPortalProps {
  currentUser?: User | null;
  onlineAuctionsCount?: number;
  silentAuctionsCount?: number;
  initialSubScreen?: SellerSubScreen;
  onNavigateHome: () => void;
  onLogout?: () => void;
  onOpenLiveChat?: () => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  currentUser,
  onlineAuctionsCount = 300,
  silentAuctionsCount = 50,
  initialSubScreen = 'dashboard',
  onNavigateHome,
  onLogout,
  onOpenLiveChat,
}) => {
  const [activeScreen, setActiveScreen] = useState<SellerSubScreen>(initialSubScreen);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [listingFilter, setListingFilter] = useState<'All' | 'Live' | 'Scheduled' | 'Draft' | 'Sold'>('All');
  const [activeAuctionTab, setActiveAuctionTab] = useState<'Overview' | 'Specification' | 'Documents' | 'Inspection' | 'Bid History'>('Overview');
  const [paymentTab, setPaymentTab] = useState<'Transactions' | 'Settlements'>('Transactions');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Form State for Create Listing Wizard (4 Steps)
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [createFormData, setCreateFormData] = useState({
    category: 'SUV',
    make: 'Toyota',
    model: 'Fortuner',
    year: '2022',
    fuel: 'Diesel',
    km: '68000',
    regNo: 'TS08AB1234',
    location: 'Hyderabad',
    reservePrice: '3200000',
  });

  // Countdown timer for live auction
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 12, seconds: 36 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ensure address bar cleanliness
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [activeScreen]);

  const navItems = [
    { id: 'dashboard' as SellerSubScreen, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'listings' as SellerSubScreen, label: 'My Listings', icon: Car },
    { id: 'create-listing' as SellerSubScreen, label: 'Create Listing', icon: PlusSquare },
    { id: 'auction-details' as SellerSubScreen, label: 'Active Auctions', icon: Zap },
    { id: 'bids' as SellerSubScreen, label: 'Bids', icon: TrendingUp },
    { id: 'sales' as SellerSubScreen, label: 'Sales', icon: FileCheck },
    { id: 'payments' as SellerSubScreen, label: 'Payments', icon: CreditCard },
    { id: 'documents' as SellerSubScreen, label: 'Documents', icon: FileText },
    { id: 'inspections' as SellerSubScreen, label: 'Inspections', icon: ClipboardCheck },
    { id: 'analytics' as SellerSubScreen, label: 'Analytics', icon: BarChart3 },
    { id: 'notifications' as SellerSubScreen, label: 'Notifications', icon: Bell, badge: 3 },
    { id: 'profile' as SellerSubScreen, label: 'Profile', icon: UserIcon },
    { id: 'settings' as SellerSubScreen, label: 'Settings', icon: SettingsIcon },
    { id: 'help' as SellerSubScreen, label: 'Help & Support', icon: HelpCircle },
  ];

  const handleNavSelect = (screenId: SellerSubScreen) => {
    setActiveScreen(screenId);
    setIsMobileMenuOpen(false);
  };

  const sellerName = currentUser?.fullName || 'Phani Krishna';
  const sellerInitials = sellerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PK';

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ─────────────────── TOP HEADER BAR ─────────────────── */}
      <header className="h-16 bg-[#0B132B] border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
              src={getAssetUrl('/assets/nav-logo-exact-v3.png')} 
              alt="AJ Auctions" 
              className="h-8 md:h-9 w-auto object-contain brightness-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getAssetUrl('/assets/logo-aj.png');
              }}
            />
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by vehicle, listing ID, auction..." 
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-10 pr-4 py-1.5 text-xs lg:text-sm text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Right: Home Button, Logout Button, Notifications, User Profile Pill with Interactive Dropdown */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Direct Home Page Button */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer shadow-xs"
            title="Return to Public Marketplace Home"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Home Page</span>
          </button>

          {/* Direct Quick Logout Button */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              else window.location.href = '/seller-buyer/';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/30 text-xs font-semibold transition cursor-pointer shadow-xs"
            title="Log Out of Seller Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Log Out</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => handleNavSelect('notifications')}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full relative transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                1
              </span>
            </button>
          </div>

          {/* User Profile Pill with Interactive Dropdown (Screenshot 2) */}
          <div className="relative" ref={profileDropdownRef}>
            <button 
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full hover:bg-slate-800/80 cursor-pointer transition border border-slate-800 bg-slate-900/60 focus:outline-none"
              title="User Profile & Menu"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-cyan-400/30">
                {sellerInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">{sellerName}</div>
                <div className="text-[10px] text-slate-400 leading-tight">Seller</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#0B132B] rounded-2xl shadow-2xl border border-slate-700 p-5 z-50 text-center animate-in fade-in zoom-in-95 duration-150">
                <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl ring-2 ring-cyan-400/40">
                  {sellerInitials}
                </div>

                <h4 className="font-bold text-white text-base leading-tight">
                  {sellerName}
                </h4>

                <p className="text-xs text-slate-400 mb-2 font-mono truncate">
                  {currentUser?.email || 'seller@ajauctions.online'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                  <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ROLE: {currentUser?.role || 'SELLER'}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ID: SEL-10284
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onNavigateHome();
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30"
                  >
                    <Home className="w-4 h-4" />
                    <span>Marketplace Home</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleNavSelect('profile');
                    }}
                    className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Seller Profile</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleNavSelect('settings');
                    }}
                    className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                      else window.location.href = '/seller-buyer/';
                    }}
                    className="w-full py-2.5 px-3 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────── MAIN CONTAINER WITH SIDEBAR ─────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR (Desktop & Tablet) */}
        <aside className={`
          fixed md:static inset-y-16 left-0 z-30
          w-64 bg-[#0B132B] border-r border-slate-800/80 flex flex-col shrink-0
          transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Seller Portal Header Tag */}
          <div className="p-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-white">Seller Portal</span>
                <span className="text-[10px] text-slate-400 block font-mono">ID: SEL-10284</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {navItems.map((item) => {
              const active = activeScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      active ? 'bg-slate-950 text-emerald-400' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Actions: Home & Logout */}
          <div className="p-3 border-t border-slate-800/80 space-y-1.5 bg-slate-900/40">
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-semibold text-emerald-400 hover:text-white hover:bg-emerald-500/10 border border-emerald-500/20 transition cursor-pointer"
              title="Return to Public Marketplace Home"
            >
              <Home className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Marketplace Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onLogout) onLogout();
                else window.location.href = '/seller-buyer/';
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
              title="Sign Out of Seller Portal"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between">
            <span>AJ Auctions v2.4</span>
            <span className="text-emerald-400 font-medium">Verified Active</span>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* ─────────────────── MAIN VIEW SWITCHER ─────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ═══════════════ VIEW 1: DASHBOARD ═══════════════ */}
            {activeScreen === 'dashboard' && (
              <div className="space-y-6">
                {/* Hero Banner */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#0E2A27] to-[#0B132B] border border-emerald-500/30 p-6 lg:p-8 shadow-xl">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Multi-Format Auction Network
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                        Welcome to <span className="text-emerald-400">AJ Auctions</span> Seller Portal
                      </h1>
                      <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                        List, auction and sell your vehicles with confidence and transparency. Real-time bidder telemetry, certified inspections, and guaranteed settlements.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button 
                          onClick={() => setActiveScreen('create-listing')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2"
                        >
                          <PlusSquare className="w-4 h-4" />
                          Create Listing
                        </button>
                        <button 
                          onClick={() => setActiveScreen('listings')}
                          className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition"
                        >
                          View Listings
                        </button>
                      </div>
                    </div>

                    {/* Right Vehicle Showcase Strip */}
                    <div className="lg:col-span-5 flex items-center justify-center relative">
                      <div className="relative w-full max-w-md h-44 sm:h-52 flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80" 
                          alt="SUV Vehicle" 
                          className="absolute z-20 w-52 sm:w-60 h-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] hover:scale-105 transition"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=500&q=80" 
                          alt="Heavy Commercial Truck" 
                          className="absolute left-0 z-10 w-40 sm:w-44 h-auto object-contain opacity-90 drop-shadow-lg"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=500&q=80" 
                          alt="Machinery Excavator" 
                          className="absolute right-0 z-10 w-40 sm:w-44 h-auto object-contain opacity-90 drop-shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Stat KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">18</div>
                        <div className="text-xs text-slate-400 font-medium">Total Listings</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Gavel className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">12</div>
                        <div className="text-xs text-slate-400 font-medium">Active Auctions</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Handshake className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">5</div>
                        <div className="text-xs text-slate-400 font-medium">Sold Vehicles</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">₹1.82 Cr</div>
                        <div className="text-xs text-slate-400 font-medium">Total Sales</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Auction Categories & Sales Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Auction Categories */}
                  <div className="lg:col-span-5 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="border-b border-slate-800 pb-3 mb-5 flex items-center justify-between">
                        <span className="text-sm font-bold text-white relative after:content-[''] after:absolute after:-bottom-3.5 after:left-0 after:w-full after:h-0.5 after:bg-red-500">
                          Auction Categories
                        </span>
                        <span className="text-xs text-slate-400">Live Inventory</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Online Auctions */}
                        <div 
                          onClick={() => setActiveScreen('auction-details')}
                          className="bg-slate-900/80 border border-slate-700/60 hover:border-red-500/50 rounded-xl p-4 text-center cursor-pointer transition group"
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-red-400 transition">
                            <Car className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-semibold text-slate-300">Online Auctions</div>
                          <div className="text-2xl font-black text-red-500 mt-1">{onlineAuctionsCount}</div>
                        </div>

                        {/* Silent Auctions */}
                        <div 
                          onClick={() => setActiveScreen('auction-details')}
                          className="bg-slate-900/80 border border-slate-700/60 hover:border-red-500/50 rounded-xl p-4 text-center cursor-pointer transition group"
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-red-400 transition">
                            <Gavel className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-semibold text-slate-300">Silent Auctions</div>
                          <div className="text-2xl font-black text-red-500 mt-1">{silentAuctionsCount}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Total Active Catalogs</span>
                      <span className="font-bold text-white">{onlineAuctionsCount + silentAuctionsCount} Vehicles</span>
                    </div>
                  </div>

                  {/* Right: Sales Performance Chart */}
                  <div className="lg:col-span-7 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Sales Performance</h3>
                        <p className="text-xs text-slate-400">Gross transaction volume trajectory</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400">
                        ₹1.82 Cr <span className="text-slate-400 font-normal">Nov 2026</span>
                      </div>
                    </div>

                    {/* Spline Area Chart */}
                    <div className="h-44 w-full relative pt-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="490" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                        <line x1="40" y1="50" x2="490" y2="50" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                        <line x1="40" y1="80" x2="490" y2="80" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
                        <line x1="40" y1="110" x2="490" y2="110" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

                        {/* Y-Axis Labels */}
                        <text x="35" y="24" fill="#94A3B8" fontSize="9" textAnchor="end">₹2.0 Cr</text>
                        <text x="35" y="54" fill="#94A3B8" fontSize="9" textAnchor="end">₹1.5 Cr</text>
                        <text x="35" y="84" fill="#94A3B8" fontSize="9" textAnchor="end">₹1.0 Cr</text>
                        <text x="35" y="114" fill="#94A3B8" fontSize="9" textAnchor="end">₹50 L</text>
                        <text x="35" y="138" fill="#94A3B8" fontSize="9" textAnchor="end">₹0</text>

                        {/* Area Fill */}
                        <path 
                          d="M 60 120 C 130 115, 180 85, 230 100 C 290 120, 340 70, 410 75 C 450 80, 460 30, 485 28 L 485 130 L 60 130 Z" 
                          fill="url(#salesGrad)" 
                        />
                        {/* Smooth Stroke Line */}
                        <path 
                          d="M 60 120 C 130 115, 180 85, 230 100 C 290 120, 340 70, 410 75 C 450 80, 460 30, 485 28" 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                        />

                        {/* Data Nodes */}
                        <circle cx="60" cy="120" r="4" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                        <circle cx="150" cy="98" r="4" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                        <circle cx="230" cy="100" r="4" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                        <circle cx="320" cy="88" r="4" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                        <circle cx="410" cy="75" r="4" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                        <circle cx="485" cy="28" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                      </svg>

                      {/* X-Axis Months */}
                      <div className="flex justify-between pl-10 pr-2 pt-2 text-[10px] text-slate-400 font-medium">
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Recent Listings Table */}
                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">Recent Listings</h3>
                    <button 
                      onClick={() => setActiveScreen('listings')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                    >
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs lg:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Vehicle</th>
                          <th className="pb-3 font-semibold">Details</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Auction Type</th>
                          <th className="pb-3 font-semibold">Start Date</th>
                          <th className="pb-3 font-semibold">Bids</th>
                          <th className="pb-3 font-semibold">Current Bid</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {/* Row 1: Toyota Fortuner */}
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <img 
                                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=120&q=80" 
                                alt="Toyota Fortuner" 
                                className="w-12 h-9 object-cover rounded-lg border border-slate-700 shrink-0" 
                              />
                              <div>
                                <span className="font-bold text-white block">Toyota Fortuner</span>
                                <span className="text-[11px] text-slate-400">2022 • 68,000 km</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-300">Automatic • 2.8L 4x4</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                              Live
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-300">Online</td>
                          <td className="py-3.5 text-slate-400">16 Nov 2026</td>
                          <td className="py-3.5 font-bold text-white">37</td>
                          <td className="py-3.5 font-bold text-emerald-400">₹34,50,000</td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => setActiveScreen('auction-details')}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>

                        {/* Row 2: Hyundai Creta */}
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <img 
                                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80" 
                                alt="Hyundai Creta" 
                                className="w-12 h-9 object-cover rounded-lg border border-slate-700 shrink-0" 
                              />
                              <div>
                                <span className="font-bold text-white block">Hyundai Creta</span>
                                <span className="text-[11px] text-slate-400">2021 • 42,000 km</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-300">Manual • SX Petrol</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                              Scheduled
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-300">Online</td>
                          <td className="py-3.5 text-slate-400">20 Nov 2026</td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => setActiveScreen('listings')}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>

                        {/* Row 3: Tata Prima */}
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <img 
                                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=120&q=80" 
                                alt="Tata Prima" 
                                className="w-12 h-9 object-cover rounded-lg border border-slate-700 shrink-0" 
                              />
                              <div>
                                <span className="font-bold text-white block">Tata Prima 5525.S</span>
                                <span className="text-[11px] text-slate-400">2020 • 1,20,000 km</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-300">Commercial Heavy Cargo</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-xs font-bold">
                              Draft
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-slate-500">—</td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => setActiveScreen('create-listing')}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 2: MY LISTINGS ═══════════════ */}
            {activeScreen === 'listings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / My Listings</div>
                    <h2 className="text-2xl font-bold text-white">My Listings (18)</h2>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('create-listing')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition self-start"
                  >
                    <PlusSquare className="w-4 h-4" />
                    Create Listing
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search by title, VIN, reg no..." 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {(['All', 'Live', 'Scheduled', 'Draft', 'Sold'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setListingFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          listingFilter === f
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {f === 'All' ? 'All (18)' : f === 'Live' ? 'Live (12)' : f === 'Scheduled' ? 'Scheduled (3)' : f === 'Draft' ? 'Draft (2)' : 'Sold (5)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing Items List */}
                <div className="space-y-3">
                  {/* Item 1 */}
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-700 transition">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200&q=80" 
                        alt="Toyota Fortuner" 
                        className="w-20 h-14 object-cover rounded-xl border border-slate-700 shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">Toyota Fortuner 2.8 4x4 AT</h4>
                        <p className="text-xs text-slate-400">2022 • Diesel • 68,000 km • TS08AB1234</p>
                        <div className="mt-1 text-xs text-emerald-400 font-bold">Current Bid: ₹34,50,000 (37 Bids)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        Live
                      </span>
                      <button 
                        onClick={() => setActiveScreen('auction-details')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition"
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-700 transition">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80" 
                        alt="Hyundai Creta SX" 
                        className="w-20 h-14 object-cover rounded-xl border border-slate-700 shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">Hyundai Creta SX</h4>
                        <p className="text-xs text-slate-400">2021 • Petrol • 42,000 km • Starts in 2 days</p>
                        <div className="mt-1 text-xs text-blue-400 font-bold">Reserve: ₹14,50,000</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
                        Scheduled
                      </span>
                      <button 
                        onClick={() => setActiveScreen('auction-details')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-700 transition">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img 
                        src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=200&q=80" 
                        alt="Tata Prima" 
                        className="w-20 h-14 object-cover rounded-xl border border-slate-700 shrink-0" 
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">Tata Prima 5525.S</h4>
                        <p className="text-xs text-slate-400">2020 • Diesel • 1,20,000 km • Awaiting documents</p>
                        <div className="mt-1 text-xs text-slate-400">Draft Status</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                        Draft
                      </span>
                      <button 
                        onClick={() => setActiveScreen('create-listing')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-xs text-slate-950 font-bold rounded-lg transition"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 3: CREATE LISTING WIZARD ═══════════════ */}
            {activeScreen === 'create-listing' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Create Listing</div>
                  <h2 className="text-2xl font-bold text-white">Create New Vehicle Listing</h2>
                </div>

                {/* 4-Step Stepper */}
                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4 sm:p-6">
                  <div className="grid grid-cols-4 gap-2 relative">
                    <div className="text-center">
                      <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                        createStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        1
                      </div>
                      <div className="text-xs font-semibold mt-1 text-white">Vehicle Details</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                        createStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        2
                      </div>
                      <div className="text-xs font-semibold mt-1 text-slate-400">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                        createStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        3
                      </div>
                      <div className="text-xs font-semibold mt-1 text-slate-400">Inspection</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                        createStep === 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        4
                      </div>
                      <div className="text-xs font-semibold mt-1 text-slate-400">Review</div>
                    </div>
                  </div>
                </div>

                {/* Step Form Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Input Fields */}
                  <div className="lg:col-span-7 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white">Vehicle Details</h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Category *</label>
                      <select 
                        value={createFormData.category}
                        onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Commercial">Commercial Heavy Truck</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Machinery">Machinery / Excavator</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Make *</label>
                        <select 
                          value={createFormData.make}
                          onChange={(e) => setCreateFormData({ ...createFormData, make: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                        >
                          <option value="Toyota">Toyota</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="Tata">Tata</option>
                          <option value="Mahindra">Mahindra</option>
                          <option value="Mercedes-Benz">Mercedes-Benz</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Model *</label>
                        <select 
                          value={createFormData.model}
                          onChange={(e) => setCreateFormData({ ...createFormData, model: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-emerald-500"
                        >
                          <option value="Fortuner">Fortuner</option>
                          <option value="Land Cruiser">Land Cruiser</option>
                          <option value="Innova">Innova</option>
                          <option value="Creta">Creta</option>
                          <option value="Prima 5525.S">Prima 5525.S</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                        <input 
                          type="text" 
                          value={createFormData.year}
                          onChange={(e) => setCreateFormData({ ...createFormData, year: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Fuel</label>
                        <input 
                          type="text" 
                          value={createFormData.fuel}
                          onChange={(e) => setCreateFormData({ ...createFormData, fuel: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">KM Driven</label>
                        <input 
                          type="text" 
                          value={createFormData.km}
                          onChange={(e) => setCreateFormData({ ...createFormData, km: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Reg. Number</label>
                        <input 
                          type="text" 
                          value={createFormData.regNo}
                          onChange={(e) => setCreateFormData({ ...createFormData, regNo: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                        <input 
                          type="text" 
                          value={createFormData.location}
                          onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button 
                        onClick={() => setActiveScreen('listings')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl"
                      >
                        Save Draft
                      </button>
                      <button 
                        onClick={() => {
                          alert('Details saved! Transitioning to step 2: Documents');
                          setCreateStep(2);
                        }}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 rounded-xl flex items-center gap-2"
                      >
                        Next: Documents <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Upload Photos Preview Box */}
                  <div className="lg:col-span-5 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white">Vehicle Gallery</h3>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-48 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" 
                        alt="Primary Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs border border-slate-700">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        Upload Photos
                      </button>
                    </div>

                    {/* Thumbnail gallery strip with + button */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="h-14 rounded-lg overflow-hidden border border-emerald-500">
                        <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=120&q=80" alt="Thumb 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-14 rounded-lg overflow-hidden border border-slate-700">
                        <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80" alt="Thumb 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-14 rounded-lg overflow-hidden border border-slate-700">
                        <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=120&q=80" alt="Thumb 3" className="w-full h-full object-cover" />
                      </div>
                      <button className="h-14 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition">
                        <PlusSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 4: AUCTION DETAILS ═══════════════ */}
            {activeScreen === 'auction-details' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Active Auctions / Auction Details</div>
                  <h2 className="text-2xl font-bold text-white">Toyota Fortuner 2.8 4x4 AT</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Vehicle Image & Specs */}
                  <div className="lg:col-span-8 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-1/2 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-48 sm:h-56">
                        <img 
                          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" 
                          alt="Toyota Fortuner Live" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full sm:w-1/2 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            Live Auction
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID: AJ-2026-1187</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block">Year</span>
                            <span className="font-bold text-white">2022</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block">Fuel</span>
                            <span className="font-bold text-white">Diesel</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block">KM</span>
                            <span className="font-bold text-white">68,000 km</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block">Reg. No.</span>
                            <span className="font-bold text-white">TS08AB1234</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 col-span-2">
                            <span className="text-slate-400 block">Location</span>
                            <span className="font-bold text-white">Hyderabad Central Yard</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs: Overview, Specification, Documents, Inspection, Bid History */}
                    <div>
                      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                        {(['Overview', 'Specification', 'Documents', 'Inspection', 'Bid History'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveAuctionTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              activeAuctionTab === tab
                                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 text-xs text-slate-300 leading-relaxed">
                        {activeAuctionTab === 'Overview' && (
                          <p>
                            Well-maintained Toyota Fortuner 2.8 4x4 AT, single owner, company service record, accident-free, with all valid documents and certified 5-point inspection cleared.
                          </p>
                        )}
                        {activeAuctionTab === 'Specification' && (
                          <p>Engine: 2755 cc, 201 bhp @ 3400 RPM, 500 Nm torque, 6-Speed Automatic Transmission with Paddle Shifters, 4WD High/Low selector.</p>
                        )}
                        {activeAuctionTab === 'Documents' && (
                          <p>All documents verified by AJ Legal Team: Original RC Book, Comprehensive Insurance valid until Oct 2027, PUC Clear.</p>
                        )}
                        {activeAuctionTab === 'Inspection' && (
                          <p>Certified Rating: 9.4 / 10 by AJ Certified Inspectors. Zero structural or flood damage found.</p>
                        )}
                        {activeAuctionTab === 'Bid History' && (
                          <p>Total of 37 competitive bids logged. Opening reserve was ₹32,00,000.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Bidding Card with Live Countdown Timer */}
                  <div className="lg:col-span-4 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Current Highest Bid</div>
                      <div className="text-3xl font-black text-emerald-400 mt-1">₹34,50,000</div>
                      <div className="text-xs text-slate-400 mt-1">Next Minimum Bid: <span className="font-bold text-white">₹34,75,000</span></div>

                      {/* Live Timer */}
                      <div className="mt-5 p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                        <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-400 animate-spin" />
                          Ends in
                        </div>
                        <div className="text-2xl font-black text-red-500 tracking-widest font-mono">
                          {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Hrs : Min : Sec</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button 
                        onClick={() => setActiveScreen('bids')}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <TrendingUp className="w-4 h-4" />
                        View Bids (37)
                      </button>
                      <button 
                        onClick={() => setActiveScreen('inspections')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
                      >
                        Inspection Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 5: BIDS ═══════════════ */}
            {activeScreen === 'bids' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Active Auctions / Bids</div>
                  <h2 className="text-2xl font-bold text-white">Bids (37) - Toyota Fortuner 2.8 4x4 AT</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs lg:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                          <th className="pb-3 font-semibold">#</th>
                          <th className="pb-3 font-semibold">Bidder ID</th>
                          <th className="pb-3 font-semibold">Bid Amount</th>
                          <th className="pb-3 font-semibold">Bid Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        <tr className="bg-emerald-500/10 text-emerald-300 font-bold">
                          <td className="py-3">1</td>
                          <td className="py-3">BUY-4587</td>
                          <td className="py-3 text-emerald-400 font-black">₹34,50,000</td>
                          <td className="py-3 text-slate-300">16 Nov 2026, 10:24 AM</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3 text-slate-400">2</td>
                          <td className="py-3 text-slate-300">BUY-7712</td>
                          <td className="py-3 text-white font-bold">₹34,25,000</td>
                          <td className="py-3 text-slate-400">16 Nov 2026, 10:21 AM</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3 text-slate-400">3</td>
                          <td className="py-3 text-slate-300">BUY-3090</td>
                          <td className="py-3 text-white font-bold">₹34,00,000</td>
                          <td className="py-3 text-slate-400">16 Nov 2026, 10:16 AM</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3 text-slate-400">4</td>
                          <td className="py-3 text-slate-300">BUY-9921</td>
                          <td className="py-3 text-white font-bold">₹33,75,000</td>
                          <td className="py-3 text-slate-400">16 Nov 2026, 10:10 AM</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="py-3 text-slate-400">5</td>
                          <td className="py-3 text-slate-300">BUY-6670</td>
                          <td className="py-3 text-white font-bold">₹33,50,000</td>
                          <td className="py-3 text-slate-400">16 Nov 2026, 10:05 AM</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 6: SALES ═══════════════ */}
            {activeScreen === 'sales' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Sales</div>
                    <h2 className="text-2xl font-bold text-white">Sales (5)</h2>
                  </div>
                  <select className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white">
                    <option>Last 6 Months</option>
                    <option>Year 2026</option>
                  </select>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <table className="w-full text-left text-xs lg:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-semibold">#</th>
                        <th className="pb-3 font-semibold">Vehicle</th>
                        <th className="pb-3 font-semibold">Final Price</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-3.5 text-slate-400">1</td>
                        <td className="py-3.5 font-bold text-white">Toyota Innova Crysta</td>
                        <td className="py-3.5 font-bold text-emerald-400">₹18,90,000</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Sold</span></td>
                        <td className="py-3.5 text-slate-400">02 Nov 2026</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 text-slate-400">2</td>
                        <td className="py-3.5 font-bold text-white">Hyundai Creta SX</td>
                        <td className="py-3.5 font-bold text-emerald-400">₹14,80,000</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Sold</span></td>
                        <td className="py-3.5 text-slate-400">28 Oct 2026</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 text-slate-400">3</td>
                        <td className="py-3.5 font-bold text-white">Mahindra XUV700</td>
                        <td className="py-3.5 font-bold text-emerald-400">₹26,50,000</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Sold</span></td>
                        <td className="py-3.5 text-slate-400">21 Oct 2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 7: PAYMENTS ═══════════════ */}
            {activeScreen === 'payments' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Payments</div>
                  <h2 className="text-2xl font-bold text-white">Payments & Settlements</h2>
                </div>

                {/* 3 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs text-slate-400 font-medium">Total Sales</div>
                    <div className="text-2xl font-black text-white mt-1">₹1.82 Cr</div>
                  </div>
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs text-slate-400 font-medium">Amount Received</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">₹1.74 Cr</div>
                  </div>
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs text-slate-400 font-medium">Pending Settlement</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">₹8.00 L</div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
                    <button 
                      onClick={() => setPaymentTab('Transactions')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${paymentTab === 'Transactions' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Transactions
                    </button>
                    <button 
                      onClick={() => setPaymentTab('Settlements')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${paymentTab === 'Settlements' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Settlements
                    </button>
                  </div>

                  <table className="w-full text-left text-xs lg:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Transaction ID</th>
                        <th className="pb-3 font-semibold">Payment For</th>
                        <th className="pb-3 font-semibold">Bid Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-3 text-cyan-400">TRX-83452</td>
                        <td className="py-3 font-sans font-bold text-white">Toyota Fortuner</td>
                        <td className="py-3 font-bold text-emerald-400">₹18,90,000</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Received</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 text-cyan-400">TRX-83401</td>
                        <td className="py-3 font-sans font-bold text-white">Hyundai Creta</td>
                        <td className="py-3 font-bold text-emerald-400">₹14,80,000</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Received</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 8: ANALYTICS ═══════════════ */}
            {activeScreen === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Analytics</div>
                    <h2 className="text-2xl font-bold text-white">Seller Analytics</h2>
                  </div>
                  <select className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white">
                    <option>Last 6 Months</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4">
                    <div className="text-xs text-slate-400">Total Sales</div>
                    <div className="text-xl font-black text-white mt-1">₹1.82 Cr</div>
                  </div>
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4">
                    <div className="text-xs text-slate-400">Vehicles Sold</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">5</div>
                  </div>
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4">
                    <div className="text-xs text-slate-400">Total Listings</div>
                    <div className="text-xl font-black text-white mt-1">18</div>
                  </div>
                  <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-4">
                    <div className="text-xs text-slate-400">Conversion</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">66%</div>
                  </div>
                </div>

                {/* Two Visual Charts: Listings vs Sales Bar Chart & Sales by Category Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Bar Chart */}
                  <div className="lg:col-span-7 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4">Listings vs Sales</h4>
                    <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
                      {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((m, idx) => (
                        <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full flex items-end justify-center gap-1 h-36">
                            <div className="w-3 bg-slate-700 rounded-t-sm" style={{ height: `${(idx + 2) * 14}%` }} />
                            <div className="w-3 bg-emerald-500 rounded-t-sm" style={{ height: `${(idx + 1) * 16}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{m}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-700 rounded-xs" /> Listings</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Sales</div>
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="lg:col-span-5 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white mb-2">Sales by Category</h4>
                    <div className="flex items-center justify-center my-4">
                      <div className="relative w-36 h-36 rounded-full border-8 border-emerald-500 border-t-cyan-500 border-r-amber-500 border-b-purple-500 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-slate-400 font-medium">Total</div>
                          <div className="text-sm font-black text-white">₹1.82 Cr</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> SUV (48%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" /> Sedan (20%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Commercial (18%)</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full" /> Others (14%)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 9: DOCUMENTS ═══════════════ */}
            {activeScreen === 'documents' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Documents</div>
                  <h2 className="text-2xl font-bold text-white">Vehicle Documents - Toyota Fortuner (AJ-2026-1187)</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                  {[
                    { name: 'RC (Registration Certificate)', size: 'PDF (1.2 MB)' },
                    { name: 'Insurance Policy', size: 'PDF (850 KB)' },
                    { name: 'PUC Certificate', size: 'PDF (320 KB)' },
                    { name: 'Service History', size: 'PDF (1.8 MB)' },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="text-sm font-bold text-white">{doc.name}</div>
                          <div className="text-xs text-slate-400">{doc.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          Uploaded
                        </span>
                        <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" title="View Document">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" title="Download Document">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 10: INSPECTIONS ═══════════════ */}
            {activeScreen === 'inspections' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Inspections</div>
                    <h2 className="text-2xl font-bold text-white">Inspection Report - Toyota Fortuner</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Inspector Overview Card */}
                  <div className="lg:col-span-6 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex gap-4 items-center">
                      <img 
                        src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80" 
                        alt="Inspection Action" 
                        className="w-24 h-24 object-cover rounded-xl border border-slate-700" 
                      />
                      <div className="space-y-1 text-xs">
                        <div><span className="text-slate-400">Inspection ID:</span> <span className="font-bold text-white">INS-77341</span></div>
                        <div><span className="text-slate-400">Inspection Date:</span> <span className="font-bold text-white">14 Nov 2026</span></div>
                        <div><span className="text-slate-400">Inspector:</span> <span className="font-bold text-white">AJ Inspections</span></div>
                        <div><span className="text-slate-400">Overall Status:</span> <span className="font-bold text-emerald-400">Passed</span></div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition">
                      View Full Report (PDF)
                    </button>
                  </div>

                  {/* Right 5-Point Checklist */}
                  <div className="lg:col-span-6 bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-2.5">
                    <h4 className="text-sm font-bold text-white mb-2">5-Point Certified Checklist</h4>
                    {[
                      'Engine & Transmission',
                      'Exterior & Body',
                      'Interior & Cabin',
                      'Tyres & Brakes',
                      'Electrical Systems'
                    ].map(point => (
                      <div key={point} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-200 font-semibold">{point}</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Passed
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 11: NOTIFICATIONS ═══════════════ */}
            {activeScreen === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Notifications</div>
                  <h2 className="text-2xl font-bold text-white">Notifications</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Auction ending in 15 minutes</div>
                      <div className="text-xs text-slate-400">Toyota Fortuner (AJ-2026-1187) is in final round of bids.</div>
                      <div className="text-[10px] text-slate-500 mt-1">Just now</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">New bid received</div>
                      <div className="text-xs text-slate-400">₹34,50,000 for AJ-2026-1187 from Bidder BUY-4587.</div>
                      <div className="text-[10px] text-slate-500 mt-1">10 min ago</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Payment received</div>
                      <div className="text-xs text-slate-400">₹18,90,000 settled for TRX-83452. Funds transferred to verified bank account.</div>
                      <div className="text-[10px] text-slate-500 mt-1">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 12: PROFILE ═══════════════ */}
            {activeScreen === 'profile' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Profile</div>
                  <h2 className="text-2xl font-bold text-white">Seller Profile</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-5 mb-5">
                    <div className="w-16 h-16 rounded-full bg-cyan-600 text-white font-black text-xl flex items-center justify-center ring-4 ring-cyan-500/20">
                      {sellerInitials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {sellerName}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Seller ID: SEL-10284</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Personal Information', desc: 'Phone, email, and primary contact address' },
                      { name: 'KYC & Verification', desc: 'Emirates ID / PAN and commercial trade license verified' },
                      { name: 'Bank Details', desc: 'HDFC Bank - A/C ending in 4102 for instant settlement payouts' },
                      { name: 'Change Password', desc: 'Update login credentials and two-factor authentication' },
                    ].map(item => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                        <div>
                          <div className="text-sm font-bold text-white">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.desc}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 13: SETTINGS ═══════════════ */}
            {activeScreen === 'settings' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Settings</div>
                  <h2 className="text-2xl font-bold text-white">System Settings</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-2">
                  {[
                    'Account Settings',
                    'Notification Preferences',
                    'Privacy & Security',
                    'Business Preferences',
                    'API / Integrations',
                  ].map(setting => (
                    <div key={setting} className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                      <span className="text-sm font-semibold text-slate-200">{setting}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}

                  <div 
                    onClick={onLogout}
                    className="flex items-center justify-between p-3.5 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer transition mt-4"
                  >
                    <span className="text-sm font-bold">Sign Out</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ VIEW 14: HELP & SUPPORT ═══════════════ */}
            {activeScreen === 'help' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Seller Portal / Help & Support</div>
                  <h2 className="text-2xl font-bold text-white">Help & Support</h2>
                </div>

                <div className="bg-[#1E293B]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    {[
                      'Knowledge Base',
                      'Frequently Asked Questions (FAQs)',
                      'Raise a Support Ticket',
                      'Contact Seller Concierge',
                    ].map(helpItem => (
                      <div key={helpItem} className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                        <span className="text-sm font-semibold text-slate-200">{helpItem}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={onOpenLiveChat}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Start Live Chat with Concierge
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};
