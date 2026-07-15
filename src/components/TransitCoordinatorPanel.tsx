import React, { useState } from 'react';
import { Train, ArrowRight, Sparkles, RefreshCw, AlertCircle, Info, Check } from 'lucide-react';

interface TransitData {
  transitService: string;
  statusSummary: string;
  actionRecommendation: string;
  rationale: string;
  expectedImpact: string;
  alternativeSop: string;
  confidence: number;
}

export default function TransitCoordinatorPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransitData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default transit live dashboard values that can be modified by the user
  const [railLoad, setRailLoad] = useState(85);
  const [shuttleLoad, setShuttleLoad] = useState(25);
  const [rideshareWait, setRideshareWait] = useState(15);

  const handleCoordinate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meadowlandsLoad: railLoad,
          meadowlandsStatus: railLoad > 80 ? 'Heavy Congestion' : 'Nominal',
          shuttleWestLoad: shuttleLoad,
          shuttleWestStatus: shuttleLoad > 70 ? 'Congested' : 'On Schedule',
          rideshareWait: rideshareWait,
          rideshareSurge: rideshareWait > 10 ? 1.5 : 1.0,
          loadShiftPotential: Math.max(10, railLoad - shuttleLoad)
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error or is rate-limited.');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to contact AI Transit Coordinator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4" id="transit-coordinator-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <Train className="w-4 h-4 text-indigo-400" />
          GenAI Transit Coordinator Board
        </h3>
        <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-900/30">
          Live Connection Active
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
        Dynamically shifts passenger flow by analyzing peak crowd metrics at local rail platforms, bus links, and rideshare bays using server-side Gemini intelligence.
      </p>

      {/* Slide / Input control bars */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
        <h4 className="text-[10px] text-slate-500 uppercase font-bold font-mono tracking-wider">Configure Telemetry inputs</h4>
        
        <div className="space-y-2.5">
          {/* Slider 1: Meadowlands Rail Load */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Meadowlands Rail Platform Load</span>
              <span className={`font-bold ${railLoad > 75 ? 'text-rose-400' : 'text-slate-300'}`}>{railLoad}% Capacity</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={railLoad}
              onChange={(e) => setRailLoad(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Shuttle West Bus Load */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Shuttle West Express Bus Load</span>
              <span className="text-slate-300 font-bold">{shuttleLoad}% Capacity</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={shuttleLoad}
              onChange={(e) => setShuttleLoad(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Input: Rideshare waiting time */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono border-t border-slate-900">
            <span className="text-slate-400">Rideshare Lot Wait Time</span>
            <div className="flex items-center gap-1.5">
              <input 
                type="number" 
                min="2" 
                max="60" 
                value={rideshareWait} 
                onChange={(e) => setRideshareWait(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 w-12 text-center text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-500">mins</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCoordinate}
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all shadow"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Running Neural Transit Calculus...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Calculate Load Shift Recommendation
            </>
          )}
        </button>
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-900 text-rose-300 p-3 rounded-lg flex items-start gap-2.5 text-[11px] leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold">Coordination Blocked:</span> {error}
          </div>
        </div>
      )}

      {/* AI Recommendation Output */}
      {result && !loading && (
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950 space-y-3.5 animate-fadeIn">
          {/* Service & Confidence */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
            <div>
              <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">RECOMMENDED CHANNEL</span>
              <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {result.transitService}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] text-slate-500 font-bold font-mono uppercase">AI CONFIDENCE</span>
              <span className="text-xs font-bold text-indigo-400 font-mono">{result.confidence}% Match</span>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="space-y-2 text-[11px]">
            <div>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">STATUS ASSESSMENT</span>
              <p className="text-slate-300 font-sans mt-0.5">{result.statusSummary}</p>
            </div>

            <div>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">PROPOSED Shift ACTION</span>
              <p className="text-emerald-400 font-sans font-semibold mt-0.5">{result.actionRecommendation}</p>
            </div>

            <div>
              <span className="block text-[9px] text-slate-500 font-mono font-bold">GROUNDED RATIONALE</span>
              <p className="text-slate-400 font-sans mt-0.5 leading-relaxed">{result.rationale}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
              <div className="bg-indigo-950/20 border border-indigo-900/30 p-2 rounded-lg">
                <span className="block text-[8px] text-indigo-400 font-mono font-bold uppercase">EXPECTED IMPACT</span>
                <span className="text-indigo-300 font-bold text-[10px] block mt-0.5">{result.expectedImpact}</span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg">
                <span className="block text-[8px] text-slate-500 font-mono font-bold uppercase">ALTERNATIVE SOP PLAN</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{result.alternativeSop}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
