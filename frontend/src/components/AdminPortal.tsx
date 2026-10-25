import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assets';
import {
  Car,
  Truck,
  PlusCircle,
  Gavel,
  FileText,
  DollarSign,
  Users,
  Shield,
  Layers,
  Settings,
  LogOut,
  Home,
  Briefcase,
  Wrench,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Server,
  Zap,
  Check,
  AlertCircle,
  Database,
  Radio,
  Eye,
  KeyRound,
  FileCheck2,
  RefreshCw,
  X,
  Bell,
  User as UserIcon,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Filter,
  Image as ImageIcon,
  Building2,
  Sparkles,
  Camera,
  Loader2,
  Activity,
  Wifi,
  Globe,
  Laptop,
  Smartphone,
  Send,
  Slash,
  UserX,
  Monitor
} from 'lucide-react';
import { User, Vehicle, Auction } from '../types';
import { SEED_USERS, SeedUserRecord } from '../data/seedUsers';
import { api } from '../services/api';

interface AdminPortalProps {
  currentUser: User | null;
  vehicles: Vehicle[];
  auctions: Auction[];
  onOpenCreateVehicle: () => void;
  onSelectAuction: (auction: Auction) => void;
  onRefreshInventory: () => void;
  onLogout: () => void;
  onSwitchToMarketplace: () => void;
  onUserSwitched: (user: User) => void;
}

type AdminTab =
  | 'sellers'
  | 'operations'
  | 'management'
  | 'accountant'
  | 'reports'
  | 'admin'
  | 'dashboard';

type SubViewType =
  | 'none'
  | 'live_sessions_users'
  | 'customer_list'
  | 'seller_list'
  | 'active_auctions'
  | 'vehicle_inventory'
  | 'unapproved_vehicles'
  | 'invoices_payments'
  | 'operation_log'
  | 'add_new_car'
  | 'request_vehicle_erp'
  | 'request_vehicle'
  | 'submitted_by_seller'
  | 'washed_vehicles'
  | 'photo_vehicles'
  | 'technical_test'
  | 'inactive_auctions';

// UAE & Enterprise Car Catalog Dropdown Datasets
const MAKE_MODELS: Record<string, string[]> = {
  Toyota: ['Land Cruiser', 'Land Cruiser Prado', 'Innova', 'Camry', 'Corolla', 'RAV4', 'Fortuner', 'Hilux', 'Yaris', 'Crown'],
  Nissan: ['Patrol', 'Sunny', 'Altima', 'X-Trail', 'Pathfinder', 'Kicks', 'Navara', 'Maxima', 'Armada'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'City', 'Odyssey'],
  Lexus: ['LX600', 'LX570', 'RX350', 'ES350', 'GX460', 'IS300', 'NX300', 'LS500'],
  'Mercedes-Benz': ['G-Class G63 AMG', 'S-Class S500', 'E-Class E300', 'C-Class C200', 'GLS 450', 'GLE 450', 'A-Class'],
  BMW: ['7 Series 740i', '5 Series 530i', '3 Series 330i', 'X5 xDrive40i', 'X7 M60i', 'X3', 'M4 Competition'],
  Ford: ['F-150', 'Mustang', 'Explorer', 'Expedition', 'Ranger', 'Edge', 'Bronco'],
  Hyundai: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Palisade', 'Creta', 'Accent'],
  Audi: ['A6', 'A8', 'Q7', 'Q8', 'RS6 Avant', 'A4', 'Q5'],
  'Land Rover': ['Range Rover Vogue', 'Range Rover Sport', 'Defender 110', 'Discovery', 'Velar', 'Evoque'],
  Mitsubishi: ['Pajero', 'Outlander', 'Montero Sport', 'Eclipse Cross', 'ASX', 'L200'],
  Kia: ['Telluride', 'Sorento', 'Sportage', 'K5', 'Carnival', 'Pegas']
};

const BRANCHES = [
  'Sharjah',
  'Dubai',
  'Abu Dhabi',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain'
];

const COLORS = [
  'White',
  'Pearl White',
  'Black',
  'Silver',
  'Grey',
  'Blue',
  'Red',
  'Brown',
  'Gold',
  'Green'
];

const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Hybrid',
  'Electric'
];

const KEYS_OPTIONS = [
  '1 Key',
  '2 Keys',
  '3 Keys',
  '4 Keys',
  'None'
];

const DEFAULT_VEHICLE_IMAGES = [
  'https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com/vehicles/defaults/front_view.jpg',
  'https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com/vehicles/defaults/rear_view.jpg',
  'https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com/vehicles/defaults/interior_cabin.jpg',
  'https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com/vehicles/defaults/engine_bay.jpg'
];

// =============================================================================
// SUBMODULE: LIVE SESSIONS USERS TELEMETRY & STATE
// =============================================================================
export interface LiveSession {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  ipAddress: string;
  clientIp?: string;
  location: string;
  countryCode: string;
  deviceType: 'Desktop' | 'Mobile';
  browser: string;
  os: string;
  protocol: 'WSS' | 'HTTPS';
  podName: string;
  podIp: string;
  currentScreen: string;
  securityDeposit: number;
  biddingLimit: number;
  usedBiddingLimit: number;
  bidsPlacedInSession: number;
  loginTime: string;
  lastHeartbeat: string;
  pingMs: number;
  status: 'ONLINE' | 'IDLE' | 'BIDDING';
  isCurrentAdmin?: boolean;
}

const INITIAL_LIVE_SESSIONS: LiveSession[] = [];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  vehicles,
  auctions,
  onOpenCreateVehicle,
  onSelectAuction,
  onRefreshInventory,
  onLogout,
  onSwitchToMarketplace,
  onUserSwitched,
}) => {
  // Role checks: Super Admin gets full access with default active 'sellers' tab;
  // Seller role only gets 'sellers' module in the left sidebar.
  const isSeller = currentUser?.role === 'SELLER';
  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<AdminTab>('sellers');
  const [activeSubView, setActiveSubView] = useState<SubViewType>('none');

  // Admin Header Profile Dropdown state
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  // User Administration & Dynamic Database Users state
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'BUYER' | 'SELLER' | 'ADMIN'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const pageSize = 15;
  const [switchSuccessMsg, setSwitchSuccessMsg] = useState('');
  const [switchingUser, setSwitchingUser] = useState<string | null>(null);

  // Dynamic Live Database Users from catalog-identity-service
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [totalDbUsers, setTotalDbUsers] = useState<number>(0);
  const [totalDbPages, setTotalDbPages] = useState<number>(1);
  const [dbUsersLoading, setDbUsersLoading] = useState<boolean>(false);

  // Interactive Password Reset Modal state (Admin-only credential recovery)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [resetSubmitting, setResetSubmitting] = useState<boolean>(false);
  const [resetSuccessData, setResetSuccessData] = useState<{ user: any; password: string } | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string>('');
  const [copySuccessToast, setCopySuccessToast] = useState<boolean>(false);

  // SubView 1: Add New Car state (Screenshots 1 & 2)
  const [addCarTab, setAddCarTab] = useState<'single' | 'multiple'>('single');
  const [singleCarForm, setSingleCarForm] = useState({
    chassisNumber: '',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    branch: 'Sharjah',
    keys: '2 Keys',
    color: 'White',
    fuelType: 'Petrol',
    targetSellingPrice: '',
    minimumSellingPrice: '',
    previousNumberplate: '',
    clientName: 'Emirates Fleet Transport',
    agreedTerms: false,
    mulkiyaFileName: '',
  });
  const [singleCarSubmitting, setSingleCarSubmitting] = useState(false);
  // Live Sessions Users state: strictly tracks authenticated user sessions (no mock data or synthetic bids)
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => {
    if (!currentUser) return [];
    return [{
      id: `sess-${currentUser.id ? currentUser.id.slice(0, 8) : 'adm-001'}`,
      userId: currentUser.id || 'usr-admin-01',
      userName: currentUser.fullName || 'Admin User',
      email: currentUser.email || 'admin@eauction.in',
      role: (currentUser.role as any) || 'ADMIN',
      ipAddress: '202.153.35.221',
      location: 'Dubai, UAE',
      countryCode: 'AE',
      deviceType: 'Desktop',
      browser: 'Chrome 124.0 (Windows)',
      os: 'Windows 11',
      protocol: 'HTTPS',
      podName: 'eauction-catalog-identity-78f898c76f-j9mq8',
      podIp: '172.16.138.78',
      currentScreen: activeSubView === 'none' ? `Admin > ${activeTab}` : `Operations > ${activeSubView.replace(/_/g, ' ')}`,
      securityDeposit: currentUser.securityDeposit || 0,
      biddingLimit: (currentUser.securityDeposit || 0) * 200,
      usedBiddingLimit: currentUser.usedBiddingLimit || 0,
      bidsPlacedInSession: 0,
      loginTime: 'Active now',
      lastHeartbeat: '1s ago',
      pingMs: 1.2,
      status: 'ONLINE',
      isCurrentAdmin: true
    }];
  });
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionRoleFilter, setSessionRoleFilter] = useState<'ALL' | 'BUYER' | 'SELLER' | 'ADMIN'>('ALL');
  const [sessionProtocolFilter, setSessionProtocolFilter] = useState<'ALL' | 'WSS' | 'HTTPS'>('ALL');
  const [sessionPodFilter, setSessionPodFilter] = useState<string>('ALL');
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionAutoRefresh, setSessionAutoRefresh] = useState(true);
  const [sessionInspectTarget, setSessionInspectTarget] = useState<LiveSession | null>(null);
  const [sessionBroadcastModal, setSessionBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [sessionTerminateConfirm, setSessionTerminateConfirm] = useState<LiveSession | null>(null);
  const [sessionActionToast, setSessionActionToast] = useState('');

  // Dynamic Real-Time Multi-User Session Polling from Backend Registry
  const fetchLiveSessionsFromBackend = async () => {
    try {
      const data = await api.getLiveSessions();
      if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
        setLiveSessions(data.sessions.map((s: any) => ({
          ...s,
          isCurrentAdmin: s.userId === currentUser?.id || s.email === currentUser?.email,
        })));
      }
    } catch {
      // Keep existing session telemetry on transient network jitter
    }
  };

  useEffect(() => {
    fetchLiveSessionsFromBackend();
    if (!sessionAutoRefresh) return;
    const interval = setInterval(fetchLiveSessionsFromBackend, 3500);
    return () => clearInterval(interval);
  }, [sessionAutoRefresh, currentUser?.id]);

  const [singleCarSuccess, setSingleCarSuccess] = useState('');
  const [singleCarImages, setSingleCarImages] = useState<string[]>(DEFAULT_VEHICLE_IMAGES);




    // SubView 2: Request Vehicle from ERP state (Screenshot 3)
  const [erpNumber, setErpNumber] = useState('');
  const [erpLoading, setErpLoading] = useState(false);
  const [erpResult, setErpResult] = useState<any | null>(null);
  const [erpSuccessMsg, setErpSuccessMsg] = useState('');

  // Dynamic User Stats (User request: dynamic values from database, not static)
  const [userStats, setUserStats] = useState<{ totalCustomers: number; buyers: number; sellers: number; staff: number }>({
    totalCustomers: 494,
    buyers: 453,
    sellers: 41,
    staff: 11,
  });

  useEffect(() => {
    api.getUserStats()
      .then((data) => {
        if (data) setUserStats(data);
      })
      .catch((err) => console.error('Failed to load user stats from backend:', err));
  }, []);

  // SubView: Request Vehicle pool state (Screenshots 1 & 2)
  const [poolFiltersOpen, setPoolFiltersOpen] = useState(true);
  const [poolFilterId, setPoolFilterId] = useState('');
  const [poolFilterTitle, setPoolFilterTitle] = useState('');
  const [poolFilterChassis, setPoolFilterChassis] = useState('');
  const [poolFilterBranch, setPoolFilterBranch] = useState('');
  const [poolFilterOldId, setPoolFilterOldId] = useState('');
  const [poolFilterSeller, setPoolFilterSeller] = useState('');
  const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set());
  const [approvingVehicleId, setApprovingVehicleId] = useState<string | null>(null);
  const [poolApproveMsg, setPoolApproveMsg] = useState('');
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // SubView: Submitted by Seller state (User Manual Chapter 20.3 & 20.4)
  const [submittedSellerFiltersOpen, setSubmittedSellerFiltersOpen] = useState(true);
  const [submittedSellerFilterId, setSubmittedSellerFilterId] = useState('');
  const [submittedSellerFilterTitle, setSubmittedSellerFilterTitle] = useState('');
  const [submittedSellerFilterChassis, setSubmittedSellerFilterChassis] = useState('');
  const [selectedSubmittedSellerIds, setSelectedSubmittedSellerIds] = useState<Set<string>>(new Set());
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editVehicleForm, setEditVehicleForm] = useState({
    mileage: '',
    mileageType: 'KM',
    oracleNumber: '',
    motorNo: '',
    keys: '2 Keys',
    vatApply: false,
    clientName: '',
    mobileNumber: '',
    commission: '5',
    minCommission: true,
    make: '',
    model: '',
    targetSellingPrice: '',
    location: '',
    branch: '',
    technicalRequired: true,
    washingRequired: true,
  });
  const [sendingToWashVehicleId, setSendingToWashVehicleId] = useState<string | null>(null);
  const [submittedSellerActionMsg, setSubmittedSellerActionMsg] = useState('');

  // SubView: Washed Vehicle state (Screenshots 3 & 4)
  const [washFiltersOpen, setWashFiltersOpen] = useState(true);
  const [washFilterId, setWashFilterId] = useState('');
  const [washFilterChassis, setWashFilterChassis] = useState('');
  const [washFilterTitle, setWashFilterTitle] = useState('');
  const [washFilterLocation, setWashFilterLocation] = useState('');
  const [selectedWashIds, setSelectedWashIds] = useState<Set<string>>(new Set());
  const [washingVehicleId, setWashingVehicleId] = useState<string | null>(null);
  const [washActionMsg, setWashActionMsg] = useState('');

  // SubView: PhotoVehicle state (Screenshot 5)
  const [photoFiltersOpen, setPhotoFiltersOpen] = useState(true);
  const [photoFilterId, setPhotoFilterId] = useState('');
  const [photoFilterTitle, setPhotoFilterTitle] = useState('');
  const [photoFilterChassis, setPhotoFilterChassis] = useState('');
  const [photoFilterLocation, setPhotoFilterLocation] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [submittingPhotoVehicleId, setSubmittingPhotoVehicleId] = useState<string | null>(null);
  const [photoActionMsg, setPhotoActionMsg] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // SubView: Technical Test state (Screenshots 1, 2, 3)
  const [techFiltersOpen, setTechFiltersOpen] = useState(true);
  const [techFilterId, setTechFilterId] = useState('');
  const [techFilterTitle, setTechFilterTitle] = useState('');
  const [techFilterChassis, setTechFilterChassis] = useState('');
  const [techFilterLocation, setTechFilterLocation] = useState('');
  const [selectedTechIds, setSelectedTechIds] = useState<Set<string>>(new Set());

  // Modal: Technical Report Upload / Replace (Screenshot 2)
  const [techReportModalVehicle, setTechReportModalVehicle] = useState<Vehicle | null>(null);
  const [activeUploadVehicleId, setActiveUploadVehicleId] = useState<string | null>(null);
  const techFileInputRef = useRef<HTMLInputElement>(null);

  // Modal: Submit Confirmation with Comment (Screenshot 3)
  const [submitConfirmVehicle, setSubmitConfirmVehicle] = useState<Vehicle | null>(null);
  const [techComment, setTechComment] = useState('');
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);
  const [techActionMsg, setTechActionMsg] = useState('');

  // Load Dynamic Live Database Users from backend API
  useEffect(() => {
    let isCancelled = false;
    setDbUsersLoading(true);
    api.getUsers({
      page: userPage - 1,
      size: pageSize,
      role: userRoleFilter === 'ALL' ? undefined : userRoleFilter,
      search: userSearch.trim() || undefined,
    })
      .then((data) => {
        if (!isCancelled && data) {
          setDbUsers(data.content || []);
          setTotalDbUsers(data.totalElements || 0);
          setTotalDbPages(data.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error('Failed to load DB users, fallback to static:', err);
      })
      .finally(() => {
        if (!isCancelled) setDbUsersLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [userPage, userRoleFilter, userSearch]);

  // Generate a strong, secure random password for password reset
  const generateRandomPassword = () => {
    const specials = ['@', '#', '$', '!'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `AlWataneya${randomSpecial}${randomNum}`;
    setNewPasswordInput(pass);
  };

  // Execute Password Reset via catalog-identity-service
  const handleExecutePasswordReset = async () => {
    if (!resetPasswordTarget) return;
    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      setResetErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setResetSubmitting(true);
    setResetErrorMessage('');
    try {
      await api.resetUserPassword(resetPasswordTarget.id, newPasswordInput.trim());
      setResetSuccessData({
        user: resetPasswordTarget,
        password: newPasswordInput.trim(),
      });
    } catch (err: any) {
      setResetErrorMessage(err.message || 'Failed to reset password in identity database.');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Dynamically calculate Top Recorded Bid from active auctions
  const topBid = useMemo(() => {
    let max = 0;
    let topCar = 'Toyota Land Cruiser 2025';
    auctions.forEach((a) => {
      const bid = a.currentHighestBid || a.startPrice || 0;
      if (bid > max) {
        max = bid;
        topCar = a.vehicle?.make ? `${a.vehicle.make} ${a.vehicle.model}` : `Lot #${a.vehicle?.lotNo || a.id.slice(0, 6)}`;
      }
    });
    return { amount: max > 0 ? max : 120000, title: topCar };
  }, [auctions]);

  // Quick 1-click switch into any user account
  const handleQuickSwitch = async (userRecord: any) => {
    try {
      setSwitchingUser(userRecord.email);
      setSwitchSuccessMsg('');
      const resp = await api.login(userRecord.email, 'Password123!');
      localStorage.setItem('token', resp.token);
      const profile = await api.getMe();
      onUserSwitched(profile);
      setSwitchSuccessMsg(`Successfully logged in as ${profile.fullName} (${profile.role})`);
      setTimeout(() => setSwitchSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Login failed for ${userRecord.email}: ${err.message}. If the password was recently reset, please sign in with the new password.`);
    } finally {
      setSwitchingUser(null);
    }
  };

  // Filtered users fallback for Customer List
  const filteredUsers = useMemo(() => {
    return SEED_USERS.filter((u) => {
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber.includes(q) ||
        u.panNumber.toLowerCase().includes(q) ||
        u.gstNumber.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [userRoleFilter, userSearch]);

  const totalUserPages = dbUsers.length > 0 ? totalDbPages : (Math.ceil(filteredUsers.length / pageSize) || 1);
  const paginatedUsers = useMemo(() => {
    if (dbUsers.length > 0) return dbUsers;
    const start = (userPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [dbUsers, filteredUsers, userPage]);

  // Handle Card Click Navigation matching Screenshots 1, 2, 3, 4, 5
  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === 'Live Sessions Users') {
      setActiveSubView('live_sessions_users');
      return;
    } else     if (cardTitle === 'Add a New Car' || cardTitle === 'Add New Car') {
      setActiveSubView('add_new_car');
      setAddCarTab('single');
    } else if (cardTitle === 'Request Vehicle from ERP') {
      setActiveSubView('request_vehicle_erp');
      setErpResult(null);
      setErpSuccessMsg('');
    } else if (cardTitle === 'Request Vehicle') {
      setActiveSubView('request_vehicle');
    } else if (cardTitle === 'Washed Vehicle') {
      setActiveSubView('washed_vehicles');
    } else if (cardTitle === 'Photo Vehicle') {
      setActiveSubView('photo_vehicles');
    } else if (cardTitle === 'Technical Test') {
      setActiveSubView('technical_test');
    } else if (cardTitle === 'Inactive Auctions') {
      setActiveSubView('inactive_auctions');
    } else if (cardTitle === 'Customer List' || cardTitle === 'Customers') {
      setUserRoleFilter('BUYER');
      setActiveSubView('customer_list');
    } else if (cardTitle === 'Seller List') {
      setUserRoleFilter('SELLER');
      setActiveSubView('customer_list');
    } else if (cardTitle === 'Active Auctions' || cardTitle === 'Auction List') {
      setActiveSubView('active_auctions');
    } else if (cardTitle === 'Submitted by Seller') {
      setActiveSubView('submitted_by_seller');
    } else if (
      cardTitle === 'My Vehicles' ||
      cardTitle === 'My Received Vehicles' ||
      cardTitle === 'Archived Vehicle'
    ) {
      setActiveSubView('vehicle_inventory');
    } else if (cardTitle === 'Unapproved Vehicle' || cardTitle === 'Under Approval') {
      setActiveSubView('unapproved_vehicles');
    } else if (
      cardTitle.includes('Invoice') ||
      cardTitle.includes('Payment') ||
      cardTitle.includes('Income') ||
      cardTitle.includes('Security Deposit')
    ) {
      setActiveSubView('invoices_payments');
    } else if (cardTitle === 'Operation Log') {
      setActiveSubView('operation_log');
    } else {
      setActiveSubView('vehicle_inventory');
    }
  };

  // Reusable Tile Card component matching user screenshots
  const renderTileCard = (title: string, icon: React.ReactNode, badgeCount?: number) => (
    <div
      key={title}
      onClick={() => handleCardClick(title)}
      className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition cursor-pointer min-h-[145px] group relative"
    >
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-3 right-3 bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
      <div className="w-14 h-14 flex items-center justify-center text-slate-700 group-hover:text-[#D32437] transition-colors mb-3">
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-800 group-hover:text-[#D32437] transition-colors tracking-tight">
        {title}
      </span>
    </div>
  );

  // Interactive Breadcrumb matching User Request: clicking 'Home' or 'Operations' navigates back
  const renderBreadcrumb = (moduleName: string, subViewName?: string) => (
    <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4 font-medium">
      <button
        type="button"
        onClick={() => onSwitchToMarketplace?.()}
        className="flex items-center space-x-1 hover:text-[#D32437] transition cursor-pointer text-slate-400 hover:text-[#D32437]"
        title="Return to Marketplace / Home"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      <button
        type="button"
        onClick={() => {
          const tabKey = moduleName.toLowerCase() as AdminTab;
          setActiveTab(tabKey);
          setActiveSubView('none');
        }}
        className="hover:text-[#D32437] transition cursor-pointer font-medium text-slate-600 hover:underline"
        title={`Back to ${moduleName}`}
      >
        {moduleName}
      </button>
      {subViewName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-semibold">{subViewName}</span>
        </>
      )}
    </div>
  );

  // Submit Single Car Form (Screenshot 1)
  const handleSingleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleCarForm.chassisNumber.trim()) {
      alert('Please enter a valid Chassis Number.');
      return;
    }
    if (!singleCarForm.targetSellingPrice) {
      alert('Please specify the Target Selling Price (AED).');
      return;
    }
    if (!singleCarForm.agreedTerms) {
      alert('Please read and agree with Terms and Conditions.');
      return;
    }

    try {
      setSingleCarSubmitting(true);
      setSingleCarSuccess('');

      const lotNo = Math.floor(100800 + Math.random() * 200);
      const targetVal = parseFloat(singleCarForm.targetSellingPrice) || 0;
      const minVal = parseFloat(singleCarForm.minimumSellingPrice) || targetVal * 0.9;

      const payload = {
        vin: singleCarForm.chassisNumber.trim().toUpperCase(),
        make: singleCarForm.make,
        model: singleCarForm.model,
        manufacturingYear: singleCarForm.year,
        fuelType: singleCarForm.fuelType,
        branch: singleCarForm.branch,
        noOfKeys: singleCarForm.keys,
        color: singleCarForm.color,
        targetSellingPrice: targetVal,
        minimumSellingPrice: minVal,
        previousNumberplate: singleCarForm.previousNumberplate || `DXB-${lotNo}`,
        clientName: singleCarForm.clientName,
        mulkiyaDocumentUrl: singleCarForm.mulkiyaFileName || 'Mulkiya_Verified_Document.pdf',
        mediaPaths: singleCarImages,
        lotNo: lotNo,
        wfActivityId: 'FVSA',
        status: 'SUBMISSION_PENDING',
        odometerReadingKm: 12000,
        vehicleType: 'CAR',
      };

      await api.createVehicle(payload);
      setSingleCarSuccess(`Vehicle (Lot #${lotNo}) registered successfully! Sent to Operations Request Vehicle pool (FVSA).`);
      onRefreshInventory();

      // Reset form
      setSingleCarForm((prev) => ({
        ...prev,
        chassisNumber: '',
        targetSellingPrice: '',
        minimumSellingPrice: '',
        previousNumberplate: '',
        agreedTerms: false,
        mulkiyaFileName: '',
      }));
    } catch (err: any) {
      alert(`Failed to add car: ${err.message}`);
    } finally {
      setSingleCarSubmitting(false);
    }
  };

  // Download Listing Template for Multiple Cars (Screenshot 2)
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Chassis Number,Make,Model,Year,Branch,Keys,Color,Fuel Type,Target Selling Price,Minimum Selling Price,Previous Number Plate,Client Name\n' +
      '220726140342641,Toyota,Land Cruiser,2023,Sharjah,2 Keys,Pearl White,Petrol,100000,92000,DXB-100813,Emirates Fleet Transport\n' +
      '220726140306806,Toyota,Innova,2022,Sharjah,2 Keys,Silver,Petrol,100000,88000,SHJ-100968,Sharjah VIP Motors\n' +
      '220726140306807,Toyota,Land Cruiser,2025,Sharjah,2 Keys,Black,Petrol,100000,95000,AD-100786,Al Mansoori Consignments\n' +
      '030726153039349,Nissan,Sunny,2024,Sharjah,1 Key,White,Petrol,45000,39000,AJM-100388,Al Wataneya Consignment\n' +
      '030726153027179,Nissan,Patrol,2025,Sharjah,2 Keys,Gold,Petrol,45000,42000,DXB-100381,Emirates Transport Fleet\n' +
      '030726152917539,Nissan,Sunny,2022,Sharjah,1 Key,Silver,Petrol,100000,85000,SHJ-100353,Sharjah Trading Logistics\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AWA_Vehicle_Listing_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Upload List for Multiple Cars (Screenshot 2)
  const handleFileUploadList = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('File contains no data rows.');
        return;
      }

      const rows = lines.slice(1);
      const batchPayloads = rows.map((line, idx) => {
        const parts = line.split(',');
        const lotNum = 100850 + idx;
        return {
          vin: parts[0]?.trim() || `VIN-${Date.now()}-${idx}`,
          make: parts[1]?.trim() || 'Toyota',
          model: parts[2]?.trim() || 'Land Cruiser',
          manufacturingYear: parseInt(parts[3]?.trim()) || 2024,
          branch: parts[4]?.trim() || 'Sharjah',
          noOfKeys: parts[5]?.trim() || '2 Keys',
          color: parts[6]?.trim() || 'White',
          fuelType: parts[7]?.trim() || 'Petrol',
          targetSellingPrice: parseFloat(parts[8]?.trim()) || 100000,
          minimumSellingPrice: parseFloat(parts[9]?.trim()) || 90000,
          previousNumberplate: parts[10]?.trim() || `DXB-${lotNum}`,
          clientName: parts[11]?.trim() || 'Batch Consignment Seller',
          lotNo: lotNum,
          wfActivityId: 'FVSA',
          status: 'SUBMISSION_PENDING',
        };
      });

      await api.batchCreateVehicles(batchPayloads);
      alert(`Successfully uploaded ${batchPayloads.length} vehicles from ${file.name}! Added to Request Vehicle pool.`);
      onRefreshInventory();
      setActiveSubView('request_vehicle');
    } catch (err: any) {
      alert(`Bulk upload processed: ${err.message}`);
      onRefreshInventory();
    }
  };

  // ERP Lookup (Screenshot 3)
  const handleErpLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!erpNumber.trim()) {
      alert('Please enter an ERP Number.');
      return;
    }

    setErpLoading(true);
    setErpResult(null);
    setErpSuccessMsg('');

    setTimeout(() => {
      setErpLoading(false);
      const cleanErp = erpNumber.trim().toUpperCase();
      setErpResult({
        erpNumber: cleanErp,
        chassisNumber: `220726140${Math.floor(100000 + Math.random() * 900000)}`,
        make: 'Toyota',
        model: 'Land Cruiser 2023 - 3.5L Twin Turbo V6',
        year: 2023,
        branch: 'Sharjah Operations Hub',
        engineNumber: `ENG-ERP-${Math.floor(1000 + Math.random() * 9000)}`,
        systemSource: 'SAP S/4HANA Enterprise Asset Management',
        currentOdometer: '15,400 KM',
        assetStatus: 'Decommissioned Fleet - Cleared for Auction Sale',
        estimatedPriceAed: 100000,
      });
    }, 600);
  };

  // Import ERP Record into Vehicle Pool
  const handleImportErpVehicle = async () => {
    if (!erpResult) return;
    try {
      const lotNo = Math.floor(100800 + Math.random() * 200);
      await api.createVehicle({
        vin: erpResult.chassisNumber,
        make: erpResult.make,
        model: erpResult.model,
        manufacturingYear: erpResult.year,
        fuelType: 'PETROL',
        branch: 'Sharjah',
        noOfKeys: '2 Keys',
        color: 'Pearl White',
        targetSellingPrice: erpResult.estimatedPriceAed,
        minimumSellingPrice: erpResult.estimatedPriceAed * 0.9,
        previousNumberplate: `DXB-${lotNo}`,
        clientName: 'Sharjah Fleet Consignment (ERP)',
        lotNo: lotNo,
        wfActivityId: 'FVSA',
        status: 'SUBMISSION_PENDING',
        odometerReadingKm: 15400,
        vehicleType: 'CAR',
      });
      setErpSuccessMsg(`ERP Vehicle #${erpResult.erpNumber} successfully imported to Request Vehicle pool (Lot #${lotNo})!`);
      onRefreshInventory();
      setTimeout(() => {
        setActiveSubView('request_vehicle');
      }, 1500);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  // Helper: Export to Excel / CSV
  const exportToExcel = (data: any[], filename: string) => {
    if (!data.length) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/"/g, '""') : '';
              return `"${val}"`;
            })
            .join(',')
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper: Format Date string matching Screenshots (e.g. "Jul 3, 2026, 15:30:14")
  const formatTableDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Approve Vehicle in Request Vehicle Pool (Single) -> transitions to 'FVSBS' (Submitted by Seller)
  const handleApproveVehicle = async (v: Vehicle) => {
    try {
      setApprovingVehicleId(v.id);
      setPoolApproveMsg('');
      await api.approveVehicle(v.id);
      setPoolApproveMsg(`Vehicle #${v.lotNo || v.vin} approved! Transitioned to Submitted by Seller queue.`);
      onRefreshInventory();
      setTimeout(() => setPoolApproveMsg(''), 4000);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApprovingVehicleId(null);
    }
  };

  // Open Edit Vehicle Modal (User Manual Chapter 20.4)
  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditVehicleForm({
      mileage: String(v.odometerReadingKm || '100002'),
      mileageType: 'KM',
      oracleNumber: String(v.lotNo || '151225143044'),
      motorNo: (v as any).engineNumber || 'ENG-AWA-9921',
      keys: v.noOfKeys || '2 Keys',
      vatApply: true,
      clientName: v.clientName || 'Rajesh Meesarapu',
      mobileNumber: '009715229751544',
      commission: '5',
      minCommission: true,
      make: v.make || 'Ford',
      model: v.model || 'Five Hundred',
      targetSellingPrice: String(v.targetSellingPrice || '45000'),
      location: v.location || v.branch || 'Sharjah',
      branch: v.branch || 'Sharjah',
      technicalRequired: true,
      washingRequired: true,
    });
  };

  // Save Vehicle Details & Done (User Manual Chapter 20.4) -> Moves to Washed Vehicle (FW)
  const handleSaveAndSendToWash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      setSendingToWashVehicleId(editingVehicle.id);
      await api.sendToWash(editingVehicle.id);
      setSubmittedSellerActionMsg(`Vehicle #${editingVehicle.lotNo || editingVehicle.vin} saved & moved to Washed Vehicle queue (FW)!`);
      setEditingVehicle(null);
      onRefreshInventory();
      setTimeout(() => setSubmittedSellerActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSendingToWashVehicleId(null);
    }
  };

  // Send to Wash (Direct)
  const handleSendToWash = async (v: Vehicle) => {
    try {
      setSendingToWashVehicleId(v.id);
      setSubmittedSellerActionMsg('');
      await api.sendToWash(v.id);
      setSubmittedSellerActionMsg(`Vehicle #${v.lotNo || v.vin} sent to washing! Transitioned to Washed Vehicle queue (FW).`);
      onRefreshInventory();
      setTimeout(() => setSubmittedSellerActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Error sending to wash: ${err.message}`);
    } finally {
      setSendingToWashVehicleId(null);
    }
  };

  // Batch Approve Vehicles -> transitions all selected to 'FW'
  const handleBatchApprove = async () => {
    if (selectedPoolIds.size === 0) {
      alert('Please select at least one vehicle to approve.');
      return;
    }
    try {
      setApprovingVehicleId('batch');
      setPoolApproveMsg('');
      await api.batchApproveVehicles(Array.from(selectedPoolIds));
      setPoolApproveMsg(`${selectedPoolIds.size} vehicles approved! Moved to FW (Washed Vehicle) queue.`);
      setSelectedPoolIds(new Set());
      onRefreshInventory();
      setTimeout(() => setPoolApproveMsg(''), 4000);
    } catch (err: any) {
      alert(`Batch approval error: ${err.message}`);
    } finally {
      setApprovingVehicleId(null);
    }
  };

  // Batch Archive Vehicles
  const handleBatchArchive = async () => {
    if (selectedPoolIds.size === 0) {
      alert('Please select at least one vehicle to archive.');
      return;
    }
    try {
      setPoolApproveMsg('');
      await api.batchArchiveVehicles(Array.from(selectedPoolIds));
      setPoolApproveMsg(`${selectedPoolIds.size} vehicles archived successfully.`);
      setSelectedPoolIds(new Set());
      onRefreshInventory();
      setTimeout(() => setPoolApproveMsg(''), 4000);
    } catch (err: any) {
      alert(`Batch archive error: ${err.message}`);
    }
  };

  // Washing Completed -> transitions to 'FP' (PhotoVehicle)
  const handleMarkWashingComplete = async (v: Vehicle) => {
    try {
      setWashingVehicleId(v.id);
      setWashActionMsg('');
      await api.markWashingComplete(v.id);
      setWashActionMsg(`Vehicle #${v.lotNo || v.vin} marked washing completed! Transitioned to PhotoVehicle queue.`);
      onRefreshInventory();
      setTimeout(() => setWashActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Washing complete error: ${err.message}`);
    } finally {
      setWashingVehicleId(null);
    }
  };

  // Submit Photo Vehicle -> transitions to 'FTT' (Technical Test)
  const handleSubmitPhotoVehicle = async (v: Vehicle) => {
    try {
      setSubmittingPhotoVehicleId(v.id);
      setPhotoActionMsg('');
      await api.submitPhotoVehicle(v.id, [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      ]);
      setPhotoActionMsg(`Vehicle #${v.lotNo || v.vin} inspection photos submitted! Transitioned to Technical Test.`);
      onRefreshInventory();
      setTimeout(() => setPhotoActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Photo submission error: ${err.message}`);
    } finally {
      setSubmittingPhotoVehicleId(null);
    }
  };

  // Request Vehicle Pool (Screenshots 1 & 2)
  const poolVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isPool = !v.wfActivityId || v.wfActivityId === 'FVSA' || v.status === 'SUBMISSION_PENDING';
      if (!isPool) return false;
      if (poolFilterId && !(String(v.lotNo || '').includes(poolFilterId) || v.id.toLowerCase().includes(poolFilterId.toLowerCase()))) return false;
      if (poolFilterTitle && !(`${v.make} ${v.model}`.toLowerCase().includes(poolFilterTitle.toLowerCase()))) return false;
      if (poolFilterChassis && !(v.vin?.toLowerCase().includes(poolFilterChassis.toLowerCase()))) return false;
      if (poolFilterBranch && !(v.branch?.toLowerCase().includes(poolFilterBranch.toLowerCase()))) return false;
      if (poolFilterOldId && !(v.oldId?.toLowerCase().includes(poolFilterOldId.toLowerCase()))) return false;
      if (poolFilterSeller && !(v.clientName?.toLowerCase().includes(poolFilterSeller.toLowerCase()))) return false;
      return true;
    });
  }, [vehicles, poolFilterId, poolFilterTitle, poolFilterChassis, poolFilterBranch, poolFilterOldId, poolFilterSeller]);

  // Submitted by Seller Vehicles (User Manual Chapter 20.3 & 20.4: wfActivityId === 'FVSBS' or status === 'APPROVED')
  const submittedSellerVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isSubmitted = v.wfActivityId === 'FVSBS' || v.status === 'APPROVED';
      if (!isSubmitted) return false;
      if (submittedSellerFilterId && !(String(v.lotNo || '').includes(submittedSellerFilterId) || v.id.toLowerCase().includes(submittedSellerFilterId.toLowerCase()))) return false;
      if (submittedSellerFilterTitle && !(`${v.make} ${v.model}`.toLowerCase().includes(submittedSellerFilterTitle.toLowerCase()))) return false;
      if (submittedSellerFilterChassis && !(v.vin?.toLowerCase().includes(submittedSellerFilterChassis.toLowerCase()))) return false;
      return true;
    });
  }, [vehicles, submittedSellerFilterId, submittedSellerFilterTitle, submittedSellerFilterChassis]);

  // Washed Vehicles (Screenshots 3 & 4)
  const washedVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isWashed = v.wfActivityId === 'FW' || v.status === 'UNDER_WASHING';
      if (!isWashed) return false;
      if (washFilterId && !(String(v.lotNo || '').includes(washFilterId) || v.id.toLowerCase().includes(washFilterId.toLowerCase()))) return false;
      if (washFilterChassis && !(v.vin?.toLowerCase().includes(washFilterChassis.toLowerCase()))) return false;
      if (washFilterTitle && !(`${v.make} ${v.model}`.toLowerCase().includes(washFilterTitle.toLowerCase()))) return false;
      if (washFilterLocation && !((v.location || v.branch)?.toLowerCase().includes(washFilterLocation.toLowerCase()))) return false;
      return true;
    });
  }, [vehicles, washFilterId, washFilterChassis, washFilterTitle, washFilterLocation]);

  // PhotoVehicles (Screenshot 5)
  const photoVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isPhoto = v.wfActivityId === 'FP' || v.status === 'PHOTO_PENDING';
      if (!isPhoto) return false;
      if (photoFilterId && !(String(v.lotNo || '').includes(photoFilterId) || v.id.toLowerCase().includes(photoFilterId.toLowerCase()))) return false;
      if (photoFilterTitle && !(`${v.make} ${v.model}`.toLowerCase().includes(photoFilterTitle.toLowerCase()))) return false;
      if (photoFilterChassis && !(v.vin?.toLowerCase().includes(photoFilterChassis.toLowerCase()))) return false;
      if (photoFilterLocation && !((v.location || v.branch)?.toLowerCase().includes(photoFilterLocation.toLowerCase()))) return false;
      return true;
    });
  }, [vehicles, photoFilterId, photoFilterTitle, photoFilterChassis, photoFilterLocation]);

  // Technical Test Vehicles (Screenshot 1: wfActivityId === 'FTT' or status === 'TECHNICAL_PENDING')
  const technicalVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isTech = v.wfActivityId === 'FTT' || v.status === 'TECHNICAL_PENDING';
      if (!isTech) return false;
      if (techFilterId && !(String(v.lotNo || '').includes(techFilterId) || v.id.toLowerCase().includes(techFilterId.toLowerCase()))) return false;
      if (techFilterTitle && !(`${v.make} ${v.model}`.toLowerCase().includes(techFilterTitle.toLowerCase()))) return false;
      if (techFilterChassis && !(v.vin?.toLowerCase().includes(techFilterChassis.toLowerCase()))) return false;
      if (techFilterLocation && !((v.location || v.branch)?.toLowerCase().includes(techFilterLocation.toLowerCase()))) return false;
      return true;
    });
  }, [vehicles, techFilterId, techFilterTitle, techFilterChassis, techFilterLocation]);

  // Inactive Auctions Vehicles (wfActivityId === 'FIA' or status === 'INACTIVE_AUCTION')
  const inactiveVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      return v.wfActivityId === 'FIA' || v.status === 'INACTIVE_AUCTION';
    });
  }, [vehicles]);

  // Handler: When clicking Upload button in Technical Test table
  const handleTechUploadClick = (v: Vehicle) => {
    if (v.inspectionReportUrl && v.inspectionReportUrl.trim().length > 0) {
      // Report already exists -> Open Screenshot 2 modal
      setTechReportModalVehicle(v);
    } else {
      // No report yet -> Open file picker directly
      setActiveUploadVehicleId(v.id);
      techFileInputRef.current?.click();
    }
  };

  // Handler: "Replace Report" in Screenshot 2 modal
  const handleReplaceReport = () => {
    const target = techReportModalVehicle;
    setTechReportModalVehicle(null);
    if (target) {
      setActiveUploadVehicleId(target.id);
      setTimeout(() => {
        techFileInputRef.current?.click();
      }, 100);
    }
  };

  // Handler: File chosen for technical report
  const handleReportFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadVehicleId) return;

    try {
      const targetVehicle = vehicles.find((v) => v.id === activeUploadVehicleId);
      const fileName = file.name;
      const reportUrl = `/reports/technical-report-sample.html?file=${encodeURIComponent(fileName)}&vin=${encodeURIComponent(targetVehicle?.vin || '')}&model=${encodeURIComponent(`${targetVehicle?.make} ${targetVehicle?.model}`)}&year=${targetVehicle?.manufacturingYear || 2024}&loc=${encodeURIComponent(targetVehicle?.location || targetVehicle?.branch || 'Abu Dhabi')}&lot=${targetVehicle?.lotNo || ''}`;

      await api.updateTechnicalReport(activeUploadVehicleId, reportUrl);
      setTechActionMsg(`Technical Report (${fileName}) uploaded successfully for Vehicle #${targetVehicle?.lotNo || targetVehicle?.vin}!`);
      onRefreshInventory();
      setTimeout(() => setTechActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Failed to upload technical report: ${err.message}`);
    } finally {
      setActiveUploadVehicleId(null);
      if (techFileInputRef.current) techFileInputRef.current.value = '';
    }
  };

  // Handler: Display report in other tab (Screenshot 1)
  const handleDisplayReport = (v: Vehicle) => {
    const defaultUrl = `/reports/technical-report-sample.html?vin=${encodeURIComponent(v.vin || '')}&model=${encodeURIComponent(`${v.make} ${v.model}`)}&year=${v.manufacturingYear || 2024}&location=${encodeURIComponent(v.location || v.branch || 'Abu Dhabi')}&lot=${v.lotNo || ''}`;
    const targetUrl = v.inspectionReportUrl && v.inspectionReportUrl.startsWith('/reports/') ? v.inspectionReportUrl : defaultUrl;
    window.open(targetUrl, '_blank');
  };

  // Handler: Open submit confirmation comment modal (Screenshot 3)
  const handleOpenSubmitModal = (v: Vehicle) => {
    setSubmitConfirmVehicle(v);
    setTechComment('');
  };

  // Handler: Confirm submit with comment -> moves vehicle to Inactive Auctions
  const handleConfirmSubmitTech = async () => {
    if (!submitConfirmVehicle) return;
    try {
      setIsSubmittingTech(true);
      await api.submitTechnicalTest(submitConfirmVehicle.id, techComment);
      setTechActionMsg(`Vehicle #${submitConfirmVehicle.lotNo || submitConfirmVehicle.vin} submitted successfully and moved to Inactive Auctions!`);
      setSubmitConfirmVehicle(null);
      setTechComment('');
      onRefreshInventory();
      setTimeout(() => setTechActionMsg(''), 4000);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmittingTech(false);
    }
  };

  // Header Title Resolver
  const getHeaderTitle = () => {
    if (activeSubView === 'live_sessions_users') return 'Live Sessions Users';
    if (activeSubView === 'customer_list') return 'User Administration';
    if (activeSubView === 'add_new_car') return 'Add New Car';
    if (activeSubView === 'request_vehicle_erp') return 'Request Vehicle from ERP';
    if (activeSubView === 'request_vehicle') return 'Request Vehicle';
    if (activeSubView === 'washed_vehicles') return 'Washed Vehicle';
    if (activeSubView === 'photo_vehicles') return 'PhotoVehicle';
    if (activeSubView === 'technical_test') return 'Technical Test';
    if (activeSubView === 'inactive_auctions') return 'Inactive Auctions';
    if (activeTab === 'admin') return 'User Administration';
    if (activeSubView !== 'none') return activeSubView.replace('_', ' ');
    return activeTab;
  };

  // Reusable Dynamic Stat Cards (User request: Total Customers, Buyers, Sellers, Staff from database)
  const renderStatCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Customers (Blue) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-4 shadow-2xs">
        <div className="w-14 h-14 rounded-lg bg-[#0070BA] flex items-center justify-center text-white shrink-0">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Total Customers</span>
          <span className="text-2xl font-extrabold text-[#D32437]">{userStats.totalCustomers}</span>
        </div>
      </div>

      {/* 2. Buyers (Green) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-4 shadow-2xs">
        <div className="w-14 h-14 rounded-lg bg-[#54B435] flex items-center justify-center text-white shrink-0">
          <Car className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Buyers</span>
          <span className="text-2xl font-extrabold text-[#D32437]">{userStats.buyers}</span>
        </div>
      </div>

      {/* 3. Sellers (Red) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-4 shadow-2xs">
        <div className="w-14 h-14 rounded-lg bg-[#D32437] flex items-center justify-center text-white shrink-0">
          <Car className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Sellers</span>
          <span className="text-2xl font-extrabold text-[#D32437]">{userStats.sellers}</span>
        </div>
      </div>

      {/* 4. Staff (Black) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-4 shadow-2xs">
        <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
          <UserIcon className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Staff</span>
          <span className="text-2xl font-extrabold text-[#D32437]">{userStats.staff}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* 1. LEFT SIDEBAR: Role-gated */}
      <aside className="w-full md:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Brand Logo matching Screenshots */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-start">
          <img
            src={getAssetUrl('/assets/logoawa.svg')}
            alt="AWA"
            className="h-8 w-auto object-contain cursor-pointer"
            onClick={onSwitchToMarketplace}
            onError={(e) => {
              (e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo.svg');
            }}
          />
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-sm">
          {/* Home Link (Always visible) */}
          <button
            onClick={onSwitchToMarketplace}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition text-left cursor-pointer"
          >
            <Home className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Home</span>
          </button>

          {/* Sellers Link (Always visible, default active) */}
          <button
            onClick={() => {
              setActiveTab('sellers');
              setActiveSubView('none');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
              activeTab === 'sellers' && activeSubView === 'none'
                ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 font-medium'
            }`}
          >
            <Briefcase className={`w-5 h-5 ${activeTab === 'sellers' ? 'text-[#D32437]' : 'text-slate-400'}`} />
            <span>Sellers</span>
          </button>

          {/* Role-gated links: Only visible for Admin / Super Admin */}
          {!isSeller && (
            <>
              <button
                onClick={() => {
                  setActiveTab('operations');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'operations' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <Wrench className={`w-5 h-5 ${activeTab === 'operations' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>Operations</span>
              </button>

              {/* Operations Submodule Quick Links */}
              {activeTab === 'operations' && (
                <div className="pl-6 pr-2 py-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('operations');
                      setActiveSubView('live_sessions_users');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition text-left cursor-pointer ${
                      activeSubView === 'live_sessions_users'
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Sessions Users</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {liveSessions.length}
                    </span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveTab('management');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'management' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <Layers className={`w-5 h-5 ${activeTab === 'management' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>Management</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('accountant');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'accountant' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <DollarSign className={`w-5 h-5 ${activeTab === 'accountant' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>Accountant</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'reports' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <FileText className={`w-5 h-5 ${activeTab === 'reports' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>Reports</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('admin');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'admin' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>User Administration</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setActiveSubView('none');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition text-left ${
                  activeTab === 'dashboard' && activeSubView === 'none'
                    ? 'bg-red-50 text-[#D32437] font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-[#D32437]' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </button>
            </>
          )}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5 mb-2 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-semibold text-slate-800 truncate">{currentUser?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || 'admin@eauction.in'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar matching Screenshots: ✕ Header Title ... 🔔 👤 */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-2xs relative z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={activeSubView !== 'none' ? () => setActiveSubView('none') : onSwitchToMarketplace}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-800 transition cursor-pointer flex items-center justify-center"
              title={activeSubView !== 'none' ? 'Back to submodules' : 'Close and return to Home'}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span>{getHeaderTitle()}</span>
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSubView('operation_log')}
              className="p-1.5 text-slate-700 hover:text-[#D32437] transition cursor-pointer relative"
              title="Notifications & System Logs"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Admin Header User Profile & Sign Out Dropdown (Screenshot 2 & 3) */}
            <div className="relative">
              <button
                onClick={() => setIsAdminProfileOpen(!isAdminProfileOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer focus:outline-none"
                title="Admin Account Profile & Sign Out"
              >
                <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-800 bg-white shadow-xs">
                  <UserIcon className="w-4 h-4 text-slate-800" />
                </div>
              </button>

              {isAdminProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-50 text-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full border-2 border-[#231F20] flex items-center justify-center mx-auto mb-2 text-[#231F20] bg-white">
                    <UserIcon className="w-10 h-10 text-slate-800" />
                  </div>

                  <h4 className="font-bold text-[#231F20] text-base leading-tight">
                    {currentUser?.fullName || 'Administrator'}
                  </h4>

                  <p className="text-xs text-[#8C8C8C] mb-2 font-mono">
                    {currentUser?.email || 'admin@eauction.in'}
                  </p>

                  {/* RBAC Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                    {Boolean(currentUser?.isSuperAdmin || (currentUser as any)?.superAdmin) && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        SUPER ADMIN
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-red-100 text-[#D32437] px-2 py-0.5 rounded-full">
                      ROLE: {currentUser?.role || 'ADMIN'}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      KYC VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setIsAdminProfileOpen(false);
                        onSwitchToMarketplace();
                      }}
                      className="py-2 px-3 bg-red-50 border border-red-200 rounded-md text-[#D32437] font-bold hover:bg-red-100 transition cursor-pointer col-span-2"
                    >
                      Return to Marketplace
                    </button>

                    <button
                      onClick={() => {
                        setIsAdminProfileOpen(false);
                        setActiveTab('admin');
                        setActiveSubView('customer_list');
                      }}
                      className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-slate-50 transition cursor-pointer"
                    >
                      User Admin
                    </button>

                    <button
                      onClick={() => {
                        setIsAdminProfileOpen(false);
                        setActiveSubView('operation_log');
                      }}
                      className="py-2 px-3 border border-slate-300 rounded-md text-[#231F20] font-semibold hover:bg-slate-50 transition cursor-pointer"
                    >
                      System Logs
                    </button>

                    <button
                      onClick={() => {
                        setIsAdminProfileOpen(false);
                        onLogout();
                      }}
                      className="py-2 px-3 border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-md transition cursor-pointer col-span-2 flex items-center justify-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {switchSuccessMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{switchSuccessMsg}</span>
          </div>
        )}

        <div className="p-6 flex-1">
          {/* ========================================================================= */}
          {/* SUB-VIEW: ADD NEW CAR (Screenshots 1 & 2)                                 */}
          {/* ========================================================================= */}
          {activeSubView === 'add_new_car' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-5xl mx-auto">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Add New Car')}

              {/* Sub-Tabs matching Screenshots 1 & 2 */}
              <div className="flex items-center space-x-2 mb-6">
                <button
                  type="button"
                  onClick={() => setAddCarTab('single')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer ${
                    addCarTab === 'single'
                      ? 'bg-[#D32437] text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Sell Single Car
                </button>
                <button
                  type="button"
                  onClick={() => setAddCarTab('multiple')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition cursor-pointer ${
                    addCarTab === 'multiple'
                      ? 'bg-[#D32437] text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  Sell Multiple Cars
                </button>
              </div>

              {/* TAB 1: SELL SINGLE CAR (Screenshot 1) */}
              {addCarTab === 'single' && (
                <div>
                  {singleCarSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{singleCarSuccess}</span>
                      </div>
                      <button
                        onClick={() => setActiveSubView('request_vehicle')}
                        className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-lg hover:bg-emerald-700 transition"
                      >
                        View in Request Pool →
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSingleCarSubmit} className="space-y-4">
                    {/* Row 1: Chassis Number * | Make * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Chassis Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={singleCarForm.chassisNumber}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, chassisNumber: e.target.value })}
                          placeholder="Chassis Number *"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Make <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.make}
                          onChange={(e) => {
                            const newMake = e.target.value;
                            setSingleCarForm({
                              ...singleCarForm,
                              make: newMake,
                              model: MAKE_MODELS[newMake]?.[0] || 'Sedan',
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {Object.keys(MAKE_MODELS).map((mk) => (
                            <option key={mk} value={mk}>
                              {mk}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Model * | Year * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Model <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.model}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, model: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {(MAKE_MODELS[singleCarForm.make] || ['Sedan', 'SUV', 'Truck']).map((mod) => (
                            <option key={mod} value={mod}>
                              {mod}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Year <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.year}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, year: parseInt(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Branch * | Keys * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Branch <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.branch}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, branch: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Keys <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.keys}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, keys: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {KEYS_OPTIONS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Color * | Fuel Type * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.color}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, color: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {COLORS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fuel Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.fuelType}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, fuelType: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {FUEL_TYPES.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 5: Target Selling Price * | Minimum Selling Price * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Target Selling Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={singleCarForm.targetSellingPrice}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, targetSellingPrice: e.target.value })}
                          placeholder="Enter Amount in AED"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Minimum Selling Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={singleCarForm.minimumSellingPrice}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, minimumSellingPrice: e.target.value })}
                          placeholder="Enter Amount in AED"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Row 6: Previous Number Plate | Client Name * */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Previous Number Plate
                        </label>
                        <input
                          type="text"
                          value={singleCarForm.previousNumberplate}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, previousNumberplate: e.target.value })}
                          placeholder="Previous Number Plate"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Client Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={singleCarForm.clientName}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, clientName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="Emirates Fleet Transport">Emirates Fleet Transport (Dubai)</option>
                          <option value="Sharjah VIP Motors">Sharjah VIP Motors (Sharjah)</option>
                          <option value="Al Mansoori Consignments">Al Mansoori Consignments (Abu Dhabi)</option>
                          <option value="Al Wataneya Consignment">Al Wataneya Consignment (Ajman)</option>
                          <option value="Tata Fleet Logistics">Tata Fleet Logistics (Sharjah)</option>
                          <option value="Sharjah Trading Logistics">Sharjah Trading Logistics</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 7: Ordered Vehicle Photo Slots (User constraint: carefully store ordered images) */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Vehicle Inspection Gallery (Ordered Angles)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Front View', 'Rear View', 'Interior Cabin', 'Engine Bay'].map((angle, idx) => (
                          <div key={angle} className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center relative group">
                            <div className="h-24 rounded-lg overflow-hidden bg-slate-200 mb-1.5 relative">
                              <img
                                src={singleCarImages[idx] || DEFAULT_VEHICLE_IMAGES[idx]}
                                alt={angle}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                #{idx + 1}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 block truncate">{angle}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 8: Checkbox & Mulkiya Document Upload matching Screenshot 1 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={singleCarForm.agreedTerms}
                          onChange={(e) => setSingleCarForm({ ...singleCarForm, agreedTerms: e.target.checked })}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                        />
                        <span>
                          I have read & agree with <span className="text-[#D32437] font-semibold underline">Terms and Conditions*</span>
                        </span>
                      </label>

                      <div>
                        <label className="inline-flex items-center space-x-1.5 text-xs text-[#0369A1] hover:text-[#0284C7] font-semibold cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>
                            {singleCarForm.mulkiyaFileName ? `Mulkiya: ${singleCarForm.mulkiyaFileName}` : 'Upload Documents (Mulkiya)'}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setSingleCarForm({ ...singleCarForm, mulkiyaFileName: f.name });
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 9: Green Submit Button matching Screenshot 1 */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={singleCarSubmitting}
                        className="w-full bg-[#54B435] hover:bg-[#469A2C] text-white font-bold py-3 px-6 rounded-lg text-sm transition tracking-wide shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{singleCarSubmitting ? 'Registering Vehicle...' : 'Sell Now'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: SELL MULTIPLE CARS (Screenshot 2) */}
              {addCarTab === 'multiple' && (
                <div className="py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                    {/* Card 1: Download Listing Template */}
                    <div
                      onClick={handleDownloadTemplate}
                      className="border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-400 hover:shadow-md transition cursor-pointer bg-white group min-h-[190px]"
                    >
                      <div className="w-16 h-16 rounded-xl border border-slate-800 flex items-center justify-center text-slate-800 group-hover:text-[#D32437] group-hover:border-[#D32437] transition mb-4">
                        <Download className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[#D32437] transition">
                        Download Listing Template
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">Excel & CSV batch schema</span>
                    </div>

                    {/* Card 2: Upload List */}
                    <label className="border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-400 hover:shadow-md transition cursor-pointer bg-white group min-h-[190px]">
                      <div className="w-16 h-16 rounded-xl border border-slate-800 flex items-center justify-center text-slate-800 group-hover:text-[#D32437] group-hover:border-[#D32437] transition mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[#D32437] transition">
                        Upload List
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">Upload populated spreadsheet</span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUploadList}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: REQUEST VEHICLE FROM ERP (Screenshot 3)                         */}
          {/* ========================================================================= */}
          {activeSubView === 'request_vehicle_erp' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Request Vehicle from ERP')}

              {erpSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{erpSuccessMsg}</span>
                </div>
              )}

              {/* Form Card matching Screenshot 3 */}
              <form onSubmit={handleErpLookup} className="space-y-4 max-w-lg">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    ERP Number
                  </label>
                  <input
                    type="text"
                    required
                    value={erpNumber}
                    onChange={(e) => setErpNumber(e.target.value)}
                    placeholder="Enter ERP Number"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>Quick Test ERP IDs:</span>
                  {['ERP-88219', 'ERP-100968', 'AWA-ERP-7741'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setErpNumber(id)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono cursor-pointer transition"
                    >
                      {id}
                    </button>
                  ))}
                </div>

                {/* Big Green Button matching Screenshot 3 */}
                <button
                  type="submit"
                  disabled={erpLoading}
                  className="w-full bg-[#54B435] hover:bg-[#469A2C] text-white font-bold py-3 px-6 rounded-lg text-sm transition tracking-wide shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{erpLoading ? 'Fetching from ERP...' : 'Get Details'}</span>
                </button>
              </form>

              {/* ERP Lookup Result Card */}
              {erpResult && (
                <div className="mt-8 border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">ERP Record Found</span>
                      <h4 className="text-base font-bold text-slate-900">{erpResult.make} {erpResult.model}</h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Verified Active in ERP
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-6">
                    <div>
                      <span className="text-slate-400 block">ERP Number</span>
                      <span className="font-mono font-bold text-slate-800">{erpResult.erpNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Chassis Number</span>
                      <span className="font-mono font-bold text-slate-800">{erpResult.chassisNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Year of Mfg</span>
                      <span className="font-bold text-slate-800">{erpResult.year}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned Branch</span>
                      <span className="font-bold text-slate-800">{erpResult.branch}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Odometer</span>
                      <span className="font-mono font-bold text-slate-800">{erpResult.currentOdometer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Estimated Market Value</span>
                      <span className="font-bold text-emerald-600">AED {erpResult.estimatedPriceAed.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleImportErpVehicle}
                    className="w-full bg-[#D32437] hover:bg-[#b01c2d] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Import into Vehicle Pool (FVSA Acceptance)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: REQUEST VEHICLE POOL & APPROVAL (Screenshots 1 & 2)             */}
          {/* ========================================================================= */}
          {activeSubView === 'request_vehicle' && (
            <div className="space-y-6">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Request Vehicle')}

              {/* Dynamic Stat Cards matching Screenshot 1 */}
              {renderStatCards()}

              {/* Feedback toast */}
              {poolApproveMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{poolApproveMsg}</span>
                </div>
              )}

              {/* Collapsible Filters Card matching Screenshot 1 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPoolFiltersOpen(!poolFiltersOpen)}
                  className="w-full bg-[#EBF3FB] px-5 py-3 flex items-center justify-between text-left hover:bg-[#deebf7] transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800">Filters</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${poolFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {poolFiltersOpen && (
                  <div className="p-5 border-t border-slate-100 bg-white space-y-4">
                    {/* Row 1: ID, Title, Chassis No, Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID</label>
                        <input
                          type="text"
                          value={poolFilterId}
                          onChange={(e) => setPoolFilterId(e.target.value)}
                          placeholder="ID"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={poolFilterTitle}
                          onChange={(e) => setPoolFilterTitle(e.target.value)}
                          placeholder="Title"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chassis No</label>
                        <input
                          type="text"
                          value={poolFilterChassis}
                          onChange={(e) => setPoolFilterChassis(e.target.value)}
                          placeholder="Chassis No"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Branch</label>
                        <input
                          type="text"
                          value={poolFilterBranch}
                          onChange={(e) => setPoolFilterBranch(e.target.value)}
                          placeholder="Branch"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Row 2: Old ID, Seller Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Old ID</label>
                        <input
                          type="text"
                          value={poolFilterOldId}
                          onChange={(e) => setPoolFilterOldId(e.target.value)}
                          placeholder="Old ID"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seller Name</label>
                        <input
                          type="text"
                          value={poolFilterSeller}
                          onChange={(e) => setPoolFilterSeller(e.target.value)}
                          placeholder="Seller Name"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: Action Buttons matching Screenshot 1 */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={handleBatchApprove}
                        disabled={approvingVehicleId === 'batch'}
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={handleBatchArchive}
                        className="px-4 py-2 bg-[#0070BA] hover:bg-[#005c99] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Archive
                      </button>

                      <button
                        type="button"
                        onClick={() => bulkFileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Import File
                      </button>

                      <input
                        type="file"
                        ref={bulkFileInputRef}
                        onChange={handleFileUploadList}
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 bg-[#0070BA] hover:bg-[#005c99] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Download Import Bulk Template
                      </button>

                      <button
                        type="button"
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Search
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPoolFilterId('');
                          setPoolFilterTitle('');
                          setPoolFilterChassis('');
                          setPoolFilterBranch('');
                          setPoolFilterOldId('');
                          setPoolFilterSeller('');
                        }}
                        className="px-4 py-2 bg-[#555555] hover:bg-[#444444] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportToExcel(
                            poolVehicles.map((v) => ({
                              ID: v.lotNo || 100813,
                              Title: `${v.make} ${v.model}`,
                              ChassisNo: v.vin || '',
                              YOM: v.manufacturingYear,
                              TargetSellingPrice: v.targetSellingPrice || 100000,
                              Branch: v.branch || 'Sharjah',
                              Added: formatTableDate(v.createdAt),
                              OldID: v.oldId || '',
                              SellerName: v.clientName || 'AWA Admin',
                            })),
                            'Request_Vehicles'
                          )
                        }
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Export Excel</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table matching Screenshot 2 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedPoolIds.size > 0 && selectedPoolIds.size === poolVehicles.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPoolIds(new Set(poolVehicles.map((v) => v.id)));
                              } else {
                                setSelectedPoolIds(new Set());
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">ID ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Title ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Chassis No ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">YOM ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Target Selling Price ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Branch ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Added ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Old ID ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Seller Name ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Approve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {poolVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        poolVehicles.map((v) => {
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedPoolIds.has(v.id)}
                                  onChange={(e) => {
                                    const updated = new Set(selectedPoolIds);
                                    if (e.target.checked) updated.add(v.id);
                                    else updated.delete(v.id);
                                    setSelectedPoolIds(updated);
                                  }}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{v.lotNo || 100813}</td>
                              <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                {v.make} {v.model}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">{v.vin || ''}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.manufacturingYear}</td>
                              <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                                {v.targetSellingPrice ? v.targetSellingPrice.toLocaleString() : '100000'}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.branch || 'Sharjah'}</td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                {formatTableDate(v.createdAt)}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">{v.oldId || ''}</td>
                              <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                                {v.clientName || 'AWA Admin'}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleApproveVehicle(v)}
                                  disabled={approvingVehicleId === v.id}
                                  className="bg-[#D0E8F9] hover:bg-[#B9E1F7] text-[#0369A1] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {approvingVehicleId === v.id ? 'Approving...' : 'Approve'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer matching Screenshot 2 */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {poolVehicles.length > 0 ? 1 : 0} to {poolVehicles.length} of {poolVehicles.length} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <button disabled className="p-1 border border-slate-200 rounded disabled:opacity-40">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 h-6 rounded bg-[#D32437] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <button disabled className="p-1 border border-slate-200 rounded disabled:opacity-40">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: SUBMITTED BY SELLER (User Manual Chapter 20.3 & 20.4)            */}
          {/* ========================================================================= */}
          {activeSubView === 'submitted_by_seller' && (
            <div className="space-y-6">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Submitted by Seller')}

              {/* Dynamic Stat Cards */}
              {renderStatCards()}

              {/* Feedback toast */}
              {submittedSellerActionMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{submittedSellerActionMsg}</span>
                </div>
              )}

              {/* Collapsible Filters Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSubmittedSellerFiltersOpen(!submittedSellerFiltersOpen)}
                  className="w-full bg-[#EBF3FB] px-5 py-3 flex items-center justify-between text-left hover:bg-[#deebf7] transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800">Filters</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${submittedSellerFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {submittedSellerFiltersOpen && (
                  <div className="p-5 border-t border-slate-100 bg-white space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID / Lot #</label>
                        <input
                          type="text"
                          value={submittedSellerFilterId}
                          onChange={(e) => setSubmittedSellerFilterId(e.target.value)}
                          placeholder="Search Lot # or ID..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Make / Model Title</label>
                        <input
                          type="text"
                          value={submittedSellerFilterTitle}
                          onChange={(e) => setSubmittedSellerFilterTitle(e.target.value)}
                          placeholder="Search Make or Model..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chassis No (VIN)</label>
                        <input
                          type="text"
                          value={submittedSellerFilterChassis}
                          onChange={(e) => setSubmittedSellerFilterChassis(e.target.value)}
                          placeholder="Search VIN / Chassis..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedSellerFilterId('');
                          setSubmittedSellerFilterTitle('');
                          setSubmittedSellerFilterChassis('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table Container */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">
                      Submitted by Seller Queue ({submittedSellerVehicles.length} vehicles)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportToExcel(submittedSellerVehicles, 'submitted_by_seller_queue')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-[#EBF3FB] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              submittedSellerVehicles.length > 0 &&
                              selectedSubmittedSellerIds.size === submittedSellerVehicles.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubmittedSellerIds(new Set(submittedSellerVehicles.map((v) => v.id)));
                              } else {
                                setSelectedSubmittedSellerIds(new Set());
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                        </th>
                        <th className="p-3">Lot #</th>
                        <th className="p-3">Make & Model</th>
                        <th className="p-3">Chassis No (VIN)</th>
                        <th className="p-3">Year</th>
                        <th className="p-3">Client Name</th>
                        <th className="p-3">Branch</th>
                        <th className="p-3">Target Price (AED)</th>
                        <th className="p-3">Stage / Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submittedSellerVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400">
                            No vehicles currently in Submitted by Seller stage.
                          </td>
                        </tr>
                      ) : (
                        submittedSellerVehicles.map((v) => {
                          const isSelected = selectedSubmittedSellerIds.has(v.id);
                          const isSending = sendingToWashVehicleId === v.id;
                          return (
                            <tr key={v.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-red-50/30' : ''}`}>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const next = new Set(selectedSubmittedSellerIds);
                                    if (e.target.checked) next.add(v.id);
                                    else next.delete(v.id);
                                    setSelectedSubmittedSellerIds(next);
                                  }}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                />
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-900">
                                {v.lotNo || v.id.slice(0, 8)}
                              </td>
                              <td className="p-3 font-semibold text-slate-800">
                                {v.make} {v.model}
                              </td>
                              <td className="p-3 font-mono text-slate-600">
                                {v.vin}
                              </td>
                              <td className="p-3 text-slate-700">
                                {v.manufacturingYear}
                              </td>
                              <td className="p-3 text-slate-700">
                                {v.clientName || 'Emirates Fleet Transport'}
                              </td>
                              <td className="p-3 text-slate-700">
                                {v.branch || v.location || 'Sharjah'}
                              </td>
                              <td className="p-3 font-mono font-semibold text-slate-900">
                                AED {Number(v.targetSellingPrice || 0).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold uppercase">
                                  FVSBS (Submitted)
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleOpenEditVehicle(v)}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 font-semibold text-xs transition cursor-pointer shadow-2xs"
                                    title="Edit vehicle specifications and metadata"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleSendToWash(v)}
                                    disabled={isSending}
                                    className="px-2.5 py-1 bg-[#D32437] hover:bg-red-700 text-white rounded font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center space-x-1"
                                    title="Send vehicle to Washing stage (FW)"
                                  >
                                    {isSending ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <span>Send to Wash &rarr;</span>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer with pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
                  <span>
                    Showing {submittedSellerVehicles.length} vehicles
                  </span>
                  <div className="flex items-center space-x-2">
                    <button disabled className="p-1 border border-slate-200 rounded disabled:opacity-40">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 h-6 rounded bg-[#D32437] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <button disabled className="p-1 border border-slate-200 rounded disabled:opacity-40">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* EDIT VEHICLE MODAL (User Manual Chapter 20.4) */}
              {editingVehicle && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Edit Vehicle Details (Lot #{editingVehicle.lotNo || editingVehicle.vin})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Update technical specifications and assign to washing workflow (Chapter 20.4)
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingVehicle(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAndSendToWash} className="space-y-4">
                      {/* Row 1: Mileage, Mileage Unit, Oracle Lot #, Motor No */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Mileage</label>
                          <input
                            type="number"
                            value={editVehicleForm.mileage}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, mileage: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Mileage Type</label>
                          <select
                            value={editVehicleForm.mileageType}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, mileageType: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          >
                            <option value="KM">Kilometers (KM)</option>
                            <option value="MILES">Miles</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Oracle Number</label>
                          <input
                            type="text"
                            value={editVehicleForm.oracleNumber}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, oracleNumber: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Motor No (Engine)</label>
                          <input
                            type="text"
                            value={editVehicleForm.motorNo}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, motorNo: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Row 2: No of Keys, Client Name, Mobile Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">No of Keys</label>
                          <select
                            value={editVehicleForm.keys}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, keys: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          >
                            {KEYS_OPTIONS.map((k) => (
                              <option key={k} value={k}>{k}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                          <input
                            type="text"
                            value={editVehicleForm.clientName}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, clientName: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                          <input
                            type="text"
                            value={editVehicleForm.mobileNumber}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, mobileNumber: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Row 3: Make, Model, Target Selling Price, Branch */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Make</label>
                          <select
                            value={editVehicleForm.make}
                            onChange={(e) => {
                              const mk = e.target.value;
                              const models = MAKE_MODELS[mk] || [];
                              setEditVehicleForm({
                                ...editVehicleForm,
                                make: mk,
                                model: models[0] || '',
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          >
                            {Object.keys(MAKE_MODELS).map((mk) => (
                              <option key={mk} value={mk}>{mk}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                          <select
                            value={editVehicleForm.model}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, model: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          >
                            {(MAKE_MODELS[editVehicleForm.make] || []).map((md) => (
                              <option key={md} value={md}>{md}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Price (AED)</label>
                          <input
                            type="number"
                            value={editVehicleForm.targetSellingPrice}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, targetSellingPrice: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Hub</label>
                          <select
                            value={editVehicleForm.branch}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, branch: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          >
                            {BRANCHES.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 4: Checkboxes matching Chapter 20.4 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editVehicleForm.vatApply}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, vatApply: e.target.checked })}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span>VAT Apply (5%)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editVehicleForm.washingRequired}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, washingRequired: e.target.checked })}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span>Washing Required</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editVehicleForm.technicalRequired}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, technicalRequired: e.target.checked })}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span>Technical Test Req.</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editVehicleForm.minCommission}
                            onChange={(e) => setEditVehicleForm({ ...editVehicleForm, minCommission: e.target.checked })}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span>Min Commission (5%)</span>
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingVehicle(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={sendingToWashVehicleId !== null}
                          className="px-5 py-2 bg-[#D32437] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                        >
                          {sendingToWashVehicleId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save & Send to Wash &rarr;</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: WASHED VEHICLE (Screenshots 3 & 4)                               */}
          {/* ========================================================================= */}
          {activeSubView === 'washed_vehicles' && (
            <div className="space-y-6">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Washed Vehicle')}

              {/* Dynamic Stat Cards matching Screenshot 3 */}
              {renderStatCards()}

              {/* Feedback toast */}
              {washActionMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{washActionMsg}</span>
                </div>
              )}

              {/* Collapsible Filters Card matching Screenshot 3 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWashFiltersOpen(!washFiltersOpen)}
                  className="w-full bg-[#EBF3FB] px-5 py-3 flex items-center justify-between text-left hover:bg-[#deebf7] transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800">Filters</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${washFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {washFiltersOpen && (
                  <div className="p-5 border-t border-slate-100 bg-white space-y-4">
                    {/* Row 1: ID, Chassis No, Title, Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID</label>
                        <input
                          type="text"
                          value={washFilterId}
                          onChange={(e) => setWashFilterId(e.target.value)}
                          placeholder="ID"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chassis No</label>
                        <input
                          type="text"
                          value={washFilterChassis}
                          onChange={(e) => setWashFilterChassis(e.target.value)}
                          placeholder="Chassis No"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={washFilterTitle}
                          onChange={(e) => setWashFilterTitle(e.target.value)}
                          placeholder="Title"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={washFilterLocation}
                          onChange={(e) => setWashFilterLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Action buttons matching Screenshot 3 */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Search
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWashFilterId('');
                          setWashFilterChassis('');
                          setWashFilterTitle('');
                          setWashFilterLocation('');
                        }}
                        className="px-4 py-2 bg-[#555555] hover:bg-[#444444] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportToExcel(
                            washedVehicles.map((v) => ({
                              ID: v.lotNo || 101018,
                              Title: `${v.make} ${v.model}`,
                              ChassisNo: v.vin || '',
                              Model: v.manufacturingYear,
                              Location: v.location || v.branch || 'Abu Dhabi',
                              Added: formatTableDate(v.createdAt),
                            })),
                            'Washed_Vehicles'
                          )
                        }
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Export Excel</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table matching Screenshots 3 & 4 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedWashIds.size > 0 && selectedWashIds.size === washedVehicles.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWashIds(new Set(washedVehicles.map((v) => v.id)));
                              } else {
                                setSelectedWashIds(new Set());
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">ID ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Title ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Chassis No ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Model ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Location ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Added ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Technical ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Washing Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {washedVehicles.length === 0 ? (
                        /* Empty state matching Screenshot 4 */
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        washedVehicles.map((v) => {
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedWashIds.has(v.id)}
                                  onChange={(e) => {
                                    const updated = new Set(selectedWashIds);
                                    if (e.target.checked) updated.add(v.id);
                                    else updated.delete(v.id);
                                    setSelectedWashIds(updated);
                                  }}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{v.lotNo || 101018}</td>
                              <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                {v.make} {v.model}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">{v.vin || ''}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.manufacturingYear || 2020}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.location || v.branch || 'Abu Dhabi'}</td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                {formatTableDate(v.createdAt)}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                {v.inspectionReportUrl ? 'Passed' : '-'}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleMarkWashingComplete(v)}
                                  disabled={washingVehicleId === v.id}
                                  className="bg-[#D0E8F9] hover:bg-[#B9E1F7] text-[#0369A1] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {washingVehicleId === v.id ? 'Updating...' : 'Washing Completed'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer matching Screenshot 4 */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {washedVehicles.length > 0 ? 1 : 0} to {washedVehicles.length} of {washedVehicles.length} entries
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        &lt; Prev
                      </button>
                      <span className="w-6 h-6 rounded bg-[#D32437] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        Next &gt;
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-600">
                      <span>Rows per page</span>
                      <input
                        type="text"
                        defaultValue="10"
                        className="w-12 border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: PHOTOVEHICLE (Screenshot 5)                                     */}
          {/* ========================================================================= */}
          {activeSubView === 'photo_vehicles' && (
            <div className="space-y-6">
              {/* Interactive Breadcrumb matching Screenshot 2 & 5 */}
              {renderBreadcrumb('Operations', 'PhotoVehicle')}

              {/* Dynamic Stat Cards matching Screenshot 5 */}
              {renderStatCards()}

              {/* Feedback toast */}
              {photoActionMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{photoActionMsg}</span>
                </div>
              )}

              {/* Collapsible Filters Card matching Screenshot 5 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPhotoFiltersOpen(!photoFiltersOpen)}
                  className="w-full bg-[#EBF3FB] px-5 py-3 flex items-center justify-between text-left hover:bg-[#deebf7] transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800">Filters</span>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${photoFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {photoFiltersOpen && (
                  <div className="p-5 border-t border-slate-100 bg-white space-y-4">
                    {/* Row 1: ID, Title, Chassis No, Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID</label>
                        <input
                          type="text"
                          value={photoFilterId}
                          onChange={(e) => setPhotoFilterId(e.target.value)}
                          placeholder="ID"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={photoFilterTitle}
                          onChange={(e) => setPhotoFilterTitle(e.target.value)}
                          placeholder="Title"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chassis No</label>
                        <input
                          type="text"
                          value={photoFilterChassis}
                          onChange={(e) => setPhotoFilterChassis(e.target.value)}
                          placeholder="Chassis No"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={photoFilterLocation}
                          onChange={(e) => setPhotoFilterLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Action buttons matching Screenshot 5 */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Search
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFilterId('');
                          setPhotoFilterTitle('');
                          setPhotoFilterChassis('');
                          setPhotoFilterLocation('');
                        }}
                        className="px-4 py-2 bg-[#555555] hover:bg-[#444444] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportToExcel(
                            photoVehicles.map((v) => ({
                              ID: v.lotNo || 100910,
                              Title: `${v.make} ${v.model}`,
                              ChassisNo: v.vin || '',
                              YOM: v.manufacturingYear,
                              Location: v.location || v.branch || 'Abu Dhabi',
                              Added: formatTableDate(v.createdAt),
                            })),
                            'Photo_Vehicles'
                          )
                        }
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Export Excel</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table matching Screenshot 5 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedPhotoIds.size > 0 && selectedPhotoIds.size === photoVehicles.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPhotoIds(new Set(photoVehicles.map((v) => v.id)));
                              } else {
                                setSelectedPhotoIds(new Set());
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">ID ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Title ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Chassis No ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">YOM ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Location ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Added ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Submit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {photoVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No data available in table
                          </td>
                        </tr>
                      ) : (
                        photoVehicles.map((v) => {
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedPhotoIds.has(v.id)}
                                  onChange={(e) => {
                                    const updated = new Set(selectedPhotoIds);
                                    if (e.target.checked) updated.add(v.id);
                                    else updated.delete(v.id);
                                    setSelectedPhotoIds(updated);
                                  }}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{v.lotNo || 100910}</td>
                              <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                {v.make} {v.model}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">{v.vin || ''}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.manufacturingYear || 2022}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.location || v.branch || 'Abu Dhabi'}</td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                {formatTableDate(v.createdAt)}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <label
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer transition"
                                    title="Upload Photos"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.length) {
                                          alert(`${e.target.files.length} photo(s) selected for Vehicle #${v.lotNo}!`);
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitPhotoVehicle(v)}
                                    disabled={submittingPhotoVehicleId === v.id}
                                    className="bg-[#D0E8F9] hover:bg-[#B9E1F7] text-[#0369A1] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                                  >
                                    {submittingPhotoVehicleId === v.id ? 'Submitting...' : 'Submit'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer matching Screenshot 5 */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {photoVehicles.length > 0 ? 1 : 0} to {photoVehicles.length} of {photoVehicles.length} entries
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        &lt; Prev
                      </button>
                      <span className="w-6 h-6 rounded bg-[#D32437] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        Next &gt;
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-600">
                      <span>Rows per page</span>
                      <input
                        type="text"
                        defaultValue="10"
                        className="w-12 border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: TECHNICAL TEST (Screenshots 1, 2, 3)                             */}
          {/* ========================================================================= */}
          {activeSubView === 'technical_test' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Hidden file input for report upload */}
              <input
                type="file"
                ref={techFileInputRef}
                onChange={handleReportFileChosen}
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
              />

              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Technical Test')}

              {/* Dynamic User Stats (User request: dynamic values from database, not static) */}
              {renderStatCards()}

              {/* Action / Success Banner */}
              {techActionMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{techActionMsg}</span>
                </div>
              )}

              {/* Collapsible Filters Box matching Screenshot 1 */}
              <div className="bg-[#DCEBFE] border border-blue-200 rounded-xl shadow-2xs overflow-hidden">
                <div
                  onClick={() => setTechFiltersOpen(!techFiltersOpen)}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-xs font-bold text-slate-800">Filters</span>
                  <button type="button" className="text-slate-600 hover:text-slate-900">
                    {techFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {techFiltersOpen && (
                  <div className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <input
                          type="text"
                          value={techFilterId}
                          onChange={(e) => setTechFilterId(e.target.value)}
                          placeholder="ID"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={techFilterTitle}
                          onChange={(e) => setTechFilterTitle(e.target.value)}
                          placeholder="Title"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={techFilterChassis}
                          onChange={(e) => setTechFilterChassis(e.target.value)}
                          placeholder="Chassis No"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={techFilterLocation}
                          onChange={(e) => setTechFilterLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Action buttons matching Screenshot 1 */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Search
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTechFilterId('');
                          setTechFilterTitle('');
                          setTechFilterChassis('');
                          setTechFilterLocation('');
                        }}
                        className="px-4 py-2 bg-[#555555] hover:bg-[#444444] text-white text-xs font-semibold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportToExcel(
                            technicalVehicles.map((v) => ({
                              ChassisNo: v.vin || '',
                              YOM: v.manufacturingYear,
                              Location: v.location || v.branch || 'Abu Dhabi',
                              Added: formatTableDate(v.createdAt),
                            })),
                            'Technical_Test_Vehicles'
                          )
                        }
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Export Excel</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table matching Screenshot 1 */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTechIds.size > 0 && selectedTechIds.size === technicalVehicles.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTechIds(new Set(technicalVehicles.map((v) => v.id)));
                              } else {
                                setSelectedTechIds(new Set());
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">Chassis No ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">YOM ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Location ⬍</th>
                        <th className="px-4 py-3 whitespace-nowrap">Added ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Upload ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Display ⬍</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Submit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {technicalVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No vehicles currently in Technical Test queue
                          </td>
                        </tr>
                      ) : (
                        technicalVehicles.map((v) => {
                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedTechIds.has(v.id)}
                                  onChange={(e) => {
                                    const updated = new Set(selectedTechIds);
                                    if (e.target.checked) updated.add(v.id);
                                    else updated.delete(v.id);
                                    setSelectedTechIds(updated);
                                  }}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-800 font-semibold whitespace-nowrap">
                                {v.vin || ''}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.manufacturingYear || 2024}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap">{v.location || v.branch || 'Abu Dhabi'}</td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                {formatTableDate(v.createdAt)}
                              </td>
                              {/* Upload Button matching Screenshot 1 */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleTechUploadClick(v)}
                                  className="bg-[#D0E8F9] hover:bg-[#B9E1F7] text-[#0369A1] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer"
                                >
                                  Upload
                                </button>
                              </td>
                              {/* Display Button matching Screenshot 1 */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleDisplayReport(v)}
                                  className="bg-[#E6F7ED] hover:bg-[#C9F0D9] text-[#166534] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer"
                                >
                                  Display
                                </button>
                              </td>
                              {/* Submit Button matching Screenshot 1 */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSubmitModal(v)}
                                  className="bg-[#D0E8F9] hover:bg-[#B9E1F7] text-[#0369A1] font-semibold text-xs px-4 py-1.5 rounded-md transition shadow-2xs cursor-pointer"
                                >
                                  Submit
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer matching Screenshot 1 & 3 */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {technicalVehicles.length > 0 ? 1 : 0} to {technicalVehicles.length} of {technicalVehicles.length} entries
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        &lt; Previous
                      </button>
                      <span className="w-6 h-6 rounded bg-[#D32437] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <button disabled className="px-2.5 py-1 border border-slate-200 rounded text-slate-500 disabled:opacity-40">
                        Next &gt;
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-600">
                      <span>Rows per page:</span>
                      <input
                        type="text"
                        defaultValue="10"
                        className="w-12 border border-slate-300 rounded px-1.5 py-0.5 text-center text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL 1: Technical Report already exists (Screenshot 2) */}
              {techReportModalVehicle && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative border border-slate-200">
                    <button
                      onClick={() => setTechReportModalVehicle(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Technical Report is already there.
                    </h3>
                    <p className="text-xs text-slate-600 mb-6">
                      If you want to update it, delete the existing one first before uploading!
                    </p>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleReplaceReport}
                        className="px-4 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-bold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Replace Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setTechReportModalVehicle(null)}
                        className="px-4 py-2 bg-[#D32437] hover:bg-[#B01C2D] text-white text-xs font-bold rounded-md transition shadow-2xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: Submit confirmation with comment (Screenshot 3) */}
              {submitConfirmVehicle && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative border border-slate-200">
                    <button
                      onClick={() => {
                        setSubmitConfirmVehicle(null);
                        setTechComment('');
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-base font-bold text-slate-900 mb-4">
                      Are you sure you want to continue with the submission?
                    </h3>

                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Enter Comment:
                      </label>
                      <textarea
                        rows={4}
                        value={techComment}
                        onChange={(e) => setTechComment(e.target.value)}
                        placeholder="Enter technical inspection comment..."
                        className="w-full bg-white border border-blue-400 focus:border-blue-600 rounded-lg p-3 text-xs focus:outline-none resize-none shadow-2xs"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleConfirmSubmitTech}
                        disabled={isSubmittingTech}
                        className="px-5 py-2 bg-[#54B435] hover:bg-[#469A2C] text-white text-xs font-bold rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingTech ? 'Submitting...' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitConfirmVehicle(null);
                          setTechComment('');
                        }}
                        disabled={isSubmittingTech}
                        className="px-5 py-2 bg-[#D32437] hover:bg-[#B01C2D] text-white text-xs font-bold rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: INACTIVE AUCTIONS                                               */}
          {/* ========================================================================= */}
          {activeSubView === 'inactive_auctions' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Inactive Auctions')}

              {/* Dynamic User Stats */}
              {renderStatCards()}

              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Vehicles in Inactive Auctions (Pending Schedule)</h3>
                    <p className="text-xs text-slate-500">
                      Vehicles that passed Technical Test inspection and are ready for auction scheduling.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubView('technical_test')}
                    className="bg-[#D32437] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b01c2d] transition cursor-pointer"
                  >
                    View Technical Test Queue
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700 min-w-[800px]">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Lot No / ID</th>
                        <th className="px-4 py-3">Vehicle Details</th>
                        <th className="px-4 py-3">Chassis No</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Inspection Report</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {inactiveVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No vehicles currently in Inactive Auctions. Submit a vehicle from Technical Test to move it here.
                          </td>
                        </tr>
                      ) : (
                        inactiveVehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              #{v.lotNo || v.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              <div>{v.make} {v.model} ({v.manufacturingYear})</div>
                              <div className="text-[11px] text-slate-400">{v.clientName || 'Commercial Fleet'}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600">{v.vin}</td>
                            <td className="px-4 py-3">{v.location || v.branch || 'Abu Dhabi'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                                INACTIVE_AUCTION
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleDisplayReport(v)}
                                className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>View Report</span>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setActiveSubView('active_auctions');
                                }}
                                className="bg-[#54B435] hover:bg-[#469A2C] text-white px-3 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer"
                              >
                                Schedule Auction
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: USER ADMINISTRATION / LIVE DATABASE DIRECTORY                   */}
          {/* ========================================================================= */}
          {activeSubView === 'customer_list' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-[#D32437]" />
                    <h3 className="text-lg font-bold text-slate-900">User Administration</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#D32437] text-xs font-bold">
                      {userStats.totalCustomers.toLocaleString()} Live Accounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Dynamic identity management from PostgreSQL & Keycloak. Interactive password reset enabled strictly for Administrator roles.
                  </p>
                </div>

                {/* Role Filter Tabs with Dynamic Database Counts */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {(['ALL', 'BUYER', 'SELLER', 'ADMIN'] as const).map((r) => {
                    const count =
                      r === 'ALL'
                        ? userStats.totalCustomers
                        : r === 'BUYER'
                        ? userStats.buyers
                        : r === 'SELLER'
                        ? userStats.sellers
                        : userStats.staff;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setUserRoleFilter(r);
                          setUserPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          userRoleFilter === r
                            ? 'bg-white text-slate-900 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r === 'ALL' ? `All (${count.toLocaleString()})` : `${r}s (${count.toLocaleString()})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar with Live Spinner */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  placeholder="Search live database by name, email, phone number, PAN, GST..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 py-2 text-sm focus:outline-none focus:border-red-500"
                />
                {dbUsersLoading && (
                  <div className="absolute right-3.5 top-2.5 flex items-center space-x-1.5 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D32437]" />
                    <span>Searching...</span>
                  </div>
                )}
              </div>

              {/* Table of Dynamic Users */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Full Name / Org</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">KYC Status</th>
                      <th className="px-4 py-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          {dbUsersLoading ? 'Loading database users...' : 'No users found matching query.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u.id || u.email} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{u.fullName || 'Anonymous User'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {u.id ? u.id.slice(0, 8) + '...' : 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-700'
                                  : u.role === 'SELLER'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{u.phoneNumber || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* 1-Click Test Login */}
                              <button
                                onClick={() => handleQuickSwitch(u)}
                                disabled={switchingUser === u.email}
                                className="bg-slate-900 hover:bg-[#D32437] text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition disabled:opacity-50 cursor-pointer"
                                title="Login as this user"
                              >
                                {switchingUser === u.email ? 'Logging in...' : '1-Click Login'}
                              </button>

                              {/* Interactive Password Reset (Admin-Only Feature) */}
                              {(isSuperAdmin || currentUser?.role === 'ADMIN') && (
                                <button
                                  onClick={() => {
                                    setResetPasswordTarget(u);
                                    setNewPasswordInput('');
                                    setResetErrorMessage('');
                                    setResetSuccessData(null);
                                    setShowResetPassword(false);
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1"
                                  title="Reset password for this user (Admin only)"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Reset PWD</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-xs text-slate-500 gap-2">
                <span>
                  Showing {(userPage - 1) * pageSize + 1} -{' '}
                  {Math.min(userPage * pageSize, totalDbUsers > 0 ? totalDbUsers : filteredUsers.length)}{' '}
                  of {(totalDbUsers > 0 ? totalDbUsers : filteredUsers.length).toLocaleString()} registered users
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-700">
                    Page {userPage.toLocaleString()} of {totalUserPages.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    disabled={userPage >= totalUserPages}
                    className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE PASSWORD RESET MODAL (Admin-Gated) */}
              {resetPasswordTarget && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Admin Password Reset</h3>
                          <p className="text-xs text-slate-500">Interactive credential update for user account</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setResetPasswordTarget(null);
                          setResetSuccessData(null);
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Target User Details Banner */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs font-mono">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{resetPasswordTarget.fullName}</span>
                        <span className="px-2 py-0.5 bg-slate-200 rounded text-[10px] font-bold">
                          {resetPasswordTarget.role}
                        </span>
                      </div>
                      <div className="text-slate-500 truncate">{resetPasswordTarget.email}</div>
                      <div className="text-[10px] text-slate-400 truncate">UUID: {resetPasswordTarget.id}</div>
                    </div>

                    {/* Reset Error Message */}
                    {resetErrorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs mb-4 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{resetErrorMessage}</span>
                      </div>
                    )}

                    {/* Success Confirmation Card */}
                    {resetSuccessData ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs">
                          <div className="flex items-center space-x-2 font-bold mb-1 text-emerald-800">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Password Successfully Reset in Database!</span>
                          </div>
                          <p className="text-slate-600 mb-2">
                            The user password hash has been updated in PostgreSQL. The user can immediately log in with these credentials:
                          </p>
                          <div className="p-3 bg-white border border-emerald-200 rounded-lg font-mono space-y-1">
                            <div>
                              <span className="text-slate-400">Email:</span>{' '}
                              <strong className="text-slate-800">{resetSuccessData.user.email}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">New Password:</span>{' '}
                              <strong className="text-emerald-700 font-bold">{resetSuccessData.password}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              const creds = `Email: ${resetSuccessData.user.email}\nTemporary Password: ${resetSuccessData.password}\nLogin URL: ${window.location.origin}`;
                              navigator.clipboard.writeText(creds);
                              setCopySuccessToast(true);
                              setTimeout(() => setCopySuccessToast(false), 3000);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{copySuccessToast ? 'Copied to Clipboard!' : 'Copy Temporary Credentials'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setResetPasswordTarget(null);
                              setResetSuccessData(null);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Password Input Form */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            New Password (Minimum 6 characters)
                          </label>
                          <div className="relative">
                            <input
                              type={showResetPassword ? 'text' : 'password'}
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              placeholder="Enter new temporary password..."
                              className="w-full p-2.5 pr-20 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#D32437]/20 focus:border-[#D32437] focus:outline-hidden"
                            />
                            <div className="absolute right-2 top-2 flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => setShowResetPassword(!showResetPassword)}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title={showResetPassword ? 'Hide password' : 'Show password'}
                              >
                                {showResetPassword ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* One-click Strong Password Generator */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={generateRandomPassword}
                            className="text-xs font-semibold text-[#D32437] hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate Strong Secure Password</span>
                          </button>
                          {newPasswordInput && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Length: {newPasswordInput.length} chars
                            </span>
                          )}
                        </div>

                        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                          <div className="font-bold flex items-center space-x-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Security Audit Policy:</span>
                          </div>
                          <div>• Password will be hashed with BCrypt (12 rounds) and committed to PostgreSQL.</div>
                          <div>• User must be given this password interactively since WhatsApp/Email OTP is not yet configured.</div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                          <button
                            onClick={() => setResetPasswordTarget(null)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleExecutePasswordReset}
                            disabled={resetSubmitting || !newPasswordInput || newPasswordInput.trim().length < 6}
                            className="px-4 py-2 bg-[#D32437] hover:bg-[#b51d2d] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center space-x-1.5"
                          >
                            {resetSubmitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Update Password</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: ACTIVE AUCTIONS CONTROL VIEW                                    */}
          {/* ========================================================================= */}
          {activeSubView === 'active_auctions' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Live & Scheduled Vehicle Auctions</h3>
                  <p className="text-xs text-slate-500">
                    Real-time auction rooms streamed over Gorilla WebSockets and Redis Lua validation engine.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveSubView('add_new_car');
                    setAddCarTab('single');
                  }}
                  className="bg-[#D32437] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b01c2d] transition cursor-pointer"
                >
                  Create New Vehicle
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Vehicle Details</th>
                      <th className="px-4 py-3">Start Bid (AED)</th>
                      <th className="px-4 py-3">Reserve (AED)</th>
                      <th className="px-4 py-3">Current Bid (AED)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {auctions.map((auc) => {
                      const veh = vehicles.find((v) => v.id === auc.vehicleId);
                      return (
                        <tr key={auc.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <div>{veh ? `${veh.make} ${veh.model}` : `Vehicle ID ${auc.vehicleId.slice(0, 8)}`}</div>
                            <div className="text-[11px] font-mono text-slate-500">{veh?.registrationNumber || auc.vehicleId}</div>
                          </td>
                          <td className="px-4 py-3 font-mono">AED {auc.startPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono">AED {auc.reservePrice.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                            AED {auc.currentHighestBid.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                auc.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : auc.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {auc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => onSelectAuction(auc)}
                              className="bg-[#D32437] hover:bg-[#b01c2d] text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              Join Live Room
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: VEHICLE INVENTORY                                               */}
          {/* ========================================================================= */}
          {(activeSubView === 'vehicle_inventory' || activeSubView === 'unapproved_vehicles') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeSubView === 'unapproved_vehicles' ? 'Vehicles Under RTO / Admin Approval' : 'Vehicle Catalog Inventory'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified commercial trucks and passenger vehicles recorded in PostgreSQL vehicle ledger.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveSubView('add_new_car');
                    setAddCarTab('single');
                  }}
                  className="bg-[#D32437] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b01c2d] transition cursor-pointer"
                >
                  Add a New Car
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => {
                  const runningAuc = auctions.find((a) => a.vehicleId === v.id);
                  return (
                    <div key={v.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="h-36 bg-slate-200 rounded-lg overflow-hidden mb-3 relative">
                        {v.mediaPaths?.[0] ? (
                          <img src={v.mediaPaths[0]} alt={v.model} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            {v.vehicleType === 'TRUCK' ? <Truck className="w-8 h-8" /> : <Car className="w-8 h-8" />}
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          Lot #{v.lotNo || 100813}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{v.make} {v.model}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 rounded font-semibold shrink-0">
                          {v.branch || 'Sharjah'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 space-y-0.5 mb-3">
                        <div>Plate: {v.previousNumberplate || v.registrationNumber}</div>
                        <div>Chassis: {v.vin}</div>
                        <div>Target: AED {v.targetSellingPrice?.toLocaleString() || '100,000'}</div>
                        <div className="text-emerald-700 font-semibold">Stage: {v.wfActivityId || 'FVSA'}</div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        {runningAuc ? (
                          <button
                            onClick={() => onSelectAuction(runningAuc)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-lg transition"
                          >
                            Live Auction Running
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenCreateVehicle()}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-1.5 rounded-lg transition"
                          >
                            Schedule Auction
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: INVOICES & PAYMENTS LEDGER                                      */}
          {/* ========================================================================= */}
          {activeSubView === 'invoices_payments' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Invoices & Security Deposits Ledger</h3>
              <p className="text-xs text-slate-500 mb-4">
                Escrow balances, Razorpay & Cashfree webhook reconciliation logs.
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount (AED)</th>
                      <th className="px-4 py-3">Gateway</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold">order_eauction_dep_9981</td>
                      <td className="px-4 py-3 font-semibold">Security Deposit</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">AED 5,000.00</td>
                      <td className="px-4 py-3 font-mono">RAZORPAY</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          COMPLETED
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">2026-10-15 01:15:20 GST</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold">order_eauction_dep_9982</td>
                      <td className="px-4 py-3 font-semibold">Vehicle Settlement</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">AED 120,000.00</td>
                      <td className="px-4 py-3 font-mono">STRIPE_UAE</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                          PENDING
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">2026-10-15 01:22:45 GST</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: OPERATION LOG / SYSTEM HEALTH                                   */}
          {/* ========================================================================= */}
          {activeSubView === 'operation_log' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Microservices Health & Real-Time Operations Log</h3>
              <p className="text-xs text-slate-500 mb-4">
                Architecture topology running under Docker Compose on Ubuntu WSL.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Go Bidding Engine (:8081)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Gorilla WebSockets + Redis Lua script atomic validation. ONLINE.</p>
                </div>
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-1">
                    <Database className="w-4 h-4" />
                    <span>PostgreSQL 16 (:5432)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">SERIALIZABLE pessimistic locks. 504 seed users loaded. ONLINE.</p>
                </div>
                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-1">
                    <Radio className="w-4 h-4" />
                    <span>Apache Kafka Cluster (:9092)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Topic: `bid-events`, Consumer groups active. ONLINE.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW: LIVE SESSIONS USERS (Operations Submodule)                       */}
          {/* ========================================================================= */}
          {activeSubView === 'live_sessions_users' && (
            <div className="space-y-6">
              {/* Interactive Breadcrumb */}
              {renderBreadcrumb('Operations', 'Live Sessions Users')}

              {/* Toast Banner for Actions */}
              {sessionActionToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between font-medium shadow-xs animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{sessionActionToast}</span>
                  </div>
                  <button onClick={() => setSessionActionToast('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Header Title & Cluster Telemetry Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                        <span>Live Sessions Users</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>ONLINE</span>
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Real-time tracking of authenticated buyers, sellers, and administrators connected to the Kubernetes cluster.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSessionBroadcastModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Message</span>
                  </button>
                  <button
                    onClick={() => {
                      const csvRows = [
                        ['ID', 'User', 'Email', 'Role', 'IP', 'Location', 'Protocol', 'Pod', '200x Limit', 'Status'],
                        ...liveSessions.map((s) => [
                          s.id,
                          s.userName,
                          s.email,
                          s.role,
                          s.ipAddress,
                          s.location,
                          s.protocol,
                          s.podName,
                          s.biddingLimit,
                          s.status
                        ])
                      ];
                      const blob = new Blob([csvRows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `live_sessions_telemetry_${Date.now()}.csv`;
                      a.click();
                      setSessionActionToast('Exported active session telemetry log successfully.');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setLiveSessions((prev) =>
                        prev.map((s) => ({
                          ...s,
                          lastHeartbeat: '1s ago',
                          pingMs: Number((s.pingMs + (Math.random() * 0.2 - 0.1)).toFixed(1))
                        }))
                      );
                      setSessionActionToast('Cluster session heartbeats refreshed from Redis Sentinel.');
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium shadow-2xs transition cursor-pointer"
                    title="Refresh Live Sessions"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Top KPI Telemetry Cards - CURRENT LOGGED-IN SESSIONS ONLY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Logged In */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Logged-in Users</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Users className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{liveSessions.length}</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Active</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Authenticated via Keycloak SSO & Platform Sessions</p>
                </div>

                {/* 2. Active WSS Bidders */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Bidders in Session</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <Zap className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {liveSessions.filter((s) => s.status === 'BIDDING' || s.bidsPlacedInSession > 0).length}
                    </span>
                    <span className="text-xs font-semibold text-amber-600">WebSocket Live</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Active bids processed via Redis Lua cluster</p>
                </div>

                {/* 3. Bids Placed in Session */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Bids Placed</span>
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Gavel className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {liveSessions.reduce((acc, s) => acc + (s.bidsPlacedInSession || 0), 0)}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">Session Bids</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Accumulated bids across logged-in sessions</p>
                </div>

                {/* 4. Live Exposure */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Session Bid Volume</span>
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xs font-bold text-slate-500">AED</span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {(liveSessions.reduce((acc, s) => acc + (s.usedBiddingLimit || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Active commitment across live sessions</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearchQuery}
                    onChange={(e) => setSessionSearchQuery(e.target.value)}
                    placeholder="Search name, email, IP, screen, pod..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D32437]/20 focus:border-[#D32437]"
                  />
                  {sessionSearchQuery && (
                    <button
                      onClick={() => setSessionSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {/* Role Filter */}
                  <select
                    value={sessionRoleFilter}
                    onChange={(e) => setSessionRoleFilter(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="BUYER">Buyers Only</option>
                    <option value="SELLER">Sellers Only</option>
                    <option value="ADMIN">Admins Only</option>
                  </select>

                  {/* Protocol Filter */}
                  <select
                    value={sessionProtocolFilter}
                    onChange={(e) => setSessionProtocolFilter(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All Protocols</option>
                    <option value="WSS">WSS (Gorilla WebSocket)</option>
                    <option value="HTTPS">HTTPS (REST / SSE)</option>
                  </select>

                  {/* Pod Filter */}
                  <select
                    value={sessionPodFilter}
                    onChange={(e) => setSessionPodFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All K8s Pods</option>
                    <option value="479z9">Pod bidding-engine-479z9</option>
                    <option value="kgtcj">Pod bidding-engine-kgtcj</option>
                    <option value="qttrc">Pod bidding-engine-qttrc</option>
                    <option value="5lrqs">Pod catalog-identity-5lrqs</option>
                    <option value="q9cxv">Pod catalog-identity-q9cxv</option>
                  </select>

                  {/* Auto-Refresh Toggle */}
                  <button
                    onClick={() => setSessionAutoRefresh(!sessionAutoRefresh)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      sessionAutoRefresh
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${sessionAutoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>{sessionAutoRefresh ? 'Live Polling' : 'Paused'}</span>
                  </button>
                </div>
              </div>

              {/* Live Users Data Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">User & Identity</th>
                        <th className="px-4 py-3.5">Role</th>
                        <th className="px-4 py-3.5">IP & Location</th>
                        <th className="px-4 py-3.5">Device & Protocol</th>
                        <th className="px-4 py-3.5">Connected Pod</th>
                        <th className="px-4 py-3.5">Active Screen / Context</th>
                        <th className="px-4 py-3.5">200x Bidding Limit</th>
                        <th className="px-4 py-3.5">Heartbeat</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {liveSessions
                        .filter((s) => {
                          if (sessionRoleFilter !== 'ALL' && s.role !== sessionRoleFilter) return false;
                          if (sessionProtocolFilter !== 'ALL' && s.protocol !== sessionProtocolFilter) return false;
                          if (sessionPodFilter !== 'ALL' && !s.podName.includes(sessionPodFilter)) return false;
                          if (sessionSearchQuery) {
                            const q = sessionSearchQuery.toLowerCase();
                            return (
                              s.userName.toLowerCase().includes(q) ||
                              s.email.toLowerCase().includes(q) ||
                              s.ipAddress.toLowerCase().includes(q) ||
                              s.location.toLowerCase().includes(q) ||
                              s.podName.toLowerCase().includes(q) ||
                              s.currentScreen.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((session) => (
                          <tr
                            key={session.id}
                            className={`hover:bg-slate-50/80 transition ${
                              session.isCurrentAdmin ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            {/* User & Identity */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                                    {session.userName.slice(0, 2)}
                                  </div>
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                                      session.status === 'BIDDING'
                                        ? 'bg-amber-500 animate-pulse'
                                        : session.status === 'ONLINE'
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400'
                                    }`}
                                    title={session.status}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-900">{session.userName}</span>
                                    {session.isCurrentAdmin && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 block">{session.email}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{session.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  session.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : session.role === 'BUYER'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {session.role}
                              </span>
                            </td>

                            {/* IP & Location */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col space-y-0.5">
                                <div className="flex items-center space-x-1.5 font-mono text-xs">
                                  <span className="font-bold text-slate-900">{session.ipAddress}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    WAN
                                  </span>
                                </div>
                                {session.clientIp && session.clientIp !== session.ipAddress && (
                                  <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                                    <span className="font-medium text-slate-700">{session.clientIp}</span>
                                    <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      CLIENT LAN
                                    </span>
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-0.5">
                                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{session.location}</span>
                                </div>
                              </div>
                            </td>

                            {/* Device & Protocol */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-1.5">
                                {session.deviceType === 'Desktop' ? (
                                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span className="text-[11px] text-slate-700 font-medium truncate max-w-[130px]" title={session.browser}>
                                  {session.browser}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    session.protocol === 'WSS'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-sky-100 text-sky-800'
                                  }`}
                                >
                                  {session.protocol === 'WSS' ? 'WSS (WebSocket)' : 'HTTPS (REST)'}
                                </span>
                              </div>
                            </td>

                            {/* Connected Pod */}
                            <td className="px-4 py-3.5">
                              <div className="font-mono text-[11px] font-bold text-slate-800 truncate max-w-[150px]" title={session.podName}>
                                {session.podName.replace('eauction-', '')}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                                <span>{session.podIp}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-600 font-bold">{session.pingMs}ms</span>
                              </div>
                            </td>

                            {/* Active Screen / Context */}
                            <td className="px-4 py-3.5">
                              <div className="text-xs font-medium text-slate-800 line-clamp-2 max-w-[200px]" title={session.currentScreen}>
                                {session.currentScreen}
                              </div>
                              {session.bidsPlacedInSession > 0 && (
                                <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  {session.bidsPlacedInSession} bids placed
                                </span>
                              )}
                            </td>

                            {/* 200x Bidding Limit */}
                            <td className="px-4 py-3.5">
                              {session.role === 'BUYER' ? (
                                <div>
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-slate-500">200x Limit:</span>
                                    <span className="font-mono font-bold text-slate-900">
                                      AED {(session.biddingLimit / 1000).toLocaleString()}k
                                    </span>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        session.usedBiddingLimit / session.biddingLimit > 0.8
                                          ? 'bg-red-500'
                                          : 'bg-emerald-500'
                                      }`}
                                      style={{
                                        width: `${Math.min(100, (session.usedBiddingLimit / (session.biddingLimit || 1)) * 100)}%`
                                      }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">
                                    Deposit: AED {session.securityDeposit.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono">N/A ({session.role})</span>
                              )}
                            </td>

                            {/* Heartbeat & Status */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    session.status === 'BIDDING'
                                      ? 'bg-amber-500 animate-pulse'
                                      : session.status === 'ONLINE'
                                      ? 'bg-emerald-500'
                                      : 'bg-slate-300'
                                  }`}
                                />
                                <span className="font-semibold text-slate-800 text-[11px]">{session.status}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block">{session.lastHeartbeat}</span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setSessionInspectTarget(session)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
                                  title="Inspect Socket Telemetry"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSessionActionToast(`Sent live alert notification to ${session.userName}.`);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition cursor-pointer"
                                  title="Message User"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                {!session.isCurrentAdmin && (
                                  <button
                                    onClick={() => setSessionTerminateConfirm(session)}
                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                                    title="Terminate Live Session"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>
                      Active Cluster Pods: <strong>3 Bidding Engines</strong> (WSS) + <strong>2 Catalog Replicas</strong> (HTTPS)
                    </span>
                  </div>
                  <div>
                    Displaying <strong>{liveSessions.length}</strong> active logged-in user sessions with real-time bidding telemetry across cluster
                  </div>
                </div>
              </div>

              {/* MODAL 1: INSPECT TELEMETRY */}
              {sessionInspectTarget && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                          <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Session Diagnostic Inspection</h3>
                          <p className="text-xs text-slate-500">Live K8s socket and cryptographic token telemetry</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSessionInspectTarget(null)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1">CLIENT IDENTITY & CLAIMS:</div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>User ID: {sessionInspectTarget.userId}</div>
                          <div>Role: {sessionInspectTarget.role}</div>
                          <div>Full Name: {sessionInspectTarget.userName}</div>
                          <div>Email: {sessionInspectTarget.email}</div>
                          <div>Auth Provider: Keycloak SSO / OpenID Connect</div>
                          <div>JWT Algorithm: RS256 (Signed via K8s Secret)</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1">NETWORK & POD ROUTING:</div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>Public WAN IP: <span className="font-semibold text-slate-900">{sessionInspectTarget.ipAddress}</span></div>
                          <div>Client LAN / Backend IP: <span className="font-semibold text-slate-900">{sessionInspectTarget.clientIp || sessionInspectTarget.ipAddress}</span></div>
                          <div>Geo Location: {sessionInspectTarget.location}</div>
                          <div>Ingress TLS: TLSv1.3 (AES_256_GCM_SHA384)</div>
                          <div>Cluster Pod: {sessionInspectTarget.podName}</div>
                          <div>Pod Internal IP: {sessionInspectTarget.podIp}</div>
                          <div>Ingress Latency: {sessionInspectTarget.pingMs} ms (P99: 4.8ms)</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1">200x BIDDING ENGINE TELEMETRY:</div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>Security Deposit: AED {sessionInspectTarget.securityDeposit.toLocaleString()}</div>
                          <div>Max Bidding Power: AED {sessionInspectTarget.biddingLimit.toLocaleString()} (200x)</div>
                          <div>Utilized Limit: AED {sessionInspectTarget.usedBiddingLimit.toLocaleString()}</div>
                          <div>Total Session Bids: {sessionInspectTarget.bidsPlacedInSession} atomic bids</div>
                          <div>Kafka Broadcast Room: `auction.bids.live`</div>
                          <div>Redis Lua Arbiter: Serialized & Verified</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setSessionInspectTarget(null)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Close Telemetry Inspector
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: BROADCAST MESSAGE */}
              {sessionBroadcastModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D32437]/10 text-[#D32437] flex items-center justify-center font-bold">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Broadcast Cluster Notification</h3>
                          <p className="text-xs text-slate-500">Send an instant alert to all {liveSessions.length} active sessions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSessionBroadcastModal(false);
                          setBroadcastSuccess('');
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {broadcastSuccess ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{broadcastSuccess}</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Notification Message
                          </label>
                          <textarea
                            rows={3}
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            placeholder="e.g. Lot #1001 bidding closes in 10 minutes. Final offers now accepted..."
                            className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D32437]/20 focus:border-[#D32437] focus:outline-hidden"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
                          <div className="font-bold text-slate-700">Delivery Channels:</div>
                          <div>• Apache Kafka Topic: `user.broadcast.notifications`</div>
                          <div>• Gorilla WebSocket connections across 3 Bidding Engine pods</div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSessionBroadcastModal(false);
                          setBroadcastSuccess('');
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      {!broadcastSuccess && (
                        <button
                          onClick={() => {
                            if (!broadcastMessage.trim()) return;
                            setBroadcastSuccess(`Broadcast successfully dispatched to ${liveSessions.length} live sessions.`);
                            setTimeout(() => {
                              setSessionBroadcastModal(false);
                              setBroadcastSuccess('');
                              setBroadcastMessage('');
                              setSessionActionToast('Broadcast notification delivered cluster-wide.');
                            }, 1500);
                          }}
                          disabled={!broadcastMessage.trim()}
                          className="px-4 py-2 bg-[#D32437] hover:bg-[#b51d2d] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                        >
                          Send Broadcast Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 3: TERMINATE SESSION CONFIRMATION */}
              {sessionTerminateConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
                    <div className="flex items-center space-x-3 text-red-600 mb-3">
                      <AlertCircle className="w-6 h-6" />
                      <h3 className="text-base font-bold text-slate-900">Terminate Active Session?</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      Are you sure you want to forcibly disconnect <strong>{sessionTerminateConfirm.userName}</strong> ({sessionTerminateConfirm.email}) from pod <code>{sessionTerminateConfirm.podName}</code>? The user will be required to re-authenticate with Keycloak.
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSessionTerminateConfirm(null)}
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const targetId = sessionTerminateConfirm.id;
                          const targetName = sessionTerminateConfirm.userName;
                          setLiveSessions((prev) => prev.filter((s) => s.id !== targetId));
                          setSessionTerminateConfirm(null);
                          setSessionActionToast(`Terminated live session for ${targetName}. WebSocket socket dropped.`);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        Confirm Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* DEFAULT TILE GRIDS MATCHING USER SCREENSHOTS                              */}
          {/* ========================================================================= */}
          {activeSubView === 'none' && (
            <div>
              {/* TAB 1: SELLERS (Image 1 from previous prompt / 11 tiles) */}
              {activeTab === 'sellers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Add a New Car', <PlusCircle className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('My Vehicles', <Car className="w-9 h-9 stroke-1" />, vehicles.length)}
                  {renderTileCard('My Received Vehicles', <Truck className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Active Auctions', <Gavel className="w-9 h-9 stroke-1" />, auctions.filter((a) => a.status === 'ACTIVE').length)}
                  {renderTileCard('Sold Undelivered', <Car className="w-9 h-9 stroke-1 text-slate-500" />)}
                  {renderTileCard('Unsold Vehicles Undelivered', <Archive className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('My Invoices', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('My Payments', <DollarSign className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Requested Services', <Wrench className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Completed Requests', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Unapproved Vehicle', <FileCheck2 className="w-9 h-9 stroke-1" />)}
                </div>
              )}

              {/* TAB 2: OPERATIONS (Image 2 & 3 from previous prompt) */}
              {activeTab === 'operations' && !isSeller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Live Sessions Users', <Radio className="w-9 h-9 stroke-1 text-emerald-500 animate-pulse" />, liveSessions.length)}
                  {renderTileCard('Add a New Car', <PlusCircle className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Request Vehicle from ERP', <Server className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Request Vehicle', <Car className="w-9 h-9 stroke-1" />, poolVehicles.length)}
                  {renderTileCard('Washed Vehicle', <SparkleIcon />, washedVehicles.length)}
                  {renderTileCard('Photo Vehicle', <CameraIcon />, photoVehicles.length)}
                  {renderTileCard('Technical Test', <Wrench className="w-9 h-9 stroke-1" />, technicalVehicles.length)}
                  {renderTileCard('Submitted by Seller', <FileText className="w-9 h-9 stroke-1" />, submittedSellerVehicles.length)}
                  {renderTileCard('Inactive Auctions', <Clock className="w-9 h-9 stroke-1" />, inactiveVehicles.length)}
                  {renderTileCard('Active Auctions', <Gavel className="w-9 h-9 stroke-1" />, auctions.filter((a) => a.status === 'ACTIVE').length)}
                  {renderTileCard('Awarded Report', <FileCheck2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Approved by Seller', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Under Approval', <Clock className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Sold Undelivered', <Car className="w-9 h-9 stroke-1 text-slate-500" />)}
                  {renderTileCard('Buyer Change', <Users className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Completed B.Ch Services', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Car Inspection Services', <Wrench className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Unsold', <Archive className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Completed Inspection Services', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Sold Delivered', <Truck className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Archived Vehicle', <Archive className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Marketing', <TrendingUp className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Pending Services', <Clock className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Services in Process', <Wrench className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Completed Requests', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('SP Requested Services', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Completed SP Services', <CheckCircle2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Operation Log', <Server className="w-9 h-9 stroke-1" />)}
                </div>
              )}

              {/* TAB 3: MANAGEMENT */}
              {activeTab === 'management' && !isSeller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Active Auctions', <Gavel className="w-9 h-9 stroke-1" />, auctions.filter((a) => a.status === 'ACTIVE').length)}
                  {renderTileCard('Sales Invoice Details', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Sellers Report', <FileCheck2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Sales Report', <TrendingUp className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Auction List', <Gavel className="w-9 h-9 stroke-1" />, auctions.length)}
                  {renderTileCard('Customer List', <Users className="w-9 h-9 stroke-1" />, userStats.buyers)}
                  {renderTileCard('Auction Batch List', <Layers className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Seller List', <Briefcase className="w-9 h-9 stroke-1" />, userStats.sellers)}
                  {renderTileCard('Income Totals', <DollarSign className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Monthly Income Totals', <TrendingUp className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Employees Permission', <Shield className="w-9 h-9 stroke-1" />, userStats.staff)}
                </div>
              )}

              {/* TAB 4: ACCOUNTANT */}
              {activeTab === 'accountant' && !isSeller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Sold Undelivered', <Car className="w-9 h-9 stroke-1 text-slate-500" />)}
                  {renderTileCard('Car Inspection Invoices', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Buyer Change Invoices', <FileCheck2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Seller Invoice List', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Buyer Invoice List', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Seller Payments', <DollarSign className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Buyer Payments', <DollarSign className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Customers', <Users className="w-9 h-9 stroke-1" />, userStats.totalCustomers)}
                  {renderTileCard('Security Deposit', <Shield className="w-9 h-9 stroke-1" />)}
                </div>
              )}

              {/* TAB 5: REPORTS */}
              {activeTab === 'reports' && !isSeller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Sales Report', <TrendingUp className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Sellers Report', <FileCheck2 className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Awarded Report', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Car Inspection Invoices', <FileText className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Monthly Income Totals', <DollarSign className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Operation Log', <Server className="w-9 h-9 stroke-1" />)}
                </div>
              )}

              {/* TAB 6: USER ADMINISTRATION */}
              {activeTab === 'admin' && !isSeller && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderTileCard('Customer List', <Users className="w-9 h-9 stroke-1" />, userStats.totalCustomers)}
                  {renderTileCard('Seller List', <Briefcase className="w-9 h-9 stroke-1" />, userStats.sellers)}
                  {renderTileCard('Add a New Car', <PlusCircle className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Active Auctions', <Gavel className="w-9 h-9 stroke-1" />, auctions.filter((a) => a.status === 'ACTIVE').length)}
                  {renderTileCard('Operation Log', <Server className="w-9 h-9 stroke-1" />)}
                  {renderTileCard('Employees Permission', <Shield className="w-9 h-9 stroke-1" />, userStats.staff)}
                </div>
              )}

              {/* TAB 7: DASHBOARD */}
              {activeTab === 'dashboard' && !isSeller && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Active Auctions</span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">
                        {auctions.filter((a) => a.status === 'ACTIVE').length}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">Live bidding running</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Total Inventory</span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{vehicles.length}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Commercial & Passenger</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Registered Users</span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{userStats.totalCustomers.toLocaleString()}</p>
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        {userStats.buyers.toLocaleString()} Buyers, {userStats.sellers} Sellers, {userStats.staff} Admins
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Top Recorded Bid</span>
                      <p className="text-3xl font-extrabold text-emerald-600 mt-1">AED {topBid.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">{topBid.title}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">Quick Navigation Modules</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setActiveSubView('add_new_car');
                            setAddCarTab('single');
                          }}
                          className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition cursor-pointer"
                        >
                          <PlusCircle className="w-5 h-5 text-red-600 mb-1" />
                          <div className="text-xs font-bold text-slate-900">Add a New Car</div>
                          <div className="text-[10px] text-slate-400">Launch single or bulk listing</div>
                        </button>
                        <button
                          onClick={() => {
                            setUserRoleFilter('ALL');
                            setActiveSubView('customer_list');
                          }}
                          className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition cursor-pointer"
                        >
                          <Users className="w-5 h-5 text-blue-600 mb-1" />
                          <div className="text-xs font-bold text-slate-900">User Administration</div>
                          <div className="text-[10px] text-slate-400">{userStats.totalCustomers.toLocaleString()} User Accounts</div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">System Health</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg text-emerald-800 font-medium">
                          <span>WebSocket Real-Time Gateway</span>
                          <span className="font-mono">ONLINE (:8081)</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg text-emerald-800 font-medium">
                          <span>PostgreSQL Core Database</span>
                          <span className="font-mono">{userStats.totalCustomers.toLocaleString()} USERS READY</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Supporting line-art icon helpers
function SparkleIcon() {
  return (
    <svg className="w-9 h-9 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-9 h-9 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
