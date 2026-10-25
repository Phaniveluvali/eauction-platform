import React, { useState, useEffect } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { 
  X, 
  Home, 
  Search, 
  ArrowUpDown, 
  Bookmark, 
  LayoutGrid, 
  AlertTriangle, 
  Clock, 
  Heart, 
  ArrowRight,
  Filter,
  Lock,
  Menu,
  CheckCircle
} from 'lucide-react';
import { initiateKeycloakLogin } from '../utils/oidc';

interface OnlineAuctionsPageProps {
  vehicles: Vehicle[];
  auctions: Auction[];
  currentUser: User | null;
  onSelectAuction: (auction: Auction) => void;
  onRequireAuth: () => void;
  onNavigate: (view: PortalView) => void;
  onBackHome: () => void;
  onOpenBidModal?: (auction: Auction) => void;
  onViewDetails?: (auction: Auction, vehicle: Vehicle) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (vehicleId: string) => void;
}

export const OnlineAuctionsPage: React.FC<OnlineAuctionsPageProps> = ({
  vehicles,
  auctions,
  currentUser,
  onSelectAuction,
  onRequireAuth,
  onNavigate,
  onBackHome,
  onOpenBidModal,
  onViewDetails,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedModel, setSelectedModel] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedBodyType, setSelectedBodyType] = useState('ALL');
  const [lotSearch, setLotSearch] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(favoriteIds));

  useEffect(() => {
    setFavorites(new Set(favoriteIds));
  }, [favoriteIds]);

  const [auctionStatusFilter, setAuctionStatusFilter] = useState<'ACTIVE' | 'ENDED' | 'ALL'>('ACTIVE');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Dynamic Catalog Pagination (Matching User Screenshot 3: editable items per page, default 27)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(27);

  // Reset to page 1 whenever search, filters, or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedMake, selectedModel, selectedYear, selectedBodyType, lotSearch, sortBy, auctionStatusFilter]);


  // Real-time ticker
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in as a buyer to save favorite vehicles to your watchlist.');
      initiateKeycloakLogin({ action: 'login' });
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Favorites are exclusive to Buyer accounts.');
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(targetId);
    } else {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(targetId)) next.delete(targetId);
        else next.add(targetId);
        return next;
      });
    }
  };

  const handleBidClick = (auc: Auction) => {
    const isEnded = auc.status === 'ENDED' || auc.status === 'COMPLETED' || (auc.endTime && new Date(auc.endTime).getTime() <= now);
    if (isEnded) {
      alert('This auction has ended and is closed for bidding.');
      return;
    }
    if (!currentUser) {
      // Must be authenticated to bid -> Redirect to Auth
      onRequireAuth();
    } else {
      onSelectAuction(auc);
    }
  };

  const formatCountdown = (endTimeStr: string) => {
    const end = new Date(endTimeStr).getTime();
    const diff = Math.max(0, end - now);
    if (diff <= 0) return '00h : 00m : 00s (Ended)';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  const formatCurrency = (val: number) => {
    const aed = new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0,
    }).format(Math.round(val / 22.5));

    const inr = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

    return { aed, inr };
  };

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setSelectedMake('ALL');
    setSelectedModel('ALL');
    setSelectedYear('ALL');
    setSelectedBodyType('ALL');
    setLotSearch('');
    setSortBy('DEFAULT');
  };

  const activeCount = auctions.filter((a) => a.status === 'ACTIVE' && !(a.endTime && new Date(a.endTime).getTime() <= now) && a.auctionType !== 'SILENT').length;
  const endedCount = auctions.filter((a) => (a.status === 'ENDED' || a.status === 'COMPLETED' || (a.endTime && new Date(a.endTime).getTime() <= now)) && a.auctionType !== 'SILENT').length;

  // Filtered live auctions: only active online auctions
  const liveAuctions = auctions.filter((auc) => {
    if (auc.auctionType && auc.auctionType === 'SILENT') return false;
    const isEnded = auc.status === 'ENDED' || auc.status === 'COMPLETED' || (auc.endTime && new Date(auc.endTime).getTime() <= now);
    if (auctionStatusFilter === 'ACTIVE' && isEnded) return false;
    if (auctionStatusFilter === 'ENDED' && !isEnded) return false;
    if (auc.status !== 'ACTIVE' && auc.status !== 'ENDED') return false;

    const v = auc.vehicle || vehicles.find((item) => item.id === auc.vehicleId);
    if (!v) return false;

    if (lotSearch) {
      const q = lotSearch.toLowerCase();
      const matchLot = auc.id.toLowerCase().includes(q) || v.registrationNumber.toLowerCase().includes(q) || v.vin.toLowerCase().includes(q);
      if (!matchLot) return false;
    }

    if (selectedCategory !== 'ALL' && v.vehicleType !== selectedCategory) return false;
    if (selectedMake !== 'ALL' && v.make.toLowerCase() !== selectedMake.toLowerCase()) return false;
    if (selectedYear !== 'ALL' && String(v.manufacturingYear) !== selectedYear) return false;

    return true;
  });

  const totalItems = liveAuctions.length;
  const effectivePerPage = itemsPerPage > 0 ? itemsPerPage : 27;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePerPage));
  const startIndex = (currentPage - 1) * effectivePerPage;
  const paginatedAuctions = liveAuctions.slice(startIndex, startIndex + effectivePerPage);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex shrink-0">
        <PortalSidebar currentView="ONLINE_AUCTIONS" onNavigate={onNavigate} />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileSidebarOpen(false)} 
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-sm text-[#231F20]">Menu</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PortalSidebar 
                currentView="ONLINE_AUCTIONS" 
                onNavigate={(view) => {
                  setIsMobileSidebarOpen(false);
                  onNavigate(view);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Header Bar matching Screenshot 1: ☰ ✕ Online Auctions */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={onBackHome}
              className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Close and return to Home"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-[#231F20]">
              Online Auctions
            </h1>
          </div>
        </div>

        {/* Breadcrumb Navigation: ⌂ > Online Auctions */}
        <div className="flex items-center space-x-2 text-xs text-[#8C8C8C] mb-6">
          <button onClick={onBackHome} className="hover:text-[#231F20] flex items-center gap-1 cursor-pointer">
            <Home className="w-3.5 h-3.5" />
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#231F20]">Online Auctions</span>
        </div>

        {/* Filters Top Bar matching Screenshot 1 */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs mb-6">
          
          {/* Row 1: Dropdown Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Categories</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]"
              >
                <option value="ALL">Select</option>
                <option value="TRUCK">Heavy Commercial</option>
                <option value="CAR">Cars & SUVs</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Make</label>
              <select 
                value={selectedMake} 
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]"
              >
                <option value="ALL">Select</option>
                <option value="Tata">Tata Motors</option>
                <option value="Ashok Leyland">Ashok Leyland</option>
                <option value="BharatBenz">BharatBenz</option>
                <option value="Mahindra">Mahindra</option>
                <option value="Volvo">Volvo</option>
                <option value="Toyota">Toyota</option>
                <option value="Nissan">Nissan</option>
                <option value="BMW">BMW</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Model</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]"
              >
                <option value="ALL">Select</option>
                <option value="Prima">Prima 5530.S</option>
                <option value="Signa">Signa 2823</option>
                <option value="BadaDost">Bada Dost</option>
                <option value="Bolero">Bolero Maxi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Year of Make</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]"
              >
                <option value="ALL">Select</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Body Type</label>
              <select 
                value={selectedBodyType} 
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]"
              >
                <option value="ALL">Select</option>
                <option value="Trailer">Tractor Trailer</option>
                <option value="Tipper">Tipper / Dumper</option>
                <option value="Truck">Rigid Haulage</option>
                <option value="Van">Delivery Van</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Additional Filters</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none focus:border-[#D32437]">
                <option value="ALL">Select</option>
                <option value="KYC">KYC Verified Only</option>
                <option value="LOW_KM">Low Mileage (&lt;50K)</option>
              </select>
            </div>

          </div>

          {/* Row 2: Lot Search, Sort, Save, Clear Filters, Grid Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F3F4F6]">
            
            {/* Lot No Search Input */}
            <div className="flex items-center border border-[#D1D5DB] rounded-md overflow-hidden bg-white max-w-xs w-full sm:w-64">
              <input
                type="text"
                value={lotSearch}
                onChange={(e) => setLotSearch(e.target.value)}
                placeholder="Lot No Search"
                className="w-full text-xs px-3 py-2 text-[#231F20] placeholder-slate-400 focus:outline-none"
              />
              <button className="px-3 text-[#D32437] hover:bg-slate-50">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              
              {/* Sort: Default */}
              <button 
                onClick={() => setSortBy(sortBy === 'DEFAULT' ? 'PRICE_ASC' : 'DEFAULT')}
                className="flex items-center space-x-1.5 px-3 py-2 border border-[#D1D5DB] rounded-md text-xs font-semibold text-[#231F20] hover:bg-slate-50 transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort: <strong>{sortBy === 'DEFAULT' ? 'Default' : 'Price'}</strong></span>
              </button>

              {/* Save Search */}
              <button className="hidden sm:flex items-center space-x-1 px-3 py-2 border border-[#D1D5DB] rounded-md text-xs font-semibold text-[#231F20] hover:bg-slate-50 transition">
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Search</span>
              </button>

              {/* Clear Filters (Dark Black Button) */}
              <button 
                onClick={handleClearFilters}
                className="px-3.5 py-2 bg-[#231F20] hover:bg-black text-white rounded-md text-xs font-bold transition cursor-pointer"
              >
                Clear Filters
              </button>

              {/* Grid Toggle (Red Active Button) */}
              <button className="p-2 bg-[#D32437] text-white rounded-md transition shadow-xs">
                <LayoutGrid className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

        {/* Quick Filter Pills matching Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-semibold">
          <button 
            onClick={() => setSelectedMake('BMW')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'BMW' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            BMW (1)
          </button>
          <button 
            onClick={() => setSelectedMake('Mitsubishi')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Mitsubishi' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            Mitsubishi (27)
          </button>
          <button 
            onClick={() => setSelectedMake('Nissan')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Nissan' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            Nissan (68)
          </button>
          <button 
            onClick={() => setSelectedMake('Toyota')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Toyota' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            Toyota (105)
          </button>
          <button 
            onClick={() => setSelectedMake('Tata')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Tata' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            Tata Motors ({vehicles.filter(v => v.make.toLowerCase().includes('tata')).length || 4})
          </button>
          <button 
            onClick={() => setSelectedMake('Ashok Leyland')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Ashok Leyland' ? 'bg-[#D32437] text-white border-[#D32437]' : 'bg-white border-[#D1D5DB] text-[#231F20] hover:border-[#D32437]'
            }`}
          >
            Ashok Leyland ({vehicles.filter(v => v.make.toLowerCase().includes('ashok')).length || 2})
          </button>
        </div>

        {/* Red Warning Banner matching Screenshot 1 */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 mb-6 text-center shadow-xs">
          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold text-[#D32437]">
            <AlertTriangle className="w-4 h-4 text-[#D32437] shrink-0" />
            <span>Bids in the last 5 minutes extend closing by 5 minutes</span>
          </div>
        </div>

        {/* Tabs: Active vs Ended Auctions */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setAuctionStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
              auctionStatusFilter === 'ACTIVE'
                ? 'bg-[#D32437] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Active Live Auctions ({activeCount})</span>
          </button>

          <button
            onClick={() => setAuctionStatusFilter('ENDED')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
              auctionStatusFilter === 'ENDED'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Ended Auctions ({endedCount})</span>
          </button>

          <button
            onClick={() => setAuctionStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              auctionStatusFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Auctions ({activeCount + endedCount})</span>
          </button>
        </div>

        {/* Live Vehicles Grid */}
        {liveAuctions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#D1D5DB] rounded-2xl bg-white">
            <h4 className="text-base font-bold text-[#231F20]">No Online Auctions Match Your Selection</h4>
            <p className="text-xs text-[#8C8C8C] mt-1">Try resetting the filter selections above.</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-[#D32437] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAuctions.map((auc) => {
              const vehicle = auc.vehicle || vehicles.find((v) => v.id === auc.vehicleId);
              if (!vehicle) return null;

              const isLiked = favoriteIds.includes(vehicle.id) || favoriteIds.includes(auc.id) || favorites.has(auc.id) || favorites.has(vehicle.id);
              const currentBid = auc.currentHighestBid || auc.startPrice;
              const priceObj = formatCurrency(currentBid);
              const isEnded = auc.status === 'ENDED' || auc.status === 'COMPLETED' || (auc.endTime && new Date(auc.endTime).getTime() <= now);
              const isLeading = Boolean(
                currentUser && (
                  auc.highestBidderId === currentUser.id ||
                  auc.highestBidderId === currentUser.email ||
                  (auc.highestBidderId && currentUser.email && auc.highestBidderId.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (auc.highestBidderId && (currentUser as any).username && auc.highestBidderId === (currentUser as any).username)
                )
              );

              const fallbackImg = vehicle.vehicleType === 'TRUCK'
                ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
                : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800';

              const displayImg = vehicle.mediaPaths && vehicle.mediaPaths.length > 0
                ? vehicle.mediaPaths[0]
                : fallbackImg;

              return (
                <div 
                  key={auc.id} 
                  className={`awa-car-card group flex flex-col justify-between transition-all duration-300 ${
                    isLeading 
                      ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-100/50 bg-emerald-50/10' 
                      : 'bg-white'
                  }`}
                >
                  
                  {/* Vehicle Image */}
                  <div 
                    onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                    className="relative overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    <img 
                      src={displayImg} 
                      alt={`${vehicle.make} ${vehicle.model}`} 
                      className="car-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImg;
                      }}
                    />

                    {/* Live vs Ended Badge */}
                    {isEnded ? (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-white rounded-md shadow-xs border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-[11px] font-bold text-slate-200 tracking-wider">
                          AUCTION ENDED
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 rounded-md shadow-xs border border-red-200">
                        <span className="w-2 h-2 rounded-full bg-[#D32437] beacon-pulse" />
                        <span className="text-[11px] font-bold text-[#D32437] tracking-wider">
                          LIVE AUCTION
                        </span>
                      </div>
                    )}

                    {/* Leading Bidder Badge */}
                    {isLeading && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-md shadow-md font-bold text-[10px] tracking-wide animate-pulse z-10">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>YOU ARE WINNING</span>
                      </div>
                    )}

                    {/* Registration No */}
                    <div className="absolute bottom-2 left-3 bg-black/70 text-white font-mono text-[11px] px-2 py-0.5 rounded backdrop-blur-xs">
                      {vehicle.registrationNumber}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 
                        onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                        className="awa-car-title cursor-pointer hover:text-[#D32437] transition"
                      >
                        {vehicle.manufacturingYear} {vehicle.make} {vehicle.model}
                      </h4>

                      <button
                        onClick={() => onViewDetails ? onViewDetails(auc, vehicle) : onSelectAuction(auc)}
                        className="text-xs text-[#0D74B5] font-semibold hover:underline block mb-2 cursor-pointer"
                      >
                        View Details & Inspection Report &rarr;
                      </button>

                      {/* Real-time Countdown or Ended Notice */}
                      {isEnded ? (
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold mb-3 bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Auction Closed (00h : 00m : 00s)</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs text-[#D32437] font-bold mb-3 bg-red-50 px-2.5 py-1.5 rounded-md">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Ends in: {formatCountdown(auc.endTime)}</span>
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs border-t border-[#F0F0F0] pt-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">Lot#:</span>
                          <span className="font-semibold text-[#231F20] font-mono">
                            AWA-{auc.id.substring(0, 6).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">Mileage:</span>
                          <span className="font-semibold text-[#231F20]">
                            {Number(vehicle.odometerReadingKm).toLocaleString()} KM
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">Location:</span>
                          <span className="font-semibold text-[#231F20]">
                            Dubai Yard 4 / Central Hub
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Bid Actions */}
                    <div className="border-t border-[#F0F0F0] pt-3 mt-auto">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                          Current Bid
                        </span>
                        <div className="text-right">
                          <div className={isLeading ? "text-lg font-extrabold text-emerald-600" : "awa-price"}>
                            {priceObj.aed}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 font-mono">
                            ({priceObj.inr})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(vehicle.id || auc.id, e)}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                            isLiked 
                              ? 'border-[#D32437] bg-red-50 text-[#D32437] shadow-xs scale-105' 
                              : 'border-[#D1D5DB] text-slate-400 hover:border-[#D32437] hover:text-[#D32437] hover:bg-red-50/20'
                          }`}
                          title={
                            !currentUser
                              ? 'Sign in to add to favorites'
                              : currentUser.role !== 'BUYER'
                                ? 'Favorites are exclusive to Buyer accounts'
                                : isLiked
                                  ? 'Remove from favorites'
                                  : 'Add to favorites'
                          }
                        >
                          <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-[#D32437] text-[#D32437]' : ''}`} />
                        </button>

                        {/* BID NOW Button or Disabled AUCTION ENDED button or WINNING (RAISE) button */}
                        {isEnded ? (
                          <button
                            disabled
                            className="flex-1 bg-slate-200 text-slate-500 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-90 text-sm"
                            title="This auction has concluded"
                          >
                            <Lock className="w-4 h-4 mr-1 text-slate-500" />
                            <span>AUCTION ENDED</span>
                          </button>
                        ) : isLeading ? (
                          <button
                            onClick={() => onOpenBidModal ? onOpenBidModal(auc) : handleBidClick(auc)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer transition text-sm"
                            title="You are currently leading this auction! Click to raise your bid."
                          >
                            <CheckCircle className="w-4 h-4 mr-1 text-white" />
                            <span>WINNING (RAISE)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenBidModal ? onOpenBidModal(auc) : handleBidClick(auc)}
                            className="flex-1 awa-bidnow-btn flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                          >
                            <span>BID NOW</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Bar Matching Screenshot 3 */}
          {totalItems > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              {/* Left Side: < Previous  1  2  3  4  5  Next > */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  &lsaquo; Previous
                </button>

                {/* Page Number Buttons */}
                {(() => {
                  const pages: number[] = [];
                  const maxButtons = 5;
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

                  if (endPage - startPage + 1 < maxButtons) {
                    startPage = Math.max(1, endPage - maxButtons + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  return pages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center ${
                        currentPage === p
                          ? 'bg-[#D32437] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ));
                })()}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next &rsaquo;
                </button>
              </div>

              {/* Right Side: Items per page: [ 27 ] matching Screenshot 3 */}
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="font-medium">Items per page:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={itemsPerPage || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      setItemsPerPage(val);
                      setCurrentPage(1);
                    } else if (e.target.value === '') {
                      setItemsPerPage(0);
                    }
                  }}
                  onBlur={() => {
                    if (itemsPerPage <= 0) setItemsPerPage(27);
                  }}
                  className="w-14 h-8 px-2 text-center text-xs font-bold text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D32437] focus:border-[#D32437] bg-white"
                />
              </div>
            </div>
          )}
        </>
      )}

      </main>

    </div>
  );
};
