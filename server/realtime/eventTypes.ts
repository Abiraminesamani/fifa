export type EventType =
  | 'crowd.updated'
  | 'incident.created'
  | 'incident.resolved'
  | 'sustainability.updated'
  | 'transit.updated'
  | 'broadcast.activated'
  | 'broadcast.resolved';

export interface BaseEvent<T = any> {
  type: EventType;
  timestamp: string;
  payload: T;
}

export interface CrowdUpdatePayload {
  zoneId: 'gate-a' | 'gate-b' | 'gate-c' | 'gate-d';
  density: number;
  trend: number; // e.g., +15% per 5 min
}

export interface IncidentEventPayload {
  id: string;
  category: 'Security' | 'Maintenance' | 'Medical' | 'Crowd';
  detail: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  status: 'Active' | 'Resolved';
}

export interface SustainabilityUpdatePayload {
  wasteLevel: number;
  waterUsage: number;
  energyUsage: number;
  binFullness: number;
}

export interface TransitUpdatePayload {
  id: string;
  name: string;
  route: string;
  schedule: string;
  cost: string;
  status: string;
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
