import React, { useState } from 'react';
import { 
  Heart, 
  ArrowLeft, 
  Search, 
  Gavel, 
  Clock, 
  MapPin, 
  Gauge, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Flame,
  Sparkles
} from 'lucide-react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import { VehicleCard } from './VehicleCard';

interface FavoritesPageProps {
  vehicles: Vehicle[];
  auctions: Auction[];
  currentUser: User | null;
  favoriteIds: string[];
  onToggleFavorite: (vehicleId: string) => void;
  onOpenBidModal: (auction: Auction) => void;
  onViewDetails: (auction: Auction, vehicle: Vehicle) => void;
  onBackHome: () => void;
  onNavigate: (view: PortalView) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  vehicles,
  auctions,
  currentUser,
  favoriteIds,
  onToggleFavorite,
  onOpenBidModal,
  onViewDetails,
  onBackHome,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CAR' | 'TRUCK' | 'PLATES'>('ALL');

  // Filter vehicles that are currently in favoriteIds
  const favoriteVehicles = vehicles.filter((v) => favoriteIds.includes(v.id));

  const filteredVehicles = favoriteVehicles.filter((v) => {
    const matchesSearch = 
      `${v.make} ${v.model} ${v.lotNo || ''} ${v.location || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'CAR' && v.vehicleType === 'CAR') return true;
    if (categoryFilter === 'TRUCK' && v.vehicleType === 'TRUCK') return true;
    if (categoryFilter === 'PLATES' && (v as any).category === 'PLATES') return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16">
      {/* Top Banner Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Back Button & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackHome}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#D32437] hover:border-[#D32437]/30 hover:bg-red-50/50 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Heart className="w-6 h-6 text-[#D32437] fill-[#D32437]" />
                    <span>My Saved Favorites</span>
                  </h1>
                  <span className="bg-red-100 text-[#D32437] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {favoriteVehicles.length} {favoriteVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time watchlist for instant bidding, auction monitoring, and live pricing.
                </p>
              </div>
            </div>

            {/* Buyer Telemetry & 200x Power Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left text-xs">
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">Buyer Limit (200x)</span>
                  <span className="font-extrabold text-slate-900">
                    AED {((currentUser.biddingLimit || 800000) - (currentUser.usedBiddingLimit || 0)).toLocaleString()} Available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Search & Category Filter Toolbar */}
        {favoriteVehicles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search saved vehicles by make, model, or lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D32437]/20 focus:border-[#D32437] transition"
              />
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'CAR', 'TRUCK', 'PLATES'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#D32437] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat === 'ALL' ? 'All Favorites' : cat === 'CAR' ? 'Cars & SUVs' : cat === 'TRUCK' ? 'Commercial Trucks' : 'VIP Plates'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {favoriteVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto mt-10 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-red-50 text-[#D32437] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Your Favorites Watchlist is Empty
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              You haven't saved any vehicles to your favorites yet. Browse active live auctions and click the heart icon on any vehicle to add it to your watchlist for instant bidding.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('ONLINE_AUCTIONS')}
                className="w-full sm:w-auto px-6 py-3 bg-[#D32437] hover:bg-[#b81d2f] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Browse Live Auctions</span>
              </button>

              <button
                type="button"
                onClick={onBackHome}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">No Matching Saved Vehicles</h4>
            <p className="text-xs text-slate-500 mb-4">No favorites found matching "{searchTerm}".</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
              }}
              className="text-xs text-[#D32437] font-bold hover:underline"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          /* Grid of Saved Vehicles */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => {
              const auction = auctions.find((a) => a.vehicleId === vehicle.id) || 
                              auctions.find((a) => a.id === vehicle.id);

              return (
                <div key={vehicle.id} className="relative">
                  <VehicleCard
                    vehicle={vehicle}
                    auction={auction}
                    onViewDetails={onViewDetails}
                    onBidClick={onOpenBidModal}
                    isFavorite={true}
                    onToggleFavorite={() => onToggleFavorite(vehicle.id)}
                    isBuyer={currentUser?.role === 'BUYER'}
                    isLoggedIn={Boolean(currentUser)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
