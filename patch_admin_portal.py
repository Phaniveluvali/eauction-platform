path = "/home/nodejs/eauction-workspace/frontend/src/components/AdminPortal.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Patch handleBroadcastVariant
old_broadcast = """  const handleBroadcastVariant = async (variant: any) => {
    setBroadcastingPromo(true);
    setPromoActionMsg('');
    try {
      const campaignPayload = {
        title_en: variant.headline_en || variant.title_en || 'Special Exclusive Promotion',
        title_ar: variant.headline_ar || variant.title_ar || 'عرض حصري خاص',
        body_en: variant.body_en || variant.message_en || '',
        body_ar: variant.body_ar || variant.message_ar || '',
        cta_en: variant.cta_en || 'Bid Now',
        cta_ar: variant.cta_ar || 'زايد الآن',
        discount_pct: promoDiscount,
        badge_en: variant.badge_en || 'LIMITED OFFER',
        badge_ar: variant.badge_ar || 'عرض محدود',
        duration_minutes: promoDuration * 60,
        target_audience: 'ALL_ACTIVE_BUYERS',
      };
      const res = await api.broadcastPromo(campaignPayload);
      setActiveCampaign(res.campaign);
      setPromoActionMsg('Campaign broadcast successfully live to all connected buyer screens!');
      setTimeout(() => setPromoActionMsg(''), 5000);
    } catch (err: any) {
      setPromoActionMsg(`Broadcast error: ${err.message}`);
    } finally {
      setBroadcastingPromo(false);
    }
  };"""

new_broadcast = """  const handleBroadcastVariant = async (variant: any) => {
    setBroadcastingPromo(true);
    setPromoActionMsg('');
    try {
      const discountPct = Number(promoDiscount || variant.discount_pct || 50);
      const durationHours = Number(promoDuration || variant.duration_hours || 2);
      const campaignPayload = {
        campaign_id: variant.variant_id || `camp-${Date.now()}`,
        title_en: variant.headline_en || variant.title_en || 'Special Exclusive Promotion',
        title_ar: variant.headline_ar || variant.title_ar || 'عرض حصري خاص',
        hook_en: variant.hook_en || variant.body_en || variant.message_en || 'Exclusive platform fee discount for active buyers.',
        hook_ar: variant.hook_ar || variant.body_ar || variant.message_ar || 'تخفيض حصري على الرسوم لجميع المشترين النشطين.',
        body_en: variant.hook_en || variant.body_en || variant.message_en || 'Exclusive platform fee discount for active buyers.',
        body_ar: variant.hook_ar || variant.body_ar || variant.message_ar || 'تخفيض حصري على الرسوم لجميع المشترين النشطين.',
        cta_label_en: variant.cta_label_en || variant.cta_en || 'Bid Now',
        cta_label_ar: variant.cta_label_ar || variant.cta_ar || 'زايد الآن',
        cta_en: variant.cta_label_en || variant.cta_en || 'Bid Now',
        cta_ar: variant.cta_label_ar || variant.cta_ar || 'زايد الآن',
        discount_code: variant.discount_code || `FLASH${discountPct}`,
        discount_pct: discountPct,
        duration_hours: durationHours,
        duration_minutes: durationHours * 60,
        badge_en: variant.badge_en || '⚡ LIMITED OFFER',
        badge_ar: variant.badge_ar || '⚡ عرض محدود',
        target_audience: 'ALL_ACTIVE_BUYERS',
      };
      const res = await api.broadcastPromo(campaignPayload);
      setActiveCampaign(res.campaign || res.payload || campaignPayload);
      setPromoActionMsg('Campaign broadcast successfully live to all connected buyer screens!');
      setTimeout(() => setPromoActionMsg(''), 5000);
    } catch (err: any) {
      setPromoActionMsg(`Broadcast error: ${err.message}`);
    } finally {
      setBroadcastingPromo(false);
    }
  };"""

if old_broadcast in content:
    content = content.replace(old_broadcast, new_broadcast, 1)
    print("handleBroadcastVariant patched!")
else:
    print("handleBroadcastVariant target not found!")

# 2. Add Backend Pod Load Distribution & Health Telemetry right after KPI grid
old_kpi_end = """                  <p className="text-[11px] text-slate-400 mt-1">Active commitment across live sessions</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}"""

new_pod_telemetry = """                  <p className="text-[11px] text-slate-400 mt-1">Active commitment across live sessions</p>
                </div>
              </div>

              {/* Backend Pod Load Distribution & Health Telemetry */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                        <span>Backend Pod Load Distribution & Real-Time Balancing</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                          3 REPLICAS LIVE
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Live WSS & HTTP session counts actively distributed across Kubernetes bidding engine worker pods.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-slate-500">Total Bidding Load:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      {liveSessions.filter(s => s.podName?.includes('bidding-engine')).length} Active Sessions
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: '479z9', label: 'bidding-engine-479z9', fullName: 'eauction-bidding-engine-9d9cb8cf4-479z9', ip: '172.16.138.78' },
                    { key: 'kgtcj', label: 'bidding-engine-kgtcj', fullName: 'eauction-bidding-engine-9d9cb8cf4-kgtcj', ip: '172.16.138.79' },
                    { key: 'qttrc', label: 'bidding-engine-qttrc', fullName: 'eauction-bidding-engine-9d9cb8cf4-qttrc', ip: '172.16.138.80' }
                  ].map((pod) => {
                    const podSessions = liveSessions.filter((s) => s.podName?.includes(pod.key));
                    const count = podSessions.length;
                    const totalBidding = liveSessions.filter(s => s.podName?.includes('bidding-engine')).length || 1;
                    const pct = Math.round((count / totalBidding) * 100);
                    const avgPing = count > 0 ? (podSessions.reduce((acc, s) => acc + (s.pingMs || 1.2), 0) / count).toFixed(1) : '1.2';
                    const activeBidders = podSessions.filter(s => s.status === 'BIDDING' || s.bidsPlacedInSession > 0).length;

                    return (
                      <div
                        key={pod.key}
                        onClick={() => setSessionPodFilter(sessionPodFilter === pod.key ? 'ALL' : pod.key)}
                        className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                          sessionPodFilter === pod.key
                            ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-300'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-mono font-bold text-xs text-slate-900">{pod.label}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{pod.ip}</span>
                        </div>

                        <div className="flex items-baseline justify-between mb-1.5">
                          <div>
                            <span className="text-2xl font-extrabold text-slate-900 font-mono">{count}</span>
                            <span className="text-[11px] text-slate-500 ml-1">sessions</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold font-mono ${pct > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {pct}% Load
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">~{avgPing}ms avg ping</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct > 55 ? 'bg-amber-500' : pct > 35 ? 'bg-indigo-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{activeBidders} active bidders</span>
                          <span className="text-indigo-600 font-medium hover:underline">
                            {sessionPodFilter === pod.key ? 'Showing filtered' : 'Click to filter'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filters & Search Toolbar */}"""

if old_kpi_end in content:
    content = content.replace(old_kpi_end, new_pod_telemetry, 1)
    print("Pod telemetry cards added!")
else:
    print("old_kpi_end target not found!")

# 3. Patch Pod Filter Dropdown to show session counts
old_pod_filter = """                  {/* Pod Filter */}
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
                  </select>"""

new_pod_filter = """                  {/* Pod Filter */}
                  <select
                    value={sessionPodFilter}
                    onChange={(e) => setSessionPodFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium focus:outline-hidden"
                  >
                    <option value="ALL">All K8s Pods ({liveSessions.length})</option>
                    <option value="479z9">Pod bidding-engine-479z9 ({liveSessions.filter(s => s.podName?.includes('479z9')).length})</option>
                    <option value="kgtcj">Pod bidding-engine-kgtcj ({liveSessions.filter(s => s.podName?.includes('kgtcj')).length})</option>
                    <option value="qttrc">Pod bidding-engine-qttrc ({liveSessions.filter(s => s.podName?.includes('qttrc')).length})</option>
                  </select>"""

if old_pod_filter in content:
    content = content.replace(old_pod_filter, new_pod_filter, 1)
    print("Pod filter dropdown patched!")
else:
    print("old_pod_filter target not found!")

# 4. Patch Bulk Rebalance Modal Options
old_bulk_options = """                          <option value="eauction-bidding-engine-9d9cb8cf4-479z9">bidding-engine-479z9</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-kgtcj">bidding-engine-kgtcj</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-qttrc">bidding-engine-qttrc</option>"""

new_bulk_src = """                          <option value="eauction-bidding-engine-9d9cb8cf4-479z9">bidding-engine-479z9 ({liveSessions.filter(s => s.podName?.includes('479z9')).length} sessions)</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-kgtcj">bidding-engine-kgtcj ({liveSessions.filter(s => s.podName?.includes('kgtcj')).length} sessions)</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-qttrc">bidding-engine-qttrc ({liveSessions.filter(s => s.podName?.includes('qttrc')).length} sessions)</option>"""

if old_bulk_options in content:
    content = content.replace(old_bulk_options, new_bulk_src, 1)
    print("Bulk source options patched!")
else:
    print("old_bulk_options target not found!")

old_bulk_tgt = """                          <option value="eauction-bidding-engine-9d9cb8cf4-kgtcj">bidding-engine-kgtcj</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-qttrc">bidding-engine-qttrc</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-479z9">bidding-engine-479z9</option>"""

new_bulk_tgt = """                          <option value="eauction-bidding-engine-9d9cb8cf4-kgtcj">bidding-engine-kgtcj ({liveSessions.filter(s => s.podName?.includes('kgtcj')).length} sessions)</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-qttrc">bidding-engine-qttrc ({liveSessions.filter(s => s.podName?.includes('qttrc')).length} sessions)</option>
                          <option value="eauction-bidding-engine-9d9cb8cf4-479z9">bidding-engine-479z9 ({liveSessions.filter(s => s.podName?.includes('479z9')).length} sessions)</option>"""

if old_bulk_tgt in content:
    content = content.replace(old_bulk_tgt, new_bulk_tgt, 1)
    print("Bulk target options patched!")
else:
    print("old_bulk_tgt target not found!")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("AdminPortal.tsx successfully updated!")
