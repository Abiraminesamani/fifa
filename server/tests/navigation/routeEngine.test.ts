import { describe, it, expect } from 'vitest';
import { CONCOURSE_NODES, calculateRouteCost, computeAccessiblePath } from '../../ai/contextEngine';

describe('Digital Twin Concourse Route Engine', () => {
  const defaultPrefs = {
    wheelchair: false,
    avoidStairs: false,
    preferElevators: false,
    lowSensory: false,
    lowerCrowds: false
  };

  it('1. should load all 8 primary concourse nodes correctly', () => {
    expect(CONCOURSE_NODES.length).toBe(8);
  });

  it('2. should resolve nodes by ID on path requests', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', defaultPrefs);
    expect(result.path.length).toBeGreaterThanOrEqual(2);
    expect(result.path[0].id).toBe('sec-101');
    expect(result.path[result.path.length - 1].id).toBe('sec-112');
  });

  it('3. should verify route never crosses a restricted playing field area', () => {
    CONCOURSE_NODES.forEach(node => {
      expect(node.id).not.toBe('playing-field');
      expect(node.name).not.toContain('Pitch');
    });
  });

  it('4. should calculate standard flat base routing cost when no preferences active', () => {
    const node = CONCOURSE_NODES.find(n => n.id === 'sec-112')!;
    const cost = calculateRouteCost(node, defaultPrefs);
    expect(cost).toBe(node.crowdDensity);
  });

  it('5. should penalize high density zones for standard routing paths', () => {
    const highDensityNode = { ...CONCOURSE_NODES[0], crowdDensity: 90 };
    const lowDensityNode = { ...CONCOURSE_NODES[0], crowdDensity: 10 };
    
    const highCost = calculateRouteCost(highDensityNode, defaultPrefs);
    const lowCost = calculateRouteCost(lowDensityNode, defaultPrefs);
    expect(highCost).toBeGreaterThan(lowCost);
  });

  it('6. should return infinite cost for non-wheelchair nodes when wheelchair required', () => {
    const nonAccessNode = {
      id: 'test-stairs',
      name: 'Steep Stairs',
      level: 2,
      accessibility: { wheelchair: false, elevator: false, ramp: false, stairsRequired: true, sensoryLoad: 'high' as const },
      crowdDensity: 30
    };
    const cost = calculateRouteCost(nonAccessNode, { ...defaultPrefs, wheelchair: true });
    expect(cost).toBe(Infinity);
  });

  it('7. should return infinite cost for stairs nodes when avoidStairs is true', () => {
    const stairsNode = CONCOURSE_NODES.find(n => n.accessibility.stairsRequired)!;
    const cost = calculateRouteCost(stairsNode, { ...defaultPrefs, avoidStairs: true });
    expect(cost).toBe(Infinity);
  });

  it('8. should calculate non-zero cost for valid accessible routes', () => {
    const accessibleNode = CONCOURSE_NODES.find(n => n.accessibility.wheelchair)!;
    const cost = calculateRouteCost(accessibleNode, { ...defaultPrefs, wheelchair: true });
    expect(cost).toBeGreaterThan(0);
    expect(cost).not.toBe(Infinity);
  });

  it('9. should include middle hop node if starting level and destination level differ', () => {
    const result = computeAccessiblePath('sec-101', 'sec-201', defaultPrefs);
    expect(result.path.length).toBe(3); // Start, Middle (Best elevator), End
  });

  it('10. should have totalCost bounded by positive limits', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', defaultPrefs);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.totalCost).toBeLessThan(500);
  });

  it('11. should contain descriptive metadata in the generated explanation', () => {
    const result = computeAccessiblePath('sec-101', 'sec-112', defaultPrefs);
    expect(result.explanation).toContain('Route calculated');
  });

  it('12. should default to base level node on invalid ID resolution', () => {
    const result = computeAccessiblePath('invalid-id', 'sec-112', defaultPrefs);
    expect(result.path[0].id).toBe('sec-101'); // fallback
  });

  it('13. should handle identical origin and destination routing gracefully', () => {
    const result = computeAccessiblePath('sec-112', 'sec-112', defaultPrefs);
    expect(result.path.length).toBe(2);
    expect(result.path[0].id).toBe('sec-112');
  });

  it('14. should guarantee Level 1 nodes are structurally marked as level 1', () => {
    const level1Nodes = CONCOURSE_NODES.filter(n => n.id.startsWith('sec-1'));
    level1Nodes.forEach(node => {
      expect(node.level).toBe(1);
    });
  });

  it('15. should successfully resolve Section 140 as a Low-Sensory Concourse node', () => {
    const sec140 = CONCOURSE_NODES.find(n => n.id === 'sec-140')!;
    expect(sec140.accessibility.sensoryLoad).toBe('low');
  });
});
