import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Gauge, 
  Calendar, 
  Fuel, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Car, 
  FileText, 
  Gavel, 
  Share2, 
  Heart,
  Eye
} from 'lucide-react';
import { Auction, Vehicle, User } from '../types';

interface VehicleDetailsPageProps {
  auction: Auction;
  vehicle: Vehicle;
  currentUser: User | null;
  onBack: () => void;
  onOpenBidModal: (auction: Auction) => void;
  onOpenDeposit: () => void;
  onRequireAuth: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const VehicleDetailsPage: React.FC<VehicleDetailsPageProps> = ({
  auction,
  vehicle,
  currentUser,
  onBack,
  onOpenBidModal,
  onOpenDeposit,
  onRequireAuth,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      if (diff === 0) {
        setTimeLeft('ENDED');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}D: ${hours}H: ${minutes}M: ${seconds}S`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  const defaultImages = [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
  ];

  const galleryImages = vehicle.mediaPaths && vehicle.mediaPaths.length > 0 
    ? vehicle.mediaPaths 
    : defaultImages;

  const currentBid = Number(auction.currentHighestBid || auction.startPrice || 0);
  const lotNumber = vehicle.lotNo || 101003;

  const isLeadingBidder = Boolean(
    currentUser && (
      (auction.highestBidderId && auction.highestBidderId.toLowerCase() === currentUser.id.toLowerCase()) ||
      (currentUser.email && auction.highestBidderId && auction.highestBidderId.toLowerCase() === currentUser.email.toLowerCase()) ||
      ((currentUser as any).username && auction.highestBidderId && auction.highestBidderId === (currentUser as any).username)
    )
  );

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const downloadReport = () => {
    const reportContent = `
AJ AUCTIONS VEHICLE INSPECTION REPORT
--------------------------------------
Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.manufacturingYear})
Lot Number: ${lotNumber}
VIN: ${vehicle.vin}
Registration: ${vehicle.registrationNumber}
Odometer: ${Number(vehicle.odometerReadingKm).toLocaleString()} KM
Fuel Type: ${vehicle.fuelType}
Engine Number: ${vehicle.engineNumber}
Location: ${vehicle.location || 'Abu Dhabi'}
Inspection Status: 150-Point Certified Pass
Condition: Excellent Mechanical & Body Condition
--------------------------------------
AJ Auctions LLC - Official Digital Certificate • Powered by AshwikTechnologies
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AJ_Inspection_Report_Lot_${lotNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Bar with Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-[#D32437] font-bold text-sm transition"
          >
            <X className="w-5 h-5 text-slate-500" />
            <span>Vehicle Details</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onToggleFavorite) {
                  onToggleFavorite();
                }
              }}
              title={
                !currentUser
                  ? 'Sign in to save this vehicle to your Favorites'
                  : currentUser.role !== 'BUYER'
                    ? 'Favorites are exclusive to Buyer accounts'
                    : isFavorite
                      ? 'Remove from Favorites'
                      : 'Save to Favorites'
              }
              className={`p-2 rounded-full border transition cursor-pointer ${
                isFavorite 
                  ? 'border-[#D32437] bg-red-50 text-[#D32437] shadow-xs' 
                  : 'border-slate-200 text-slate-400 hover:text-[#D32437] hover:border-[#D32437]/40 hover:bg-red-50/20 bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-[#D32437] text-[#D32437]' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${vehicle.make} ${vehicle.model} - AJ Auctions`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Vehicle link copied to clipboard!');
                }
              }}
              className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 bg-white transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Gallery & Specs (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Main Stage Image */}
            <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={galleryImages[selectedImageIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover select-none"
              />
              
              {/* Prev / Next Image Overlays */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Counter Badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Strip with Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedImageIndex === idx
                      ? 'border-[#D32437] ring-2 ring-[#D32437]/20 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Vehicle Details & Specifications Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-xl font-bold text-slate-900">Vehicle Specifications</h2>
                <div className="w-12 h-1 bg-[#D32437] rounded-full mt-1.5" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Make & Model</span>
                  <span className="font-semibold text-slate-900">{vehicle.make} {vehicle.model}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Manufacturing Year</span>
                  <span className="font-semibold text-slate-900">{vehicle.manufacturingYear}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Odometer / Mileage</span>
                  <span className="font-semibold text-slate-900">{Number(vehicle.odometerReadingKm).toLocaleString()} KM</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Fuel Type</span>
                  <span className="font-semibold text-slate-900">{vehicle.fuelType || 'Petrol'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Transmission</span>
                  <span className="font-semibold text-slate-900">Automatic</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Location</span>
                  <span className="font-semibold text-slate-900">{vehicle.location || 'Abu Dhabi, UAE'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Chassis / VIN</span>
                  <span className="font-mono font-semibold text-slate-900">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Registration Number</span>
                  <span className="font-semibold text-slate-900">{vehicle.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Vehicle Category</span>
                  <span className="font-semibold text-slate-900">{vehicle.vehicleType}</span>
                </div>
              </div>
            </div>

            {/* Inspection & Condition Guarantee */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">AJ Certified Vehicle</h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  This vehicle has completed a comprehensive 150-point technical inspection. Comprehensive diagnostics covering engine, transmission, bodywork, and electronics have been verified.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Action Card (Matching Screenshot 3) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col gap-5">
              
              {/* Header Title with Red Accent */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="w-10 h-1 bg-[#D32437] rounded-full mt-2 mb-3" />
                
                {/* Lot Number Pill Badge */}
                <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md">
                  Lot Number {lotNumber}
                </div>
              </div>

              {/* Time Left Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-sm">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-500 font-medium">Time Left</span>
                <span className="font-extrabold text-emerald-600 ml-auto tracking-wide">
                  {timeLeft}
                </span>
              </div>

              {/* Highest Bid Card */}
              <div className={`border rounded-xl p-4 flex items-center justify-between transition ${
                isLeadingBidder ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLeadingBidder ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-[#D32437]'
                  }`}>
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Highest Bid</span>
                    {isLeadingBidder && (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                        You're in the lead!
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-extrabold ${
                    isLeadingBidder ? 'text-emerald-700' : 'text-[#D32437]'
                  }`}>
                    AED {currentBid.toLocaleString()}
                  </span>
                </div>
              </div>

              {isLeadingBidder ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You are the current highest bidder. Raising your bid will increase your own winning offer.</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Place your bid before the timer runs out.
                </p>
              )}

              {/* Main Action Button */}
              <button
                onClick={() => onOpenBidModal(auction)}
                className={`w-full font-extrabold py-3.5 px-6 rounded-xl uppercase tracking-wider text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  isLeadingBidder
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                    : 'bg-[#4caf50] hover:bg-[#43a047] text-white shadow-green-600/20'
                }`}
              >
                <span>{isLeadingBidder ? 'RAISE YOUR BID' : 'BID NOW'}</span>
              </button>

              {/* Technical Report Download Button */}
              <button
                onClick={downloadReport}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <span>Technical Report</span>
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Security Deposit Banner */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>200x Bidding Power:</span>
                <button
                  onClick={onOpenDeposit}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Manage Security Deposit
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
