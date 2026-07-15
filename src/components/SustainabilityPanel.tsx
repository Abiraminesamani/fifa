import React, { useState } from 'react';
import { SustainabilityMetrics, SustainabilityReport, UserRole } from '../types';
import { 
  Leaf, 
  Lightbulb, 
  Droplets, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';

interface SustainabilityPanelProps {
  metrics: SustainabilityMetrics;
  onChangeMetrics: (m: SustainabilityMetrics) => void;
  userRole: UserRole;
}

export default function SustainabilityPanel({
  metrics,
  onChangeMetrics,
  userRole
}: SustainabilityPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SustainabilityReport | null>(null);
  const [recyclingDrive, setRecyclingDrive] = useState(false);
  const [floodlightsOn, setFloodlightsOn] = useState(true);

  const handleFetchReport = async () => {
    setIsLoading(true);
    setReport(null);

    try {
      const res = await fetch('/api/sustainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      if (!res.ok) throw new Error('Failed to retrieve Green AI analysis.');

      const data = await res.json();
      setReport(data);
    } catch (error: any) {
      alert(`Error contact Sustainability AI: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFloodlights = () => {
    setFloodlightsOn(!floodlightsOn);
    onChangeMetrics({
      ...metrics,
      energyUsage: floodlightsOn ? metrics.energyUsage - 400 : metrics.energyUsage + 400
    });
  };

  const toggleRecyclingDrive = () => {
    setRecyclingDrive(!recyclingDrive);
    onChangeMetrics({
      ...metrics,
      binFullness: recyclingDrive ? Math.min(100, metrics.binFullness + 15) : Math.max(0, metrics.binFullness - 20)
    });
  };

  // RBAC permissions check
  const isWritable = userRole === 'STAFF' || userRole === 'ORGANIZER';

  return (
    <div id="sustainability-panel-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg border border-emerald-900/40">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Green AI Sustainability Coordinator</h3>
            <p className="text-[10px] text-slate-400">Smart garbage route management, electrical efficiency & water telemetry</p>
          </div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded">
          ECO CERTIFIED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Real-time Telemetry and Sliders (Left) */}
        <div className="md:col-span-5 space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">REAL-TIME ECO CONSOLE</span>

          {/* Telemetry metrics */}
          <div className="grid grid-cols-2 gap-3" id="sustainability-telemetry-grid">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2.5">
              <div className="bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 text-amber-500">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">WASTE ACCUM</span>
                <span className="text-xs font-semibold text-slate-200">{metrics.wasteLevel} Tons</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2.5">
              <div className="bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/30 text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">WATER REFLOW</span>
                <span className="text-xs font-semibold text-slate-200">{metrics.waterUsage} L/min</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2.5">
              <div className="bg-yellow-950/20 p-2 rounded-lg border border-yellow-900/30 text-yellow-400">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">POWER DRAW</span>
                <span className="text-xs font-semibold text-slate-200">{metrics.energyUsage} kW</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2.5">
              <div className="bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30 text-emerald-400">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">SMART BIN</span>
                <span className="text-xs font-semibold text-slate-200">{metrics.binFullness}% Avg</span>
              </div>
            </div>
          </div>

          {/* Interactive controls - locked by RBAC */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-3.5">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">SIMULATION MODIFIERS</span>
            
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="block font-semibold text-slate-300">Stadium Floodlights</span>
                <span className="text-[10px] text-slate-500">Toggles pitch field lighting load</span>
              </div>
              <button
                onClick={toggleFloodlights}
                disabled={!isWritable}
                className={`w-10 h-5.5 rounded-full transition-all relative cursor-pointer disabled:opacity-30 ${
                  floodlightsOn ? 'bg-amber-600' : 'bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  floodlightsOn ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-850 pt-2.5 text-xs">
              <div>
                <span className="block font-semibold text-slate-300">Active recycling incentive</span>
                <span className="text-[10px] text-slate-500 font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Coins className="w-3 h-3" /> Fan token rewards active
                </span>
              </div>
              <button
                onClick={toggleRecyclingDrive}
                disabled={!isWritable}
                className={`w-10 h-5.5 rounded-full transition-all relative cursor-pointer disabled:opacity-30 ${
                  recyclingDrive ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  recyclingDrive ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-850 text-xs">
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Set smart bin levels manually:</span>
                <span className="font-mono text-emerald-400">{metrics.binFullness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={metrics.binFullness}
                disabled={!isWritable}
                onChange={(e) => onChangeMetrics({ ...metrics, binFullness: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

          <button
            onClick={handleFetchReport}
            disabled={isLoading || !isWritable}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                Processing green audit recommendation matrix...
              </>
            ) : (
              <>
                <Leaf className="w-4 h-4" />
                {isWritable ? 'Trigger Green AI Optimization' : 'Locked for Fan/Volunteer Credentials'}
              </>
            )}
          </button>
        </div>

        {/* AI Recommendations (Right) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {!report && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/20">
              <Leaf className="w-8 h-8 text-slate-700 animate-pulse" />
              <h4 className="text-slate-400 font-semibold text-xs mt-3">Green AI Panel Dormant</h4>
              <p className="text-[10px] text-slate-500 max-w-sm mt-1 leading-normal">
                Click "Trigger Green AI Optimization" on the left. The compiler will ingest resource rates and output recycling allocations.
              </p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-850 rounded-xl p-8 text-center animate-pulse">
              <div className="flex items-center justify-center gap-1.5 h-12">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <h4 className="text-emerald-400 font-mono text-xs mt-4 uppercase">Ingesting Sustainability Context</h4>
              <p className="text-slate-500 text-[10px] mt-1 max-w-xs leading-normal">
                Connecting server-side Gemini 3.5 Flash... Reading greywater pressure and bin telemetry...
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              
              {/* Grounding box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    SUSTAINABILITY AUDIT GROUNDING
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Verified in code</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg">
                    <span className="block text-slate-500 font-bold font-mono text-[9px] uppercase">EXPECTED IMPACT</span>
                    <p className="text-slate-200 mt-0.5">{report.expectedImpact}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-center font-mono flex flex-col justify-center">
                    <span className="block text-slate-500 font-bold text-[9px] uppercase mb-0.5">CONFIDENCE</span>
                    <strong className="text-base text-emerald-400">{report.confidence}%</strong>
                  </div>
                </div>

                {report.meta && (
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-850">
                    <span>Model: {report.meta.model}</span>
                    <span>Latency: {report.meta.latencyMs}ms</span>
                    <span>Cache: {report.meta.cache}</span>
                  </div>
                )}
              </div>

              {/* Predictions */}
              <div className="bg-slate-950 border border-emerald-950 p-3.5 rounded-xl border-l-4 border-l-emerald-500 space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">
                  🔮 PREDICTED WASTE ACCUMULATION
                </span>
                <p className="text-[11px] text-slate-200 leading-normal font-sans">
                  {report.wastePrediction}
                </p>
              </div>

              {/* Alerts */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block font-mono">
                  🚨 LIVE TELEMETRY BOTTLENECK ALERTS:
                </span>
                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  {report.alerts.map((alert, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-2 rounded-lg flex items-start gap-1.5">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Efficiency steps */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider block font-mono">
                  ⚡ CONCRETE EFFICIENCY DIRECTIVES:
                </span>
                <div className="space-y-2 text-xs">
                  {report.efficiencySteps.map((step, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-300 leading-normal flex items-start gap-2 font-mono">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 rounded font-bold">
                        0{idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
