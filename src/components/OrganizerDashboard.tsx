import React, { useState } from 'react';
import { IncidentLog, UserRole, BroadcastPayload, AuditLogEntry, CacheStats } from '../types';
import { 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  FileText, 
  PlusCircle, 
  Printer, 
  Eye, 
  Clock, 
  UserCheck, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  ListTodo,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface OrganizerDashboardProps {
  logs: IncidentLog[];
  onResolveLog: (id: string) => void;
  onAddCustomLog: (category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd', location: string, detail: string, severity: 'low' | 'medium' | 'high' | 'critical') => void;
  crowdLevel: 'Low' | 'Medium' | 'High' | 'Sellout';
  setCrowdLevel: (level: 'Low' | 'Medium' | 'High' | 'Sellout') => void;
  onUpdateCongestion: (gate: 'A' | 'B' | 'C' | 'D', value: number) => void;
  congestionA: number;
  congestionB: number;
  congestionC: number;
  congestionD: number;
  
  // New Architectural Props
  userRole: UserRole;
  activeBroadcasts: BroadcastPayload[];
  pendingBroadcastProposal: { id: string; incidentType: string; targetArea: string; message: string; sopRecommended: string; confidence: number } | null;
  onApproveBroadcastProposal: (proposal: any, approvedBy: string) => void;
  onCancelBroadcastProposal: () => void;
  auditTrail: AuditLogEntry[];
  cacheStats: CacheStats;
}

export default function OrganizerDashboard({
  logs,
  onResolveLog,
  onAddCustomLog,
  crowdLevel,
  setCrowdLevel,
  onUpdateCongestion,
  congestionA,
  congestionB,
  congestionC,
  congestionD,
  
  userRole,
  activeBroadcasts,
  pendingBroadcastProposal,
  onApproveBroadcastProposal,
  onCancelBroadcastProposal,
  auditTrail,
  cacheStats
}: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'simulation' | 'logs' | 'broadcasts' | 'report' | 'efficiency'>('simulation');
  const [report, setReport] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportMeta, setReportMeta] = useState<any>(null);

  // New manual log form states
  const [customCategory, setCustomCategory] = useState<'Security' | 'Maintenance' | 'Medical' | 'Crowd'>('Security');
  const [customLocation, setCustomLocation] = useState('Section 101');
  const [customDetail, setCustomDetail] = useState('');
  const [customSeverity, setCustomSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Approval Modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approverName, setApproverName] = useState('Director of Ops');

  const handleFetchReport = async () => {
    setIsLoadingReport(true);
    setReport(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          activeCrowd: crowdLevel
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate daily report.');
      }

      const data = await res.json();
      setReport(data.report);
      setReportMeta(data.meta || null);
      setActiveTab('report');
    } catch (error: any) {
      alert(`Error contact Operations AI: ${error.message}`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSubmitCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDetail.trim()) return;
    onAddCustomLog(customCategory, customLocation, customDetail, customSeverity);
    setCustomDetail('');
  };

  const handleConfirmApproval = () => {
    if (pendingBroadcastProposal) {
      onApproveBroadcastProposal(pendingBroadcastProposal, approverName);
      setShowApprovalModal(false);
    }
  };

  return (
    <div id="organizer-dashboard-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-950/40 border border-rose-900/60 text-rose-400 font-bold font-mono text-[9px] px-2 py-0.5 rounded uppercase">
              ROLE LOCK: {userRole}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">FIFA COMMAND & CONTROL</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mt-1">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Tournament Operations Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            FIFA Match Day Command & Control centre simulator
          </p>
        </div>

        {/* Local Tab Navigation based on permissions */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
              activeTab === 'simulation' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulator
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incidents ({logs.filter(l => l.status === 'Active').length})
          </button>

          {(userRole === 'STAFF' || userRole === 'ORGANIZER') && (
            <button
              onClick={() => setActiveTab('broadcasts')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider flex items-center gap-1.5 relative ${
                activeTab === 'broadcasts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Broadcasts
              {pendingBroadcastProposal && (
                <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          {userRole === 'ORGANIZER' && (
            <>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
                  activeTab === 'report' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Brief Report
              </button>
              <button
                onClick={() => setActiveTab('efficiency')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider flex items-center gap-1 ${
                  activeTab === 'efficiency' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Efficiency
              </button>
            </>
          )}
        </div>
      </div>

      {/* Human In the Loop Warning Shelf (Always high priority and visible in Dashboard for Staff/Organizers) */}
      {pendingBroadcastProposal && activeTab !== 'broadcasts' && (userRole === 'ORGANIZER' || userRole === 'STAFF') && (
        <div className="bg-rose-950/20 border-l-4 border-l-rose-500 border border-rose-900/30 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              AI JUMBOTRON WARNING SHELF PROPOSAL PENDING
            </span>
            <p className="text-xs text-slate-300">
              Gemini proposed a stadium screen takeover message for: <strong>{pendingBroadcastProposal.incidentType}</strong>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('broadcasts')}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-all shadow"
          >
            Authorize & Review Action
          </button>
        </div>
      )}

      {/* 1. Simulator Content Tab */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard-simulation-panel">
          
          {/* Controls column */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">STADIUM TRAFFIC CONTROLLER</h4>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Match Attendance Density State:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Sellout'] as const).map(lvl => {
                    const disabled = userRole === 'VOLUNTEER';
                    return (
                      <button
                        key={lvl}
                        disabled={disabled}
                        onClick={() => {
                          setCrowdLevel(lvl);
                          // Automatically adjust gate congestions to match
                          if (lvl === 'Low') {
                            onUpdateCongestion('A', 15); onUpdateCongestion('B', 20); onUpdateCongestion('C', 10); onUpdateCongestion('D', 5);
                          } else if (lvl === 'Medium') {
                            onUpdateCongestion('A', 45); onUpdateCongestion('B', 38); onUpdateCongestion('C', 52); onUpdateCongestion('D', 22);
                          } else if (lvl === 'High') {
                            onUpdateCongestion('A', 75); onUpdateCongestion('B', 65); onUpdateCongestion('C', 82); onUpdateCongestion('D', 45);
                          } else {
                            onUpdateCongestion('A', 98); onUpdateCongestion('B', 92); onUpdateCongestion('C', 95); onUpdateCongestion('D', 80);
                          }
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all border ${
                          crowdLevel === lvl
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        } disabled:opacity-40`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Congestion sliders */}
              <div className="space-y-3 pt-3 border-t border-slate-850">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">FINE-TUNE INDIVIDUAL GATE CONGESTION:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(gate => {
                    const val = gate === 'A' ? congestionA : gate === 'B' ? congestionB : gate === 'C' ? congestionC : congestionD;
                    const color = gate === 'A' ? 'accent-emerald-500' : gate === 'B' ? 'accent-amber-500' : gate === 'C' ? 'accent-teal-500' : 'accent-blue-500';
                    return (
                      <div key={gate}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Gate {gate}:</span>
                          <span className="font-mono text-indigo-400 font-bold">{val}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val}
                          disabled={userRole === 'VOLUNTEER'}
                          onChange={(e) => onUpdateCongestion(gate as any, parseInt(e.target.value))}
                          className={`w-full ${color} h-1 bg-slate-900 rounded disabled:opacity-30`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {userRole === 'ORGANIZER' ? (
              <button
                onClick={handleFetchReport}
                disabled={isLoadingReport}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isLoadingReport ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-indigo-200" />
                    Generating Operations Summary...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Compile AI Match Day Briefing Report
                  </>
                )}
              </button>
            ) : (
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-[11px] text-slate-500 text-center">
                * Operational reports and briefings are locked to Authorized Organizer credentials.
              </div>
            )}
          </div>

          {/* Timeline and telemetry stats Column */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">OPERATIONS STATS</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-850 bg-slate-900/50 p-2.5 rounded-lg text-center">
                  <span className="block text-[9px] text-slate-500 font-bold font-mono">TICKET RATIO</span>
                  <span className="text-base font-semibold text-slate-200">{crowdLevel === 'Low' ? '32%' : crowdLevel === 'Medium' ? '65%' : crowdLevel === 'High' ? '88%' : '100%'}</span>
                  <span className="block text-[8px] text-emerald-400 font-mono mt-0.5">Scanned Tickets</span>
                </div>
                <div className="border border-slate-850 bg-slate-900/50 p-2.5 rounded-lg text-center">
                  <span className="block text-[9px] text-slate-500 font-bold font-mono">INCIDENT RATIO</span>
                  <span className="text-base font-semibold text-slate-200">{logs.filter(l => l.status === 'Active').length} Active</span>
                  <span className="block text-[8px] text-rose-400 font-mono mt-0.5">{logs.filter(l => l.status === 'Resolved').length} Resolved</span>
                </div>
              </div>
            </div>

            {/* In-Memory Timeline Audit Logs */}
            <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-1">
              <span className="block text-[9px] text-slate-500 font-bold font-mono uppercase">REAL-TIME OPERATIONAL AUDIT TIMELINE:</span>
              <div className="space-y-1.5 text-[10px]">
                {auditTrail.slice(0, 5).map((log, index) => (
                  <div key={index} className="bg-slate-900/60 border border-slate-850 rounded p-2 flex items-start gap-1.5 leading-normal">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between text-slate-500 font-mono text-[8px]">
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="text-indigo-400">[{log.operatorRole}]</span>
                      </div>
                      <p className="text-slate-300 font-mono mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Incidents and Dispatch Tab */}
      {activeTab === 'logs' && (
        <div id="dashboard-logs-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Logs Stream */}
          <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">STADIUM LIVE LOG STREAM</h4>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`border p-3 rounded-xl flex items-start justify-between gap-4 transition-all ${
                    log.status === 'Resolved'
                      ? 'bg-slate-900/40 border-slate-850 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg text-white mt-0.5 ${
                      log.status === 'Resolved'
                        ? 'bg-emerald-900/80 border border-emerald-800'
                        : log.severity === 'critical'
                        ? 'bg-red-600 animate-pulse'
                        : log.severity === 'high'
                        ? 'bg-orange-600'
                        : 'bg-slate-800'
                    }`}>
                      {log.status === 'Resolved' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-semibold text-xs text-slate-200">{log.category} Alert</span>
                        <span className="text-[9px] text-slate-500 font-mono">{log.time}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          log.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-slate-800 text-slate-400'
                        }`}>{log.severity}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{log.detail}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {log.location}
                      </div>
                    </div>
                  </div>

                  {log.status === 'Active' && (userRole === 'STAFF' || userRole === 'ORGANIZER') && (
                    <button
                      onClick={() => onResolveLog(log.id)}
                      className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-900/50 py-1 px-3 rounded text-[10px] font-semibold transition-all whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch form - locked based on RBAC */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">DISPATCH NEW INCIDENT</h4>
            
            {userRole === 'FAN' || userRole === 'VOLUNTEER' ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-850 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-slate-600" />
                <span className="block text-xs font-bold text-slate-400 mt-3">Access Denied</span>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                  Only authorized Staff or Organizers can deploy team-wide security and maintenance dispatches.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCustomLog} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">INCIDENT TYPE</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:outline-none"
                  >
                    <option value="Security">👮 Security Event</option>
                    <option value="Medical">🏥 Medical / Emergency Injury</option>
                    <option value="Maintenance">🛠️ Maintenance Breakout</option>
                    <option value="Crowd">🚶 Crowd Density Spike</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">LOCATION</label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Section 112"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">SEVERITY</label>
                    <select
                      value={customSeverity}
                      onChange={(e) => setCustomSeverity(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:outline-none"
                    >
                      <option value="low">Low (Yellow)</option>
                      <option value="medium">Medium (Orange)</option>
                      <option value="high">High (Red)</option>
                      <option value="critical">Critical (Black Alert)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 font-mono">LOG CASE PARTICULARS</label>
                  <textarea
                    rows={2}
                    value={customDetail}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    placeholder="Provide exact details for stadium personnel..."
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1.5 focus:outline-none placeholder:text-slate-650 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customDetail.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <PlusCircle className="w-4 h-4" />
                  Dispatch Incident Log
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Human-in-the-Loop Jumbotron Broadcast Approval Shelf Tab */}
      {activeTab === 'broadcasts' && (userRole === 'STAFF' || userRole === 'ORGANIZER') && (
        <div className="space-y-4" id="dashboard-broadcast-tab">
          
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">FIFA JUMBOTRON BROADCAST MANAGEMENT</h4>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900">
              MAPPED TO 16 STADIUM SCREENS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Pending Proposals Shelf (Left) */}
            <div className="lg:col-span-6 space-y-3">
              <span className="block text-[10px] font-bold text-amber-400 font-mono uppercase">AI PROPOSALS AWAITING HUMAN AUTHORIZATION:</span>
              
              {pendingBroadcastProposal ? (
                <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-4 space-y-4 border-l-4 border-l-amber-500 animate-fadeIn">
                  <div className="flex items-start justify-between border-b border-slate-850 pb-2">
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold font-mono">INCIDENT SOURCE</span>
                      <span className="text-xs font-bold text-slate-200">{pendingBroadcastProposal.incidentType}</span>
                    </div>
                    <span className="bg-amber-950 text-amber-400 border border-amber-900 font-mono text-[9px] px-2 py-0.5 rounded font-bold">
                      Confidence: {pendingBroadcastProposal.confidence}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] text-slate-500 font-bold font-mono">TAKE-OVER MESSAGE TEXT:</span>
                    <p className="text-xs text-amber-200 italic leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-850">
                      "{pendingBroadcastProposal.message}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] text-slate-500 font-bold font-mono">RECOMMENDED ACTION SOP GUIDELINES:</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {pendingBroadcastProposal.sopRecommended}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                    <button
                      onClick={onCancelBroadcastProposal}
                      className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-semibold py-2 rounded-lg transition-all"
                    >
                      Reject / Dismiss
                    </button>
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-lg flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve & Broadcast
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 text-center text-slate-500 text-xs h-48 flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                  <span className="block font-bold text-slate-400">All Clear</span>
                  <p className="text-[10px] text-slate-500 mt-1">No AI-generated broadcast takeovers currently queued.</p>
                </div>
              )}
            </div>

            {/* Active Live Broadcasts (Right) */}
            <div className="lg:col-span-6 space-y-3">
              <span className="block text-[10px] font-bold text-emerald-400 font-mono uppercase">ACTIVE JUMBOTRON BROADCAST LOGS (AUDITED):</span>
              
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {activeBroadcasts.length > 0 ? (
                  activeBroadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="bg-slate-950 border border-emerald-900/20 rounded-xl p-3 border-l-4 border-l-emerald-500 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-300 font-bold">📡 LIVE ON STADIUM SCREENS</span>
                        <span className="text-slate-500">{new Date(broadcast.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-200 font-mono bg-slate-900 p-2.5 rounded border border-slate-850">
                        "{broadcast.message}"
                      </p>
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                        <span>Role: {broadcast.approvedRole}</span>
                        <span className="text-emerald-400 font-bold">Approved by: {broadcast.approvedBy}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 text-center text-slate-500 text-xs h-48 flex flex-col items-center justify-center">
                    <Clock className="w-8 h-8 text-slate-600 mb-2" />
                    <span>No active screen broadcasts at MetLife Stadium</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Operational Briefing Tab */}
      {activeTab === 'report' && userRole === 'ORGANIZER' && (
        <div id="dashboard-report-panel" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">AI OPERATIONS BRIEFING REPORT</h4>
            <div className="flex items-center gap-3">
              {reportMeta && (
                <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>Latency: <strong className="text-emerald-400">{reportMeta.latencyMs}ms</strong></span>
                  <span>Cache: <strong className="text-indigo-400">{reportMeta.cache}</strong></span>
                </div>
              )}
              <button
                onClick={() => window.print()}
                className="bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 font-semibold py-1 px-3 rounded text-[10px] flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                Print Briefing
              </button>
            </div>
          </div>

          {!report ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-850 text-center flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-slate-600 animate-pulse" />
              <h4 className="text-slate-400 font-semibold text-sm mt-3">Briefing Table Unpopulated</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Go to the 'Simulator' tab and click "Compile AI Match Day Briefing Report" to run high-level operational digests.
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 font-sans text-xs text-slate-200 leading-relaxed border-l-4 border-l-indigo-500 max-h-96 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg mb-4 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="block font-bold text-slate-200 uppercase">DOCUMENT TYPE: OPERATIONAL REPORT</span>
                  <span>FIFA STADIUM CONTROL HUB • NEW YORK STADIUM</span>
                </div>
                <div className="text-right">
                  <span className="block">STATUS: CLASSIFIED OFFICIAL</span>
                  <span>GENERATED ON TIME: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose prose-invert prose-xs text-slate-300 max-w-none whitespace-pre-line">
                {report}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Caching and Efficiency Statistics Tab */}
      {activeTab === 'efficiency' && userRole === 'ORGANIZER' && (
        <div id="dashboard-efficiency-panel" className="space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">AI CACHE & SYSTEM EFFICIENCY PLATFORM</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Stats gauges */}
            <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="block text-[9px] text-slate-500 font-bold font-mono uppercase">REAL-TIME EFFICIENCY GAUGES</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                    <span className="block text-[9px] text-slate-500 font-bold font-mono">CACHE HITS</span>
                    <span className="text-xl font-bold text-indigo-400 font-mono">{cacheStats.hits}</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">TTL hit ratio</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                    <span className="block text-[9px] text-slate-500 font-bold font-mono">CACHE MISSES</span>
                    <span className="text-xl font-bold text-slate-400 font-mono">{cacheStats.misses}</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">LLM Generations</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total API Request Count:</span>
                  <strong className="font-mono text-slate-200">{cacheStats.totalRequests}</strong>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-400">Avg Cached Latency:</span>
                  <strong className="font-mono text-emerald-400">{cacheStats.avgHitLatencyMs} ms</strong>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-400">Avg LLM Latency:</span>
                  <strong className="font-mono text-amber-500">{cacheStats.avgMissLatencyMs} ms</strong>
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg text-center">
                <span className="block text-[9px] text-emerald-400 font-bold font-mono uppercase">ACCUMULATED TIME SAVED:</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{(cacheStats.accumulatedSavingsMs / 1000).toFixed(2)} Sec</span>
                <span className="text-[8px] text-slate-500 block mt-0.5">Bypassed token network hop delay</span>
              </div>
            </div>

            {/* Explanatory Context Diagram (Visual Art / Design) */}
            <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="block text-[9px] text-slate-500 font-bold font-mono uppercase">AI CONTEXT COALESCING SCHEMATIC</span>
                
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold">1. UNIFIED LIVE TELEMETRY</span>
                    <span className="text-emerald-400">✓ Event Bus Active</span>
                  </div>
                  
                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <span className="text-indigo-400 font-bold">2. DETAILED TS GRAPH COSTS</span>
                    <span className="text-emerald-400">✓ Deterministic Cost Tracing</span>
                  </div>

                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <span className="text-indigo-400 font-bold">3. SINGLE-FLIGHT COALESCER</span>
                    <span className="text-emerald-400">✓ Request Deduplication Running</span>
                  </div>

                  <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400 leading-normal font-sans">
                    Rather than operating as disconnected, isolated chatbots that constantly duplicate Gemini calls, the platform channels all fan, safety, and sustainability requests through a centralized <strong>Stadium Context Engine</strong>. Combined with standard TTL caching, duplicate request coalescence, and security guardrails, the platform delivers pristine latency metrics (<strong className="text-emerald-400">~18ms hits</strong>) while securing 100% accurate, audited operations.
                  </div>
                </div>
              </div>

              <div className="text-center p-3 border border-slate-850 rounded-lg text-[10px] text-indigo-400 font-mono">
                🛰️ Live cache mapping connected: metlife_stadium_context_v{auditTrail.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* AUTHORIZED HUMAN APPROVAL MODAL */}
      {/* --------------------------------------------------------------------- */}
      {showApprovalModal && pendingBroadcastProposal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">Confirm Operational Action</h3>
                <span className="text-[10px] text-rose-500 font-mono font-bold">⚠️ CRITICAL: SYSTEM-WIDE ADVISORY TAKEOVER</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div>
                <span className="block text-[10px] text-slate-500 font-bold font-mono">TARGET REGION:</span>
                <strong className="text-slate-200">16 Jumbotrons (MetLife Stadium Screen Area)</strong>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 font-bold font-mono">BROADCAST TEXT:</span>
                <p className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-amber-300 mt-1 leading-normal">
                  "{pendingBroadcastProposal.message}"
                </p>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 font-bold font-mono">AUTHORIZED OPERATOR ROLE:</span>
                <select
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none cursor-pointer mt-1"
                >
                  <option value="Stadium Operations Director">Stadium Operations Director (ORGANIZER)</option>
                  <option value="Chief Security Warden">Chief Security Warden (STAFF)</option>
                  <option value="Lead Concourse Supervisor">Lead Concourse Supervisor (STAFF)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-semibold py-2 rounded-lg transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg transition-all text-xs shadow-lg"
              >
                Confirm & Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
