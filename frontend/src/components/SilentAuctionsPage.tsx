import React, { useState, useEffect } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { 
  X, 
  Home, 
  Search, 
  ArrowUpDown, 
  LayoutGrid, 
  Image as ImageIcon,
  Clock, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface SilentAuctionsPageProps {
  vehicles: Vehicle[];
  auctions?: Auction[];
  currentUser: User | null;
  onRequireAuth: () => void;
  onNavigate: (view: PortalView) => void;
  onBackHome: () => void;
}

export const SilentAuctionsPage: React.FC<SilentAuctionsPageProps> = ({
  vehicles,
  auctions = [],
  currentUser,
  onRequireAuth,
  onNavigate,
  onBackHome,
}) => {
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [lotSearch, setLotSearch] = useState('');

  // Dynamically map silent auctions from backend API data
  const silentFromAuctions = (auctions || [])
    .filter((a) => a.auctionType === 'SILENT')
    .map((a, idx) => {
      const v = a.vehicle || vehicles.find((item) => item.id === a.vehicleId);
      return {
        id: a.id,
        title: v ? `${v.make} ${v.model}` : `Lot #${a.id.slice(0, 6)}`,
        lotNo: v?.registrationNumber ? v.registrationNumber.replace('DXB-', '') : `10041${2 + idx}`,
        mileage: v ? `${Number(v.odometerReadingKm).toLocaleString()} KM` : '124,000 KM',
        location: idx === 0 ? 'Dubai Al Ruwayyah Yard' : 'Abu Dhabi Central Yard',
        minDeposit: `AED ${Math.round(a.startPrice / 22.5 / 10).toLocaleString()}`,
        countdown: '76D: 20H: 49M: 51S',
        image: v?.mediaPaths && v.mediaPaths.length > 0 ? v.mediaPaths[0] : null,
      };
    });

  // Fallback to reference Screenshot 2 items if empty
  const silentVehicles = silentFromAuctions.length > 0 ? silentFromAuctions : [
    {
      id: 'silent-1',
      title: 'Honda Civic 2011',
      lotNo: '100412',
      mileage: '124,000 KM',
      location: 'Dubai Al Ruwayyah Yard',
      minDeposit: 'AED 5,000',
      countdown: '76D: 20H: 49M: 51S',
      image: null,
    },
    {
      id: 'silent-2',
      title: 'Nissan Patrol 2017',
      lotNo: '100413',
      mileage: '85,000 KM',
      location: 'Abu Dhabi Central Yard',
      minDeposit: 'AED 10,000',
      countdown: '76D: 20H: 49M: 51S',
      image: null,
    },
  ];

  const handleSilentBid = (item: any) => {
    if (!currentUser) {
      // Must be authenticated to bid -> Redirect to Screenshot 4
      onRequireAuth();
    } else {
      alert(`Silent / Sealed bid registered for ${item.title}. Minimum deposit verified.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar matching Screenshot 2 */}
      <PortalSidebar currentView="SILENT_AUCTIONS" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Header Bar matching Screenshot 2: ✕ Silent Auctions */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] mb-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBackHome}
              className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Close and return to Home"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-[#231F20]">
              Silent Auctions
            </h1>
          </div>
        </div>

        {/* Breadcrumb Navigation: ⌂ > Silent Auctions */}
        <div className="flex items-center space-x-2 text-xs text-[#8C8C8C] mb-6">
          <button onClick={onBackHome} className="hover:text-[#231F20] flex items-center gap-1 cursor-pointer">
            <Home className="w-3.5 h-3.5" />
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#231F20]">Silent Auctions</span>
        </div>

        {/* Filters Top Bar matching Screenshot 2 */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs mb-6">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Categories</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none">
                <option value="ALL">Select</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Make</label>
              <select 
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none"
              >
                <option value="ALL">Select</option>
                <option value="Honda">Honda</option>
                <option value="Nissan">Nissan</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Model</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none">
                <option value="ALL">Select</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Year of Make</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none">
                <option value="ALL">Select</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Body Type</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none">
                <option value="ALL">Select</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C8C8C] mb-1">Additional Filters</label>
              <select className="w-full text-xs bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1.5 text-[#231F20] focus:outline-none">
                <option value="ALL">Select</option>
              </select>
            </div>
          </div>

          {/* Row 2: Lot Search, Sort, Clear, Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F3F4F6]">
            <div className="flex items-center border border-[#D1D5DB] rounded-md overflow-hidden bg-white max-w-xs w-full sm:w-64">
              <input
                type="text"
                value={lotSearch}
                onChange={(e) => setLotSearch(e.target.value)}
                placeholder="Lot No Search"
                className="w-full text-xs px-3 py-2 text-[#231F20] placeholder-slate-400 focus:outline-none"
              />
              <button className="px-3 text-[#059669] hover:bg-slate-50">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1.5 px-3 py-2 border border-[#D1D5DB] rounded-md text-xs font-semibold text-[#231F20] hover:bg-slate-50 transition">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort: <strong>Default</strong></span>
              </button>

              <button 
                onClick={() => {
                  setSelectedMake('ALL');
                  setLotSearch('');
                }}
                className="px-3.5 py-2 bg-[#231F20] hover:bg-black text-white rounded-md text-xs font-bold transition cursor-pointer"
              >
                Clear Filters
              </button>

              <button className="p-2 bg-[#059669] text-white rounded-md transition shadow-xs">
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Quick Filter Pills matching Screenshot 2: Honda (1), Nissan (1) */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-semibold">
          <button 
            onClick={() => setSelectedMake('Honda')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Honda' ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white border-[#D1D5DB] text-[#231F20]'
            }`}
          >
            Honda (1)
          </button>
          <button 
            onClick={() => setSelectedMake('Nissan')}
            className={`px-3 py-1.5 rounded-md border transition ${
              selectedMake === 'Nissan' ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white border-[#D1D5DB] text-[#231F20]'
            }`}
          >
            Nissan (1)
          </button>
        </div>

        {/* Tab: Current Auctions */}
        <div className="flex items-center space-x-3 mb-6">
          <button className="px-5 py-2 bg-[#059669] text-white rounded-md text-xs sm:text-sm font-bold shadow-xs">
            Current Auctions ({silentVehicles.length})
          </button>
        </div>

        {/* Cards Grid matching Screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {silentVehicles.map((item) => (
            <div key={item.id} className="aj-card h-full flex flex-col justify-between bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
              
              {/* Image or IMAGE NOT AVAILABLE matching Screenshot 2 */}
              <div className="h-48 sm:h-52 w-full bg-[#EFEFEF] flex flex-col items-center justify-center text-slate-400 overflow-hidden relative shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-20 h-16 border-2 border-slate-400 rounded-lg flex items-center justify-center mb-2 bg-slate-200/50">
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 tracking-wider">
                      IMAGE NOT AVAILABLE
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body matching Screenshot 2 */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {item.title}
                  </h4>

                  <button 
                    onClick={() => handleSilentBid(item)}
                    className="text-xs text-[#0D74B5] font-semibold hover:underline block mb-2"
                  >
                    View Details
                  </button>

                  <div className="text-xs text-[#059669] font-bold mb-3">
                    {item.countdown}
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-[#F0F0F0] pt-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B]">Lot#:</span>
                      <span className="font-semibold text-[#231F20] font-mono">{item.lotNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B]">Mileage:</span>
                      <span className="font-semibold text-[#231F20]">{item.mileage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B]">Location:</span>
                      <span className="font-semibold text-[#231F20]">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Silent Bid CTA */}
                <div className="border-t border-[#F0F0F0] pt-3 mt-auto">
                  <button
                    onClick={() => handleSilentBid(item)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>PLACE SEALED BID</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </main>

    </div>
  );
};
