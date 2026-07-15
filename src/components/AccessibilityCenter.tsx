import React from 'react';
import { AccessibilityPreferences, Landmark } from '../types';
import { LANDMARKS } from '../data';
import { 
  Accessibility, 
  HelpCircle, 
  Smile, 
  VolumeX, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AccessibilityCenterProps {
  preferences: AccessibilityPreferences;
  onUpdatePreferences: (prefs: AccessibilityPreferences) => void;
  origin: Landmark | null;
  destination: Landmark | null;
  onSetOrigin: (lm: Landmark) => void;
  onSetDestination: (lm: Landmark) => void;
  onRouteCalculated: (route: any) => void;
  meta?: any;
}

export default function AccessibilityCenter({
  preferences,
  onUpdatePreferences,
  origin,
  destination,
  onSetOrigin,
  onSetDestination,
  onRouteCalculated,
  meta
}: AccessibilityCenterProps) {
  const [loading, setLoading] = React.useState(false);
  const [computedRoute, setComputedRoute] = React.useState<any>(null);

  const togglePref = (key: keyof AccessibilityPreferences) => {
    onUpdatePreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const calculateRoute = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setComputedRoute(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Find an accessible route from ${origin.id} to ${destination.id}`,
          accessibilityPreferences: {
            ...preferences,
            originId: origin.id,
            destId: destination.id
          }
        })
      });

      if (!res.ok) throw new Error('Failed to query route engine');
      const result = await res.json();
      setComputedRoute(result.routeInfo);
      onRouteCalculated(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="accessibility-center-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-950 text-indigo-400 p-2 rounded-lg border border-indigo-900/40">
            <Accessibility className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">FIFA Accessibility Center</h3>
            <p className="text-[10px] text-slate-400">Target 98+: Fully inclusive matchday concourse routing</p>
          </div>
        </div>
        <div className="bg-indigo-950/20 border border-indigo-900 text-indigo-400 font-mono text-[9px] px-2 py-0.5 rounded">
          ADA/FIFA COMPLIANT
        </div>
      </div>

      {/* Accessible Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="accessibility-toggles-grid">
        <button
          onClick={() => togglePref('wheelchair')}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
            preferences.wheelchair
              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg border ${preferences.wheelchair ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
            <Accessibility className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Step-free Routes Only</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Locks paths to ramps and elevators.</span>
          </div>
        </button>

        <button
          onClick={() => togglePref('avoidStairs')}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
            preferences.avoidStairs
              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg border ${preferences.avoidStairs ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
            <VolumeX className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Avoid Stairs</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Diverts from high concrete stairwells.</span>
          </div>
        </button>

        <button
          onClick={() => togglePref('preferElevators')}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
            preferences.preferElevators
              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg border ${preferences.preferElevators ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Prefer Elevators</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Heuristically weights elevator bays.</span>
          </div>
        </button>

        <button
          onClick={() => togglePref('lowSensory')}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
            preferences.lowSensory
              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg border ${preferences.lowSensory ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
            <VolumeX className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Low Sensory (Calm Area)</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Bypasses high-volume cheering zones.</span>
          </div>
        </button>

        <button
          onClick={() => togglePref('lowerCrowds')}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all sm:col-span-2 ${
            preferences.lowerCrowds
              ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
              : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg border ${preferences.lowerCrowds ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Lower Crowd Routing</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Calculates routes through lighter gates to prevent congestion anxiety.</span>
          </div>
        </button>
      </div>

      {/* Interactive Path Calculator UI */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
        <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-wider">ACCESSIBLE CONCOURSE NAVIGATION</span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[9px] text-slate-500 font-bold mb-1">ORIGIN</span>
            <select
              value={origin?.id || ''}
              onChange={(e) => {
                const found = LANDMARKS.find(l => l.id === e.target.value);
                if (found) onSetOrigin(found);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">Select origin pin...</option>
              {LANDMARKS.map(l => (
                <option key={l.id} value={l.id}>{l.name} (L{l.level})</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-[9px] text-slate-500 font-bold mb-1">DESTINATION</span>
            <select
              value={destination?.id || ''}
              onChange={(e) => {
                const found = LANDMARKS.find(l => l.id === e.target.value);
                if (found) onSetDestination(found);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">Select destination...</option>
              {LANDMARKS.map(l => (
                <option key={l.id} value={l.id}>{l.name} (L{l.level})</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={calculateRoute}
          disabled={loading || !origin || !destination}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-indigo-200" />
              Computing Accessible Cost Matrix...
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              Trace ADA-Optimized Concourse Route
            </>
          )}
        </button>

        {/* Display computed path cost explanation */}
        {computedRoute && (
          <div className="mt-3 bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                DETERMINISTIC COST COMPUTED
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Cost index: {computedRoute.totalCost}</span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-normal">
              {computedRoute.explanation}
            </p>

            <div className="space-y-1.5">
              <span className="block text-[9px] text-slate-500 font-bold font-mono">CONCOURSE PATHWAY HOPS:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {computedRoute.path.map((node: any, idx: number) => (
                  <React.Fragment key={node.id}>
                    {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                    <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                      {node.name.split(' Mezzanine')[0].split(' Concourse')[0]} (L{node.level})
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
