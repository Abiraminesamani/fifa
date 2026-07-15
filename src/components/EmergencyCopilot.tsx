import React, { useState } from 'react';
import { CopilotResponse, UserRole } from '../types';
import { 
  ShieldAlert, 
  Play, 
  CheckSquare, 
  FileText, 
  Users, 
  Radio, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Info,
  XCircle
} from 'lucide-react';

interface EmergencyCopilotProps {
  onAddIncidentLog: (category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd', location: string, detail: string, severity: 'low' | 'medium' | 'high' | 'critical') => void;
  presetLocation?: string;
  presetIncident?: string;
  onClearPreset?: () => void;
  
  // Architectural integrations
  userRole: UserRole;
  onProposeBroadcastProposal: (proposal: { incidentType: string; targetArea: string; message: string; sopRecommended: string; confidence: number }) => void;
}

export default function EmergencyCopilot({
  onAddIncidentLog,
  presetLocation = '',
  presetIncident = '',
  onClearPreset,
  userRole,
  onProposeBroadcastProposal
}: EmergencyCopilotProps) {
  const [incidentType, setIncidentType] = useState('Crowd Congestion');
  const [location, setLocation] = useState('Gate A Concourse');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [details, setDetails] = useState('Excessive fan pileups reported around the turnstiles leading to crowd delays and frustration.');
  
  // Routing simulation fields for deterministic code math
  const [sourceGate, setSourceGate] = useState<'gate-a' | 'gate-b' | 'gate-c' | 'gate-d'>('gate-a');
  const [destGate, setDestGate] = useState<'gate-a' | 'gate-b' | 'gate-c' | 'gate-d'>('gate-c');

  const [isLoading, setIsLoading] = useState(false);
  const [playbook, setPlaybook] = useState<CopilotResponse | null>(null);
  const [checkedRecommendations, setCheckedRecommendations] = useState<Record<number, boolean>>({});
  const [proposalStatus, setProposalStatus] = useState<'idle' | 'proposed'>('idle');

  // Sync preset if triggered from map clicks
  React.useEffect(() => {
    if (presetLocation && presetIncident) {
      setLocation(presetLocation);
      setIncidentType(presetIncident);
      setSeverity('high');
      
      if (presetIncident.includes('Medical')) {
        setIncidentType('Medical Emergency');
        setDetails('A spectator requires medical assistance on Level 1. Requesting on-duty volunteer EMT dispatch.');
      } else if (presetIncident.includes('Water')) {
        setIncidentType('Facility Water Leak');
        setDetails('Plumbing line overflow near East rest-west-1b causing wet floor slippage risks.');
      } else if (presetIncident.includes('Alarm')) {
        setIncidentType('VIP Security Alarm');
        setDetails('Plaza Security Level 2 trigger detected. Patrol dispatch requested for visual validation.');
      } else {
        setDetails('High volume spectator arrival surge leading to dense security queue line stalls.');
      }
    }
  }, [presetLocation, presetIncident]);

  const handleGeneratePlaybook = async () => {
    setIsLoading(true);
    setPlaybook(null);
    setCheckedRecommendations({});
    setProposalStatus('idle');

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: incidentType,
          location,
          severity,
          details,
          sourceGate,
          destGate
        })
      });

      if (!res.ok) throw new Error('Failed to generate incident playbook.');

      const data = await res.json();
      setPlaybook(data);

      // Map categories
      let category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd' = 'Security';
      if (incidentType.toLowerCase().includes('crowd') || incidentType.toLowerCase().includes('congestion')) category = 'Crowd';
      else if (incidentType.toLowerCase().includes('medical')) category = 'Medical';
      else if (incidentType.toLowerCase().includes('water') || incidentType.toLowerCase().includes('maintenance') || incidentType.toLowerCase().includes('power')) category = 'Maintenance';

      onAddIncidentLog(category, location, `${incidentType}: ${details}`, severity);
      if (onClearPreset) onClearPreset();
    } catch (error: any) {
      alert(`Error contact AI Security Service: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeJumbotron = () => {
    if (!playbook) return;
    onProposeBroadcastProposal({
      incidentType: incidentType,
      targetArea: location,
      message: playbook.jumbotronMessage,
      sopRecommended: playbook.action,
      confidence: playbook.confidence
    });
    setProposalStatus('proposed');
  };

  const toggleRecommendation = (idx: number) => {
    setCheckedRecommendations(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div id="emergency-copilot-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-rose-950 text-rose-400 p-2 rounded-lg border border-rose-900/40 animate-pulse">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Incident Decision Copilot</h3>
            <p className="text-[10px] text-slate-400">Grounded in physical metrics & Standard Operating Procedures</p>
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-900 text-rose-400 font-mono text-[9px] px-2 py-0.5 rounded">
          FIFA SECURITY LEVEL 3
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Form Panel (Left) */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 h-fit space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">INCIDENT DISPATCH PARTICULARS</span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1 font-mono">INCIDENT CATEGORY</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="Crowd Congestion">Crowd Congestion & Gate bottleneck</option>
                <option value="Medical Emergency">Medical Emergency / Collapse</option>
                <option value="Facility Water Leak">Facility Water Leak / Overflow</option>
                <option value="VIP Security Alarm">VIP Security Alarm Trigger</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1 font-mono">LOCATION AREA</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1 font-mono">SEVERITY LEVEL</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="low">Low (Yellow)</option>
                  <option value="medium">Medium (Orange)</option>
                  <option value="high">High (Red Alert)</option>
                  <option value="critical">Critical (Black Alert)</option>
                </select>
              </div>
            </div>

            {/* Deterministic physical inputs */}
            {incidentType === 'Crowd Congestion' && (
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[8px] text-slate-500 font-bold mb-1 font-mono">SOURCE GATE</label>
                  <select
                    value={sourceGate}
                    onChange={(e) => setSourceGate(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                  >
                    <option value="gate-a">Gate A (North)</option>
                    <option value="gate-b">Gate B (East)</option>
                    <option value="gate-c">Gate C (South)</option>
                    <option value="gate-d">Gate D (West)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] text-slate-500 font-bold mb-1 font-mono">DESTINATION GATE</label>
                  <select
                    value={destGate}
                    onChange={(e) => setDestGate(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                  >
                    <option value="gate-a">Gate A (North)</option>
                    <option value="gate-b">Gate B (East)</option>
                    <option value="gate-c">Gate C (South)</option>
                    <option value="gate-d">Gate D (West)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1 font-mono">SITUATIONAL DETAILS</label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Details of incidents..."
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none placeholder:text-slate-650 resize-none text-xs"
              />
            </div>

            <button
              onClick={handleGeneratePlaybook}
              disabled={isLoading || !location.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-rose-200" />
                  Generating SOP Playbook...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Evaluate & Generate SOP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel (Right) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {!playbook && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/20">
              <ShieldAlert className="w-8 h-8 text-slate-700 animate-pulse" />
              <h4 className="text-slate-400 font-semibold text-xs mt-3">Playbook Pending Action</h4>
              <p className="text-[10px] text-slate-500 max-w-sm mt-1 leading-normal">
                Submit details on the left. The AI Decision Copilot will evaluate the active incident and formulate grounded, structured SOP playbooks.
              </p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-850 rounded-xl p-8 text-center animate-pulse">
              <div className="flex items-center justify-center gap-1.5 h-12">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              </div>
              <h4 className="text-rose-400 font-mono text-xs mt-4 uppercase">AI COGNITIVE LAYER COMPUTING</h4>
              <p className="text-slate-500 text-[10px] mt-1 max-w-xs leading-normal">
                Constructing unified Stadium Context. Synthesizing standard operating procedure checklists...
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              
              {/* Grounded Evidence Box (Prinicple: Ground with real math first!) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-[10px] text-rose-400 font-bold font-mono uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    GROUNDING EVIDENCE & CALCULATIONS
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Verified in code</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg">
                    <span className="block text-slate-500 font-bold font-mono text-[9px] uppercase">DECISION ACTION</span>
                    <p className="text-slate-200 mt-0.5">{playbook.action}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg">
                    <span className="block text-slate-500 font-bold font-mono text-[9px] uppercase">RATIONALE (WHY)</span>
                    <p className="text-slate-300 mt-0.5">{playbook.why}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-center font-mono">
                    <span className="block text-[8px] text-slate-500">SOURCE DENSITY</span>
                    <strong className="text-xs text-rose-400">{playbook.sourceDensity}%</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-center font-mono">
                    <span className="block text-[8px] text-slate-500">DEST DENSITY</span>
                    <strong className="text-xs text-indigo-400">{playbook.destDensity}%</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-center font-mono">
                    <span className="block text-[8px] text-slate-500">LOAD SHIFT INTENT</span>
                    <strong className="text-xs text-emerald-400">-{playbook.calculatedReduction}%</strong>
                  </div>
                </div>

                {playbook.meta && (
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-850">
                    <span>Model: {playbook.meta.model}</span>
                    <span>Latency: {playbook.meta.latencyMs}ms</span>
                    <span>Cache: {playbook.meta.cache}</span>
                  </div>
                )}
              </div>

              {/* Standard Operating Procedure Checklist */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                <span className="block text-[10px] font-bold text-amber-400 font-mono uppercase">
                  👮 ACTION-READY SOP PROCEDURES:
                </span>
                
                <div className="space-y-1.5 text-xs">
                  {playbook.sopSteps.map((step, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                        checkedRecommendations[idx]
                          ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-500 line-through'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-750'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedRecommendations[idx]}
                        onChange={() => toggleRecommendation(idx)}
                        className="mt-0.5 accent-emerald-500"
                        id={`sop-checkbox-${idx}`}
                      />
                      <span>{step}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Jumbotron screen advisory */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 relative space-y-2">
                <span className="block text-[10px] font-bold text-teal-400 font-mono uppercase">
                  📡 PROPOSED STADIUM SCREEN ALERT MESSAGE:
                </span>
                
                <p className="text-[11px] text-amber-300 bg-slate-900 border border-slate-800 p-2.5 rounded-lg leading-normal font-mono">
                  "{playbook.jumbotronMessage}"
                </p>

                {proposalStatus === 'proposed' ? (
                  <div className="bg-amber-950/20 border border-amber-900/60 text-amber-400 text-[10px] font-semibold py-2 px-3 rounded-lg text-center font-mono">
                    ✓ PROPOSAL DISPATCHED TO HUMAN CONTROL SHELF. AWAITING APPROVAL.
                  </div>
                ) : (
                  <button
                    onClick={handleProposeJumbotron}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 rounded-lg text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Propose Jumbotron Takeover (Requires Human Review)
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
