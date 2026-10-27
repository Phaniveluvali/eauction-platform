import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Sparkles, MessageSquare, X, Send, Bot, User as UserIcon, RefreshCw, ChevronRight, Car, DollarSign, Shield, Tag, Globe } from 'lucide-react';

interface AICustomerConciergeProps {
  currentUser?: User | null;
  onNavigateToAuction?: (auctionId: string) => void;
  onOpenDeposit?: () => void;
  onOpenSellCar?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: string[];
  embedded_vehicles?: any[];
  timestamp: string;
}

export const AICustomerConcierge: React.FC<AICustomerConciergeProps> = ({
  currentUser,
  onNavigateToAuction,
  onOpenDeposit,
  onOpenSellCar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: (
        "مرحباً بك في مزاد الوطنية! أنا مستشارك الذكي للمزادات.\n\n" +
        "Welcome to **Al Wataneya Auctions**! I am your 24/7 AI Concierge. I can help you find vehicles, calculate exact drive-away fees, check your 200x bidding power, or estimate your car's auction valuation."
      ),
      suggested_actions: [
        "Calculate Total Out-of-Pocket Fees",
        "Check Bidding Limit (200x)",
        "Find SUVs under AED 60,000",
        "Sell My Car - Free Valuation",
        "GCC Export & Customs Rules"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text });

      const res = await api.conciergeChat(history, currentUser ? {
        fullName: currentUser.fullName,
        role: currentUser.role,
        securityDeposit: currentUser.securityDeposit || 0,
        biddingLimit: (currentUser.securityDeposit || 0) * 200
      } : undefined);

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply || 'I am processing your inquiry. How else can I assist with your auction experience?',
        suggested_actions: res.suggested_actions || [],
        embedded_vehicles: res.embedded_vehicles || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I am having trouble connecting to the AI inference cluster. Please try again in a moment or contact our Sharjah branches directly at +971 8006006.",
          suggested_actions: ["Calculate Bidding Power", "Browse Online Auctions"],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes("Deposit") || action.includes("Bidding Power")) {
      if (onOpenDeposit) onOpenDeposit();
    } else if (action.includes("Sell My Car") || action.includes("Valuation")) {
      if (onOpenSellCar) onOpenSellCar();
    }
    handleSend(action);
  };

  return (
    <>
      {/* 1. Floating Round Trigger Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#D32437] to-[#991524] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-red-600/40 hover:scale-105 transition-all duration-200 flex items-center gap-2.5 cursor-pointer border-2 border-white/20 group"
          title="Open AI Concierge"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
          </div>
          <span className="hidden sm:inline-block font-extrabold text-xs uppercase tracking-wider">
            AI Concierge / المساعد الذكي
          </span>
        </button>
      )}

      {/* 2. Interactive AI Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] max-h-[85vh] h-[640px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-[#1A1D20] to-black text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D32437] flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <span>Al Wataneya AI Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <p className="text-[10px] text-slate-400">
                  24/7 Bilingual Buyer & Seller Assistant (Qwen + Llama)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Restart conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Pillar Strip */}
          <div className="bg-slate-50 border-b border-slate-100 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-semibold overflow-x-auto">
            <button onClick={() => handleActionClick("Calculate Total Out-of-Pocket Fees")} className="flex items-center gap-1 hover:text-[#D32437] transition whitespace-nowrap">
              <DollarSign className="w-3 h-3 text-[#D32437]" /> Fee Calculator
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => handleActionClick("Check Bidding Limit (200x)")} className="flex items-center gap-1 hover:text-[#D32437] transition whitespace-nowrap">
              <Shield className="w-3 h-3 text-emerald-600" /> 200x Power
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => handleActionClick("Sell My Car - Free Valuation")} className="flex items-center gap-1 hover:text-[#D32437] transition whitespace-nowrap">
              <Tag className="w-3 h-3 text-amber-500" /> Seller Valuation
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => handleActionClick("GCC Export & Customs Rules")} className="flex items-center gap-1 hover:text-[#D32437] transition whitespace-nowrap">
              <Globe className="w-3 h-3 text-blue-500" /> Export Guide
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#D32437]/10 text-[#D32437] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-[#D32437] text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Embedded Vehicle Cards if available */}
                  {m.embedded_vehicles && m.embedded_vehicles.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                      <p className="font-bold text-[11px] text-slate-700">Top Matching Lots:</p>
                      {m.embedded_vehicles.map((v: any) => (
                        <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-2 hover:border-[#D32437] transition">
                          <div className="flex items-center gap-2">
                            {v.image_url ? (
                              <img src={v.image_url} alt={v.make} className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Car className="w-5 h-5 text-slate-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{v.year} {v.make} {v.model}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Current: AED {(v.current_highest_bid || v.start_bid || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          {onNavigateToAuction && v.auction_id && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onNavigateToAuction(v.auction_id);
                              }}
                              className="px-2 py-1 bg-[#D32437] text-white text-[10px] font-bold rounded-lg hover:bg-[#b81d2f] transition flex items-center gap-0.5 shrink-0"
                            >
                              <span>Bid</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Action Pills */}
                  {m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                      {m.suggested_actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-[#D32437] font-semibold text-[10px] rounded-lg transition text-left cursor-pointer"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`block text-[9px] mt-1.5 font-mono text-right ${
                    m.role === 'user' ? 'text-red-200' : 'text-slate-400'
                  }`}>
                    {m.timestamp}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-3 w-fit shadow-xs animate-pulse">
                <Bot className="w-4 h-4 text-[#D32437]" />
                <span>Thinking & calculating on Ollama cluster...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. out-of-pocket cost, find SUVs, sell car)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#D32437] transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#D32437] hover:bg-[#b81d2f] text-white rounded-xl transition cursor-pointer disabled:opacity-40 shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
