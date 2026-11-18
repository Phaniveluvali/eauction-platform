import React, { useMemo } from 'react';
import { Auction, Vehicle, User } from '../types';
import { PortalView } from './PortalSidebar';
import { getAssetUrl } from '../utils/assets';
import {
  ICON_ONLINE_AUCTIONS,
  ICON_SILENT_AUCTIONS,
  ICON_UAE_PLATES,
  ICON_EQUIPMENT,
  ICON_EMIRATES_MOTO,
  ICON_STEP_SIGNUP,
  ICON_STEP_BIDS,
  ICON_STEP_PAYMENT,
  ICON_STEP_DELIVERY,
  ICON_SVC_INSPECTION,
  ICON_SVC_DELIVERY,
  ICON_SVC_TRANSFER,
  ICON_SVC_POLISHING,
  ICON_SVC_REPAIRS,
  ICON_SVC_MORE,
} from '../constants/homeAssets';

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
  onNavigate,
}) => {
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

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-slate-900">
      {/* ============================================================ */}
      {/* 1. TOP WEB BANNER (AJ AUCTIONS PLATFORM BANNER)              */}
      {/* ============================================================ */}
      <div className="w-full bg-[#020b18] overflow-hidden flex items-center justify-center">
        <img
          src={getAssetUrl('/assets/banner-aj.webp')}
          alt="AJ Auctions Web Banner"
          className="w-full h-auto object-cover max-h-[380px] sm:max-h-[460px] block"
        />
      </div>

      {/* ============================================================ */}
      {/* 2. AUCTION CATEGORIES (EXACT MATCH TO AL WATANEYA LAYOUT)    */}
      {/* ============================================================ */}
      <div className="auction-home-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div className="mb-6">
          <h3 className="header-title">Auction Categories</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Card 1: Online Auctions */}
          <div
            onClick={() => onNavigate('ONLINE_AUCTIONS')}
            className="category-box"
            role="button"
            tabIndex={0}
            title="Online Auctions"
          >
            <img
              src={ICON_ONLINE_AUCTIONS}
              alt="Online Auctions"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
            />
            <div className="category-title text-center">
              Online Auctions
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">
                {stats.onlineActive}
              </span>
            </div>
          </div>

          {/* Card 2: Silent Auctions */}
          <div
            onClick={() => onNavigate('SILENT_AUCTIONS')}
            className="category-box"
            role="button"
            tabIndex={0}
            title="Silent Auctions"
          >
            <img
              src={ICON_SILENT_AUCTIONS}
              alt="Silent Auctions"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
            />
            <div className="category-title text-center">
              Silent Auctions
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">
                {stats.silentActive}
              </span>
            </div>
          </div>

          {/* Card 3: UAE Plates */}
          <div
            className="category-box cursor-pointer"
            role="button"
            tabIndex={0}
            title="UAE Plates"
          >
            <img
              src={ICON_UAE_PLATES}
              alt="UAE Plates"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
            />
            <div className="category-title text-center">
              UAE Plates
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">&nbsp;</span>
            </div>
          </div>

          {/* Card 4: Equipment & Machinery */}
          <div
            className="category-box cursor-pointer"
            role="button"
            tabIndex={0}
            title="Equipment & Machinery"
          >
            <img
              src={ICON_EQUIPMENT}
              alt="Equipment & Machinery"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
            />
            <div className="category-title text-center">
              Equipment &amp; Machinery
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">&nbsp;</span>
            </div>
          </div>

          {/* Card 5: Emirates Moto */}
          <div
            className="category-box cursor-pointer"
            role="button"
            tabIndex={0}
            title="Emirates Moto"
          >
            <img
              src={ICON_EMIRATES_MOTO}
              alt="Emirates Moto"
              width="80"
              height="80"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2"
            />
            <div className="category-title text-center">
              Emirates Moto
              <br />
              <span className="text-[#D32437] font-bold text-base sm:text-lg">&nbsp;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 10px HOME DIVIDER                                         */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 4. HOW IT WORKS (AUTHENTIC 4-STEP AL WATANEYA LAYOUT)        */}
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
                  src={ICON_STEP_SIGNUP}
                  alt="Sign Up & Verify Account"
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
                  src={ICON_STEP_BIDS}
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
                  src={ICON_STEP_PAYMENT}
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
                  src={ICON_STEP_DELIVERY}
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
      {/* 5. 10px HOME DIVIDER                                         */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 6. VALUE - ADDED SERVICES                                    */}
      {/* ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="header-title">Value - Added Services</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: 'Vehicle Inspection', icon: ICON_SVC_INSPECTION },
              { title: 'Vehicle Delivery', icon: ICON_SVC_DELIVERY },
              { title: 'Ownership Transfer', icon: ICON_SVC_TRANSFER },
              { title: 'Polishing & Detailing', icon: ICON_SVC_POLISHING },
              { title: 'Maintenance & Repairs', icon: ICON_SVC_REPAIRS },
              { title: 'More Services', icon: ICON_SVC_MORE },
            ].map((svc) => (
              <div
                key={svc.title}
                className="category-box p-4"
              >
                <img
                  src={svc.icon}
                  alt={svc.title}
                  width="54"
                  height="54"
                  className="w-12 h-12 mb-3 object-contain mx-auto"
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
      {/* 7. 10px HOME DIVIDER                                         */}
      {/* ============================================================ */}
      <div className="home_divider" />

      {/* ============================================================ */}
      {/* 8. TESTIMONIALS                                              */}
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
      {/* 9. FOOTER & AJ AUCTIONS COMMUNICATION CHANNELS               */}
      {/* ============================================================ */}
      <footer className="bg-[#1F242E] text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={getAssetUrl('/assets/logo-aj.png')}
                  alt="AJ Auctions"
                  className="h-9 w-auto"
                />
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
                  <img
                    src={getAssetUrl('/assets/phone.png')}
                    alt="Phone"
                    className="w-4 h-4"
                  />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={getAssetUrl('/assets/wtsapp.png')}
                    alt="WhatsApp"
                    className="w-4 h-4"
                  />
                  <span>WhatsApp: +971 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={getAssetUrl('/assets/email.png')}
                    alt="Email"
                    className="w-4 h-4"
                  />
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
                  <img
                    src={getAssetUrl('/assets/instagram.png')}
                    alt="Instagram"
                    className="w-4 h-4"
                  />
                </a>
                <a
                  href="https://facebook.com/ajauctionsuae"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                  title="AJ Auctions on Facebook"
                >
                  <img
                    src={getAssetUrl('/assets/logos_facebook.png')}
                    alt="Facebook"
                    className="w-4 h-4"
                  />
                </a>
                <a
                  href="https://youtube.com/@ajauctionsuae"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                  title="AJ Auctions on YouTube"
                >
                  <img
                    src={getAssetUrl('/assets/youtube.png')}
                    alt="YouTube"
                    className="w-4 h-4"
                  />
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
                <div className="cursor-pointer inline-block">
                  <img
                    src={getAssetUrl('/assets/appstore.png')}
                    alt="App Store"
                    className="h-9 w-auto"
                  />
                </div>
                <br />
                <div className="cursor-pointer inline-block">
                  <img
                    src={getAssetUrl('/assets/googleplay.png')}
                    alt="Google Play"
                    className="h-9 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            © 2025 AJ Auctions. All rights reserved. AshwikTechnologies &amp; AJ Auctions Group.
          </div>
        </div>
      </footer>
    </div>
  );
};
