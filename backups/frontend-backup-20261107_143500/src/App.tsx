import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { AuctionRoom } from './components/AuctionRoom';
import { PaymentModal } from './components/PaymentModal';
import { CreateVehicleModal } from './components/CreateVehicleModal';
import { AdminPortal } from './components/AdminPortal';
import { PortalView } from './components/PortalSidebar';
import { OnlineAuctionsPage } from './components/OnlineAuctionsPage';
import { SilentAuctionsPage } from './components/SilentAuctionsPage';
import { HelpPage } from './components/HelpPage';
import { SignInAndSignUpPage } from './components/SignInAndSignUpPage';
import { SignUpPage } from './components/SignUpPage';
import { SignInPage } from './components/SignInPage';
import { BidModal } from './components/BidModal';
import { VehicleDetailsPage } from './components/VehicleDetailsPage';
import { SecurityDepositModal } from './components/SecurityDepositModal';
import { FavoritesPage } from './components/FavoritesPage';
import { AICustomerConcierge } from './components/AICustomerConcierge';
import { PromotionalBroadcastModal } from './components/PromotionalBroadcastModal';
import { initiateKeycloakLogin, handleKeycloakCallback, logoutKeycloak } from './utils/oidc';
import { api } from './services/api';
import { User, Vehicle, Auction } from './types';
import { AccessDeniedSecurityScreen } from './components/AccessDeniedSecurityScreen';
import { Clock } from 'lucide-react';

// Helper to determine initial view and auction ID from URL path
const getRouteFromPath = (): { view: PortalView; auctionId?: string; vehicleId?: string } => {
  if (typeof window === 'undefined') return { view: 'HOME' };
  const path = window.location.pathname.toLowerCase();

  if (path.includes('/vehicle-details')) {
    const urlParams = new URLSearchParams(window.location.search);
    return { 
      view: 'VEHICLE_DETAILS', 
      auctionId: urlParams.get('auction_id') || undefined,
      vehicleId: urlParams.get('obj') || undefined,
    };
  }
  if (path.includes('/online-auctions')) return { view: 'ONLINE_AUCTIONS' };
  if (path.includes('/silent-auctions')) return { view: 'SILENT_AUCTIONS' };
  if (path.includes('/favorites')) return { view: 'FAVORITES' };
  if (path.includes('/security-deposit')) return { view: 'SECURITY_DEPOSIT' };
  if (path.includes('/help')) return { view: 'HELP' };
  if (path.includes('/signin-signup')) return { view: 'SIGNIN_SIGNUP' };
  if (path.includes('/signin')) return { view: 'SIGNIN' };
  if (path.includes('/signup')) return { view: 'SIGNUP' };
  if (path.includes('/admin')) return { view: 'ADMIN' };
  if (path.includes('/auction-room')) {
    const parts = window.location.pathname.split('/auction-room/');
    return { view: 'AUCTION_ROOM', auctionId: parts[1] };
  }
  return { view: 'HOME' };
};

const getPathForView = (view: PortalView, auctionId?: string): string => {
  const basePath = '/seller-buyer';
  switch (view) {
    case 'VEHICLE_DETAILS':
      return `${basePath}/vehicle-details${auctionId ? `?auction_id=${auctionId}` : ''}`;
    case 'SECURITY_DEPOSIT':
      return `${basePath}/security-deposit`;
    case 'FAVORITES':
      return `${basePath}/favorites`;
    case 'ONLINE_AUCTIONS':
      return `${basePath}/online-auctions`;
    case 'SILENT_AUCTIONS':
      return `${basePath}/silent-auctions`;
    case 'HELP':
      return `${basePath}/help`;
    case 'SIGNIN_SIGNUP':
      return `${basePath}/signin-signup`;
    case 'SIGNIN':
      return `${basePath}/signin`;
    case 'SIGNUP':
      return `${basePath}/signup`;
    case 'ADMIN':
      return `${basePath}/admin`;
    case 'AUCTION_ROOM':
      return auctionId ? `${basePath}/auction-room/${auctionId}` : `${basePath}/auction-room`;
    case 'HOME':
    default:
      return `${basePath}/home`;
  }
};

interface RouteSecurityRule {
  requiresAuth: boolean;
  allowedRoles?: Array<'ADMIN' | 'BUYER' | 'SELLER'>;
  redirectUnauthTo?: PortalView;
  description: string;
}

const ROUTE_SECURITY_RULES: Record<PortalView, RouteSecurityRule> = {
  ADMIN: {
    requiresAuth: true,
    allowedRoles: ['ADMIN'],
    redirectUnauthTo: 'SIGNIN',
    description: 'Administrator Console',
  },
  FAVORITES: {
    requiresAuth: true,
    allowedRoles: ['BUYER'],
    redirectUnauthTo: 'SIGNIN',
    description: 'Buyer Watchlist',
  },
  SECURITY_DEPOSIT: {
    requiresAuth: true,
    allowedRoles: ['BUYER'],
    redirectUnauthTo: 'SIGNIN',
    description: 'Security Deposit Management',
  },
  HOME: { requiresAuth: false, description: 'Marketplace Home' },
  ONLINE_AUCTIONS: { requiresAuth: false, description: 'Online Auctions' },
  SILENT_AUCTIONS: { requiresAuth: false, description: 'Silent Auctions' },
  HELP: { requiresAuth: false, description: 'Help Center' },
  SIGNIN_SIGNUP: { requiresAuth: false, description: 'Sign In / Sign Up' },
  SIGNIN: { requiresAuth: false, description: 'Sign In' },
  SIGNUP: { requiresAuth: false, description: 'Sign Up' },
  VEHICLE_DETAILS: { requiresAuth: false, description: 'Vehicle Inspection & Details' },
  AUCTION_ROOM: { requiresAuth: false, description: 'Live Auction Room' },
};

function evaluateRouteSecurity(targetView: PortalView, user: User | null): {
  allowed: boolean;
  reason?: 'UNAUTHENTICATED' | 'FORBIDDEN_ROLE';
  fallbackView?: PortalView;
} {
  const rule = ROUTE_SECURITY_RULES[targetView];
  if (!rule || !rule.requiresAuth) return { allowed: true };

  if (!user) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      fallbackView: rule.redirectUnauthTo || 'SIGNIN',
    };
  }

  if (rule.allowedRoles && rule.allowedRoles.length > 0) {
    const isSuperAdmin = Boolean(user.isSuperAdmin || (user as any).superAdmin);
    const isAllowed = rule.allowedRoles.includes(user.role as any) || (isSuperAdmin && rule.allowedRoles.includes('ADMIN'));
    if (!isAllowed) {
      return {
        allowed: false,
        reason: 'FORBIDDEN_ROLE',
        fallbackView: 'HOME',
      };
    }
  }

  return { allowed: true };
}

const detectDeviceInfo = () => {
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua) || (typeof window !== 'undefined' && window.innerWidth < 768);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';

  let os = 'Windows';
  if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Windows/i.test(ua)) os = 'Windows';

  return { deviceType, browser: `${browser} (${os})`, os };
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Dedicated View Router: initialized from URL pathname
  const initialRoute = getRouteFromPath();
  const [currentView, setCurrentView] = useState<PortalView>(initialRoute.view);
  const [pendingAuctionId, setPendingAuctionId] = useState<string | undefined>(initialRoute.auctionId);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | undefined>(initialRoute.vehicleId);

  // Security & Authentication Gatekeeper
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    return Boolean(ROUTE_SECURITY_RULES[initialRoute.view]?.requiresAuth);
  });
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Global Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);

  // In-place Bidding Modal & Vehicle Details State (Matching User Screenshots 2, 3, 4)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidModalAuction, setBidModalAuction] = useState<Auction | null>(null);
  const [isSecurityDepositModalOpen, setIsSecurityDepositModalOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<{ auction: Auction; vehicle: Vehicle } | null>(null);

  // 15-Minute Idle Session Timeout & Client IP Detection
  const [isIdleTimedOut, setIsIdleTimedOut] = useState<boolean>(false);
  const clientIpRef = React.useRef<string>('');
  const lastActivityRef = React.useRef<number>(Date.now());

  // Route Navigator with strict security guard evaluation
  const navigateToView = (view: PortalView, auctionId?: string, overrideUser?: User | null) => {
    const userToCheck = overrideUser !== undefined ? overrideUser : (currentUserRef.current ?? currentUser);
    const secCheck = evaluateRouteSecurity(view, userToCheck);
    if (!secCheck.allowed) {
      if (secCheck.reason === 'UNAUTHENTICATED') {
        setSecurityNotice(`Authentication required to access ${ROUTE_SECURITY_RULES[view]?.description || 'this page'}. Please sign in.`);
        const fallback = secCheck.fallbackView || 'SIGNIN';
        setCurrentView(fallback);
        const targetPath = getPathForView(fallback);
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ view: fallback }, '', targetPath);
        }
        return;
      } else if (secCheck.reason === 'FORBIDDEN_ROLE') {
        setSecurityNotice(`Access Denied: Your account role (${userToCheck?.role}) does not have permission to access the Administrator Portal.`);
        const fallback = secCheck.fallbackView || 'HOME';
        setCurrentView(fallback);
        const targetPath = getPathForView(fallback);
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ view: fallback }, '', targetPath);
        }
        return;
      }
    }

    setSecurityNotice(null);
    setCurrentView(view);
    const newPath = getPathForView(view, auctionId);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view, auctionId }, '', newPath);
    }
  };

  // Top-level OIDC Callback State to prevent multiple executions & display feedback
  const [isOidcProcessing, setIsOidcProcessing] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.location.search.includes('code=') && window.location.search.includes('state='));
  });
  const [oidcError, setOidcError] = useState<string | null>(null);

  // Browser Back/Forward Navigation & URL normalization with Route Security Guards
  useEffect(() => {
    const handlePopState = () => {
      const { view, auctionId } = getRouteFromPath();
      const secCheck = evaluateRouteSecurity(view, currentUser);
      if (!secCheck.allowed) {
        const fallback = secCheck.fallbackView || 'SIGNIN';
        setCurrentView(fallback);
        window.history.replaceState({ view: fallback }, '', getPathForView(fallback));
        return;
      }

      setCurrentView(view);
      if (auctionId && auctions.length > 0) {
        const found = auctions.find((a) => a.id === auctionId);
        if (found) setSelectedAuction(found);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Normalize URL path to /seller-buyer/home ONLY if NOT returning from an OAuth callback
    const currentPath = window.location.pathname;
    const hasAuthParams = window.location.search.includes('code=');
    if (!hasAuthParams && (currentPath === '/seller-buyer' || currentPath === '/seller-buyer/' || currentPath === '/')) {
      window.history.replaceState({ view: 'HOME' }, '', '/seller-buyer/home');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [auctions, currentUser]);

  // Buyer Favorites State persisted per account
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('guest_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites when currentUser changes
  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem('favorites_' + currentUser.id);
        setFavoriteIds(stored ? JSON.parse(stored) : []);
      } catch {
        setFavoriteIds([]);
      }
    } else {
      setFavoriteIds([]);
    }
  }, [currentUser?.id]);

  const handleToggleFavorite = (vehicleId: string) => {
    if (!currentUser) {
      alert('Please log in as a buyer to save favorite vehicles to your personal watchlist.');
      initiateKeycloakLogin({ action: 'login', returnView: 'FAVORITES' });
      return;
    }
    if (currentUser.role !== 'BUYER') {
      alert('Favorites are exclusive to Buyer accounts.');
      return;
    }
    setFavoriteIds((prev) => {
      const next = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId];
      localStorage.setItem('favorites_' + currentUser.id, JSON.stringify(next));
      return next;
    });
  };

  // 1. Initial Profile & Inventory Sync + Keycloak OIDC Callback Handler + Strict Route Guard
  useEffect(() => {
    const initSecurityAndAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      let resolvedUser: User | null = null;

      // Primary: Keycloak OIDC SSO Authorization Code Callback Handler
      if (code && state) {
        setIsOidcProcessing(true);
        setOidcError(null);
        try {
          const { returnView } = await handleKeycloakCallback(code, state);
          resolvedUser = await api.getMe();
          currentUserRef.current = resolvedUser;
          setCurrentUser(resolvedUser);

          // Route directly to respective user console based on role
          let targetView: PortalView = 'HOME';
          if (returnView && returnView !== 'SIGNIN' && returnView !== 'SIGNIN_SIGNUP' && returnView !== 'SIGNUP') {
            targetView = returnView as PortalView;
          } else if (resolvedUser.role === 'ADMIN' || resolvedUser.isSuperAdmin || (resolvedUser as any).superAdmin) {
            targetView = 'ADMIN';
          } else {
            targetView = 'HOME';
          }

          setSecurityNotice(null);
          const targetPath = getPathForView(targetView, pendingAuctionId);
          window.history.replaceState({ view: targetView }, '', targetPath);
          setCurrentView(targetView);
        } catch (err: any) {
          console.error('Keycloak OIDC authentication callback error:', err);
          setOidcError(err.message || 'Keycloak authentication could not be completed.');
          setCurrentView('SIGNIN');
          window.history.replaceState({ view: 'SIGNIN' }, '', getPathForView('SIGNIN'));
        } finally {
          setIsOidcProcessing(false);
          setIsAuthChecking(false);
        }
        loadInventory();
        return;
      } else if (code) {
        // Secondary Fallback: Azure AD B2C OAuth
        try {
          const resp = await api.azureB2cLogin({
            code: code,
            redirectUri: window.location.origin + window.location.pathname,
          });
          localStorage.setItem('token', resp.token);
          resolvedUser = await api.getMe();
          setCurrentUser(resolvedUser);
          navigateToView(resolvedUser.role === 'ADMIN' ? 'ADMIN' : 'HOME');
        } catch (err) {
          console.error('Azure B2C callback error:', err);
        }
      }

      // Cryptographic Stored Token Validation
      const token = localStorage.getItem('token');
      if (token && !code) {
        try {
          resolvedUser = await api.getMe();
          currentUserRef.current = resolvedUser;
          setCurrentUser(resolvedUser);
        } catch (err) {
          console.warn('Stored token was invalid or expired, purging credentials:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('kc_access_token');
          localStorage.removeItem('kc_id_token');
          resolvedUser = null;
          currentUserRef.current = null;
          setCurrentUser(null);
        }
      } else if (!code) {
        currentUserRef.current = null;
        setCurrentUser(null);
      }

      // Check initial route against resolved user security credentials
      const requested = getRouteFromPath();
      const secCheck = evaluateRouteSecurity(requested.view, resolvedUser);

      if (!secCheck.allowed) {
        if (secCheck.reason === 'UNAUTHENTICATED') {
          setSecurityNotice(`Authentication required to access ${ROUTE_SECURITY_RULES[requested.view]?.description || 'this page'}. Please sign in.`);
          const target = secCheck.fallbackView || 'SIGNIN';
          setCurrentView(target);
          window.history.replaceState({ view: target }, '', getPathForView(target));
        } else if (secCheck.reason === 'FORBIDDEN_ROLE') {
          setSecurityNotice(`Access Denied: Your account role (${resolvedUser?.role}) does not have permission to access the Administrator Portal.`);
          const target = secCheck.fallbackView || 'HOME';
          setCurrentView(target);
          window.history.replaceState({ view: target }, '', getPathForView(target));
        }
      } else {
        setCurrentView(requested.view);
      }

      setIsAuthChecking(false);
      loadInventory();
    };

    initSecurityAndAuth();
  }, []);

  // Global 401 Unauthorized event listener: purge credentials and bounce to SIGNIN
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('kc_access_token');
      localStorage.removeItem('kc_id_token');
      currentUserRef.current = null;
      setCurrentUser(null);
      setSecurityNotice('Your session has expired. Please log in with Keycloak SSO to continue.');
      if (ROUTE_SECURITY_RULES[currentView]?.requiresAuth) {
        initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: currentView });
      } else {
        navigateToView('SIGNIN');
      }
    };

    window.addEventListener('eauction:unauthorized', handleAuthExpired);
    return () => window.removeEventListener('eauction:unauthorized', handleAuthExpired);
  }, [currentView]);

  // 2. Background Auto-Sync for Catalog Prices across windows/users
  useEffect(() => {
    if (currentView === 'AUCTION_ROOM') return; // Inside an auction room, WebSockets handle real-time broadcasts

    const pollInterval = setInterval(async () => {
      try {
        const freshAuctions = await api.getAuctions();
        setAuctions((prev) =>
          prev.map((auc) => {
            const fresh = freshAuctions.find((f) => f.id === auc.id);
            if (!fresh) return auc;
            if (fresh.currentHighestBid !== auc.currentHighestBid || fresh.status !== auc.status || fresh.highestBidderId !== auc.highestBidderId) {
              return {
                ...auc,
                currentHighestBid: fresh.currentHighestBid,
                highestBidderId: fresh.highestBidderId,
                status: fresh.status,
              };
            }
            return auc;
          })
        );

        // Real-time synchronization for Vehicle Details page
        setSelectedVehicleDetails((prev) => {
          if (!prev) return prev;
          const fresh = freshAuctions.find((f) => f.id === prev.auction.id);
          if (!fresh) return prev;
          if (fresh.currentHighestBid !== prev.auction.currentHighestBid || fresh.highestBidderId !== prev.auction.highestBidderId || fresh.status !== prev.auction.status) {
            return {
              ...prev,
              auction: {
                ...prev.auction,
                currentHighestBid: fresh.currentHighestBid,
                highestBidderId: fresh.highestBidderId,
                status: fresh.status,
              },
            };
          }
          return prev;
        });

        // Real-time synchronization for open Bid Modal
        setBidModalAuction((prev) => {
          if (!prev) return prev;
          const fresh = freshAuctions.find((f) => f.id === prev.id);
          if (!fresh) return prev;
          if (fresh.currentHighestBid !== prev.currentHighestBid || fresh.highestBidderId !== prev.highestBidderId || fresh.status !== prev.status) {
            return {
              ...prev,
              currentHighestBid: fresh.currentHighestBid,
              highestBidderId: fresh.highestBidderId,
              status: fresh.status,
            };
          }
          return prev;
        });
      } catch (err) {
        // Ignore background polling errors
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [currentView]);

  // Fetch real client public WAN IP & discover client internal LAN IP via WebRTC
  const clientPublicIpRef = React.useRef<string>('');
  const clientLocalIpRef = React.useRef<string>('');

  useEffect(() => {
    // 1. Fetch public WAN Gateway IP
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) {
          clientPublicIpRef.current = data.ip;
          clientIpRef.current = data.ip;
        }
      })
      .catch(() => {});

    // 2. Discover client internal LAN IP via WebRTC candidate probing
    try {
      const RTCPC = window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection;
      if (RTCPC) {
        const pc = new RTCPC({ iceServers: [] });
        pc.createDataChannel('telemetry');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});
        pc.onicecandidate = (e) => {
          if (!e || !e.candidate || !e.candidate.candidate) return;
          const cand = e.candidate.candidate;
          const match = cand.match(/\b((?:192\.168|10\.|172\.(?:1[6-9]|2[0-9]|3[0-1]))(?:\.\d{1,3}){2})\b/);
          if (match && match[1]) {
            clientLocalIpRef.current = match[1];
            try { pc.close(); } catch {}
          }
        };
      }
    } catch {}
  }, []);

  // 15-Minute Inactivity Idle Session Timeout (logs out and prompts user)
  useEffect(() => {
    if (!currentUser) return;

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));

    const idleCheckInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= 15 * 60 * 1000) { // 15 minutes
        const { deviceType } = detectDeviceInfo();
        api.logoutSession(currentUser.id, deviceType).catch(() => {});
        localStorage.removeItem('token');
        localStorage.removeItem('kc_access_token');
        localStorage.removeItem('kc_id_token');
        setCurrentUser(null);
        setIsIdleTimedOut(true);
        navigateToView('HOME');
      }
    }, 10000); // Check every 10 seconds

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
      clearInterval(idleCheckInterval);
    };
  }, [currentUser?.id]);

  // 3. Real-Time Multi-User Session Heartbeat (Every 5s for any logged-in user: Buyer, Seller, Admin)
  useEffect(() => {
    if (!currentUser) return;

    const sendHeartbeat = () => {
      const { deviceType, browser, os } = detectDeviceInfo();
      api.sendSessionHeartbeat({
        userId: currentUser.id,
        userName: currentUser.fullName || 'User',
        email: currentUser.email,
        role: currentUser.role,
        currentScreen: currentView === 'ADMIN' ? 'Admin > Operations' : currentView === 'ONLINE_AUCTIONS' ? 'Online Auctions' : currentView === 'FAVORITES' ? 'Favorites' : 'Home',
        securityDeposit: currentUser.securityDeposit || 0,
        usedBiddingLimit: currentUser.usedBiddingLimit || 0,
        bidsPlacedInSession: 0,
        deviceType,
        browser,
        os,
        protocol: window.location.protocol.replace(':', '').toUpperCase(),
        ipAddress: clientPublicIpRef.current || undefined,
        clientIp: clientLocalIpRef.current || undefined,
        clientPrivateIp: clientLocalIpRef.current || undefined,
      });
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(heartbeatInterval);
  }, [currentUser?.id, currentView]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [fetchedVehicles, fetchedAuctions] = await Promise.all([
        api.getVehicles(),
        api.getAuctions(),
      ]);

      // Enrich auctions with matching vehicle records
      const enrichedAuctions = fetchedAuctions.map((auc) => {
        const v = fetchedVehicles.find((veh) => veh.id === auc.vehicleId);
        return { ...auc, vehicle: v };
      });

      setVehicles(fetchedVehicles);
      setAuctions(enrichedAuctions);

      // If loaded with a direct link to an auction room
      if (pendingAuctionId && currentView === 'AUCTION_ROOM') {
        const target = enrichedAuctions.find((a) => a.id === pendingAuctionId);
        if (target) {
          setSelectedAuction(target);
          setCurrentView('AUCTION_ROOM');
        }
        setPendingAuctionId(undefined);
      } else if (currentView === 'VEHICLE_DETAILS' || (pendingVehicleId && !selectedVehicleDetails)) {
        const targetAuc = enrichedAuctions.find((a) => a.id === pendingAuctionId) || enrichedAuctions[0];
        const targetVeh = fetchedVehicles.find((v) => v.id === (pendingVehicleId || targetAuc?.vehicleId)) || (targetAuc?.vehicle || fetchedVehicles[0]);
        if (targetAuc && targetVeh) {
          setSelectedVehicleDetails({ auction: targetAuc, vehicle: targetVeh });
        }
      }
    } catch (err) {
      console.error('Failed to load catalog inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (auction: Auction) => {
    if (!currentUser) {
      navigateToView('SIGNIN');
      return;
    }
    setBidModalAuction(auction);
    setIsBidModalOpen(true);
  };

  const handleViewDetails = (auction: Auction, vehicle: Vehicle) => {
    setSelectedVehicleDetails({ auction, vehicle });
    setCurrentView('VEHICLE_DETAILS');
    const newPath = `/seller-buyer/vehicle-details?obj=${vehicle.id}&auction_id=${auction.id}`;
    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState({ view: 'VEHICLE_DETAILS', auctionId: auction.id, vehicleId: vehicle.id }, '', newPath);
    }
  };

  const handleBidSuccess = (auctionId: string, newBidAmount: number) => {
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? { ...a, currentHighestBid: newBidAmount, highestBidderId: currentUser?.id }
          : a
      )
    );
    if (bidModalAuction && bidModalAuction.id === auctionId) {
      setBidModalAuction((prev) => prev ? { ...prev, currentHighestBid: newBidAmount, highestBidderId: currentUser?.id } : null);
    }
    if (selectedVehicleDetails && selectedVehicleDetails.auction.id === auctionId) {
      setSelectedVehicleDetails((prev) =>
        prev
          ? {
              ...prev,
              auction: { ...prev.auction, currentHighestBid: newBidAmount, highestBidderId: currentUser?.id },
            }
          : null
      );
    }
    if (currentUser) {
      const updatedUsed = (currentUser.usedBiddingLimit || 0) + newBidAmount;
      const updatedUser: User = {
        ...currentUser,
        usedBiddingLimit: updatedUsed,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('user_used_limit_' + currentUser.id, String(updatedUsed));
    }
  };

  const handleUpdateDeposit = (newDeposit: number) => {
    if (currentUser) {
      const newLimit = newDeposit * 200;
      const updatedUser: User = {
        ...currentUser,
        securityDeposit: newDeposit,
        biddingLimit: newLimit,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('user_deposit_' + currentUser.id, String(newDeposit));
      localStorage.setItem('user_limit_' + currentUser.id, String(newLimit));
    }
  };


  const handleLogout = () => {
    if (currentUser?.id) {
      api.logoutSession(currentUser.id).catch(() => {});
    }
    currentUserRef.current = null;
    setCurrentUser(null);
    logoutKeycloak(`${window.location.origin}/seller-buyer/`);
  };

  const handleLiveNowClick = () => {
    const liveAuction = auctions.find((a) => a.status === 'ACTIVE');
    if (liveAuction) {
      setSelectedAuction(liveAuction);
      navigateToView('AUCTION_ROOM', liveAuction.id);
    } else {
      navigateToView('ONLINE_AUCTIONS');
    }
  };

  // Dynamic Category Counts from Live Backend API Data
  const onlineAuctionsCount = auctions.filter(
    (a) => a.status === 'ACTIVE' && (!a.auctionType || a.auctionType === 'ONLINE')
  ).length;

  const silentAuctionsCount = auctions.filter(
    (a) => a.status === 'ACTIVE' && a.auctionType === 'SILENT'
  ).length;

  const uaePlatesCount = vehicles.filter((v) => (v as any).category === 'PLATES').length;
  const machineryCount = vehicles.filter((v) => (v as any).category === 'MACHINERY').length;
  const emiratesMotoCount = vehicles.filter((v) => (v as any).category === 'EMIRATES_MOTO').length;

  return (
    <div className="min-h-screen bg-white text-[#231F20] flex flex-col font-sans selection:bg-[#D32437] selection:text-white">
      {/* OIDC Authentication In-Progress Overlay */}
      {isOidcProcessing ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-[#D32437] animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Completing Keycloak Single Sign-On...</h2>
          <p className="text-xs text-slate-400 mt-1">Verifying cryptographic authorization code and syncing user session.</p>
        </div>
      ) : isAuthChecking ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Verifying Security Credentials...</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticating session authorization and route permissions.</p>
        </div>
      ) : currentView === 'ADMIN' ? (
        !currentUser || (currentUser.role !== 'ADMIN' && !currentUser.isSuperAdmin && !(currentUser as any)?.superAdmin) ? (
          <AccessDeniedSecurityScreen
            currentUser={currentUser}
            requiredRole="ADMIN"
            onLogin={() => initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: 'ADMIN' })}
            onGoHome={() => navigateToView('HOME')}
          />
        ) : (
          <main className="flex-1 bg-slate-950 text-slate-100">
            <AdminPortal
              currentUser={currentUser}
              vehicles={vehicles}
              auctions={auctions}
              onOpenCreateVehicle={() => setIsCreateVehicleOpen(true)}
              onSelectAuction={(auc) => {
                setSelectedAuction(auc);
                navigateToView('AUCTION_ROOM', auc.id);
              }}
              onRefreshInventory={loadInventory}
              onLogout={handleLogout}
              onSwitchToMarketplace={() => navigateToView('HOME')}
              onUserSwitched={(user) => {
                setCurrentUser(user);
                loadInventory();
              }}
            />
          </main>
        )
      ) : currentView === 'AUCTION_ROOM' && selectedAuction ? (
        <main className="flex-1 bg-slate-950 text-slate-100">
          <AuctionRoom
            auction={selectedAuction}
            currentUser={currentUser}
            onBack={() => {
              setSelectedAuction(null);
              navigateToView('HOME');
              loadInventory();
            }}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
          />
        </main>
      ) : currentView === 'VEHICLE_DETAILS' && selectedVehicleDetails ? (
        <VehicleDetailsPage
          auction={selectedVehicleDetails.auction}
          vehicle={selectedVehicleDetails.vehicle}
          currentUser={currentUser}
          isFavorite={favoriteIds.includes(selectedVehicleDetails.vehicle.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedVehicleDetails.vehicle.id)}
          onBack={() => {
            setSelectedVehicleDetails(null);
            navigateToView('HOME');
          }}
          onOpenBidModal={(auc) => handleOpenBidModal(auc)}
          onOpenDeposit={() => setIsSecurityDepositModalOpen(true)}
          onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: 'ONLINE_AUCTIONS' })}
        />
      ) : currentView === 'FAVORITES' ? (
        !currentUser ? (
          <AccessDeniedSecurityScreen
            currentUser={currentUser}
            requiredRole="BUYER"
            onLogin={() => initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: 'FAVORITES' })}
            onGoHome={() => navigateToView('HOME')}
          />
        ) : (
          <FavoritesPage
            vehicles={vehicles}
            auctions={auctions}
            currentUser={currentUser}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenBidModal={handleOpenBidModal}
            onViewDetails={handleViewDetails}
            onBackHome={() => navigateToView('HOME')}
            onNavigate={(view) => navigateToView(view)}
          />
        )
      ) : currentView === 'SECURITY_DEPOSIT' ? (
        !currentUser ? (
          <AccessDeniedSecurityScreen
            currentUser={currentUser}
            requiredRole="BUYER"
            onLogin={() => initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: 'FAVORITES' })}
            onGoHome={() => navigateToView('HOME')}
          />
        ) : (
          <div className="flex-1 bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <SecurityDepositModal
              isOpen={true}
              currentUser={currentUser}
              onClose={() => navigateToView('HOME')}
              onUpdateDeposit={handleUpdateDeposit}
            />
          </div>
        )
      ) : currentView === 'ONLINE_AUCTIONS' ? (
        <OnlineAuctionsPage
          vehicles={vehicles}
          auctions={auctions}
          currentUser={currentUser}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onSelectAuction={(auc) => {
            setSelectedAuction(auc);
            navigateToView('AUCTION_ROOM', auc.id);
          }}
          onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
          onNavigate={(view) => navigateToView(view)}
          onBackHome={() => navigateToView('HOME')}
          onOpenBidModal={handleOpenBidModal}
          onViewDetails={handleViewDetails}
        />
      ) : currentView === 'SILENT_AUCTIONS' ? (
        <SilentAuctionsPage
          vehicles={vehicles}
          auctions={auctions}
          currentUser={currentUser}
          onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
          onNavigate={(view) => navigateToView(view)}
          onBackHome={() => navigateToView('HOME')}
        />
      ) : currentView === 'HELP' ? (
        <HelpPage
          onNavigate={(view) => navigateToView(view)}
          onBackHome={() => navigateToView('HOME')}
        />
      ) : currentView === 'SIGNIN_SIGNUP' ? (
        <SignInAndSignUpPage
          onGoSignIn={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
          onGoSignUp={() => initiateKeycloakLogin({ action: 'register' })}
          onBackHome={() => navigateToView('HOME')}
          onNavigate={(view) => navigateToView(view)}
        />
      ) : currentView === 'SIGNUP' ? (
        <SignUpPage
          onSuccess={(user) => {
            setCurrentUser(user);
            setSecurityNotice(null);
            navigateToView('HOME');
            loadInventory();
          }}
          onGoSignIn={() => navigateToView('SIGNIN')}
          onBackHome={() => navigateToView('HOME')}
          onNavigate={(view) => navigateToView(view)}
        />
      ) : currentView === 'SIGNIN' ? (
        <SignInPage
          oidcError={oidcError}
          securityNotice={securityNotice}
          onSuccess={(user) => {
            currentUserRef.current = user;
            setCurrentUser(user);
            setSecurityNotice(null);
            if (user.role === 'ADMIN' || (user as any).superAdmin) {
              navigateToView('ADMIN', undefined, user);
            } else {
              navigateToView('HOME', undefined, user);
            }
            loadInventory();
          }}
          onGoSignUp={() => initiateKeycloakLogin({ action: 'register' })}
          onBackHome={() => navigateToView('HOME')}
          onNavigate={(view) => navigateToView(view)}
        />
      ) : (
        /* HOME View: Sticky 96px Al Wataneya Navbar + Full HomePage */
        <div className="flex-1 flex flex-col">
          <Navbar
            currentUser={currentUser}
            favoriteCount={favoriteIds.length}
            onOpenAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
            onOpenCreateVehicle={() => setIsCreateVehicleOpen(true)}
            onOpenAdmin={() => navigateToView('ADMIN')}
            onLogout={handleLogout}
                        onLiveNowClick={handleLiveNowClick}
            onSearchChange={(q) => setSearchQuery(q)}
            onHomeClick={() => {
              setSelectedAuction(null);
              navigateToView('HOME');
            }}
            onNavigate={(view) => navigateToView(view)}
            onlineAuctionsCount={onlineAuctionsCount}
            silentAuctionsCount={silentAuctionsCount}
            uaePlatesCount={uaePlatesCount}
            machineryCount={machineryCount}
            emiratesMotoCount={emiratesMotoCount}
          />

          <main className="flex-1 w-full">
            <HomePage
              vehicles={vehicles}
              auctions={auctions}
              currentUser={currentUser}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectAuction={(auc) => {
                setSelectedAuction(auc);
                navigateToView('AUCTION_ROOM', auc.id);
              }}
              onOpenAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
              onOpenDeposit={() => setIsSecurityDepositModalOpen(true)}
                            onOpenCreateVehicle={() => setIsCreateVehicleOpen(true)}
              searchFilter={searchQuery}
              onNavigate={(view) => navigateToView(view)}
              onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login' })}
              onOpenBidModal={handleOpenBidModal}
              onViewDetails={handleViewDetails}
            />
          </main>
        </div>
      )}

      {/* Global Modals for Deposit & Vehicle Listing */}

      <PaymentModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currentUser={currentUser}
        auction={selectedAuction}
      />

      <CreateVehicleModal
        isOpen={isCreateVehicleOpen}
        onClose={() => setIsCreateVehicleOpen(false)}
        onSuccess={() => {
          loadInventory();
        }}
      />

      {/* In-place Bidding Modal (Screenshot 2) */}
      <BidModal
        isOpen={isBidModalOpen}
        auction={bidModalAuction}
        currentUser={currentUser}
        onClose={() => setIsBidModalOpen(false)}
        onSuccessBid={handleBidSuccess}
        onOpenDeposit={() => setIsSecurityDepositModalOpen(true)}
        onRequireAuth={() => initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: 'ONLINE_AUCTIONS' })}
      />

      {/* Security Deposit & 200x Limit Modal with Bank Account Refund */}
      <SecurityDepositModal
        isOpen={isSecurityDepositModalOpen}
        currentUser={currentUser}
        onClose={() => setIsSecurityDepositModalOpen(false)}
        onUpdateDeposit={handleUpdateDeposit}
      />

      {/* 15-Minute Inactivity Idle Session Expired Modal */}
      {isIdleTimedOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Session Expired</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              For your security, your session has expired after 15 minutes of inactivity. Please log in again to continue bidding and managing your account.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsIdleTimedOut(false);
                  initiateKeycloakLogin({ action: 'login', prompt: 'login', returnView: currentView });
                }}
                className="w-full py-3 px-4 bg-[#D32437] hover:bg-[#b51a2b] text-white font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Log In with Keycloak SSO
              </button>
              <button
                onClick={() => setIsIdleTimedOut(false)}
                className="w-full py-2.5 px-4 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer text-sm"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24/7 Universal Homepage AI Assistant for Buyers & Sellers */}
      <AICustomerConcierge
        currentUser={currentUser}
        onNavigateToAuction={(aucId) => {
          const target = auctions.find((a) => a.id === aucId);
          if (target) {
            setSelectedAuction(target);
            navigateToView('AUCTION_ROOM', aucId);
          }
        }}
        onOpenDeposit={() => setIsSecurityDepositModalOpen(true)}
        onOpenSellCar={() => setIsCreateVehicleOpen(true)}
      />

      {/* AI Live Promotional Broadcast Modal on Buyer Screens */}
      <PromotionalBroadcastModal
        onNavigateToCatalog={() => navigateToView('ONLINE_AUCTIONS')}
      />
    </div>
  );
};

export default App;
