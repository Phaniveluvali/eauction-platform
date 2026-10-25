import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { AuctionRoom } from './components/AuctionRoom';
import { AuthModal } from './components/AuthModal';
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
import { initiateKeycloakLogin, handleKeycloakCallback } from './utils/oidc';
import { api } from './services/api';
import { User, Vehicle, Auction } from './types';

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

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  // Global Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);

  // In-place Bidding Modal & Vehicle Details State (Matching User Screenshots 2, 3, 4)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidModalAuction, setBidModalAuction] = useState<Auction | null>(null);
  const [isSecurityDepositModalOpen, setIsSecurityDepositModalOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<{ auction: Auction; vehicle: Vehicle } | null>(null);

  // Route Navigator that synchronizes URL pathname with /seller-buyer/*
  const navigateToView = (view: PortalView, auctionId?: string) => {
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

  // Browser Back/Forward Navigation & URL normalization
  useEffect(() => {
    const handlePopState = () => {
      const { view, auctionId } = getRouteFromPath();
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
  }, [auctions]);

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

  // 1. Initial Profile & Inventory Sync + Keycloak OIDC Callback Handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // Primary: Keycloak OIDC SSO Authorization Code Callback Handler
    if (code && state) {
      setIsOidcProcessing(true);
      setOidcError(null);
      handleKeycloakCallback(code, state)
        .then(async ({ returnView }) => {
          const profile = await api.getMe();
          setCurrentUser(profile);
          // Strip sensitive tokens/codes from address bar
          const targetView: PortalView = (returnView as PortalView) || 
            (profile.role === 'ADMIN' || profile.isSuperAdmin || (profile as any).superAdmin ? 'ADMIN' : 'HOME');
          navigateToView(targetView);
          loadInventory();
        })
        .catch((err) => {
          console.error('Keycloak OIDC authentication callback error:', err);
          setOidcError(err.message || 'Keycloak authentication could not be completed.');
          navigateToView('SIGNIN');
        })
        .finally(() => {
          setIsOidcProcessing(false);
        });
      return;
    } else if (code) {
      // Secondary Fallback: Azure AD B2C OAuth
      api.azureB2cLogin({
        code: code,
        redirectUri: window.location.origin + window.location.pathname,
      })
        .then((resp) => {
          localStorage.setItem('token', resp.token);
          return api.getMe();
        })
        .then((user) => {
          setCurrentUser(user);
          navigateToView(user.role === 'ADMIN' ? 'ADMIN' : 'HOME');
        })
        .catch((err) => {
          console.error('Azure B2C callback error:', err);
        });
    }

    const token = localStorage.getItem('token');
    if (token && !code) {
      api.getMe()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
        });
    }

    loadInventory();
  }, []);

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
            if (fresh.currentHighestBid !== auc.currentHighestBid || fresh.status !== auc.status) {
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
      } catch (err) {
        // Ignore background polling errors
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentView]);

  // 3. Real-Time Multi-User Session Heartbeat (Every 5s for any logged-in user: Buyer, Seller, Admin)
  useEffect(() => {
    if (!currentUser) return;

    const sendHeartbeat = () => {
      api.sendSessionHeartbeat({
        userId: currentUser.id,
        userName: currentUser.fullName || 'User',
        email: currentUser.email,
        role: currentUser.role,
        currentScreen: currentView === 'ADMIN' ? 'Admin > Operations' : currentView === 'ONLINE_AUCTIONS' ? 'Online Auctions' : currentView === 'FAVORITES' ? 'Favorites' : 'Home',
        securityDeposit: currentUser.securityDeposit || 0,
        usedBiddingLimit: currentUser.usedBiddingLimit || 0,
        bidsPlacedInSession: 0,
        deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
        browser: 'Chrome 124.0 (Windows)',
        os: 'Windows 11',
        protocol: window.location.protocol.replace(':', '').toUpperCase(),
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
      setBidModalAuction((prev) => prev ? { ...prev, currentHighestBid: newBidAmount } : null);
    }
    if (selectedVehicleDetails && selectedVehicleDetails.auction.id === auctionId) {
      setSelectedVehicleDetails((prev) =>
        prev
          ? {
              ...prev,
              auction: { ...prev.auction, currentHighestBid: newBidAmount },
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

  // Quick 1-Click Demo Login with pre-generated users
  const handleQuickLogin = async (role: 'BUYER' | 'SELLER' | 'ADMIN') => {
    try {
      let email = 'buyer@sharmatransport.in';
      if (role === 'SELLER') email = 'seller@tatafleet.in';
      if (role === 'ADMIN') email = 'admin@eauction.in';

      const resp = await api.login(email, 'Password123!');
      localStorage.setItem('token', resp.token);
      const profile = await api.getMe();
      setCurrentUser(profile);
      if (role === 'ADMIN') {
        navigateToView('ADMIN');
      } else {
        if (currentView === 'SIGNIN' || currentView === 'SIGNIN_SIGNUP' || currentView === 'SIGNUP') {
          navigateToView('HOME');
        }
      }
    } catch (err: any) {
      console.warn('Quick login fallback:', err.message);
      setIsAuthOpen(true);
    }
  };

  const handleLogout = () => {
    if (currentUser?.id) {
      api.logoutSession(currentUser.id);
    }
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigateToView('HOME');
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
      ) : currentView === 'ADMIN' ? (
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
            onRequireAuth={() => navigateToView('SIGNIN_SIGNUP')}
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
          onRequireAuth={() => navigateToView('SIGNIN')}
        />
      ) : currentView === 'FAVORITES' ? (
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
          onRequireAuth={() => navigateToView('SIGNIN_SIGNUP')}
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
          onRequireAuth={() => navigateToView('SIGNIN_SIGNUP')}
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
          onGoSignIn={() => navigateToView('SIGNIN')}
          onGoSignUp={() => navigateToView('SIGNUP')}
          onBackHome={() => navigateToView('HOME')}
          onNavigate={(view) => navigateToView(view)}
        />
      ) : currentView === 'SIGNUP' ? (
        <SignUpPage
          onSuccess={(user) => {
            setCurrentUser(user);
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
          onSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'ADMIN' || (user as any).superAdmin) {
              navigateToView('ADMIN');
            } else {
              navigateToView('HOME');
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
            onOpenAuth={() => navigateToView('SIGNIN')}
            onOpenCreateVehicle={() => setIsCreateVehicleOpen(true)}
            onOpenAdmin={() => navigateToView('ADMIN')}
            onLogout={handleLogout}
            onQuickLogin={handleQuickLogin}
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
              onOpenAuth={() => navigateToView('SIGNIN')}
              onOpenDeposit={() => setIsSecurityDepositModalOpen(true)}
              onQuickLogin={handleQuickLogin}
              onOpenCreateVehicle={() => setIsCreateVehicleOpen(true)}
              searchFilter={searchQuery}
              onNavigate={(view) => navigateToView(view)}
              onRequireAuth={() => navigateToView('SIGNIN_SIGNUP')}
              onOpenBidModal={handleOpenBidModal}
              onViewDetails={handleViewDetails}
            />
          </main>
        </div>
      )}

      {/* Global Modals for Deposit & Vehicle Listing */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          loadInventory();
        }}
      />

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
        onRequireAuth={() => navigateToView('SIGNIN')}
      />

      {/* Security Deposit & 200x Limit Modal with Bank Account Refund */}
      <SecurityDepositModal
        isOpen={isSecurityDepositModalOpen}
        currentUser={currentUser}
        onClose={() => setIsSecurityDepositModalOpen(false)}
        onUpdateDeposit={handleUpdateDeposit}
      />
    </div>
  );
};

export default App;
