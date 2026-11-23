import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Gavel, 
  Trophy, 
  Play, 
  Pause, 
  RefreshCw, 
  Save, 
  Zap,
  Info
} from 'lucide-react';
import { notificationApi, NotificationSettings } from '../services/api/notificationApi';

interface NotificationControlCenterProps {
  currentAdminEmail?: string;
}

export const NotificationControlCenter: React.FC<NotificationControlCenterProps> = ({
  currentAdminEmail = 'admin@eauction.in'
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    globalEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
    whatsappEnabled: true,
    auctionStartedEnabled: false,
    auctionClosingSoonEnabled: false,
    outbidEnabled: false,
    auctionWonEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load current settings from backend on mount
  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await notificationApi.getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Quick toggle master global switch
  const handleToggleGlobal = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);
    try {
      const updated = await notificationApi.toggleGlobalNotifications(currentAdminEmail);
      setSettings(updated);
      setSaveSuccess(updated.globalEnabled ? 'Automated notifications have been STARTED.' : 'All automated notifications have been STOPPED.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle global notifications');
    } finally {
      setIsSaving(false);
    }
  };

  // Immediate Stop All
  const handleStopAll = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);
    try {
      const updated = await notificationApi.stopAllNotifications(currentAdminEmail);
      setSettings(updated);
      setSaveSuccess('All notifications and email broadcasts have been STOPPED cluster-wide.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to stop notifications');
    } finally {
      setIsSaving(false);
    }
  };

  // Save manual modifications (tick marks)
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);
    try {
      const updated = await notificationApi.updateNotificationSettings(settings, currentAdminEmail);
      setSettings(updated);
      setSaveSuccess('Notification settings successfully updated and applied.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl ${settings.globalEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {settings.globalEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Notification Control Center
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  settings.globalEnabled 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {settings.globalEnabled ? 'Engine Active' : 'Engine Stopped'}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Manage automated email, SMS, and WhatsApp alerts for live and silent vehicle auctions.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadSettings}
            disabled={isLoading || isSaving}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
            title="Refresh from server"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleToggleGlobal}
            disabled={isSaving}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs ${
              settings.globalEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {settings.globalEnabled ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop Engine</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Engine</span>
              </>
            )}
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs shadow-slate-900/20"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Active Operational Directive:</p>
          <p className="text-amber-800 leading-relaxed">
            As requested, email notifications for <strong>Auction Started</strong> and <strong>Auction Ending (60 Minutes)</strong> are currently <strong>STOPPED</strong>.
            You can dynamically re-enable or disable channels and event triggers below using the checkboxes and click <strong>Save Rules</strong>.
          </p>
        </div>
      </div>

      {/* Success / Error Banners */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Channels & Trigger Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: Delivery Channels */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Notification Delivery Channels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable or disable tick marks to toggle delivery gateways.
              </p>
            </div>
            <Zap className="w-4 h-4 text-[#059669]" />
          </div>

          <div className="space-y-3.5">
            {/* Email Channel */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.emailEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Notifications
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.emailEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.emailEnabled ? 'ENABLED' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends transactional HTML emails via SMTP/SendGrid for auction alerts, outbid notices, and winner confirmations.
                </p>
              </div>
            </label>

            {/* SMS Channel */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.smsEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.smsEnabled}
                onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    SMS Text Alerts
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.smsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.smsEnabled ? 'ENABLED' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends direct telecom SMS alerts for urgent auction reminders and high-priority outbid notifications.
                </p>
              </div>
            </label>

            {/* WhatsApp Channel */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.whatsappEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={(e) => setSettings({ ...settings, whatsappEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    WhatsApp Business Channel
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.whatsappEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.whatsappEnabled ? 'ENABLED' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends interactive WhatsApp messages with vehicle inspection reports and direct live auction links.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 2: Auction Trigger Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Auction Event Triggers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle specific event broadcasts across all enabled channels.
              </p>
            </div>
            <Clock className="w-4 h-4 text-[#059669]" />
          </div>

          <div className="space-y-3.5">
            {/* Auction Started Notice */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.auctionStartedEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.auctionStartedEnabled}
                onChange={(e) => setSettings({ ...settings, auctionStartedEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600" />
                    Auction Started Broadcast
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.auctionStartedEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {settings.auctionStartedEnabled ? 'ACTIVE' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends single notification when an auction transitions to ACTIVE and live bidding begins. (Currently stopped)
                </p>
              </div>
            </label>

            {/* Auction Ending 60 Minutes Notice */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.auctionClosingSoonEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.auctionClosingSoonEnabled}
                onChange={(e) => setSettings({ ...settings, auctionClosingSoonEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    60-Minute Countdown Notice
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.auctionClosingSoonEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {settings.auctionClosingSoonEnabled ? 'ACTIVE' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends single final hammer call exactly 1 hour before auction closes. (Currently stopped)
                </p>
              </div>
            </label>

            {/* Outbid Alerts */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.outbidEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.outbidEnabled}
                onChange={(e) => setSettings({ ...settings, outbidEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-indigo-500" />
                    Outbid Counter-Alerts
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.outbidEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.outbidEnabled ? 'ACTIVE' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sends instant alert with minimum next counter-bid when another buyer places a higher bid.
                </p>
              </div>
            </label>

            {/* Auction Won Notices */}
            <label className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
              settings.auctionWonEnabled 
                ? 'border-emerald-500/50 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={settings.auctionWonEnabled}
                onChange={(e) => setSettings({ ...settings, auctionWonEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Auction Won & Invoices
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.auctionWonEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.auctionWonEnabled ? 'ACTIVE' : 'STOPPED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Congratulates the winning bidder with final hammer price and payment settlement link.
                </p>
              </div>
            </label>
          </div>
        </div>

      </div>

      {/* Quick Emergency Controls Footer */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-slate-900">Emergency Broadcast Suppression</p>
            <p className="text-slate-500">Need to immediately silence all outgoing notifications without changing custom rules?</p>
          </div>
        </div>

        <button
          onClick={handleStopAll}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Pause className="w-3.5 h-3.5" />
          <span>Stop All Outgoing Notifications</span>
        </button>
      </div>

    </div>
  );
};
