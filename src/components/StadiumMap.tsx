import React, { useState } from 'react';
import { Landmark, IncidentLog } from '../types';
import { LANDMARKS, generateRoutePath } from '../data';
import { MapPin, Navigation, Info, ShieldAlert, ArrowRight, UserPlus, Flame, HeartPulse, Hammer } from 'lucide-react';

interface StadiumMapProps {
  origin: Landmark | null;
  destination: Landmark | null;
  setOrigin: (landmark: Landmark | null) => void;
  setDestination: (landmark: Landmark | null) => void;
  crowdLevel: 'Low' | 'Medium' | 'High' | 'Sellout';
  congestionA: number; // 0-100
  congestionB: number;
  congestionC: number;
  congestionD: number;
  activeIncidents: IncidentLog[];
  onMapIncidentTrigger?: (type: string, location: string) => void;
}

export default function StadiumMap({
  origin,
  destination,
  setOrigin,
  setDestination,
  crowdLevel,
  congestionA,
  congestionB,
  congestionC,
  congestionD,
  activeIncidents,
  onMapIncidentTrigger,
}: StadiumMapProps) {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [hoveredPin, setHoveredPin] = useState<Landmark | null>(null);

  // Filter landmarks by selected floor/level
  const filteredLandmarks = LANDMARKS.filter(lm => lm.level === selectedLevel);

  // Generate route path if both are selected
  let routePoints: { x: number; y: number }[] = [];
  if (origin && destination) {
    routePoints = generateRoutePath(origin, destination, crowdLevel === 'Sellout' || crowdLevel === 'High');
  }

  // Get color for gate congestion
  const getCongestionColor = (val: number) => {
    if (val < 40) return 'rgba(34, 197, 94, 0.55)'; // green
    if (val < 75) return 'rgba(245, 158, 11, 0.65)'; // orange
    return 'rgba(239, 68, 68, 0.75)'; // red
  };

  const getIncidentIcon = (category: string) => {
    switch (category) {
      case 'Security': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Medical': return <HeartPulse className="w-4 h-4 text-amber-500" />;
      default: return <Hammer className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div id="stadium-map-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            Interactive Stadium Visualizer
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time heatmaps, floor plans, and GenAI route calculations
          </p>
        </div>

        {/* Level Toggles */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono">LEVEL:</span>
          {([1, 2, 3] as const).map(level => (
            <button
              key={level}
              id={`btn-map-level-${level}`}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedLevel === level
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              L{level}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative w-full aspect-square max-w-2xl mx-auto bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
        {/* Map Legend */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg text-[10px] space-y-1.5 text-slate-300 z-10 max-w-xs shadow-lg font-mono">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">LEGEND & INDICATORS</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span>Gate A (North Concourse) - {congestionA}% Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
            <span>Gate B (East Concourse) - {congestionB}% Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span>
            <span>Central Pitch (Access Restricted)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 border border-dashed border-yellow-400 block"></span>
            <span>GenAI Calculated Pathway</span>
          </div>
          {activeIncidents.length > 0 && (
            <div className="flex items-center gap-2 text-red-400 font-semibold mt-1">
              <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" />
              <span>{activeIncidents.length} Active Incidents Logged</span>
            </div>
          )}
        </div>

        {/* Level Map Renderer */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full select-none"
          id="stadium-svg-canvas"
        >
          {/* Ambient Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="0.2" />
            </pattern>
            <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* 1. Outer Stadium Bowl Outline */}
          <ellipse cx="50" cy="50" rx="44" ry="44" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="42" ry="42" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />

          {/* 2. Middle Concourse Ring */}
          <ellipse cx="50" cy="50" rx="34" ry="34" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
          
          {/* 3. Lower Tier Concourse Ring */}
          <ellipse cx="50" cy="50" rx="26" ry="26" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.5" />

          {/* 4. Gate Congestion / Heatmap Outer Glows */}
          {/* Gate A (Top / North) */}
          <circle cx="50" cy="10" r="10" fill={getCongestionColor(congestionA)} className="animate-pulse origin-center" style={{ animationDuration: '3s' }} />
          {/* Gate B (Right / East) */}
          <circle cx="85" cy="50" r="10" fill={getCongestionColor(congestionB)} className="animate-pulse origin-center" style={{ animationDuration: '3.5s' }} />
          {/* Gate C (Bottom / South) */}
          <circle cx="50" cy="90" r="10" fill={getCongestionColor(congestionC)} className="animate-pulse origin-center" style={{ animationDuration: '4s' }} />
          {/* Gate D (Left / West) */}
          <circle cx="15" cy="50" r="10" fill={getCongestionColor(congestionD)} className="animate-pulse origin-center" style={{ animationDuration: '4.5s' }} />

          {/* 5. The Football Pitch (Central Field) */}
          <rect x="36" y="38" width="28" height="24" rx="1.5" fill="#14532d" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          <rect x="36" y="38" width="28" height="24" rx="1.5" fill="url(#pitchGlow)" />
          {/* Halfway line */}
          <line x1="50" y1="38" x2="50" y2="62" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          {/* Center circle */}
          <circle cx="50" cy="50" r="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          {/* Penalty boxes */}
          <rect x="36" y="44" width="4" height="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          <rect x="60" y="44" width="4" height="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />

          {/* 6. Active incident indicators on map */}
          {activeIncidents.map(inc => {
            // Find map coordinates corresponding to the location
            const landmarkMatch = LANDMARKS.find(lm => inc.location.toLowerCase().includes(lm.name.split(' (')[0].toLowerCase()) || lm.id === inc.location);
            const x = landmarkMatch ? landmarkMatch.x : 50;
            const y = landmarkMatch ? landmarkMatch.y : 50;
            return (
              <g key={inc.id} className="cursor-pointer">
                <circle cx={x} cy={y} r="5" fill="rgba(239, 68, 68, 0.4)" className="animate-ping" />
                <circle cx={x} cy={y} r="2.5" fill="#ef4444" />
              </g>
            );
          })}

          {/* 7. Draw GenAI calculated pathway */}
          {routePoints.length > 1 && (
            <path
              d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              className="animate-[dash_10s_linear_infinite]"
              id="svg-route-path"
              style={{
                strokeDashoffset: 100,
              }}
            />
          )}

          {/* 8. Render active Landmark Pins */}
          {filteredLandmarks.map(lm => {
            const isOrigin = origin?.id === lm.id;
            const isDestination = destination?.id === lm.id;
            
            // Assign pin colors based on types
            let pinColor = '#94a3b8'; // slate
            if (lm.type === 'gate') pinColor = '#10b981'; // emerald
            if (lm.type === 'food') pinColor = '#f59e0b'; // amber
            if (lm.type === 'restroom') pinColor = '#06b6d4'; // cyan
            if (lm.type === 'medical') pinColor = '#ec4899'; // pink
            if (lm.type === 'section') pinColor = '#6366f1'; // indigo

            if (isOrigin) pinColor = '#4f46e5'; // selected purple
            if (isDestination) pinColor = '#ef4444'; // selected red

            return (
              <g
                key={lm.id}
                transform={`translate(${lm.x}, ${lm.y})`}
                onClick={() => setHoveredPin(hoveredPin?.id === lm.id ? null : lm)}
                onMouseEnter={() => setHoveredPin(lm)}
                className="cursor-pointer group"
                id={`map-pin-${lm.id}`}
              >
                {/* Glow ring if selected */}
                {(isOrigin || isDestination) && (
                  <circle cx="0" cy="0" r="4" fill="none" stroke={pinColor} strokeWidth="1" className="animate-ping" />
                )}
                {/* Anchor dot */}
                <circle cx="0" cy="0" r="1.5" fill="#020617" />
                {/* Visual Pin */}
                <circle
                  cx="0"
                  cy="-2"
                  r="2.2"
                  fill={pinColor}
                  stroke="#020617"
                  strokeWidth="0.5"
                  className="transition-transform group-hover:scale-125"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating details / Pin Selection card inside Map container */}
        {hoveredPin && (
          <div
            id="stadium-map-pin-hover-card"
            className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-4 rounded-xl text-slate-200 shadow-2xl z-20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: hoveredPin.type === 'gate' ? '#10b981' : hoveredPin.type === 'food' ? '#f59e0b' : hoveredPin.type === 'restroom' ? '#06b6d4' : hoveredPin.type === 'medical' ? '#ec4899' : '#6366f1' }}></span>
                <h4 className="font-semibold text-sm text-slate-100">{hoveredPin.name}</h4>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">LEVEL {hoveredPin.level}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{hoveredPin.description}</p>
              {hoveredPin.accessibilityNotes && (
                <p className="text-[10px] text-teal-400 flex items-center gap-1 mt-1 font-mono">
                  <span className="font-bold">♿ ACCESSIBILITY:</span> {hoveredPin.accessibilityNotes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-slate-850 pt-2 md:pt-0 md:border-t-0">
              <button
                id="btn-set-map-origin"
                onClick={() => {
                  setOrigin(hoveredPin);
                  if (destination?.id === hoveredPin.id) setDestination(null);
                }}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded flex items-center gap-1 transition-all ${
                  origin?.id === hoveredPin.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-400 hover:bg-slate-700'
                }`}
              >
                Set Origin
              </button>
              <button
                id="btn-set-map-destination"
                onClick={() => {
                  setDestination(hoveredPin);
                  if (origin?.id === hoveredPin.id) setOrigin(null);
                }}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded flex items-center gap-1 transition-all ${
                  destination?.id === hoveredPin.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-red-400 hover:bg-slate-700'
                }`}
              >
                Set Destination
              </button>
              <button
                onClick={() => setHoveredPin(null)}
                className="text-xs text-slate-400 hover:text-slate-200 px-1.5"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Organizer Quick Triggers */}
      {onMapIncidentTrigger && (
        <div className="mt-5 border-t border-slate-800/80 pt-4 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Staff Simulation: Click to trigger an operational incident on map</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onMapIncidentTrigger('Turnstile Congestion', 'gate-a')}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all text-left"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Gate A Crowding</span>
            </button>
            <button
              onClick={() => onMapIncidentTrigger('Medical Emergency', 'sec-112')}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all text-left"
            >
              <HeartPulse className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Medical (Sec 112)</span>
            </button>
            <button
              onClick={() => onMapIncidentTrigger('Sewer Water Leak', 'restroom-2b')}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all text-left"
            >
              <Hammer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Water Leak (Sec 224)</span>
            </button>
            <button
              onClick={() => onMapIncidentTrigger('VIP Suite Crowd Alarm', 'sec-224')}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all text-left"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>VIP Alarm (Sec 224)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
