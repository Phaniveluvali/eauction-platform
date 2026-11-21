export type Language = 'EN' | 'AR';

export interface Translations {
  nav: {
    home: string;
    allAuctions: string;
    onlineAuctions: string;
    silentAuctions: string;
    uaePlates: string;
    equipment: string;
    emiratesMoto: string;
    sellVehicle: string;
    howItWorks: string;
    helpSupport: string;
    login: string;
    signUp: string;
    dashboard: string;
    browseAuctions: string;
    myBids: string;
    watchlist: string;
    wonAuctions: string;
    savedSearches: string;
    payments: string;
    deliveryCollection: string;
    myListings: string;
    createListing: string;
    adminPortal: string;
  };
  hero: {
    portalBadge: string;
    title: string;
    subtitle: string;
    exploreBtn: string;
    sellBtn: string;
    howItWorksBtn: string;
  };
  categories: {
    activeAuctions: string;
    silentAuctions: string;
    verifiedListings: string;
    secureBidding: string;
    transparentProcess: string;
    dedicatedSupport: string;
  };
  badges: {
    pointInspection: string;
    wireSettlement: string;
    auditTrail: string;
    multiPointVerified: string;
  };
  stats: {
    vehiclesAuctioned: string;
    registeredBuyers: string;
    verifiedSellers: string;
    successRate: string;
    secureCompliant: string;
  };
  buyer: {
    welcome: string;
    activeBids: string;
    watchlist: string;
    wonAuctions: string;
    biddingBalance: string;
    liveAuctions: string;
    biddingActivity: string;
    viewAll: string;
    placeBid: string;
    leading: string;
    outbid: string;
  };
  seller: {
    welcome: string;
    totalListings: string;
    activeAuctions: string;
    soldVehicles: string;
    totalRevenue: string;
    salesPerformance: string;
    createListingBtn: string;
    viewListingsBtn: string;
    myListings: string;
  };
  admin: {
    overview: string;
    totalUsers: string;
    buyers: string;
    sellers: string;
    vehicleListings: string;
    liveAuctions: string;
    totalTransactionValue: string;
    systemHealth: string;
    operational: string;
    healthy: string;
  };
}

export const translations: Record<Language, Translations> = {
  EN: {
    nav: {
      home: 'Home',
      allAuctions: 'All Auctions',
      onlineAuctions: 'Online Auctions',
      silentAuctions: 'Silent Auctions',
      uaePlates: 'UAE Number Plates',
      equipment: 'Equipment & Machinery',
      emiratesMoto: 'Emirates Moto',
      sellVehicle: 'Sell Your Car',
      howItWorks: 'How It Works',
      helpSupport: 'Help & Support',
      login: 'Log In',
      signUp: 'Sign Up',
      dashboard: 'Dashboard',
      browseAuctions: 'Browse Auctions',
      myBids: 'My Bids',
      watchlist: 'Watchlist',
      wonAuctions: 'Won Auctions',
      savedSearches: 'Saved Searches',
      payments: 'Payments & Invoices',
      deliveryCollection: 'Delivery & Collection',
      myListings: 'My Listings',
      createListing: 'Create Listing',
      adminPortal: 'Admin Portal',
    },
    hero: {
      portalBadge: 'OFFICIAL DIGITAL AUCTION PORTAL',
      title: 'Buy & Sell Vehicles with Confidence & Transparency',
      subtitle: 'Commercial Fleet, Passenger Vehicles & Heavy Equipment',
      exploreBtn: 'Explore Auctions',
      sellBtn: 'Sell Your Vehicle',
      howItWorksBtn: 'How It Works',
    },
    categories: {
      activeAuctions: 'Online Auctions',
      silentAuctions: 'Silent Auctions',
      verifiedListings: 'Verified Listings',
      secureBidding: 'Secure Bidding',
      transparentProcess: 'Transparent Process',
      dedicatedSupport: 'Dedicated Support',
    },
    badges: {
      pointInspection: '150-Point Inspection',
      wireSettlement: 'Instant UAE Wire Settlement',
      auditTrail: 'Bank-Grade Cryptographic Audit Trail',
      multiPointVerified: 'Real-Time Multi-Point Verified',
    },
    stats: {
      vehiclesAuctioned: '15K+ Vehicles Auctioned',
      registeredBuyers: '12K+ Registered Buyers',
      verifiedSellers: '3K+ Verified Sellers',
      successRate: '99.5% Successful Auctions',
      secureCompliant: '100% Secure & Compliant',
    },
    buyer: {
      welcome: 'Welcome back',
      activeBids: 'Active Bids',
      watchlist: 'Watchlist',
      wonAuctions: 'Won Auctions',
      biddingBalance: 'Bidding Balance',
      liveAuctions: 'Live Auctions',
      biddingActivity: 'Bidding Activity',
      viewAll: 'View All',
      placeBid: 'Place Bid',
      leading: 'Leading',
      outbid: 'Outbid',
    },
    seller: {
      welcome: 'Welcome to AJ Auctions Seller Portal',
      totalListings: 'Total Listings',
      activeAuctions: 'Active Auctions',
      soldVehicles: 'Sold Vehicles',
      totalRevenue: 'Total Sales Revenue',
      salesPerformance: 'Sales Performance',
      createListingBtn: '+ Create Listing',
      viewListingsBtn: 'View Listings',
      myListings: 'My Listings',
    },
    admin: {
      overview: 'Platform Overview & Operations',
      totalUsers: 'Total Users',
      buyers: 'Buyers',
      sellers: 'Sellers',
      vehicleListings: 'Vehicle Listings',
      liveAuctions: 'Live Auctions',
      totalTransactionValue: 'Total Transaction Value',
      systemHealth: 'System Health',
      operational: 'Operational',
      healthy: 'Healthy',
    },
  },
  AR: {
    nav: {
      home: 'الرئيسية',
      allAuctions: 'جميع المزادات',
      onlineAuctions: 'المزادات عبر الإنترنت',
      silentAuctions: 'المزادات الصامتة',
      uaePlates: 'لوحات مركبات الإمارات',
      equipment: 'المعدات والآليات الثقيلة',
      emiratesMoto: 'إمارات موتو',
      sellVehicle: 'بع سيارتك',
      howItWorks: 'كيف يعمل المزاد',
      helpSupport: 'المساعدة والدعم',
      login: 'تسجيل الدخول',
      signUp: 'تسجيل جديد',
      dashboard: 'لوحة التحكم',
      browseAuctions: 'تصفح المزادات',
      myBids: 'مزايداتي',
      watchlist: 'قائمة المتابعة',
      wonAuctions: 'المزادات الرابحة',
      savedSearches: 'عمليات البحث المحفوظة',
      payments: 'المدفوعات والفواتير',
      deliveryCollection: 'التسليم والاستلام',
      myListings: 'إعلاناتي',
      createListing: 'إضافة مركبة للبيع',
      adminPortal: 'بوابة الإدارة',
    },
    hero: {
      portalBadge: 'البوابة الرقمية الرسمية لمزادات المركبات',
      title: 'بيع وشراء المركبات بكل ثقة وشفافية',
      subtitle: 'أساطيل الشركات، مركبات الركاب، والمعدات الثقيلة',
      exploreBtn: 'استكشف المزادات',
      sellBtn: 'اعرض مركبتك للبيع',
      howItWorksBtn: 'كيف يعمل المزاد',
    },
    categories: {
      activeAuctions: 'المزادات عبر الإنترنت',
      silentAuctions: 'المزادات الصامتة',
      verifiedListings: 'مركبات مفحوصة وموثقة',
      secureBidding: 'مزايدة إلكترونية آمنة',
      transparentProcess: 'عملية شراء شفافة',
      dedicatedSupport: 'فريق دعم متخصص',
    },
    badges: {
      pointInspection: 'فحص فني شامل 150 نقطة',
      wireSettlement: 'تسوية بنكية فورية في الإمارات',
      auditTrail: 'سجل تدقيق مشفر ومعتمد مصرفياً',
      multiPointVerified: 'مركبات معتمدة ومفحوصة بالكامل',
    },
    stats: {
      vehiclesAuctioned: '+15 ألف مركبة مباعة',
      registeredBuyers: '+12 ألف مشترٍ مسجل',
      verifiedSellers: '+3 آلاف بائع معتمد',
      successRate: '99.5% نسبة نجاح المزادات',
      secureCompliant: '100% آمن ومتوافق قانونياً',
    },
    buyer: {
      welcome: 'مرحباً بعودتك',
      activeBids: 'المزايدات النشطة',
      watchlist: 'قائمة المتابعة',
      wonAuctions: 'المزادات الرابحة',
      biddingBalance: 'رصيد المزايدة المتاح',
      liveAuctions: 'المزادات المباشرة',
      biddingActivity: 'نشاط المزايدة',
      viewAll: 'عرض الكل',
      placeBid: 'مزايدة الآن',
      leading: 'أعلى مزايد',
      outbid: 'تمت المزايدة عليك',
    },
    seller: {
      welcome: 'مرحباً بك في بوابة البائعين - إيه جيه للمزادات',
      totalListings: 'إجمالي الإعلانات',
      activeAuctions: 'المزادات الجارية',
      soldVehicles: 'المركبات المباعة',
      totalRevenue: 'إجمالي المبيعات',
      salesPerformance: 'أداء المبيعات',
      createListingBtn: '+ إضافة مركبة جديدة',
      viewListingsBtn: 'عرض الإعلانات',
      myListings: 'إعلاناتي',
    },
    admin: {
      overview: 'نظرة عامة على المنصة والعمليات',
      totalUsers: 'إجمالي المستخدمين',
      buyers: 'المشترون',
      sellers: 'البائعون',
      vehicleListings: 'إجمالي المركبات',
      liveAuctions: 'المزادات النشطة',
      totalTransactionValue: 'إجمالي قيمة المعاملات',
      systemHealth: 'حالة النظام',
      operational: 'يعمل بكفاءة',
      healthy: 'سليم',
    },
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.EN;
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString('en-US')}`;
}

export function useTranslation(lang: Language = 'EN') {
  const dict = translations[lang] || translations.EN;
  const t = (key: string): string => {
    const parts = key.split('.');
    let cur: any = dict;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        return key;
      }
    }
    return typeof cur === 'string' ? cur : key;
  };
  return { t, formatAed, lang, dict };
}
