import React, { useState } from 'react';
import { PortalSidebar, PortalView } from './PortalSidebar';
import { 
  X, 
  Home, 
  ChevronLeft, 
  Info, 
  Headphones, 
  HelpCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Building,
  CheckCircle2
} from 'lucide-react';

interface HelpPageProps {
  onNavigate: (view: PortalView) => void;
  onBackHome: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({
  onNavigate,
  onBackHome,
}) => {
  const [activeTab, setActiveTab] = useState<'NONE' | 'ABOUT' | 'CONTACT' | 'FAQS' | 'BRANCHES'>('NONE');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I register and place a bid on Al Wataneya Auctions?',
      a: 'To bid, create a Buyer Account through the Sign Up page, verify your contact information, and ensure your account has a registered security deposit. Once registered, navigate to any Live or Silent auction and click "BID NOW".'
    },
    {
      q: 'What is the "5-minute extension" rule in live auctions?',
      a: 'If any competitive bid is submitted in the final 5 minutes of an auction lot, the closing time is automatically extended by an additional 5 minutes to allow all bidders equal opportunity to submit counter-bids.'
    },
    {
      q: 'How do I inspect vehicles prior to bidding?',
      a: 'Each lot includes a certified 150-point technical inspection report available on the details page. Additionally, physical vehicle inspection is available at our Dubai, Abu Dhabi, and regional yards Saturday through Thursday from 8:00 AM to 6:00 PM.'
    },
    {
      q: 'What payment methods are supported after winning an auction?',
      a: 'Winning buyers can settle payments via instant bank transfer, certified bank draft, or credit/debit card through our secure payment broker within 48 hours of lot closing.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-row font-sans">
      
      {/* Left Sidebar matching Screenshot 3 */}
      <PortalSidebar currentView="HELP" onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Header Bar matching Screenshot 3: ✕ Help */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] mb-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBackHome}
              className="p-1 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Close and return to Home"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-[#231F20]">
              Help
            </h1>
          </div>
        </div>

        {/* Breadcrumb Navigation: ⌂ > Help */}
        <div className="flex items-center space-x-2 text-xs text-[#8C8C8C] mb-6">
          <button onClick={onBackHome} className="hover:text-[#231F20] flex items-center gap-1 cursor-pointer">
            <Home className="w-3.5 h-3.5" />
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#231F20]">Help</span>
        </div>

        {/* Red Banner with Back Arrow matching Screenshot 3 */}
        <div className="w-full bg-[#C8102E] rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm flex items-center space-x-5">
          <button 
            onClick={onBackHome}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#231F20] shadow-md hover:bg-slate-100 transition cursor-pointer shrink-0"
            title="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Help</h2>
            <p className="text-xs sm:text-sm text-red-100 mt-1">Find Branches, Help center</p>
          </div>
        </div>

        {/* 4 Large Clean Cards matching Screenshot 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          
          {/* 1. About Us */}
          <div 
            onClick={() => setActiveTab(activeTab === 'ABOUT' ? 'NONE' : 'ABOUT')}
            className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center space-x-4 ${
              activeTab === 'ABOUT' ? 'border-[#D32437] ring-2 ring-red-100' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Info className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#231F20] text-base">About Us</h4>
              <p className="text-xs text-[#8C8C8C]">Our story, mission & Emirates Transport backing</p>
            </div>
          </div>

          {/* 2. Contact Us */}
          <div 
            onClick={() => setActiveTab(activeTab === 'CONTACT' ? 'NONE' : 'CONTACT')}
            className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center space-x-4 ${
              activeTab === 'CONTACT' ? 'border-[#D32437] ring-2 ring-red-100' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Headphones className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#231F20] text-base">Contact Us</h4>
              <p className="text-xs text-[#8C8C8C]">24/7 Phone, WhatsApp & Support Desk</p>
            </div>
          </div>

          {/* 3. FAQs */}
          <div 
            onClick={() => setActiveTab(activeTab === 'FAQS' ? 'NONE' : 'FAQS')}
            className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center space-x-4 ${
              activeTab === 'FAQS' ? 'border-[#D32437] ring-2 ring-red-100' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <HelpCircle className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#231F20] text-base">FAQs</h4>
              <p className="text-xs text-[#8C8C8C]">Frequently asked questions & bidding guide</p>
            </div>
          </div>

          {/* 4. Find Branches */}
          <div 
            onClick={() => setActiveTab(activeTab === 'BRANCHES' ? 'NONE' : 'BRANCHES')}
            className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center space-x-4 ${
              activeTab === 'BRANCHES' ? 'border-[#D32437] ring-2 ring-red-100' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <MapPin className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#231F20] text-base">Find Branches</h4>
              <p className="text-xs text-[#8C8C8C]">Yard locations, operating hours & maps</p>
            </div>
          </div>

        </div>

        {/* Detailed Section Drawer / Details based on selection or full view */}
        <div className="space-y-6">
          
          {/* Contact Details */}
          {(activeTab === 'NONE' || activeTab === 'CONTACT') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#231F20] mb-4 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#D32437]" />
                Customer Support & Helpdesk
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-[#231F20] mb-1">
                    <Phone className="w-4 h-4 text-[#D32437]" />
                    Toll Free Hotline
                  </div>
                  <p className="text-xs text-slate-600">800 6006 / +971 8006006</p>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Available 24/7</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-[#231F20] mb-1">
                    <Mail className="w-4 h-4 text-[#D32437]" />
                    Support Email
                  </div>
                  <p className="text-xs text-slate-600">etcares@et.ae / auctions@awa.ae</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Response within 2 hours</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-[#231F20] mb-1">
                    <Clock className="w-4 h-4 text-[#D32437]" />
                    Auction Yard Hours
                  </div>
                  <p className="text-xs text-slate-600">Sat - Thu: 8:00 AM - 6:00 PM</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Friday Closed</span>
                </div>
              </div>
            </div>
          )}

          {/* Branch Locations */}
          {(activeTab === 'NONE' || activeTab === 'BRANCHES') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#231F20] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#D32437]" />
                Our Yard & Branch Locations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="border border-slate-200 p-4 rounded-xl">
                  <span className="font-bold text-[#231F20] text-sm block mb-1">Dubai Main Yard (Al Ruwayyah)</span>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    Al Ruwayyah 3, Dubai - Al Ain Road (E66), Near Academic City, Dubai, United Arab Emirates.
                  </p>
                  <span className="text-emerald-600 font-bold block mt-2">Capacity: 1,500+ Vehicles</span>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl">
                  <span className="font-bold text-[#231F20] text-sm block mb-1">Abu Dhabi Yard (Musaffah)</span>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    Musaffah Industrial Area M-14, Behind Emirates Transport Heavy Maintenance Hub, Abu Dhabi.
                  </p>
                  <span className="text-emerald-600 font-bold block mt-2">Capacity: 800+ Commercial Fleets</span>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl">
                  <span className="font-bold text-[#231F20] text-sm block mb-1">India Port Hub (Mumbai / Delhi)</span>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    JNPT Logistics Zone, Navi Mumbai & Delhi Central Transport Nagar Yard, India.
                  </p>
                  <span className="text-emerald-600 font-bold block mt-2">Capacity: 1,200+ Fleets & Trucks</span>
                </div>
              </div>
            </div>
          )}

          {/* FAQs Accordion */}
          {(activeTab === 'NONE' || activeTab === 'FAQS') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#231F20] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#D32437]" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-[#231F20] hover:bg-slate-50 transition"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-[#525252] leading-relaxed bg-slate-50/50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Us Description */}
          {(activeTab === 'NONE' || activeTab === 'ABOUT') && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs text-xs text-[#525252] leading-relaxed space-y-3">
              <h3 className="text-lg font-bold text-[#231F20] mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D32437]" />
                About Al Wataneya Auctions
              </h3>
              <p>
                Established in 2010 as a dedicated subsidiary of Emirates Transport (ET), Al Wataneya Auctions has evolved into the UAE’s and region's foremost institutional vehicle auction portal. We specialize in transparent commercial fleet remarketing, passenger vehicle remarketing, and heavy machinery auctions.
              </p>
              <p>
                Every vehicle listed on our platform undergoes rigorous documentation verification, chassis and engine physical audit, and condition grading to guarantee peace of mind for corporate fleet buyers, dealers, and private individuals.
              </p>
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
