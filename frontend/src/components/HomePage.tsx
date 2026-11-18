import React, { useState, useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import {
  Car,
  Wallet,
  HelpCircle,
  Heart,
  ShoppingBag,
  ArrowRight,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  vehicles: Vehicle[];
  auctions: Auction[];
  currentUser: User | null;
  onSelectAuction: (auction: Auction) => void;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
  onQuickLogin?: (role: 'BUYER' | 'SELLER' | 'ADMIN') => void;
  onOpenCreateVehicle: () => void;
  searchFilter: string;
  onNavigate: (view: PortalView) => void;
  onRequireAuth: () => void;
  onOpenBidModal?: (auction: Auction) => void;
  onViewDetails?: (auction: Auction, vehicle: Vehicle) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (vehicleId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  vehicles,
  auctions,
  currentUser,
  onOpenDeposit,
  onOpenCreateVehicle,
  onNavigate,
  onRequireAuth,
  favoriteIds = [],
}) => {
  const [comingSoonTitle, setComingSoonTitle] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = Date.now();
    const onlineActive = auctions.filter(
      (a) =>
        a.auctionType !== 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const silentActive = auctions.filter(
      (a) =>
        a.auctionType === 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const inspectedVehicles = vehicles.length;
    return { onlineActive, silentActive, inspectedVehicles };
  }, [auctions, vehicles]);

  const handleSellCarClick = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (currentUser.role === 'BUYER') {
      alert(
        'You are currently signed in as a Buyer account.\n\nOnly registered Sellers or Admins can submit vehicles for consignment. Please sign out and sign in with a Seller account, or contact AJ Auctions support.'
      );
      return;
    }
    onOpenCreateVehicle();
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-slate-900">
      {/* ============================================================ */}
      {/* 1. TOP WEB BANNER (AJ AUCTIONS PLATFORM BANNER)              */}
      {/* ============================================================ */}
      <div className="w-full bg-[#0F172A] overflow-hidden flex items-center justify-center">
        <img
          src="/assets/banner-aj.png"
          alt="AJ Auctions Web Banner"
          className="w-full h-auto object-cover max-h-[380px] sm:max-h-[460px] block"
          onError={(e) => {
            // Fallback gradient if banner image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. AUCTION CATEGORIES (IDENTICAL TO CATEGORY GRID)     */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div className="mb-6">
          <h3 className="header-title">Auction Categories</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {/* 1. Online Auctions */}
          <div
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="category-box group"
            title="Browse Live Online Auctions"
          >
            <img
              src="/assets/categories/cat-online-auctions.png"
              alt="Online Auctions"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 transition group-hover:scale-105"
            />
            <div className="category-title text-center mt-2">
              Online Auctions
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">
                {stats.onlineActive}
              </span>
            </div>
          </div>

          {/* 2. Silent Auctions */}
          <div
            onClick={() => onNavigate('SILENT_AUCTIONS')}
            className="category-box group"
            title="Browse Confidential Silent Auctions"
          >
            <img
              src="/assets/categories/cat-silent-auctions.png"
              alt="Silent Auctions"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 transition group-hover:scale-105"
            />
            <div className="category-title text-center mt-2">
              Silent Auctions
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">
                {stats.silentActive}
              </span>
            </div>
          </div>

          {/* 3. UAE Plates */}
          <div
            onClick={() => setComingSoonTitle('UAE License Plates Auction')}
            className="category-box group"
            title="Exclusive VIP Number Plates"
          >
            <img
              src="/assets/categories/cat-uae-plates.png"
              alt="UAE Plates"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 transition group-hover:scale-105"
            />
            <div className="category-title text-center mt-2">
              UAE Plates
              <br />
              <span className="text-[#D32437] font-bold text-xs uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>

          {/* 4. Equipment & Machinery */}
          <div
            onClick={() => setComingSoonTitle('Equipment & Heavy Machinery Auction')}
            className="category-box group"
            title="Heavy Commercial Equipment & Machinery"
          >
            <img
              src="/assets/categories/cat-equipment.png"
              alt="Equipment & Machinery"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 transition group-hover:scale-105"
            />
            <div className="category-title text-center mt-2">
              Equipment &amp; Machinery
              <br />
              <span className="text-[#D32437] font-bold text-xs uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>

          {/* 5. AJ Moto */}
          <div
            onClick={() => setComingSoonTitle('AJ Moto - Specialty Showroom & Bikes')}
            className="category-box group"
            title="AJ Moto Specialty & Supercars"
          >
            <img
              src="/assets/categories/cat-aj-moto.png"
              alt="AJ Moto"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 transition group-hover:scale-105"
            />
            <div className="category-title text-center mt-2">
              AJ Moto
              <br />
              <span className="text-[#D32437] font-bold text-xs uppercase tracking-wider">
                Showroom
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. HOME DIVIDER                                              */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 4. QUICK ACTION CARDS (SELL CAR, DEPOSIT/PURCHASES, WATCHLIST)*/}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Sell Your Car */}
          <div
            onClick={handleSellCarClick}
            className="bg-white border border-[#C7C7C7] hover:border-[#D32437] rounded-xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D32437] flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#231F20]">Sell Your Car</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit your vehicle for inspection, verification, and batching in our next Online or Silent auction.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D32437] mt-3">
                <span>Submit Vehicle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Security Deposit OR My Purchases */}
          {currentUser?.role === 'BUYER' ? (
            <div
              onClick={() => onNavigate('MY_PURCHASES')}
              className="bg-white border border-[#C7C7C7] hover:border-blue-500 rounded-xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#231F20]">My Purchases &amp; Payments</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  View won vehicles, official settlement receipts, chronological payments, and active sealed bids.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-3">
                  <span>Open Buyer Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => (currentUser ? onOpenDeposit() : onRequireAuth())}
              className="bg-white border border-[#C7C7C7] hover:border-blue-500 rounded-xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#231F20]">Security Deposit &amp; 200x Limit</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Top up your 100% refundable security deposit to activate up to 200x instant bidding power across all auctions.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-3">
                  <span>Manage Deposit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* Buyer Watchlist OR Help Center */}
          {currentUser?.role === 'BUYER' ? (
            <div
              onClick={() => onNavigate('FAVORITES')}
              className="bg-white border border-[#C7C7C7] hover:border-red-400 rounded-xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D32437] flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-[#D32437] text-[#D32437]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#231F20]">
                  My Watchlist ({favoriteIds.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Track saved vehicles across Online and Silent auctions with instant status notifications.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D32437] mt-3">
                  <span>View Watchlist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigate('HELP')}
              className="bg-white border border-[#C7C7C7] hover:border-amber-500 rounded-xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#231F20]">Inspection &amp; Bidding Guide</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Learn about 150-point technical tests, Online vs Silent auctions, deposit limits, and yard collection.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-3">
                  <span>Help Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. HOME DIVIDER                                              */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 6. HOW IT WORKS (AUTHENTIC 4-STEP CATEGORY GRID)        */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h3 className="header-title">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Step 1 */}
            <div className="step-wrapper">
              <div className="step-icon light">
                <img
                  src="/assets/steps/step-1-signup.png"
                  alt="Sign Up"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden lg:block step-line" />
              <div className="step-text mt-4">
                <h5 className="text-lg font-bold text-[#231F20]">Sign Up &amp; Verify Account</h5>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Create your account and complete verification in minutes to start bidding on AJ Auctions.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-wrapper">
              <div className="step-icon">
                <img
                  src="/assets/steps/step-2-bids.png"
                  alt="Browse & Place Bids"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
              </div>
              <div className="hidden lg:block step-line" />
              <div className="step-text mt-4">
                <h5 className="text-lg font-bold text-[#231F20]">Browse &amp; Place Bids</h5>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Explore our extensive inventory and place competitive bids on your desired vehicles.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-wrapper">
              <div className="step-icon light">
                <img
                  src="/assets/steps/step-3-payment.png"
                  alt="Win & Make Payment"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden lg:block step-line" />
              <div className="step-text mt-4">
                <h5 className="text-lg font-bold text-[#231F20]">Win &amp; Make Payment</h5>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Won the auction? Complete your payment securely through our trusted platform.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-wrapper">
              <div className="step-icon">
                <img
                  src="/assets/steps/step-4-delivery.png"
                  alt="Get Your Car Delivered"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
              </div>
              <div className="step-text mt-4">
                <h5 className="text-lg font-bold text-[#231F20]">Get Your Car Delivered</h5>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Sit back and relax as we handle the delivery of your vehicle to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HOME DIVIDER                                              */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 8. VALUE - ADDED SERVICES                                   */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="header-title">Value - Added Services</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: 'Vehicle Inspection', icon: '/assets/services/svc-inspection.png' },
              { title: 'Vehicle Delivery', icon: '/assets/services/svc-delivery.png' },
              { title: 'Ownership Transfer', icon: '/assets/services/svc-transfer.png' },
              { title: 'Polishing & Detailing', icon: '/assets/services/svc-polishing.png' },
              { title: 'Maintenance & Repairs', icon: '/assets/services/svc-repairs.png' },
              { title: 'More Services', icon: '/assets/services/svc-more.png' },
            ].map((svc) => (
              <div
                key={svc.title}
                onClick={() => setComingSoonTitle(`AJ Services: ${svc.title}`)}
                className="category-box p-4"
              >
                <img
                  src={svc.icon}
                  alt={svc.title}
                  width="54"
                  height="54"
                  className="w-12 h-12 mb-3 object-contain"
                />
                <div className="category-title text-center text-xs sm:text-sm font-semibold text-[#231F20]">
                  {svc.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. HOME DIVIDER                                              */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 10. TESTIMONIALS                                             */}
      {/* ============================================================ */}
      <section className="py-14 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h3 className="header-title">Testimonials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="testimonial-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-lg">
                  ★★★★★
                </div>
                <h5 className="font-bold text-[#231F20] text-base mb-2">
                  Smooth Bidding, Great Finds at AJ Auctions!
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "I had a fantastic buying experience with AJ Auctions! The platform was user-friendly, offering a wide variety of vehicles. The bidding process was smooth, and their team provided excellent support, ensuring a seamless transaction. Highly recommend!"
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Mohammed A. • Verified Buyer</span>
                <span className="text-xs text-slate-400">Dubai, UAE</span>
              </div>
            </div>

            <div className="testimonial-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-lg">
                  ★★★★★
                </div>
                <h5 className="font-bold text-[#231F20] text-base mb-2">
                  Effortless Selling with AJ Auctions.
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "Selling through AJ Auctions was a breeze! Their platform made listing my vehicle simple, and the bidding process attracted serious buyers quickly. The team's support was top-notch, ensuring a fast and profitable sale. Highly recommend!"
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Tariq S. • Verified Seller</span>
                <span className="text-xs text-slate-400">Abu Dhabi, UAE</span>
              </div>
            </div>

            <div className="testimonial-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-lg">
                  ★★★★★
                </div>
                <h5 className="font-bold text-[#231F20] text-base mb-2">
                  Outstanding Customer Service at AJ Auctions
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "AJ Auctions provided exceptional customer service! Their team was responsive, guiding me through every step of the bidding process with clarity and patience. Any questions I had were answered promptly, making my experience smooth and stress-free."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Khalid M. • Corporate Bidder</span>
                <span className="text-xs text-slate-400">Sharjah, UAE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. FOOTER & AJ AUCTIONS COMMUNICATION CHANNELS             */}
      {/* ============================================================ */}
      <footer className="bg-[#1F242E] text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/logo-aj.png" alt="AJ Auctions" className="h-9 w-auto" />
                <span className="text-lg font-black text-white tracking-wider">AJ AUCTIONS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                UAE's premier online &amp; silent vehicle auction platform. Certified 150-point technical testing, bank-grade settlement, and door-to-door delivery.
              </p>
            </div>

            {/* Column 2: Contact Details */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">Contact AJ Auctions</h5>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <img src="/assets/phone.png" alt="Phone" className="w-4 h-4" />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/assets/wtsapp.png" alt="WhatsApp" className="w-4 h-4" />
                  <span>WhatsApp: +971 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/assets/email.png" alt="Email" className="w-4 h-4" />
                  <span>support@ajauctions.ae</span>
                </div>
              </div>
            </div>

            {/* Column 3: Social Channels */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">Follow AJ Auctions</h5>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/ajauctionsuae"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                  title="AJ Auctions on Instagram"
                >
                  <img src="/assets/instagram.png" alt="Instagram" className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/ajauctionsuae"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                  title="AJ Auctions on Facebook"
                >
                  <img src="/assets/logos_facebook.png" alt="Facebook" className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@ajauctionsuae"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                  title="AJ Auctions on YouTube"
                >
                  <img src="/assets/youtube.png" alt="YouTube" className="w-4 h-4" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                @ajauctionsuae across all official channels
              </p>
            </div>

            {/* Column 4: App Download */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">Download Mobile App</h5>
              <div className="space-y-2">
                <div
                  onClick={() => setComingSoonTitle('AJ Auctions iOS App')}
                  className="cursor-pointer inline-block"
                >
                  <img src="/assets/appstore.png" alt="App Store" className="h-9 w-auto" />
                </div>
                <br />
                <div
                  onClick={() => setComingSoonTitle('AJ Auctions Android App')}
                  className="cursor-pointer inline-block"
                >
                  <img src="/assets/googleplay.png" alt="Google Play" className="h-9 w-auto" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            © 2025 AJ Auctions. All rights reserved. AshwikTechnologies &amp; AJ Auctions Group.
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* COMING SOON MODAL                                            */}
      {/* ============================================================ */}
      {comingSoonTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#D32437]">
                <Clock className="w-5 h-5" />
                <h4 className="font-bold text-slate-900 text-base">{comingSoonTitle}</h4>
              </div>
              <button
                onClick={() => setComingSoonTitle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#D32437] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h5 className="font-extrabold text-slate-900 text-lg">Launching Soon!</h5>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
                This service category is currently being prepared for catalog ingestion and batching. Please check our active Online and Silent vehicle auctions in the meantime.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setComingSoonTitle(null);
                  onNavigate('ONLINE_AUCTIONS');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#D32437] hover:bg-[#b01e2e] text-white font-bold text-xs shadow-xs transition"
              >
                Browse Online Auctions
              </button>
              <button
                onClick={() => setComingSoonTitle(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
