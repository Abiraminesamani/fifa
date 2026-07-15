export type UserRole = 'FAN' | 'VOLUNTEER' | 'STAFF' | 'ORGANIZER';

export interface Landmark {
  id: string;
  name: string;
  type: 'gate' | 'section' | 'restroom' | 'food' | 'medical';
  x: number; // percentage coordinate on SVG map (0-100)
  y: number; // percentage coordinate on SVG map (0-100)
  level: 1 | 2 | 3;
  description: string;
  accessibilityNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  meta?: PerformanceMetadata;
  routeInfo?: any;
}

export interface IncidentLog {
  id: string;
  time: string;
  category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd' | 'Sustainability';
  detail: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Active' | 'Resolved';
}

export interface CopilotResponse {
  incidentTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  why: string;
  sopSteps: string[];
  jumbotronMessage: string;
  expectedImpact: string;
  confidence: number;
  sourceDensity?: number;
  destDensity?: number;
  calculatedReduction?: number;
  meta?: PerformanceMetadata;
}

export interface SustainabilityMetrics {
  wasteLevel: number; // in tons
  waterUsage: number; // in Litres/min
  energyUsage: number; // in kW
  binFullness: number; // in %
}

export interface SustainabilityReport {
  alerts: string[];
  wastePrediction: string;
  efficiencySteps: string[];
  expectedImpact: string;
  confidence: number;
  meta?: PerformanceMetadata;
}

export interface PerformanceMetadata {
  model: string;
  latencyMs: number;
  cache: 'HIT' | 'MISS';
  contextVersion: number;
  schemaValid: 'YES' | 'NO';
}

export interface AccessibilityPreferences {
  wheelchair: boolean;
  avoidStairs: boolean;
  preferElevators: boolean;
  lowSensory: boolean;
  lowerCrowds: boolean;
}

export interface BroadcastPayload {
  id: string;
  incidentType: string;
  targetArea: string;
  message: string;
  sopRecommended: string;
  confidence: number;
  approvedBy?: string;
  approvedRole?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: string;
  operatorRole?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  avgHitLatencyMs: number;
  avgMissLatencyMs: number;
  accumulatedSavingsMs: number;
}
