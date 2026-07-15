import React, { useState, useEffect } from 'react';
import { Landmark, IncidentLog, SustainabilityMetrics, UserRole, BroadcastPayload, AuditLogEntry, CacheStats, AccessibilityPreferences } from './types';
import { LANDMARKS, TRANSIT_LIST, STADIUM_NAME, STADIUM_CAPACITY } from './data';
import StadiumMap from './components/StadiumMap';
import ChatBot from './components/ChatBot';
import EmergencyCopilot from './components/EmergencyCopilot';
import SustainabilityPanel from './components/SustainabilityPanel';
import OrganizerDashboard from './components/OrganizerDashboard';
import AccessibilityCenter from './components/AccessibilityCenter';
import SystemIntelligence from './components/SystemIntelligence';
import AiTransparency from './components/AiTransparency';
import TransitCoordinatorPanel from './components/TransitCoordinatorPanel';
import {
  Compass,
  Bot,
  ShieldAlert,
  Leaf,
  Clock,
  MapPin,
  Train,
  Sparkles,
  Users,
  ShieldCheck,
  Cpu,
  BookmarkCheck,
  History,
  Lock
} from 'lucide-react';

export default function App() {
  // Global Role-Based Access Control (RBAC) State
  const [currentRole, setCurrentRole] = useState<UserRole>('FAN');
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'map' | 'assistant' | 'copilot' | 'sustainability' | 'dashboard' | 'system_intel' | 'transparency'>('map');

  // Unified Accessibility Preferences
  const [accessibilityPreferences, setAccessibilityPreferences] = useState<AccessibilityPreferences>({
    wheelchair: false,
    avoidStairs: false,
    preferElevators: false,
    lowSensory: false,
    lowerCrowds: false
  });

  // Navigation Origin/Destination states (Accessible routing)
  const [origin, setOrigin] = useState<Landmark | null>(null);
  const [destination, setDestination] = useState<Landmark | null>(null);

  // Synchronized Real-time State (emitted from Server EventBus via SSE)
  const [congestionA, setCongestionA] = useState(45);
  const [congestionB, setCongestionB] = useState(38);
  const [congestionC, setCongestionC] = useState(52);
  const [congestionD, setCongestionD] = useState(22);
  const [logs, setLogs] = useState<IncidentLog[]>([]);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<SustainabilityMetrics>({
    wasteLevel: 4.8,
    waterUsage: 350,
    energyUsage: 1200,
    binFullness: 45
  });
  const [activeBroadcasts, setActiveBroadcasts] = useState<BroadcastPayload[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);
  
  // Cache Performance indicators
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    avgHitLatencyMs: 0,
    avgMissLatencyMs: 0,
    accumulatedSavingsMs: 0
  });

  // Human-in-the-Loop approval queue
  const [pendingBroadcastProposal, setPendingBroadcastProposal] = useState<any>(null);

  // Multilingual state
  const [currentLanguage, setCurrentLanguage] = useState('English');

  // Map Preset trigger states
  const [presetLocation, setPresetLocation] = useState('');
  const [presetIncident, setPresetIncident] = useState('');

  // ---------------------------------------------------------------------------
  // 1. ESTABLISH SSE CONNECTION & PERFORMANCE STATS POLLING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          const payload = data.payload;
          setLogs(payload.incidents || []);
          setSustainabilityMetrics(payload.sustainability);
          setCongestionA(payload.crowd['gate-a'].density);
          setCongestionB(payload.crowd['gate-b'].density);
          setCongestionC(payload.crowd['gate-c'].density);
          setCongestionD(payload.crowd['gate-d'].density);
          setActiveBroadcasts(payload.activeBroadcasts || []);
          setAuditTrail(payload.auditTrail || []);
        } else if (data.type === 'crowd.updated') {
          const { zoneId, density } = data.payload;
          if (zoneId === 'gate-a') setCongestionA(density);
          if (zoneId === 'gate-b') setCongestionB(density);
          if (zoneId === 'gate-c') setCongestionC(density);
          if (zoneId === 'gate-d') setCongestionD(density);
        } else if (data.type === 'incident.created') {
          setLogs(prev => [data.payload, ...prev]);
        } else if (data.type === 'incident.resolved') {
          const { id } = data.payload;
          setLogs(prev => prev.map(log => log.id === id ? { ...log, status: 'Resolved' } : log));
        } else if (data.type === 'sustainability.updated') {
          setSustainabilityMetrics(data.payload);
        } else if (data.type === 'broadcast.approved') {
          setActiveBroadcasts(prev => [data.payload, ...prev]);
        } else if (data.type === 'audit.logged') {
          setAuditTrail(prev => [data.payload, ...prev]);
        }
      } catch (err) {
        console.error('SSE JSON parse error:', err);
      }
    };

    // Keep cache stats in sync
    const fetchCacheStats = async () => {
      try {
        const res = await fetch('/api/cache/stats');
        if (res.ok) {
          const stats = await res.json();
          setCacheStats(stats.cacheStats);
          setAuditTrail(stats.auditTrail);
        }
      } catch (e) {
        console.error('Failed to sync cache stats:', e);
      }
    };

    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 6000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. BIDIRECTIONAL EVENT DISPATCHERS (TRIGGERS EVENTBUS VIA POST)
  // ---------------------------------------------------------------------------
  const handleUpdateCongestion = async (gate: 'A' | 'B' | 'C' | 'D', value: number) => {
    const zoneId = gate === 'A' ? 'gate-a' : gate === 'B' ? 'gate-b' : gate === 'C' ? 'gate-c' : 'gate-d';
    try {
      await fetch('/api/events/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'crowd.updated',
          payload: { zoneId, density: value, trend: 1 }
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveLog = async (id: string) => {
    try {
      await fetch('/api/events/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'incident.resolved',
          payload: { id }
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomLog = async (
    category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd',
    location: string,
    detail: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    const newIncident = {
      id: `incident-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      category,
      detail,
      location,
      severity,
      status: 'Active'
    };

    try {
      await fetch('/api/events/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'incident.created',
          payload: newIncident
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSustainability = async (metrics: SustainabilityMetrics) => {
    try {
      await fetch('/api/events/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sustainability.updated',
          payload: metrics
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. HUMAN-IN-THE-LOOP PROPOSALS AND APPROVALS
  // ---------------------------------------------------------------------------
  const handleProposeBroadcastProposal = (proposal: any) => {
    setPendingBroadcastProposal(proposal);
    // Auto shift view to dashboard broadcasts tab so staff can instantly see the approval queue
    setActiveTab('dashboard');
  };

  const handleApproveBroadcastProposal = async (proposal: any, approvedBy: string) => {
    try {
      const res = await fetch('/api/broadcast/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast: proposal,
          approvedBy,
          approvedRole: currentRole
        })
      });

      if (res.ok) {
        setPendingBroadcastProposal(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. MAP INTERACTION PRESSETS
  // ---------------------------------------------------------------------------
  const handleMapIncidentTrigger = (type: string, locationId: string) => {
    const landmark = LANDMARKS.find(lm => lm.id === locationId);
    const locName = landmark ? landmark.name : locationId;
    
    setPresetIncident(type);
    setPresetLocation(locName);
    
    // Switch role to STAFF and open Copilot tab
    setCurrentRole('STAFF');
    setActiveTab('copilot');
  };

  const handleClearPresets = () => {
    setPresetLocation('');
    setPresetIncident('');
  };

  // Role Tab Filters (Strict RBAC visibility boundaries)
  const isTabAvailable = (tab: typeof activeTab): boolean => {
    if (tab === 'transparency') return true; // Transparency is open to everyone
    if (currentRole === 'FAN') {
      return tab === 'map' || tab === 'assistant';
    }
    if (currentRole === 'VOLUNTEER') {
      return tab === 'map' || tab === 'assistant';
    }
    return true; // Staff & Organizer access all tabs
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased flex flex-col select-none" id="main-application-shell">
      
      {/* Primary Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-[10px] px-2.5 py-1 rounded tracking-widest uppercase font-mono">
                FIFA WORLD CUP 2026
              </span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                Context v{auditTrail.length} Sync
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight mt-1">
              MetLife Stadium Digital Twin Operations
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {STADIUM_NAME} • Capacity: {STADIUM_CAPACITY}
            </p>
          </div>

          {/* Time and Role Dropdown */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="block text-[8px] text-slate-500 font-bold">MATCH STATUS</span>
                <span className="text-slate-300 text-[10px] uppercase font-semibold">Pre-Kickoff</span>
              </div>
            </div>

            {/* Role-Based Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 p-1.5 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold px-1.5 font-mono">ROLE:</span>
              <select
                value={currentRole}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setCurrentRole(newRole);
                  // Safeguard: Reset active tab if selected tab is unavailable in the new role
                  if (newRole === 'FAN' || newRole === 'VOLUNTEER') {
                    setActiveTab('map');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-indigo-300 font-bold font-mono focus:outline-none cursor-pointer"
              >
                <option value="FAN">🎫 FAN PORTAL</option>
                <option value="VOLUNTEER">🙋 VOLUNTEER ASSIST</option>
                <option value="STAFF">👮 SECURITY STAFF</option>
                <option value="ORGANIZER">🏆 FIFA ORGANIZER</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        
        {/* Left Side: Live Map visualizer (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <StadiumMap
            origin={origin}
            destination={destination}
            setOrigin={setOrigin}
            setDestination={setDestination}
            crowdLevel={congestionA > 80 ? 'Sellout' : 'Medium'}
            congestionA={congestionA}
            congestionB={congestionB}
            congestionC={congestionC}
            congestionD={congestionD}
            activeIncidents={logs.filter(l => l.status === 'Active')}
            onMapIncidentTrigger={handleMapIncidentTrigger}
          />

          {/* Transit Boards (Unrestricted) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Train className="w-4 h-4 text-indigo-400" />
              FIFA World Cup Transit Coordinates
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {TRANSIT_LIST.map(transit => (
                <div key={transit.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-[11px] gap-3">
                  <div className="flex items-center gap-2">
                    <Train className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="font-semibold block text-slate-200">{transit.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{transit.route}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[9px]">
                    <span className={`block font-bold ${transit.status.includes('delay') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {transit.status}
                    </span>
                    <span className="text-slate-500 block">{transit.schedule} • {transit.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* GenAI-driven Transit Load-Shift Coordinator */}
          <TransitCoordinatorPanel />
        </div>

        {/* Right Side: Tab panel coordinator (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-5 h-full">
          
          {/* Pill navigation block */}
          <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center ${
                activeTab === 'map' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Concourse Maps
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center ${
                activeTab === 'assistant' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fan Assist
            </button>

            {/* Lock indicator tabs if roles are not authorized */}
            <button
              onClick={() => isTabAvailable('copilot') && setActiveTab('copilot')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 ${
                !isTabAvailable('copilot')
                  ? 'text-slate-650 cursor-not-allowed opacity-30'
                  : activeTab === 'copilot'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isTabAvailable('copilot') && <Lock className="w-3 h-3" />}
              Decision Copilot
            </button>

            <button
              onClick={() => isTabAvailable('sustainability') && setActiveTab('sustainability')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 ${
                !isTabAvailable('sustainability')
                  ? 'text-slate-650 cursor-not-allowed opacity-30'
                  : activeTab === 'sustainability'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isTabAvailable('sustainability') && <Lock className="w-3 h-3" />}
              Green AI
            </button>

            <button
              onClick={() => isTabAvailable('dashboard') && setActiveTab('dashboard')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 relative ${
                !isTabAvailable('dashboard')
                  ? 'text-slate-650 cursor-not-allowed opacity-30'
                  : activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isTabAvailable('dashboard') && <Lock className="w-3 h-3" />}
              Dashboard
              {pendingBroadcastProposal && isTabAvailable('dashboard') && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={() => isTabAvailable('system_intel') && setActiveTab('system_intel')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 ${
                !isTabAvailable('system_intel')
                  ? 'text-slate-650 cursor-not-allowed opacity-30'
                  : activeTab === 'system_intel'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isTabAvailable('system_intel') && <Lock className="w-3 h-3" />}
              System Intel
            </button>

            <button
              onClick={() => setActiveTab('transparency')}
              className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all text-center ${
                activeTab === 'transparency' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Transparency
            </button>
          </div>

          {/* Tab contents panels */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">MetLife Stadium Live Overview</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The MetLife digital twin synchronizes live operations directly from the central server-side Event Bus. High-density zones and active incidents are plotted dynamically. Select pins to coordinate assistance.
                </p>

                <div className="grid grid-cols-2 gap-3" id="live-overview-metrics-grid">
                  <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl">
                    <span className="block text-[8px] text-slate-500 font-bold font-mono">CONGESTION LEVEL</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {congestionA > 85 ? 'Critical (Black Status)' : congestionA > 60 ? 'Heavy Congestion' : 'Optimal operations'}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl">
                    <span className="block text-[8px] text-slate-500 font-bold font-mono">ACTIVE BROADCASTS</span>
                    <span className="text-sm font-semibold text-indigo-400 font-mono">{activeBroadcasts.length} Approved</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Multilingual assistant */}
              <ChatBot
                currentLanguage={currentLanguage}
                setCurrentLanguage={setCurrentLanguage}
                accessibilityPreferences={accessibilityPreferences}
              />

              {/* Accessible center toggles */}
              <AccessibilityCenter
                preferences={accessibilityPreferences}
                onUpdatePreferences={setAccessibilityPreferences}
                origin={origin}
                destination={destination}
                onSetOrigin={setOrigin}
                onSetDestination={setDestination}
                onRouteCalculated={(route) => {
                  if (route.routeInfo) {
                    setOrigin(route.routeInfo.path[0]);
                    setDestination(route.routeInfo.path[route.routeInfo.path.length - 1]);
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'copilot' && isTabAvailable('copilot') && (
            <div className="animate-fadeIn">
              <EmergencyCopilot
                onAddIncidentLog={handleAddCustomLog}
                presetIncident={presetIncident}
                presetLocation={presetLocation}
                onClearPreset={handleClearPresets}
                userRole={currentRole}
                onProposeBroadcastProposal={handleProposeBroadcastProposal}
              />
            </div>
          )}

          {activeTab === 'sustainability' && isTabAvailable('sustainability') && (
            <div className="animate-fadeIn">
              <SustainabilityPanel
                metrics={sustainabilityMetrics}
                onChangeMetrics={handleUpdateSustainability}
                userRole={currentRole}
              />
            </div>
          )}

          {activeTab === 'dashboard' && isTabAvailable('dashboard') && (
            <div className="animate-fadeIn">
              <OrganizerDashboard
                logs={logs}
                onResolveLog={handleResolveLog}
                onAddCustomLog={handleAddCustomLog}
                crowdLevel={congestionA > 85 ? 'Sellout' : 'Medium'}
                setCrowdLevel={async (lvl) => {
                  // Bulk update over eventbus
                  const mult = lvl === 'Low' ? 15 : lvl === 'Medium' ? 45 : lvl === 'High' ? 75 : 95;
                  await handleUpdateCongestion('A', mult);
                  await handleUpdateCongestion('B', Math.max(0, mult - 10));
                  await handleUpdateCongestion('C', Math.min(100, mult + 8));
                  await handleUpdateCongestion('D', Math.max(0, mult - 20));
                }}
                onUpdateCongestion={handleUpdateCongestion}
                congestionA={congestionA}
                congestionB={congestionB}
                congestionC={congestionC}
                congestionD={congestionD}
                
                userRole={currentRole}
                activeBroadcasts={activeBroadcasts}
                pendingBroadcastProposal={pendingBroadcastProposal}
                onApproveBroadcastProposal={handleApproveBroadcastProposal}
                onCancelBroadcastProposal={() => setPendingBroadcastProposal(null)}
                auditTrail={auditTrail}
                cacheStats={cacheStats}
              />
            </div>
          )}

          {activeTab === 'system_intel' && isTabAvailable('system_intel') && (
            <div className="animate-fadeIn">
              <SystemIntelligence
                cacheStats={cacheStats}
                auditTrail={auditTrail}
                userRole={currentRole}
              />
            </div>
          )}

          {activeTab === 'transparency' && (
            <div className="animate-fadeIn">
              <AiTransparency />
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-[10px] text-slate-600 font-mono shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>© 2026 FIFA World Cup™ Local Stadium Operations. All events logged in the audit trail.</span>
          <span className="text-indigo-500 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Context-Engine Activated
          </span>
        </div>
      </footer>

    </div>
  );
}
