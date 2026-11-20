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
  Eye,
  Maximize2
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      if (diff === 0 || auction.status === 'ENDED' || auction.status === 'COMPLETED') {
        setTimeLeft('AUCTION CLOSED');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status]);

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
  const lotNumber = vehicle.lotNo ? `AJ-${vehicle.lotNo}` : (vehicle.id ? `AJ-${vehicle.id.substring(0, 6).toUpperCase()}` : 'AJ-101003');

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

  // Lightbox keyboard navigation (Escape, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      else if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  const downloadReport = () => {
    const reportContent = `
AJ AUCTIONS VEHICLE INSPECTION REPORT
--------------------------------------
Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.manufacturingYear})
Lot Number: ${lotNumber}
VIN / Chassis: ${vehicle.vin}
Registration: ${vehicle.registrationNumber}
Odometer: ${Number(vehicle.odometerReadingKm).toLocaleString()} KM
Fuel Type: ${vehicle.fuelType}
Engine Number: ${vehicle.engineNumber || 'N/A'}
Branch / Location: ${vehicle.location || vehicle.branch || 'Abu Dhabi, UAE'}
Inspection Status: 150-Point Certified Pass
Condition: Excellent Mechanical & Body Condition
Verified Seller: ${vehicle.clientName || 'Institutional Consignment'}
--------------------------------------
AJ Auctions LLC - Official Digital Certificate • Powered by AshwikTechnologies
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AJ_Inspection_Report_${lotNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ajauctions.online';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Bar with Back Button (Fixes D21) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-[#059669] font-bold text-sm transition cursor-pointer"
            title="Return to Catalog"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
            <span>Back to Auctions</span>
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
                  ? 'border-[#059669] bg-emerald-50 text-[#059669] shadow-xs' 
                  : 'border-slate-200 text-slate-400 hover:text-[#059669] hover:border-[#059669]/40 hover:bg-emerald-50/20 bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-[#059669] text-[#059669]' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${vehicle.make} ${vehicle.model} - AJ Auctions`,
                    url: currentUrl,
                  });
                } else {
                  navigator.clipboard.writeText(currentUrl);
                  alert('Vehicle link copied to clipboard!');
                }
              }}
              className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 bg-white transition cursor-pointer"
              title="Share Vehicle"
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
            
            {/* Main Stage Image with Lightbox Trigger (Fixes D16) */}
            <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
              <img
                src={galleryImages[selectedImageIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-cover select-none cursor-zoom-in"
              />
              
              {/* Prev / Next Image Overlays */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Fullscreen Zoom Pill Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
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
                  className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#059669] ring-2 ring-[#059669]/20 scale-105'
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
                <div className="w-12 h-1 bg-[#059669] rounded-full mt-1.5" />
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
                  <span className="font-semibold text-slate-900">{vehicle.location || vehicle.branch || 'Abu Dhabi, UAE'}</span>
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

          {/* Right Column: Bidding Action Card */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col gap-5">
              
              {/* Header Title with Emerald Accent */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="w-10 h-1 bg-[#059669] rounded-full mt-2 mb-3" />
                
                {/* Lot Number Pill Badge */}
                <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md font-mono">
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
                    isLeadingBidder ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-100 text-[#059669]'
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
                    isLeadingBidder ? 'text-emerald-700' : 'text-[#059669]'
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
                    : 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-600/20'
                }`}
              >
                <span>{isLeadingBidder ? 'RAISE YOUR BID' : 'BID NOW'}</span>
              </button>

              {/* Technical Report Download Button */}
              <button
                onClick={downloadReport}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Download Inspection Report</span>
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Deep-link QR Code Widget (Fixes D17) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`}
                  alt="Scan QR for Mobile View"
                  className="w-16 h-16 rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                />
                <div className="text-left min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">Scan to View on Mobile</span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    Instant mobile inspection: Scan with your camera to view report & specs on your smartphone.
                  </span>
                </div>
              </div>

              {/* Security Deposit Banner */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>200x Bidding Power:</span>
                <button
                  onClick={onOpenDeposit}
                  className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Manage Security Deposit
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox Modal (Fixes D16) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm sm:text-base">{vehicle.make} {vehicle.model}</span>
              <span className="text-xs text-slate-400 font-mono">Lot {lotNumber}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-mono">
                {selectedImageIndex + 1} of {galleryImages.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image View */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[selectedImageIndex]}
              alt={`${vehicle.make} ${vehicle.model} Fullscreen`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
            />

            {/* Left / Right Arrow Controls */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar" onClick={(e) => e.stopPropagation()}>
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-[#059669] scale-110'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
