import { describe, it, expect } from 'vitest';
import { CONCOURSE_NODES, calculateRouteCost } from '../../ai/contextEngine';

describe('Crowd Aware Routing engine tests', () => {
  const basePrefs = {
    wheelchair: false,
    avoidStairs: false,
    preferElevators: false,
    lowSensory: false,
    lowerCrowds: false
  };

  it('1. should add extra density penalties under lowerCrowds preference', () => {
    const node = CONCOURSE_NODES[0];
    const normalCost = calculateRouteCost(node, basePrefs);
    const crowdAvoidCost = calculateRouteCost(node, { ...basePrefs, lowerCrowds: true });
    
    // Penalized cost should equal baseline + (density * 1.5)
    expect(crowdAvoidCost).toBe(normalCost + (node.crowdDensity * 1.5));
  });

  it('2. should scale cost proportionally with crowdDensity scaling', () => {
    const node1 = { ...CONCOURSE_NODES[0], crowdDensity: 10 };
    const node2 = { ...CONCOURSE_NODES[0], crowdDensity: 80 };
    
    const cost1 = calculateRouteCost(node1, { ...basePrefs, lowerCrowds: true });
    const cost2 = calculateRouteCost(node2, { ...basePrefs, lowerCrowds: true });
    
    expect(cost2).toBeGreaterThan(cost1);
  });

  it('3. should maintain minimum routing cost of 1 even for empty nodes', () => {
    const emptyNode = { 
      ...CONCOURSE_NODES[0], 
      crowdDensity: 0,
      accessibility: { ...CONCOURSE_NODES[0].accessibility, sensoryLoad: 'low' as const }
    };
    const cost = calculateRouteCost(emptyNode, { ...basePrefs, lowSensory: true }); // -15 discount
    expect(cost).toBe(1); // floor is 1
  });

  it('4. should reflect heavy density in Section 128 Gate C Concourse', () => {
    const sec128 = CONCOURSE_NODES.find(n => n.id === 'sec-128')!;
    expect(sec128.crowdDensity).toBeGreaterThan(40);
  });

  it('5. should prioritize lowest density paths on global routing calculations', () => {
    const nodeWest = { ...CONCOURSE_NODES[0], id: 'west', crowdDensity: 15 };
    const nodeEast = { ...CONCOURSE_NODES[0], id: 'east', crowdDensity: 95 };
    
    const costWest = calculateRouteCost(nodeWest, { ...basePrefs, lowerCrowds: true });
    const costEast = calculateRouteCost(nodeEast, { ...basePrefs, lowerCrowds: true });
    
    expect(costWest).toBeLessThan(costEast);
  });

  it('6. should maintain stable costs on repeated evaluations', () => {
    const node = CONCOURSE_NODES[2];
    const costFirst = calculateRouteCost(node, { ...basePrefs, lowerCrowds: true });
    const costSecond = calculateRouteCost(node, { ...basePrefs, lowerCrowds: true });
    expect(costFirst).toBe(costSecond);
  });

  it('7. should handle critical congestion thresholds (density > 85)', () => {
    const criticalNode = { ...CONCOURSE_NODES[0], crowdDensity: 95 };
    const cost = calculateRouteCost(criticalNode, { ...basePrefs, lowerCrowds: true });
    expect(cost).toBeGreaterThan(150); // heavy multiplier
  });

  it('8. should respect low-sensory bypass weights concurrently with crowd avoidance', () => {
    const tranquilNode = {
      id: 'quiet-concourse',
      name: 'Quiet Zone',
      level: 1,
      accessibility: { wheelchair: true, elevator: false, ramp: true, stairsRequired: false, sensoryLoad: 'low' as const },
      crowdDensity: 10
    };
    
    // Low sensory applies -15, Lower crowds applies +15
    const cost = calculateRouteCost(tranquilNode, { ...basePrefs, lowSensory: true, lowerCrowds: true });
    expect(cost).toBe(10 - 15 + (10 * 1.5)); // 10 - 15 + 15 = 10
    expect(cost).toBe(10);
  });
});
