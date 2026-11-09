import os
import re

base_dir = "/home/nodejs/eauction-workspace/frontend"

replacements_by_file = {
    "index.html": [
        ("<link rel=\"icon\" type=\"image/svg+xml\" href=\"/assets/hammer.svg\" />",
         "<link rel=\"icon\" type=\"image/png\" href=\"/assets/favicon-aj.png\" />"),
        ("<title>Al Wataneya Auctions | Premier Commercial Vehicle & Fleet Bidding Portal</title>",
         "<title>AJ Auctions | Premier Commercial Vehicle & Fleet Bidding Portal - Powered by AJTechnologies</title>"),
    ],
    "src/App.tsx": [
        ("/* HOME View: Sticky 96px Al Wataneya Navbar + Full HomePage */",
         "/* HOME View: Sticky 96px AJ Auctions Navbar + Full HomePage */"),
    ],
    "src/components/Navbar.tsx": [
        ("{/* Al Wataneya Brand Logo */}",
         "{/* AJ Auctions Brand Logo */}"),
        ("src={getAssetUrl('/assets/main_logo.svg')}",
         "src={getAssetUrl('/assets/logo-aj.png')}"),
        ("alt=\"Al Wataneya Auctions\"",
         "alt=\"AJ Auctions\""),
        ("(e.target as HTMLImageElement).src = getAssetUrl('/assets/logoawa.svg');",
         "(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');"),
        ("<span>Emirates Moto</span>",
         "<span>AJ Commercial Fleet</span>"),
        ("title=\"Click to view Emirates Moto\"",
         "title=\"Click to view AJ Commercial Fleet\""),
    ],
    "src/components/HomePage.tsx": [
        ("src={getAssetUrl(\"/assets/Al+Wataneya+-+Web+Banner+-+4112+X+900px.png\")}",
         "src={getAssetUrl(\"/assets/banner-aj.png\")}"),
        ("alt=\"Al Wataneya Live Auctions\"",
         "alt=\"AJ Auctions Live Portal - Powered by AJTechnologies\""),
        ("AWA-{auc.id.substring(0, 6).toUpperCase()}",
         "AJ-{auc.id.substring(0, 6).toUpperCase()}"),
        ("alt=\"Emirates Moto\"",
         "alt=\"AJ Commercial Fleet\""),
        ("title=\"Click to view Emirates Moto\"",
         "title=\"Click to view AJ Commercial Fleet\""),
        ("Emirates Moto",
         "AJ Commercial Fleet"),
        ("\"Smooth Bidding, Great Finds at Al Wataneya!\"",
         "\"Smooth Bidding, Great Finds at AJ Auctions!\""),
        ("\"I had a fantastic buying experience with Al Wataneya Auctions! The platform was user-friendly, offering a wide variety of commercial vehicles. The bidding process was smooth, and their team provided excellent support.\"",
         "\"I had a fantastic buying experience with AJ Auctions! The platform was user-friendly, offering a wide variety of commercial vehicles. The bidding process was smooth, and the AJTechnologies team provided excellent support.\""),
        ("\"Selling through Al Wataneya Auctions was a breeze! Listing our 40-truck fleet was simple, and the bidding process attracted serious corporate buyers quickly. The team’s support was top-notch throughout.\"",
         "\"Selling through AJ Auctions was a breeze! Listing our 40-truck fleet was simple, and the bidding process attracted serious corporate buyers quickly. The team’s support was top-notch throughout.\""),
        ("\"Al Wataneya Auctions provided exceptional customer service! Every lot had detailed 150-point inspection documentation. Real-time WebSocket bids updated without a single hiccup. Highly recommended!\"",
         "\"AJ Auctions provided exceptional customer service! Every lot had detailed 150-point inspection documentation. Real-time WebSocket bids updated without a single hiccup. Highly recommended!\""),
        ("Operations Lead, Emirates Haulage",
         "Operations Lead, Apex Logistics & Haulage"),
        ("<span>Al Wataneya On The Go</span>",
         "<span>AJ Auctions On The Go</span>"),
        ("src={getAssetUrl(\"/assets/main_logo.svg\")}",
         "src={getAssetUrl(\"/assets/main_logo-aj.png\")}"),
        ("alt=\"AWA App\"",
         "alt=\"AJ Auctions Mobile App\""),
        ("alt=\"Al Wataneya Auctions\"",
         "alt=\"AJ Auctions • Powered by AJTechnologies\""),
        ("Al Wataneya Auctions, established in 2010 by Emirates Transport, is a leading UAE & international vehicle auction platform, offering diverse commercial fleets and vehicles for individuals & businesses.",
         "AJ Auctions, powered by AJTechnologies, is a premier UAE & international commercial vehicle and heavy equipment auction platform, offering high-throughput digital bidding solutions for enterprises, fleets, and individual buyers."),
        ("Licensed by Emirates Transport (ET) Commercial Fleet Group.",
         "Licensed & powered by AJTechnologies Enterprise Platform."),
        ("About Al Wataneya",
         "About AJ Auctions"),
        ("etcares@et.ae",
         "support@ajtechnologies.com"),
        ("© 2026 Al Wataneya Auctions (Emirates Transport). All rights reserved.",
         "© 2026 AJ Auctions. Powered by AJTechnologies. All rights reserved."),
        ("https://www.facebook.com/alwataneya.center/",
         "https://www.facebook.com/ajtechnologies/"),
        ("https://instagram.com/alwataneya.auctions",
         "https://instagram.com/ajtechnologies.auctions"),
    ],
    "src/components/OnlineAuctionsPage.tsx": [
        ("AWA-{auc.id.substring(0, 6).toUpperCase()}",
         "AJ-{auc.id.substring(0, 6).toUpperCase()}"),
    ],
    "src/components/PortalSidebar.tsx": [
        ("{/* Top AWA Logo */}",
         "{/* Top AJ Logo */}"),
        ("src={getAssetUrl('/assets/logoawa.svg')}",
         "src={getAssetUrl('/assets/logo-aj.png')}"),
        ("alt=\"AWA Logo\"",
         "alt=\"AJ Auctions Logo\""),
        ("(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo.svg');",
         "(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');"),
        ("Al Wataneya Auctions © 2026",
         "AJ Auctions • Powered by AJTechnologies © 2026"),
    ],
    "src/components/SignInPage.tsx": [
        ("src={getAssetUrl('/assets/main_logo.svg')}",
         "src={getAssetUrl('/assets/logo-aj.png')}"),
        ("alt=\"Al Wataneya Auctions\"",
         "alt=\"AJ Auctions\""),
        ("(e.target as HTMLImageElement).src = getAssetUrl('/assets/logoawa.svg');",
         "(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');"),
        ("Sign In to Al Wataneya Auctions",
         "Sign In to AJ Auctions"),
        ("Al Wataneya Auctions Platform • Single Sign-On Enabled",
         "AJ Auctions Platform • Single Sign-On Enabled • Powered by AJTechnologies"),
    ],
    "src/components/SignUpPage.tsx": [
        ("Register for Al Wataneya Auctions",
         "Register for AJ Auctions"),
    ],
    "src/components/SignInAndSignUpPage.tsx": [
        ("Welcome to Al Wataneya Auctions",
         "Welcome to AJ Auctions"),
    ],
    "src/components/HelpPage.tsx": [
        ("How do I register and place a bid on Al Wataneya Auctions?",
         "How do I register and place a bid on AJ Auctions?"),
        ("Our story, mission & Emirates Transport backing",
         "Our story, mission & AJTechnologies backing"),
        ("etcares@et.ae / auctions@awa.ae",
         "support@ajtechnologies.com / auctions@ajtechnologies.com"),
        ("Musaffah Industrial Area M-14, Behind Emirates Transport Heavy Maintenance Hub, Abu Dhabi.",
         "Musaffah Industrial Area M-14, Commercial Asset & Fleet Hub, Abu Dhabi."),
        ("About Al Wataneya Auctions",
         "About AJ Auctions"),
        ("Established in 2010 as a dedicated subsidiary of Emirates Transport (ET), Al Wataneya Auctions has evolved into the UAE’s and region's foremost institutional vehicle auction portal. We specialize in transparent commercial fleet remarketing, passenger vehicle remarketing, and heavy machinery auctions.",
         "Established as the digital auction flagship powered by AJTechnologies, AJ Auctions is the region's foremost institutional vehicle and machinery auction portal. We specialize in transparent commercial fleet remarketing, corporate asset liquidation, and certified multi-point vehicle auctions backed by next-generation real-time bidding technology."),
    ],
    "src/components/AICustomerConcierge.tsx": [
        ("مرحباً بك في مزاد الوطنية! أنا مستشارك الذكي للمزادات.",
         "مرحباً بك في مزادات AJ! أنا مستشارك الذكي للمزادات."),
        ("Welcome to **Al Wataneya Auctions**! I am your 24/7 AI Concierge.",
         "Welcome to **AJ Auctions**! I am your 24/7 AI Concierge, powered by **AJTechnologies**."),
        ("<span>Al Wataneya AI Concierge</span>",
         "<span>AJ AI Concierge • Powered by AJTechnologies</span>"),
    ],
    "src/components/VehicleDetailsPage.tsx": [
        ("AL WATANEYA VEHICLE INSPECTION REPORT",
         "AJ AUCTIONS VEHICLE INSPECTION REPORT"),
        ("Al Wataneya Auctions LLC - Official Digital Certificate",
         "AJ Auctions LLC - Official Digital Certificate • Powered by AJTechnologies"),
        ("a.download = `AWA_Inspection_Report_Lot_${lotNumber}.txt`;",
         "a.download = `AJ_Inspection_Report_Lot_${lotNumber}.txt`;"),
        ("title: `${vehicle.make} ${vehicle.model} - Al Wataneya Auction`,",
         "title: `${vehicle.make} ${vehicle.model} - AJ Auctions`,"),
        ("<h4 className=\"font-bold text-emerald-950 text-sm\">Al Wataneya Certified Vehicle</h4>",
         "<h4 className=\"font-bold text-emerald-950 text-sm\">AJ Certified Vehicle</h4>"),
    ],
    "src/components/SecurityDepositModal.tsx": [
        ("Al Wataneya Automated Bidding Limit Arbiter",
         "AJ Auctions Automated Bidding Limit Arbiter • Powered by AJTechnologies"),
    ],
    "src/components/AuthModal.tsx": [
        ("fullName: 'AWA Azure B2C Buyer',",
         "fullName: 'AJ Corporate B2C Buyer',"),
        ("email: 'awabuyer@gmail.com',",
         "email: 'ajbuyer@ajtechnologies.com',"),
        ("b2cObjectId: 'b2c_user_awabuyer',",
         "b2cObjectId: 'b2c_user_ajbuyer',"),
        ("https://dev-alwataneya.et.ae:443/oidcclient/etdx1",
         "https://ajauctions.ajtechnologies.com:443/oidcclient/callback"),
        ("<span>Sign In with Emirates Transport (Azure B2C)</span>",
         "<span>Sign In with AJTechnologies Corporate SSO</span>"),
    ],
    "src/components/AdminPortal.tsx": [
        ("Al Wataneya can assist by splitting into 2 installments",
         "AJ Auctions can assist by splitting into 2 installments"),
        ("const pass = `AlWataneya${randomSpecial}${randomNum}`;",
         "const pass = `AJAuctions${randomSpecial}${randomNum}`;"),
        ("'030726153039349,Nissan,Sunny,2024,Sharjah,1 Key,White,Petrol,45000,39000,AJM-100388,Al Wataneya Consignment\\n' +",
         "'030726153039349,Nissan,Sunny,2024,Sharjah,1 Key,White,Petrol,45000,39000,AJM-100388,AJ Consignment\\n' +"),
        ("'030726153027179,Nissan,Patrol,2025,Sharjah,2 Keys,Gold,Petrol,45000,42000,DXB-100381,Emirates Transport Fleet\\n' +",
         "'030726153027179,Nissan,Patrol,2025,Sharjah,2 Keys,Gold,Petrol,45000,42000,DXB-100381,AJ Technologies Fleet\\n' +"),
        ("link.setAttribute('download', 'AWA_Vehicle_Listing_Template.csv');",
         "link.setAttribute('download', 'AJ_Vehicle_Listing_Template.csv');"),
        ("motorNo: (v as any).engineNumber || 'ENG-AWA-9921',",
         "motorNo: (v as any).engineNumber || 'ENG-AJ-9921',"),
        ("src={getAssetUrl('/assets/logoawa.svg')}",
         "src={getAssetUrl('/assets/logo-aj.png')}"),
        ("alt=\"AWA\"",
         "alt=\"AJ Auctions\""),
        ("(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo.svg');",
         "(e.target as HTMLImageElement).src = getAssetUrl('/assets/main_logo-aj.png');"),
        ("<option value=\"Al Wataneya Consignment\">Al Wataneya Consignment (Ajman)</option>",
         "<option value=\"Al Wataneya Consignment\">AJ Consignment (Ajman Hub)</option>"),
        ("AWA-ERP-7741",
         "AJ-ERP-7741"),
        ("SellerName: v.clientName || 'AWA Admin',",
         "SellerName: v.clientName || 'AJ Admin',"),
        ("{v.clientName || 'AWA Admin'}",
         "{v.clientName || 'AJ Admin'}"),
        ("Al Wataneya Executive Boardroom Financial Dossier ({selectedFinanceYear})",
         "AJ Auctions Executive Boardroom Financial Dossier ({selectedFinanceYear})"),
        ("<span>Confidential — Internal Al Wataneya Motors Board & Executive Leadership</span>",
         "<span>Confidential — Internal AJ Auctions Board & AJTechnologies Leadership</span>"),
    ],
    "src/index.css": [
        ("/* Al Wataneya Signature Underline on Section Headings */",
         "/* AJ Auctions Signature Underline on Section Headings */"),
        ("/* Car Card styling matching Al Wataneya specifications */",
         "/* Car Card styling matching AJ Auctions specifications */"),
    ]
}

total_files = 0
total_replacements = 0

for rel_path, reps in replacements_by_file.items():
    file_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(file_path):
        print(f"[MISSING] File not found: {file_path}")
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    file_reps = 0
    for target, repl in reps:
        if target in content:
            count = content.count(target)
            content = content.replace(target, repl)
            file_reps += count
            print(f"  [{rel_path}] Replaced ({count}x): '{target[:35]}...' -> '{repl[:35]}...'")
        else:
            print(f"  [{rel_path}] WARNING: Target substring not found: '{target[:45]}...'")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"[UPDATED] {rel_path} - {file_reps} replacements made.")
    total_files += 1
    total_replacements += file_reps

print(f"\nRebranding Summary: {total_replacements} replacements across {total_files} files.")
