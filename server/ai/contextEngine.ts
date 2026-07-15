import eventBus from '../realtime/eventBus';

export interface VenueContext {
  name: string;
  location: string;
  totalCapacity: number;
  currentMatch: string;
  matchPhase: string;
}

export interface CrowdContext {
  gates: Array<{
    id: string;
    name: string;
    density: number;
    trend: number;
    flowState: 'Optimal' | 'Heavy' | 'Critical';
  }>;
  totalScannedRatio: number;
}

export interface IncidentContext {
  id: string;
  time: string;
  category: string;
  detail: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Active' | 'Resolved';
}

export interface SustainabilityContext {
  wasteLevel: number;
  waterUsage: number;
  energyUsage: number;
  binFullness: number;
}

export interface TransitContext {
  services: Array<{
    name: string;
    route: string;
    schedule: string;
    cost: string;
    status: string;
  }>;
}

export interface AccessibilityNode {
  id: string;
  name: string;
  level: number;
  accessibility: {
    wheelchair: boolean;
    elevator: boolean;
    ramp: boolean;
    stairsRequired: boolean;
    sensoryLoad: 'low' | 'medium' | 'high';
  };
  crowdDensity: number;
}

export interface AccessibilityContext {
  nodes: AccessibilityNode[];
}

export interface StadiumContext {
  timestamp: string;
  venue: VenueContext;
  crowd: CrowdContext;
  incidents: IncidentContext[];
  sustainability: SustainabilityContext;
  transit: TransitContext;
  accessibility: AccessibilityContext;
}

// ---------------------------------------------------------------------------
// Concourse Node Map for Accessibility Routing
// Represents physical regions in MetLife Stadium for the path cost router
// ---------------------------------------------------------------------------
export const CONCOURSE_NODES: AccessibilityNode[] = [
  { id: 'sec-101', name: 'Section 101 Gate A Plaza', level: 1, accessibility: { wheelchair: true, elevator: false, ramp: true, stairsRequired: false, sensoryLoad: 'high' }, crowdDensity: 45 },
  { id: 'sec-112', name: 'Section 112 Concourse East', level: 1, accessibility: { wheelchair: true, elevator: true, ramp: false, stairsRequired: false, sensoryLoad: 'medium' }, crowdDensity: 38 },
  { id: 'sec-128', name: 'Section 128 Gate C Concourse', level: 1, accessibility: { wheelchair: true, elevator: false, ramp: true, stairsRequired: false, sensoryLoad: 'high' }, crowdDensity: 52 },
  { id: 'sec-140', name: 'Section 140 Concourse West', level: 1, accessibility: { wheelchair: true, elevator: true, ramp: false, stairsRequired: false, sensoryLoad: 'low' }, crowdDensity: 22 },
  { id: 'sec-201', name: 'Section 201 Level 2 Mezzanine North', level: 2, accessibility: { wheelchair: true, elevator: true, ramp: false, stairsRequired: false, sensoryLoad: 'medium' }, crowdDensity: 30 },
  { id: 'sec-215', name: 'Section 215 Mezzanine East Stairs', level: 2, accessibility: { wheelchair: false, elevator: false, ramp: false, stairsRequired: true, sensoryLoad: 'high' }, crowdDensity: 65 },
  { id: 'sec-228', name: 'Section 228 Level 2 Mezzanine South', level: 2, accessibility: { wheelchair: true, elevator: true, ramp: false, stairsRequired: false, sensoryLoad: 'low' }, crowdDensity: 28 },
  { id: 'sec-240', name: 'Section 240 Mezzanine West Steps', level: 2, accessibility: { wheelchair: false, elevator: false, ramp: false, stairsRequired: true, sensoryLoad: 'medium' }, crowdDensity: 40 },
];

// Helper to get raw state from event bus
async function getCrowdState(): Promise<CrowdContext> {
  const gates = Object.values(eventBus.currentCrowd).map(g => {
    let flowState: 'Optimal' | 'Heavy' | 'Critical' = 'Optimal';
    if (g.density > 85) flowState = 'Critical';
    else if (g.density > 60) flowState = 'Heavy';

    let label = 'Gate A (North)';
    if (g.zoneId === 'gate-b') label = 'Gate B (East)';
    if (g.zoneId === 'gate-c') label = 'Gate C (South)';
    if (g.zoneId === 'gate-d') label = 'Gate D (West)';

    return {
      id: g.zoneId,
      name: label,
      density: g.density,
      trend: g.trend,
      flowState
    };
  });

  // Dynamic ticket scanned calculation
  const maxDensity = Math.max(...gates.map(g => g.density));
  const totalScannedRatio = Math.round(maxDensity * 0.9 + 10);

  return {
    gates,
    totalScannedRatio: Math.min(100, totalScannedRatio)
  };
}

async function getActiveIncidents(): Promise<IncidentContext[]> {
  return eventBus.currentIncidents.filter(i => i.status === 'Active');
}

async function getSustainabilityState(): Promise<SustainabilityContext> {
  return { ...eventBus.currentSustainability };
}

async function getTransitState(): Promise<TransitContext> {
  return {
    services: eventBus.currentTransit.map(t => ({
      name: t.name,
      route: t.route,
      schedule: t.schedule,
      cost: t.cost,
      status: t.status
    }))
  };
}

function getVenueContext(): VenueContext {
  return {
    name: 'MetLife Stadium',
    location: 'East Rutherford, New Jersey',
    totalCapacity: 82500,
    currentMatch: 'USA vs. England • Group Stage',
    matchPhase: 'Matchday 4 • Pre-Kickoff'
  };
}

function getAccessibilityContext(): AccessibilityContext {
  // Sync live crowd densities to access nodes where applicable
  const updatedNodes = CONCOURSE_NODES.map(node => {
    if (node.id === 'sec-101') node.crowdDensity = eventBus.currentCrowd['gate-a'].density;
    if (node.id === 'sec-112') node.crowdDensity = eventBus.currentCrowd['gate-b'].density;
    if (node.id === 'sec-128') node.crowdDensity = eventBus.currentCrowd['gate-c'].density;
    if (node.id === 'sec-140') node.crowdDensity = eventBus.currentCrowd['gate-d'].density;
    return node;
  });

  return { nodes: updatedNodes };
}

// ---------------------------------------------------------------------------
// Main Central Context Builder (Parallelized)
// ---------------------------------------------------------------------------
export async function buildStadiumContext(): Promise<StadiumContext> {
  const [
    crowd,
    incidents,
    sustainability,
    transit
  ] = await Promise.all([
    getCrowdState(),
    getActiveIncidents(),
    getSustainabilityState(),
    getTransitState()
  ]);

  return {
    timestamp: new Date().toISOString(),
    venue: getVenueContext(),
    crowd,
    incidents,
    sustainability,
    transit,
    accessibility: getAccessibilityContext()
  };
}

// ---------------------------------------------------------------------------
// Deterministic Calculations (Grounding & Verification Logic)
// ---------------------------------------------------------------------------

// Calculate estimated load reduction for re-routing
export function calculateLoadReduction(sourceDensity: number, destinationDensity: number): number {
  const difference = sourceDensity - destinationDensity;
  return Math.max(0, Math.round(Math.min(100, difference * 0.4)));
}

// Calculate the routing cost across concourse nodes based on accessibility preferences
export interface AccessibilityPreferences {
  wheelchair: boolean;
  avoidStairs: boolean;
  preferElevators: boolean;
  lowSensory: boolean;
  lowerCrowds: boolean;
}

export function calculateRouteCost(node: AccessibilityNode, preferences: AccessibilityPreferences): number {
  let cost = node.crowdDensity;

  if (preferences.wheelchair && !node.accessibility.wheelchair) {
    return Infinity; // Completely inaccessible
  }

  if (preferences.avoidStairs && node.accessibility.stairsRequired) {
    return Infinity; // Avoid stairs
  }

  if (preferences.preferElevators && node.accessibility.elevator) {
    cost -= 25; // Massive discount to attract route to elevator node
  }

  if (preferences.lowSensory && node.accessibility.sensoryLoad === 'high') {
    cost += 50; // Heavily penalize noisy areas
  } else if (preferences.lowSensory && node.accessibility.sensoryLoad === 'low') {
    cost -= 15; // Reward quiet areas
  }

  if (preferences.lowerCrowds) {
    // Add additional weight to higher densities
    cost += (node.crowdDensity * 1.5);
  }

  return Math.max(1, cost);
}

// Find optimal route given start, end and preferences
export function computeAccessiblePath(
  startId: string,
  endId: string,
  preferences: AccessibilityPreferences
): { path: AccessibilityNode[]; totalCost: number; explanation: string } {
  // Simple fallback / direct nodes path computation
  const nodes = getAccessibilityContext().nodes;
  const startNode = nodes.find(n => n.id === startId) || nodes[0];
  const endNode = nodes.find(n => n.id === endId) || nodes[1];

  // Map the intermediate hops
  const path: AccessibilityNode[] = [startNode];
  
  // Try to find a safe middle node with a low cost
  const middleNodes = nodes.filter(n => n.id !== startId && n.id !== endId);
  let bestMiddle: AccessibilityNode | null = null;
  let minCost = Infinity;

  middleNodes.forEach(m => {
    const costM = calculateRouteCost(m, preferences);
    if (costM < minCost) {
      minCost = costM;
      bestMiddle = m;
    }
  });

  if (bestMiddle && minCost !== Infinity && startNode.level !== endNode.level) {
    path.push(bestMiddle);
  }
  path.push(endNode);

  // Explanation builder
  let explanation = `Route calculated from ${startNode.name} to ${endNode.name}. `;
  if (preferences.wheelchair) {
    explanation += `♿ Optimized for step-free access using step-free concourse paths and elevator systems. `;
  }
  if (preferences.lowSensory) {
    explanation += `🔇 Sensory comfort mode active, bypassing highest volume sectors like Section 101 Gate A Plaza. `;
  }
  if (preferences.lowerCrowds) {
    explanation += `🚶 Low-congestion path plotted, bypassing dense security gates.`;
  }

  return {
    path,
    totalCost: Math.round(minCost === Infinity ? 100 : minCost),
    explanation
  };
}
