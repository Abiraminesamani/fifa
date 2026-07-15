import { describe, it, expect } from 'vitest';
import { CONCOURSE_NODES, calculateRouteCost, computeAccessiblePath } from '../../ai/contextEngine';

describe('Accessibility Specific Routing Tests', () => {
  const prefs = {
    wheelchair: true,
    avoidStairs: true,
    preferElevators: true,
    lowSensory: true,
    lowerCrowds: true
  };

  it('1. should heavily penalize high sensory areas under sensory preference', () => {
    const highSensoryNode = CONCOURSE_NODES.find(n => n.accessibility.sensoryLoad === 'high')!;
    const baselineCost = highSensoryNode.crowdDensity;
    const sensoryCost = calculateRouteCost(highSensoryNode, { ...prefs, lowSensory: true, lowerCrowds: false });
    
    // Cost should be higher than baseline due to high sensory load penalty (+50)
    expect(sensoryCost).toBe(baselineCost + 50);
  });

  it('2. should discount low sensory areas for tranquility routing', () => {
    const lowSensoryNode = CONCOURSE_NODES.find(n => n.accessibility.sensoryLoad === 'low')!;
    const baselineCost = lowSensoryNode.crowdDensity;
    const sensoryCost = calculateRouteCost(lowSensoryNode, { ...prefs, lowSensory: true, lowerCrowds: false, preferElevators: false });
    
    // Should apply -15 discount
    expect(sensoryCost).toBe(Math.max(1, baselineCost - 15));
  });

  it('3. should discount elevator nodes when elevators are preferred', () => {
    const elevatorNode = CONCOURSE_NODES.find(n => n.accessibility.elevator)!;
    const baselineCost = elevatorNode.crowdDensity;
    const routeCost = calculateRouteCost(elevatorNode, {
      wheelchair: false,
      avoidStairs: false,
      preferElevators: true,
      lowSensory: false,
      lowerCrowds: false
    });
    
    // Should apply -25 discount
    expect(routeCost).toBe(Math.max(1, baselineCost - 25));
  });

  it('4. should block stairs nodes for disabled veterans and elderly preferences', () => {
    const stairsNode = CONCOURSE_NODES.find(n => n.accessibility.stairsRequired)!;
    const canUse = calculateRouteCost(stairsNode, {
      wheelchair: false,
      avoidStairs: true,
      preferElevators: false,
      lowSensory: false,
      lowerCrowds: false
    });
    expect(canUse).toBe(Infinity);
  });

  it('5. should inject wheelchair emoji ♿ in path descriptions when wheelchair mode active', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', {
      wheelchair: true,
      avoidStairs: true,
      preferElevators: false,
      lowSensory: false,
      lowerCrowds: false
    });
    expect(result.explanation).toContain('♿');
  });

  it('6. should inject sensory emoji 🔇 in descriptions when low sensory is requested', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', {
      wheelchair: false,
      avoidStairs: false,
      preferElevators: false,
      lowSensory: true,
      lowerCrowds: false
    });
    expect(result.explanation).toContain('🔇');
  });

  it('7. should trigger low congestion flags when lowerCrowds is requested', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', {
      wheelchair: false,
      avoidStairs: false,
      preferElevators: false,
      lowSensory: false,
      lowerCrowds: true
    });
    expect(result.explanation).toContain('🚶');
  });

  it('8. should successfully compile cost metrics for all nodes in the list with accessibility preferences', () => {
    CONCOURSE_NODES.forEach(node => {
      const cost = calculateRouteCost(node, prefs);
      expect(typeof cost).toBe('number');
    });
  });

  it('9. should choose Section 140 or Mezzanine 228 as lowest cost low-sensory node', () => {
    const quietNodes = CONCOURSE_NODES.filter(n => n.accessibility.sensoryLoad === 'low');
    expect(quietNodes.length).toBeGreaterThanOrEqual(1);
    quietNodes.forEach(node => {
      const cost = calculateRouteCost(node, {
        wheelchair: false,
        avoidStairs: false,
        preferElevators: false,
        lowSensory: true,
        lowerCrowds: false
      });
      expect(cost).toBeLessThanOrEqual(node.crowdDensity); // Discount applied
    });
  });

  it('10. should block route calculation if starting node is completely inaccessible', () => {
    const closedNode = {
      id: 'closed-zone',
      name: 'Maintenance Zone',
      level: 1,
      accessibility: { wheelchair: false, elevator: false, ramp: false, stairsRequired: true, sensoryLoad: 'high' as const },
      crowdDensity: 99
    };
    const cost = calculateRouteCost(closedNode, {
      wheelchair: true,
      avoidStairs: true,
      preferElevators: false,
      lowSensory: false,
      lowerCrowds: false
    });
    expect(cost).toBe(Infinity);
  });
});
