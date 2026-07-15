import { Landmark, IncidentLog } from './types';

export const STADIUM_NAME = 'MetLife Stadium (New York/New Jersey)';
export const STADIUM_CAPACITY = '82,500';

export const LANDMARKS: Landmark[] = [
  // Gates
  {
    id: 'gate-a',
    name: 'Gate A (North Entrance)',
    type: 'gate',
    x: 50,
    y: 10,
    level: 1,
    description: 'Main gate, closest to parking Lots A/B/C and the MetLife Sports Complex train station.',
    accessibilityNotes: 'Equipped with wheelchair ramps, dedicated priority lines, and proximity elevators.'
  },
  {
    id: 'gate-b',
    name: 'Gate B (East Entrance)',
    type: 'gate',
    x: 85,
    y: 50,
    level: 1,
    description: 'Close to parking Lot D, Bus Transit terminal, and taxi dropoff zone.',
    accessibilityNotes: 'Accessible shuttle cart pickup point located just outside the turnstiles.'
  },
  {
    id: 'gate-c',
    name: 'Gate C (South Entrance)',
    type: 'gate',
    x: 50,
    y: 90,
    level: 1,
    description: 'Close to parking Lots E/F/G and the primary Ride-share (Uber/Lyft) pickup zone.',
    accessibilityNotes: 'Equipped with wide accessible gates and elevator access directly to Club Level.'
  },
  {
    id: 'gate-d',
    name: 'Gate D (West Entrance)',
    type: 'gate',
    x: 15,
    y: 50,
    level: 1,
    description: 'VIP, Premium Club suite holder entrance, and Media accreditation gate.',
    accessibilityNotes: 'Step-free entrance with elevator access to all suites and private lounges.'
  },

  // Sections
  {
    id: 'sec-101',
    name: 'Section 101 (Lower Bowl)',
    type: 'section',
    x: 50,
    y: 30,
    level: 1,
    description: 'Located behind the North Goal. High energy supporter section.',
    accessibilityNotes: 'Platform wheelchair spots are located in row 20 with excellent sightlines.'
  },
  {
    id: 'sec-112',
    name: 'Section 112 (Lower Bowl)',
    type: 'section',
    x: 70,
    y: 50,
    level: 1,
    description: 'Adjacent to the East sideline. Excellent pitch views.',
    accessibilityNotes: 'Equipped with step-free companion seating platforms in rows 18-22.'
  },
  {
    id: 'sec-134',
    name: 'Section 134 (Lower Bowl)',
    type: 'section',
    x: 50,
    y: 70,
    level: 1,
    description: 'Located behind the South Goal. Vibrant fan area.',
    accessibilityNotes: 'Ramp-accessible platform at Section entrance with companion seating.'
  },
  {
    id: 'sec-143',
    name: 'Section 143 (Lower Bowl)',
    type: 'section',
    x: 30,
    y: 50,
    level: 1,
    description: 'Sideline Lower Bowl next to the team players tunnel.',
    accessibilityNotes: 'Direct elevator access via Gate D lobby.'
  },
  {
    id: 'sec-201',
    name: 'Section 201 (Plaza Level)',
    type: 'section',
    x: 50,
    y: 22,
    level: 2,
    description: 'Mid Tier view above the North Goal.',
    accessibilityNotes: 'Elevator access available via Gate A and Gate D lobbies.'
  },
  {
    id: 'sec-224',
    name: 'Section 224 (Plaza Level)',
    type: 'section',
    x: 78,
    y: 50,
    level: 2,
    description: 'Club seats with premium service and indoor lounge access.',
    accessibilityNotes: 'Priority elevator access. Wheelchair companion seats available in all suites.'
  },
  {
    id: 'sec-308',
    name: 'Section 308 (Upper Bowl)',
    type: 'section',
    x: 75,
    y: 25,
    level: 3,
    description: 'Panoramic views of the entire stadium and skyline.',
    accessibilityNotes: 'Steep steps. Escort services recommended. Escalator and elevator serve this platform.'
  },
  {
    id: 'sec-332',
    name: 'Section 332 (Upper Bowl)',
    type: 'section',
    x: 25,
    y: 75,
    level: 3,
    description: 'High view above the south-west quadrant.',
    accessibilityNotes: 'Wheelchair storage area is available nearby.'
  },

  // Restrooms
  {
    id: 'restroom-1a',
    name: 'Restroom 1A (Gate A)',
    type: 'restroom',
    x: 46,
    y: 12,
    level: 1,
    description: 'All-Gender, family friendly restrooms.',
    accessibilityNotes: 'Equipped with automated doors, lowered sinks, grab bars, and adult changing tables.'
  },
  {
    id: 'restroom-1b',
    name: 'Restroom 1B (Section 112)',
    type: 'restroom',
    x: 72,
    y: 48,
    level: 1,
    description: 'Standard accessible restrooms near East side concourse.',
    accessibilityNotes: 'Full wheelchair accessibility compliant. Tactile braille signage at entry.'
  },
  {
    id: 'restroom-1c',
    name: 'Restroom 1C (Section 135)',
    type: 'restroom',
    x: 48,
    y: 72,
    level: 1,
    description: 'Concourse restrooms near the South Goal.',
    accessibilityNotes: 'Standard accessible stalls and lowered fixtures.'
  },
  {
    id: 'restroom-2a',
    name: 'Restroom 2A (Gate B)',
    type: 'restroom',
    x: 84,
    y: 46,
    level: 2,
    description: 'Plaza level standard and accessible restrooms.',
    accessibilityNotes: 'Ramped entrance with support bars.'
  },
  {
    id: 'restroom-2b',
    name: 'Restroom 2B (Section 224)',
    type: 'restroom',
    x: 79,
    y: 52,
    level: 2,
    description: 'All-Gender Club level restrooms.',
    accessibilityNotes: 'Premium spacious companion-assisted restroom layout.'
  },
  {
    id: 'restroom-3a',
    name: 'Restroom 3A (Section 308)',
    type: 'restroom',
    x: 76,
    y: 23,
    level: 3,
    description: 'Upper tier concourse restrooms.',
    accessibilityNotes: 'Accessible stall included. Tactile pathways guide users.'
  },
  {
    id: 'restroom-3b',
    name: 'Restroom 3B (Section 332)',
    type: 'restroom',
    x: 24,
    y: 77,
    level: 3,
    description: 'Upper tier west-side concourse restrooms.',
    accessibilityNotes: 'Standard layout with 1 accessible stall.'
  },

  // Food
  {
    id: 'food-jersey',
    name: 'Jersey Eats Plaza',
    type: 'food',
    x: 54,
    y: 12,
    level: 1,
    description: 'Signature local flavors featuring NY-style pizza, gourmet cheesesteaks, and sliders.',
    accessibilityNotes: 'Lowered order counter and accessible payment terminal.'
  },
  {
    id: 'food-copa',
    name: 'Copa Cabana Food Stand',
    type: 'food',
    x: 68,
    y: 68,
    level: 1,
    description: 'Tribute to Latin flavors: hand-pressed tacos, empanadas, and gluten-free churros.',
    accessibilityNotes: 'Braille menu cards available upon request. Cashless payment ready.'
  },
  {
    id: 'food-green',
    name: 'The Green Grill',
    type: 'food',
    x: 46,
    y: 72,
    level: 1,
    description: '100% plant-based burgers, fresh salads, and organic juices in fully compostable packaging.',
    accessibilityNotes: 'Priority line for guests with disabilities. Dedicated seating zone nearby.'
  },
  {
    id: 'food-global',
    name: 'Global Taste Market',
    type: 'food',
    x: 79,
    y: 48,
    level: 2,
    description: 'International cuisine rotating by playing nations (Curries, Sushi, Shawarma, Crepes).',
    accessibilityNotes: 'High contrast visual menus and multi-language signage.'
  },

  // Medical
  {
    id: 'medical-103',
    name: 'Main Medical Center (Section 103)',
    type: 'medical',
    x: 55,
    y: 30,
    level: 1,
    description: 'Full-service emergency triage center staffed with doctors, paramedics, and diagnostic beds.',
    accessibilityNotes: 'Direct, flat, double-door access. Wheelchairs and stretcher-carts based here.'
  },
  {
    id: 'medical-219',
    name: 'First Aid Point (Section 219)',
    type: 'medical',
    x: 68,
    y: 32,
    level: 2,
    description: 'First Aid station for minor cuts, dehydration, heat-relief, and sensory packs.',
    accessibilityNotes: 'Quiet space available inside for sensory-overload relief.'
  },
  {
    id: 'medical-315',
    name: 'First Aid Point (Section 315)',
    type: 'medical',
    x: 32,
    y: 68,
    level: 3,
    description: 'Upper tier rapid first aid response point.',
    accessibilityNotes: 'Stretcher-capable elevator located directly adjacent.'
  }
];

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' }
];

export const TRANSIT_LIST = [
  { id: 'train', name: 'Meadowlands Rail Line', type: 'train', status: 'On Time', schedule: 'Every 8 mins', cost: '$4.25', route: 'Secaucus Junction ⇄ Stadium Station' },
  { id: 'bus', name: 'FIFA Express Shuttle (351)', type: 'bus', status: '12 min delay', schedule: 'Every 5 mins', cost: 'Free with Match Ticket', route: 'NYC Port Authority ⇄ Gate B Terminal' },
  { id: 'rideshare', name: 'Uber & Lyft Rideshare', type: 'taxi', status: 'High Demand', schedule: '4-8 min wait', cost: 'Surge Pricing', route: 'Concourse South Lot C / Gate C Zone' },
  { id: 'parking-a', name: 'Stadium Parking Lot A/B', type: 'parking', status: '85% Full', schedule: 'Gate A access', cost: '$40.00', route: 'General vehicle parking' },
  { id: 'parking-e', name: 'Stadium Parking Lot E/F', type: 'parking', status: '60% Full', schedule: 'Gate C access', cost: '$40.00', route: 'General & accessible parking' }
];

export const INITIAL_LOGS: IncidentLog[] = [
  {
    id: 'log-1',
    time: '14:22',
    category: 'Crowd',
    detail: 'Turnstile jam at Gate A north entrance causing slow entry queues.',
    location: 'Gate A Entrance',
    severity: 'medium',
    status: 'Resolved'
  },
  {
    id: 'log-2',
    time: '14:45',
    category: 'Maintenance',
    detail: 'Water pressure drop reported in Level 2 East Sector restrooms.',
    location: 'Section 224 Restroom 2B',
    severity: 'low',
    status: 'Active'
  },
  {
    id: 'log-3',
    time: '15:10',
    category: 'Medical',
    detail: 'Spectator treated for heat exhaustion. Hydrated and resting.',
    location: 'Section 308 (Row 14)',
    severity: 'medium',
    status: 'Resolved'
  },
  {
    id: 'log-4',
    time: '15:32',
    category: 'Security',
    detail: 'Unauthorized drone spotted hovering near South Goal scoreboard.',
    location: 'Upper Bowl South Rim',
    severity: 'high',
    status: 'Active'
  }
];

/**
 * Concourse-aware routing helper.
 * Generates an elegant multi-point route that curves around the central pitch (50, 50).
 */
export function generateRoutePath(start: { x: number; y: number }, end: { x: number; y: number }, avoidCrowds: boolean = false): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [start];
  
  const cx = 50;
  const cy = 50;
  const pitchRadius = 22; // Center field is restricted, must route around it
  
  // Check if direct line intersects or gets too close to the pitch center
  const distToCenter = (x: number, y: number) => Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  
  // We sample points along the direct path to see if they pierce the pitch
  let piercesPitch = false;
  const steps = 10;
  for (let i = 1; i < steps; i++) {
    const px = start.x + (end.x - start.x) * (i / steps);
    const py = start.y + (end.y - start.y) * (i / steps);
    if (distToCenter(px, py) < pitchRadius) {
      piercesPitch = true;
      break;
    }
  }

  if (piercesPitch) {
    // We need to route around the center.
    // Calculate angles of start and end from center (50, 50)
    const angleStart = Math.atan2(start.y - cy, start.x - cx);
    const angleEnd = Math.atan2(end.y - cy, end.x - cx);
    
    // Choose clockwise or counterclockwise depending on which is shorter or less crowded
    // In our simulation, let's inject a midpoint on the circular concourse (radius 32)
    const midAngle = (angleStart + angleEnd) / 2 + (avoidCrowds ? 0.3 : 0);
    const concourseRadius = 32;
    
    const mx = cx + Math.cos(midAngle) * concourseRadius;
    const my = cy + Math.sin(midAngle) * concourseRadius;
    
    // If we want a very smooth path, we can add two intermediate concourse points
    const angleStep1 = angleStart + (angleEnd - angleStart) * 0.35;
    const angleStep2 = angleStart + (angleEnd - angleStart) * 0.65;
    
    points.push({
      x: cx + Math.cos(angleStep1) * concourseRadius,
      y: cy + Math.sin(angleStep1) * concourseRadius
    });
    points.push({
      x: cx + Math.cos(angleStep2) * concourseRadius,
      y: cy + Math.sin(angleStep2) * concourseRadius
    });
  }
  
  points.push(end);
  return points;
}
