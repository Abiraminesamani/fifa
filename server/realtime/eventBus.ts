import { BaseEvent, CrowdUpdatePayload, IncidentEventPayload, SustainabilityUpdatePayload, TransitUpdatePayload, BroadcastPayload } from './eventTypes';

class EventBus {
  private listeners: ((event: BaseEvent) => void)[] = [];
  
  // Keep the in-memory digital twin of the stadium
  public currentCrowd: Record<string, CrowdUpdatePayload> = {
    'gate-a': { zoneId: 'gate-a', density: 45, trend: 5 },
    'gate-b': { zoneId: 'gate-b', density: 38, trend: -2 },
    'gate-c': { zoneId: 'gate-c', density: 52, trend: 10 },
    'gate-d': { zoneId: 'gate-d', density: 22, trend: 0 },
  };

  public currentIncidents: IncidentEventPayload[] = [
    {
      id: 'log-1',
      time: '18:45',
      category: 'Maintenance',
      detail: 'Minor water pressure leakage at Restroom West 1B.',
      location: 'Restroom West 1B',
      severity: 'low',
      status: 'Active'
    },
    {
      id: 'log-2',
      time: '18:50',
      category: 'Crowd',
      detail: 'Congestion spike near Food Court East Section 112.',
      location: 'Section 112 Escalators',
      severity: 'medium',
      status: 'Active'
    },
    {
      id: 'log-3',
      time: '18:55',
      category: 'Security',
      detail: 'Gate B turnstile scanner 4 unresponsive. Technical staff dispatched.',
      location: 'Gate B Entrance',
      severity: 'high',
      status: 'Active'
    }
  ];

  public currentSustainability: SustainabilityUpdatePayload = {
    wasteLevel: 4.8,
    waterUsage: 350,
    energyUsage: 1200,
    binFullness: 45
  };

  public currentTransit: TransitUpdatePayload[] = [
    {
      id: 'transit-1',
      name: 'Metropark Express Shuttle',
      route: 'Metropark Hub ⇄ Lot G Outer Plaza',
      schedule: 'Every 8 min',
      cost: 'Free',
      status: 'On Schedule'
    },
    {
      id: 'transit-2',
      name: 'FIFA Venue Rail Link',
      route: 'Penn Station ⇄ Meadowlands Arena Platform',
      schedule: 'Every 15 min',
      cost: '$4.25',
      status: '10-minute delay due to congestion'
    },
    {
      id: 'transit-3',
      name: 'Local Fan Rideshare Loop',
      route: 'Lot E Rideshare Zone ⇄ Route 120 Concourse',
      schedule: 'Continuous service',
      cost: 'Variable',
      status: 'High demand'
    }
  ];

  public activeBroadcasts: BroadcastPayload[] = [];
  public auditTrail: Array<{
    timestamp: string;
    action: string;
    details: string;
    operatorRole?: string;
  }> = [
    { timestamp: new Date().toISOString(), action: 'system_init', details: 'Stadium Operations Digital Twin initialized.', operatorRole: 'SYSTEM' }
  ];

  constructor() {
    // Generate a periodic simulation update to show real-time activity in the event stream!
    setInterval(() => {
      this.simulateFluctuations();
    }, 15000); // Fluctuate state every 15 seconds
  }

  private simulateFluctuations() {
    // Modify slightly to prove real-time feed works
    const gates: ('gate-a' | 'gate-b' | 'gate-c' | 'gate-d')[] = ['gate-a', 'gate-b', 'gate-c', 'gate-d'];
    const chosenGate = gates[Math.floor(Math.random() * gates.length)];
    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const currentDens = this.currentCrowd[chosenGate].density;
    this.currentCrowd[chosenGate].density = Math.max(5, Math.min(100, currentDens + delta));
    this.currentCrowd[chosenGate].trend = Math.floor(Math.random() * 8) - 4;

    this.emit({
      type: 'crowd.updated',
      timestamp: new Date().toISOString(),
      payload: this.currentCrowd[chosenGate]
    });

    // Fluctuate sustainability metrics slightly
    const wasteDelta = (Math.random() * 0.2 - 0.1);
    this.currentSustainability.wasteLevel = parseFloat((this.currentSustainability.wasteLevel + wasteDelta).toFixed(2));
    this.currentSustainability.waterUsage = Math.max(100, this.currentSustainability.waterUsage + Math.floor(Math.random() * 20 - 10));
    this.currentSustainability.energyUsage = Math.max(500, this.currentSustainability.energyUsage + Math.floor(Math.random() * 40 - 20));
    
    this.emit({
      type: 'sustainability.updated',
      timestamp: new Date().toISOString(),
      payload: this.currentSustainability
    });
  }

  public addListener(cb: (event: BaseEvent) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public emit(event: BaseEvent) {
    this.listeners.forEach(l => {
      try {
        l(event);
      } catch (e) {
        console.error('Error in event bus subscriber:', e);
      }
    });
  }

  // API Mutators
  public updateCrowd(zoneId: 'gate-a' | 'gate-b' | 'gate-c' | 'gate-d', density: number, trend: number) {
    this.currentCrowd[zoneId] = { zoneId, density, trend };
    this.emit({
      type: 'crowd.updated',
      timestamp: new Date().toISOString(),
      payload: this.currentCrowd[zoneId]
    });
  }

  public addIncident(incident: Omit<IncidentEventPayload, 'id' | 'time' | 'status'>) {
    const newIncident: IncidentEventPayload = {
      ...incident,
      id: `inc-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'Active'
    };
    this.currentIncidents.unshift(newIncident);
    this.logAudit('incident.created', `Incident dispatched: ${incident.category} in ${incident.location} - ${incident.detail}`, 'STAFF');
    
    this.emit({
      type: 'incident.created',
      timestamp: new Date().toISOString(),
      payload: newIncident
    });
    return newIncident;
  }

  public resolveIncident(id: string) {
    const inc = this.currentIncidents.find(i => i.id === id);
    if (inc) {
      inc.status = 'Resolved';
      this.logAudit('incident.resolved', `Incident resolved: ${inc.category} in ${inc.location}`, 'STAFF');
      this.emit({
        type: 'incident.resolved',
        timestamp: new Date().toISOString(),
        payload: inc
      });
    }
  }

  public updateSustainability(metrics: Partial<SustainabilityUpdatePayload>) {
    this.currentSustainability = {
      ...this.currentSustainability,
      ...metrics
    };
    this.emit({
      type: 'sustainability.updated',
      timestamp: new Date().toISOString(),
      payload: this.currentSustainability
    });
  }

  public updateTransit(transitId: string, updates: Partial<TransitUpdatePayload>) {
    const item = this.currentTransit.find(t => t.id === transitId);
    if (item) {
      Object.assign(item, updates);
      this.emit({
        type: 'transit.updated',
        timestamp: new Date().toISOString(),
        payload: item
      });
    }
  }

  public approveBroadcast(payload: BroadcastPayload, approvedBy: string, approvedRole: string) {
    const finalBroadcast = {
      ...payload,
      approvedBy,
      approvedRole,
      timestamp: new Date().toISOString()
    };
    this.activeBroadcasts.unshift(finalBroadcast);
    this.logAudit('broadcast.activated', `Jumbotron warning approved: "${finalBroadcast.message}"`, approvedRole);
    this.emit({
      type: 'broadcast.activated',
      timestamp: new Date().toISOString(),
      payload: finalBroadcast
    });
    return finalBroadcast;
  }

  public logAudit(action: string, details: string, operatorRole?: string) {
    this.auditTrail.unshift({
      timestamp: new Date().toISOString(),
      action,
      details,
      operatorRole
    });
  }
}

export const eventBus = new EventBus();
export default eventBus;
