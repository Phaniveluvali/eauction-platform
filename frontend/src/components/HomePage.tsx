import React, { useMemo } from 'react';
import { User, Vehicle, Auction } from '../types';
import { PortalView } from './PortalSidebar';
import { getAssetUrl } from '../utils/assets';
import { 
  Car, 
  Gavel, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Headphones, 
  ArrowRight 
} from 'lucide-react';
import { Language, useTranslation } from './i18n';

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
  onlineAuctionsCount?: number;
  silentAuctionsCount?: number;
  lang?: Language;
}

export const HomePage: React.FC<HomePageProps> = ({
  vehicles,
  auctions,
  onlineAuctionsCount,
  silentAuctionsCount,
  onNavigate,
  lang = 'EN',
}) => {
  const { t } = useTranslation(lang);

  // Fast count cache protection against 0-count reload flicker
  const cachedCounts = useMemo(() => {
    try {
      const c = localStorage.getItem('cached_auction_counts') || sessionStorage.getItem('cached_auction_counts');
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.online > 0 || parsed.silent > 0) return parsed;
      }
    } catch {}
    return { online: 300, silent: 50 };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const calculatedOnline = auctions.filter(
      (a) =>
        a.auctionType !== 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const calculatedSilent = auctions.filter(
      (a) =>
        a.auctionType === 'SILENT' &&
        a.status === 'ACTIVE' &&
        !(a.endTime && new Date(a.endTime).getTime() <= now)
    ).length;

    const onlineActive = calculatedOnline > 0
      ? calculatedOnline
      : (onlineAuctionsCount && onlineAuctionsCount > 0 ? onlineAuctionsCount : cachedCounts.online);

    const silentActive = calculatedSilent > 0
      ? calculatedSilent
      : (silentAuctionsCount && silentAuctionsCount > 0 ? silentAuctionsCount : cachedCounts.silent);

    return { onlineActive, silentActive };
  }, [auctions, onlineAuctionsCount, silentAuctionsCount, cachedCounts]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* ============================================================ */}
      {/* 1. HERO BANNER + FLOATING CATEGORIES CARD (SCREENSHOT 1)    */}
      {/* ============================================================ */}
      <section className="relative w-full bg-[#020B18] overflow-hidden select-none border-b border-slate-900">
        {/* Rich 2K Background Artwork (Official Digital Auction Portal, Fleet & Excavator) */}
        <div className="relative w-full overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
          <img
            src={getAssetUrl('/assets/banner-aj.webp')}
            alt="AJ Auctions Premier Portal"
            className="w-full h-auto object-cover min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('/assets/banner-aj.png');
            }}
          />

          {/* Overlay: Desktop Transparent Click Targets on Left + Floating Card on Right */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-none">
            
            {/* Left Desktop Interactive Hotspots over 'Explore Auctions' and 'Sell Your Vehicle' */}
            <div className="hidden lg:flex flex-col justify-end h-full pb-14 pointer-events-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate('ONLINE_AUCTIONS')}
                  className="w-[185px] h-[48px] rounded-full opacity-0 hover:opacity-10 bg-white transition cursor-pointer"
                  title={lang === 'AR' ? 'استكشف المزادات' : 'Explore Auctions'}
                />
                <button
                  onClick={() => onNavigate('SELLER_CREATE_LISTING')}
                  className="w-[165px] h-[48px] rounded-full opacity-0 hover:opacity-10 bg-white transition cursor-pointer"
                  title={lang === 'AR' ? 'اعرض مركبتك للبيع' : 'Sell Your Vehicle'}
                />
              </div>
            </div>

            {/* Right: Floating 'Auction Categories' Card (Exact Match to Screenshot 1) */}
            <div className="pointer-events-auto my-auto ml-auto hidden sm:block">
              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-[340px] sm:w-[380px] lg:w-[410px] border border-slate-100">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 tracking-tight">
                  {lang === 'AR' ? 'فئات المزاد' : 'Auction Categories'}
                </h4>

                {/* 2 Category Boxes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Active Auctions */}
                  <button
                    onClick={() => onNavigate('ONLINE_AUCTIONS')}
                    className="border border-slate-200/90 rounded-xl p-3 sm:p-4 text-center hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white group"
                    title={lang === 'AR' ? 'عرض المزادات النشطة' : 'View Active Auctions'}
                  >
                    <Car className="w-8 h-8 text-slate-700 mx-auto mb-1.5 group-hover:text-emerald-600 transition" />
                    <div className="text-xs text-slate-600 font-medium">
                      {lang === 'AR' ? 'المزادات النشطة' : 'Active Auctions'}
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {stats.onlineActive}
                    </div>
                  </button>

                  {/* Silent Auctions */}
                  <button
                    onClick={() => onNavigate('SILENT_AUCTIONS')}
                    className="border border-slate-200/90 rounded-xl p-3 sm:p-4 text-center hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white group"
                    title={lang === 'AR' ? 'عرض المزادات الصامتة' : 'View Silent Auctions'}
                  >
                    <Gavel className="w-8 h-8 text-slate-700 mx-auto mb-1.5 group-hover:text-emerald-600 transition" />
                    <div className="text-xs text-slate-600 font-medium">
                      {lang === 'AR' ? 'المزادات الصامتة' : 'Silent Auctions'}
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {stats.silentActive}
                    </div>
                  </button>
                </div>

                {/* 4 Micro Trust Assurances */}
                <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 text-center">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[10px] text-slate-700 font-semibold leading-tight">
                      {lang === 'AR' ? 'إعلانات موثقة' : 'Verified Listings'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Zap className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[10px] text-slate-700 font-semibold leading-tight">
                      {lang === 'AR' ? 'مزايدة آمنة' : 'Secure Bidding'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[10px] text-slate-700 font-semibold leading-tight">
                      {lang === 'AR' ? 'شفافية كاملة' : 'Transparent Process'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Headphones className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[10px] text-slate-700 font-semibold leading-tight">
                      {lang === 'AR' ? 'دعم متواصل' : 'Dedicated Support'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Small Tablet Fallback Card & Action Buttons */}
        <div className="sm:hidden bg-[#030C1B] p-4 border-t border-slate-800">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onNavigate('ONLINE_AUCTIONS')}
              className="flex-1 bg-[#7ED321] text-slate-950 font-bold py-2.5 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>{lang === 'AR' ? 'استكشف المزادات' : 'Explore Auctions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('SELLER_CREATE_LISTING')}
              className="flex-1 bg-slate-900 border border-slate-700 text-white font-bold py-2.5 rounded-full text-xs cursor-pointer"
            >
              {lang === 'AR' ? 'اعرض مركبتك' : 'Sell Your Vehicle'}
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-3">
              {lang === 'AR' ? 'فئات المزاد' : 'Auction Categories'}
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => onNavigate('ONLINE_AUCTIONS')}
                className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50"
              >
                <Car className="w-6 h-6 text-slate-700 mx-auto mb-1" />
                <div className="text-[11px] text-slate-600">
                  {lang === 'AR' ? 'نشطة' : 'Active'}
                </div>
                <div className="text-lg font-bold text-green-600">{stats.onlineActive}</div>
              </button>
              <button
                onClick={() => onNavigate('SILENT_AUCTIONS')}
                className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50"
              >
                <Gavel className="w-6 h-6 text-slate-700 mx-auto mb-1" />
                <div className="text-[11px] text-slate-600">
                  {lang === 'AR' ? 'صامتة' : 'Silent'}
                </div>
                <div className="text-lg font-bold text-green-600">{stats.silentActive}</div>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-100 text-[9px] text-slate-600 font-medium">
              <div>Verified</div>
              <div>Secure</div>
              <div>Transparent</div>
              <div>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TESTIMONIALS SECTION (EXACT CLONE OF SCREENSHOT 2)       */}
      {/* ============================================================ */}
      <section className="bg-white py-14 sm:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {lang === 'AR' ? 'آراء العملاء' : 'Testimonials'}
            </h3>
            <div className="w-8 h-1 bg-[#D32437] rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial Card 1: Mohammed A. */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-base">
                  ★★★★★
                </div>
                <h5 className="font-bold text-slate-900 text-base mb-2">
                  {lang === 'AR' ? 'مزايدة سلسة ومركبات مميزة في مزادات AJ!' : 'Smooth Bidding, Great Finds at AJ Auctions!'}
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed italic">
                  {lang === 'AR'
                    ? '"لقد حظيت بتجربة شراء رائعة مع مزادات AJ! كانت المنصة سهلة الاستخدام، وتوفر تشكيلة واسعة من المركبات التجارية والشاحنات. كانت المزايدة سلسة، وقدم فريقهم دعماً استثنائياً، مما ضمن معاملة خالية من المتاعب. أوصي بشدة!"'
                    : '"I had a fantastic buying experience with AJ Auctions! The platform was user-friendly, offering a wide variety of vehicles. The bidding process was smooth, and their team provided excellent support, ensuring a seamless transaction. Highly recommend!"'}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Mohammed A. • Verified Buyer</span>
                <span className="text-slate-400">Dubai, UAE</span>
              </div>
            </div>

            {/* Testimonial Card 2: Tariq S. */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-base">
                  ★★★★★
                </div>
                <h5 className="font-bold text-slate-900 text-base mb-2">
                  {lang === 'AR' ? 'بيع سلس مع مزادات AJ.' : 'Effortless Selling with AJ Auctions.'}
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed italic">
                  {lang === 'AR'
                    ? '"كان بيع شاحنات الأسطول عبر مزادات AJ في غاية السهولة! جعلت المنصة إدراج مركباتي أمراً بسيطاً، واجتذبت المزايدة مشترين جادين بسرعة. كان دعم الفريق على أعلى مستوى، مما ضمن بيعاً سريعاً ومربحاً. أوصي بشدة!"'
                    : '"Selling through AJ Auctions was a breeze! Their platform made listing my vehicle simple, and the bidding process attracted serious buyers quickly. The team\'s support was top-notch, ensuring a fast and profitable sale. Highly recommend!"'}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Tariq S. • Verified Seller</span>
                <span className="text-slate-400">Abu Dhabi, UAE</span>
              </div>
            </div>

            {/* Testimonial Card 3: Khalid M. */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 text-base">
                  ★★★★★
                </div>
                <h5 className="font-bold text-slate-900 text-base mb-2">
                  {lang === 'AR' ? 'خدمة عملاء استثنائية في مزادات AJ' : 'Outstanding Customer Service at AJ Auctions'}
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed italic">
                  {lang === 'AR'
                    ? '"قدمت مزادات AJ خدمة عملاء استثنائية! كان فريقهم سريع الاستجابة، وأرشدني خلال كل خطوة من خطوات المزايدة بكل وضوح وصبر. تمت الإجابة على أي أسئلة على الفور، مما جعل تجربتي سلسة وخالية من التوتر."'
                    : '"AJ Auctions provided exceptional customer service! Their team was responsive, guiding me through every step of the bidding process with clarity and patience. Any questions I had were answered promptly, making my experience smooth and stress-free."'}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Khalid M. • Corporate Bidder</span>
                <span className="text-slate-400">Sharjah, UAE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DARK NAVY ENTERPRISE FOOTER (EXACT CLONE OF SCREENSHOT 2) */}
      {/* ============================================================ */}
      <footer className="bg-[#121B2A] text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-700/60">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={getAssetUrl('/assets/logo-aj.png')}
                  alt="AJ Auctions"
                  className="h-9 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');
                  }}
                />
                <span className="text-lg font-black text-white tracking-wider">AJ AUCTIONS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'AR'
                  ? 'منصة المزادات الإلكترونية والصامتة الرائدة في الإمارات. فحص فني معتمد من 150 نقطة، تسوية مصرفية فورية، وتوصيل حتى الباب.'
                  : "UAE's premier online & silent vehicle auction platform. Certified 150-point technical testing, bank-grade settlement, and door-to-door delivery."}
              </p>
            </div>

            {/* Column 2: Contact Details */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3">
                {lang === 'AR' ? 'اتصل بـ مزادات AJ' : 'Contact AJ Auctions'}
              </h5>
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
              <h5 className="text-white font-bold text-sm mb-3">
                {lang === 'AR' ? 'تابع مزادات AJ' : 'Follow AJ Auctions'}
              </h5>
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
              <h5 className="text-white font-bold text-sm mb-3">
                {lang === 'AR' ? 'حمل التطبيق' : 'Download Mobile App'}
              </h5>
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
            © 2026 AJ Auctions. All rights reserved. AshwikTechnologies &amp; AJ Auctions Group.
          </div>
        </div>
      </footer>
    </div>
  );
};
