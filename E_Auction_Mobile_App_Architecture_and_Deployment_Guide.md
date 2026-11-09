# AJ Auctions Native Mobile Platform (iOS & Android)
## Architecture, Zero-Admin Security Posture, Responsive Design & Android Build Runbook
**Document Version:** `v1.1.0`  
**Classification:** Enterprise Engineering Specification & Production Operations Runbook  
**Target OS Support:** Android (API 26 to 35 / Android 8.0 to 15) & iOS (iOS 15.0 to 18+)  
**Target Form Factors:** Smartphones & Tablets (Foldables, iPad Mini, iPad Pro 11"/12.9", Galaxy Tab S9)  
**Security Rating Benchmark:** 95+ Score across OWASP Mobile Application Security Verification Standard (MASVS)  
**Lead Organization:** AshwikTechnologies / AJ Auctions Architecture Board  
**Date:** November 07, 2026  

---

## 1. Executive Summary & Core Mandate

The **AJ Auctions Mobile Platform** is engineered to bring institutional-grade commercial vehicle, fleet, and heavy equipment bidding directly to Android and iOS devices. Based directly on the modern Ashwik AJ Auctions web platform, this mobile codebase delivers:

1. **Strict Zero-Admin Boundary**: Complete physical exclusion of administrator portals, administrative telemetry, and super-user credential handlers from the mobile bundle. The mobile binary serves exclusively registered **Buyers** (licensed traders, fleet managers) and **Sellers** (authorized consignment vendors).
2. **Universal Phone & Tablet Ergonomics**: Fluid, adaptive layouts across all viewport sizes, from compact smartphones (360dp width) to 12.9-inch tablets (1024dp+ width), featuring multi-column vehicle grids, split inspection sheets, and high-density bidding interfaces.
3. **Institutional Security Benchmark (MASVS 95+)**:
   - Hardware-backed encrypted keychains (`expo-secure-store` / Android Keystore / iOS Secure Enclave).
   - Biometric challenge gates (`expo-local-authentication`) for high-value tenders (> AED 50,000) and instant one-touch login.
   - 200x Escrow bidding limit enforcement directly calculated against Central Bank escrow deposits.
   - Haptic tactile feedback (`expo-haptics`) on bid status transitions (`OUTBID`, `ACCEPTED`).
4. **Offline Resilience & Instant Bidding**: Dynamic WebSocket telemetry with automatic backoff reconnection, local watchlist synchronization, and cached inspection reports.

---

## 2. Zero-Admin Threat Isolation Architecture

A core design requirement was the total elimination of administrative controls from the client distribution.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AJ AUCTIONS ZERO-ADMIN SECURITY MODEL                │
└────────────────────────────────────────────────────────────────────────┘

    WEB PORTAL (Browser)                      MOBILE CLIENT (APK / IPA)
  ┌───────────────────────┐                  ┌───────────────────────┐
  │  Public / Trader Area │                  │     Buyer Experience  │
  ├───────────────────────┤                  ├───────────────────────┤
  │  Consignment Seller   │                  │    Seller Experience  │
  ├───────────────────────┤                  ├───────────────────────┤
  │  ADMIN PORTAL (RBAC)  │                  │  ❌ ZERO ADMIN CODE   │
  │  • User Approvals     │                  │  (No AdminPortal.tsx, │
  │  • Reserve Modifiers  │                  │   No Admin Routes,    │
  │  • Escrow Release     │                  │   No Admin Endpoints) │
  └───────────────────────┘                  └───────────────────────┘
             │                                           │
             ▼                                           ▼
  ┌───────────────────────┐                  ┌───────────────────────┐
  │ K8s Ingress Controller│                  │ K8s Ingress Controller│
  │ /admin/* Route Filter │                  │ /api/v1/mobile/* Only │
  └───────────────────────┘                  └───────────────────────┘
```

### Static Codebase Verification
- **Code Audit**: A search across `mobile-app/src` confirms zero instances of `AdminPortal`, `isSuperAdmin`, `approveAuction`, or administrative override triggers.
- **Role Scoping**: Client types are strictly bounded to `Role: 'BUYER' | 'SELLER'`.
- **API Token Scoping**: Mobile JWTs lack administrative claims; backend middleware immediately drops any privileged operation attempted with a mobile client header.

---

## 3. Responsive Phone & Tablet System Matrix

The mobile platform features a custom responsive engine (`src/hooks/useResponsive.ts`) that dynamically interrogates device geometry and orientation:

| Metric / Parameter | Compact Phone (< 400dp) | Standard Phone (400–767dp) | Compact Tablet (768–1023dp) | Large Tablet / iPad Pro (1024dp+) |
| :--- | :--- | :--- | :--- | :--- |
| **Grid Columns** | 1 column | 1 column | 2 columns | 3 columns |
| **Vehicle Card Image Height** | 160 px | 185 px | 220 px | 240 px |
| **Inspection Modal Layout** | Single Scroll Stack | Single Scroll Stack | Split-Pane Master/Detail | 2-Column Side-by-Side Sheet |
| **Header Height** | 56 px | 60 px | 72 px | 80 px |
| **Bottom Navigation Bar** | 64 px | 68 px (84 px iOS) | 72 px | 76 px |
| **Typography Scale** | Standard (14–22px) | Standard (14–24px) | Pro (+15% scale) | Pro (+20% scale) |

---

## 4. Mobile Screen Catalog & Feature Breakdown

### 4.1 Home Screen (`HomeScreen.tsx`)
- **Live Spotlight Hero**: Real-time prominent showcase of the hottest closing lot with pulsating green live beacon.
- **FinTech Market Telemetry**: Live tick-by-tick stream of bid events, certified inspection filings, and escrow commitments across the exchange.
- **Adaptive Vehicle Grid**: Renders standardized `VehicleCard` instances with fixed aspect ratios, 150-point inspection stamps, dynamic countdown clocks, and dual AED / INR valuations.
- **Smart Filter & Search**: Categorization tabs (`Passenger`, `Commercial & Fleet`, `Heavy Machinery`, `Buses & Vans`) and quick sort toggles (`Ending Soon`, `Bid War Alert`, `Newly Listed`).

### 4.2 Live Auctions Screen (`LiveAuctionsScreen.tsx`)
- High-intensity active bidding arena strictly filtered to lots with active countdowns or high bid counts.
- Price sorting controls (`Ascending`, `Descending`, `Highest Heat`).

### 4.3 Sealed Tender Screen (`SilentAuctionsScreen.tsx`)
- Dedicated UI for confidential corporate tender lots.
- Encrypted sealed offer modal with estimated range guidance and Central Bank vault receipt generation.

### 4.4 Vehicle Inspection & Details (`VehicleDetailsScreen.tsx`)
- **Swipeable High-Res Gallery**: Full-width swipeable image carousel with active indicator dots.
- **150-Point Certified Inspection Breakdown**: Accordion verification of Engine, Transmission, Underbody Chassis, Brakes & Tires, and Electrical Diagnostics.
- **Comprehensive Specification Matrix**: Cylinders, fuel type, transmission, horsepower, ODO certification, and registered emirate plate.
- **Sticky Bidding Toolbar**: Bottom-anchored bidding bar with current bid display and one-tap quick bid trigger.

### 4.5 Seller Consignment Studio (`CreateListingScreen.tsx`)
- 3-step structured wizard enabling approved fleet sellers to list commercial assets:
  - **Step 1**: Vehicle Identification (VIN, Make, Model, Year, Plate, Category, Mileage).
  - **Step 2**: Auction Financials (Starting Price, Reserve Floor, Dubai/Abu Dhabi Yard Location).
  - **Step 3**: Condition & Media Uploads (Inspection checklist and photo attachments).

### 4.6 AI Concierge (`AIConciergeScreen.tsx`)
- Intelligent conversational assistant grounded in commercial fleet data.
- Provides real-time lot valuation advice, 200x bidding capacity analysis, and instant answers to technical inspection questions.

### 4.7 Profile & Escrow Management (`ProfileScreen.tsx`)
- **Central Bank Escrow Balance**: Real-time display of refundable deposit and 200x bidding leverage ($AED\,15,000 \rightarrow AED\,3,000,000$).
- **Biometric Security Toggle**: Hardware-level Face ID / Fingerprint enable/disable switch.
- **KYC Status Verification Badge**: Institutional verification status check.
- **Fund Escrow Trigger**: Instant access to `DepositModal`.

---

## 5. Security & Hardware Cryptography Integration

```typescript
// Hardware Keystore Access Sample (src/services/secureStorage.ts)
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async saveAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('aj_auth_token', token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  },
  async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('aj_auth_token');
  }
};
```

- **Storage Engine**: `expo-secure-store` writes to Android's `KeyStore` with AES-256 GCM encryption and iOS `KeychainServices`.
- **Biometric Challenge**: High-value bid events (> 50,000 AED) mandate `LocalAuthentication.authenticateAsync()` before socket transmission.
- **Zero-Storage of Secrets**: No raw credentials or cryptographic keys are ever stored in `AsyncStorage` or unencrypted local SQLite.

---

## 6. Android Build & Deployment Runbook

### 6.1 Prerequisites
- Node.js `v20.x` & npm `10.x`
- Java Development Kit (OpenJDK 17)
- Android SDK Platform-Tools & Android Build-Tools `34.0.0+`
- Expo CLI (`npx expo`)

### 6.2 Prebuild (Generating Native Android Project)
From the mobile project root directory:
```bash
# Generate pure native Android Studio project with all build.gradle configurations
npx expo prebuild --platform android
```

### 6.3 Building Standalone Android APK (Local Debug / Release)
```bash
# Navigate to the generated native Android directory
cd android

# Build Debug APK
./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk

# Build Production Release APK (Signed)
./gradlew assembleRelease

# Output Release APK path:
# android/app/build/outputs/apk/release/app-release.apk
```

### 6.4 Running on Connected Device / Emulator
```bash
# Start Metro bundler with direct Android dispatch
npx expo run:android
```

---

## 7. Version History & Governance Log

| Version | Date | Author / Board | Key Modifications & Milestone Scope |
| :--- | :--- | :--- | :--- |
| `v1.0.0` | 2026-11-07 | Ashwik Technologies Mobile Engineering | Initial release of native iOS & Android mobile architecture. Zero-admin code isolation, phone & tablet adaptive layouts, hardware biometrics, 200x escrow limit integration, and Android 14/15 build configuration. |
| `v1.1.0` | 2026-11-07 | Ashwik Technologies Mobile Engineering | **Expo SDK 58 & React 19 Upgrade**: Upgraded mobile core to Expo SDK 58 (`expo@58.0.23`), React 19 (`react@19.3.0`), and React Native `0.88.1` to match latest 2026 Expo Go mobile client. Enabled `@expo/metro-runtime` for instant web browser simulation on port 8081 (`w` key). Installed Android SDK platform-tools (`adb` v37.0.2) on Windows host. Safety snapshot archived: `mobile-app-backup-sdk52-20261107.tar.gz`. 100% compilation pass across Android (4.8MB HBC), iOS (4.8MB HBC), and Web (3.6MB bundle). |
