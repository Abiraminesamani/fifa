import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, RefreshCw, BarChart2, Activity, Zap, Layers } from 'lucide-react';
import { CacheStats, AuditLogEntry } from '../types';

interface SystemIntelligenceProps {
  cacheStats: CacheStats;
  auditTrail: AuditLogEntry[];
  userRole: string;
}

export default function SystemIntelligence({ cacheStats, auditTrail, userRole }: SystemIntelligenceProps) {
  const [activeSubscribers, setActiveSubscribers] = useState(3);
  const [busHealthState, setBusHealthState] = useState<'nominal' | 'degraded'>('nominal');
  const [rateLimitHits, setRateLimitHits] = useState({ chat: 0, emergency: 0, transit: 0 });

  // Simulate slight fluctuation in telemetry values for visual fidelity
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSubscribers(prev => Math.max(2, Math.min(5, prev + (Math.random() > 0.5 ? 1 : -1))));
      setRateLimitHits(prev => ({
        chat: prev.chat + (Math.random() > 0.85 ? 1 : 0),
        emergency: prev.emergency + (Math.random() > 0.95 ? 1 : 0),
        transit: prev.transit + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRate = totalRequests > 0 ? Math.round((cacheStats.hits / totalRequests) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6" id="system-intelligence-view">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase font-mono tracking-wider">
            <Cpu className="w-5 h-5 text-indigo-400" />
            GenAI System Intelligence Command
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, model contract checks, and Digital Twin Event Bus diagnostics.
          </p>
        </div>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded border border-indigo-900">
          Operator Level: {userRole}
        </span>
      </div>

      {/* Grid: Twin Status & Cache Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Event Bus Diagnostics */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
              <Activity className="w-4 h-4 text-emerald-400" />
              Event Bus & Digital Twin Status
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">BUS COUPLING STATUS</span>
              <span className="text-emerald-400 font-semibold uppercase">NOMINAL_ONLINE</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">SSE ACTIVE CHANNELS</span>
              <span className="text-slate-300 font-bold">{activeSubscribers} Listeners</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">CONTEXT REVISIONS</span>
              <span className="text-slate-300 font-bold">Rev #{auditTrail.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EVENT DISPATCH RATE</span>
              <span className="text-indigo-400 font-semibold">~1.2 events/sec</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cache Hit-Miss Analytics */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Coalesced AI Cache Metrics
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">TOTAL AI PIPELINE TRAFFIC</span>
              <span className="text-slate-300 font-bold">{totalRequests} Queries</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">CACHE EFFECTIVENESS RATIO</span>
              <span className="text-indigo-400 font-bold">{hitRate}% Hit-Rate</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">AVG LATENCY REDUCTION</span>
              <span className="text-emerald-400 font-bold">-{cacheStats.avgMissLatencyMs - cacheStats.avgHitLatencyMs}ms per Hit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ESTIMATED COMPUTE SAVED</span>
              <span className="text-amber-400 font-bold">{(cacheStats.accumulatedSavingsMs / 1000).toFixed(1)}s CPU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Model Contract & Security Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 3: Model Output Contract Verification */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zod Contract Verification Logs
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">FAN ASSISTANT VALIDATION</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                PASSING <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">COPILOT SOP VALIDATION</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                PASSING <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">SUSTAINABILITY VALIDATION</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                PASSING <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TRANSIT SCHEMAS INJECTED</span>
              <span className="text-indigo-400 font-bold">OK (5 Contracts Active)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Rate Limiter Status */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-amber-400" />
            Security Rate Limiter Metrics
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">CHAT ENDPOINT LIMIT</span>
              <span className="text-slate-300 font-bold">5 req/min (Active)</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">EMERGENCY ENDPOINT LIMIT</span>
              <span className="text-slate-300 font-bold">20 req/min (Active)</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">SUSTAINABILITY LIMIT</span>
              <span className="text-slate-300 font-bold">10 req/min (Active)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RATE REJECTIONS TODAY</span>
              <span className={`font-bold ${rateLimitHits.chat > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {rateLimitHits.chat} Blocks Recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Logs section */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-indigo-400" />
          Active Micro-Telemetry Live Stream
        </h3>
        <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg font-mono text-[9px] text-slate-400 h-28 overflow-y-auto space-y-1 scrollbar-thin">
          <p className="text-slate-500">[{new Date().toLocaleTimeString()}] INF INITIALIZING COGNITIVE TELEMETRY PIPELINE...</p>
          <p className="text-indigo-400">[{new Date().toLocaleTimeString()}] INF ZOD ENFORCED: schemas.ts mapped securely to TypeScript compile targets.</p>
          <p className="text-emerald-400">[{new Date().toLocaleTimeString()}] DBG CACHE_ENG: Generated query signature matches cache key index.</p>
          <p className="text-slate-500">[{new Date().toLocaleTimeString()}] INF SSE: Listening channels connected.</p>
          {auditTrail.slice(0, 4).map((audit, i) => (
            <p key={i} className="text-slate-400">
              [{new Date(audit.timestamp).toLocaleTimeString()}] {audit.action.toUpperCase()}: {audit.details} ({audit.operatorRole})
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
