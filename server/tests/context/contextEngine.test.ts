import { describe, it, expect } from 'vitest';
import { buildStadiumContext, calculateLoadReduction } from '../../ai/contextEngine';
import eventBus from '../../realtime/eventBus';

describe('Central Digital Twin Context Engine', () => {
  it('1. should calculate deterministic load reduction correctly', () => {
    // 80 to 30 -> 50 difference. 50 * 0.4 = 20 reduction.
    const reduction = calculateLoadReduction(80, 30);
    expect(reduction).toBe(20);
  });

  it('2. should clamp load reduction at 100% maximum', () => {
    const reduction = calculateLoadReduction(350, 0); // huge diff
    expect(reduction).toBe(100);
  });

  it('3. should clamp load reduction at 0% minimum on negative differences', () => {
    const reduction = calculateLoadReduction(10, 80); // destination is denser
    expect(reduction).toBe(0);
  });

  it('4. should assemble comprehensive stadium context', async () => {
    const ctx = await buildStadiumContext();
    expect(ctx.venue.name).toBe('MetLife Stadium');
    expect(ctx.venue.location).toContain('New Jersey');
    expect(ctx.crowd.gates.length).toBe(4);
    expect(ctx.incidents.length).toBeGreaterThan(0);
    expect(ctx.sustainability.wasteLevel).toBeGreaterThan(0);
    expect(ctx.transit.services.length).toBeGreaterThan(0);
  });

  it('5. should synchronize gate densities from event bus to context nodes', async () => {
    eventBus.currentCrowd['gate-a'].density = 77;
    const ctx = await buildStadiumContext();
    const nodeA = ctx.accessibility.nodes.find(n => n.id === 'sec-101')!;
    expect(nodeA.crowdDensity).toBe(77);
  });

  it('6. should exclude resolved incidents from active incident list', async () => {
    const activeBefore = eventBus.currentIncidents.filter(i => i.status === 'Active').length;
    
    // Resolve one incident
    const targetInc = eventBus.currentIncidents.find(i => i.status === 'Active')!;
    eventBus.resolveIncident(targetInc.id);
    
    const ctx = await buildStadiumContext();
    const activeAfter = ctx.incidents.length;
    
    expect(activeAfter).toBe(activeBefore - 1);
    
    // Restore incident for safety
    targetInc.status = 'Active';
  });

  it('7. should report precise venue capacity limits', async () => {
    const ctx = await buildStadiumContext();
    expect(ctx.venue.totalCapacity).toBe(82500);
  });

  it('8. should calculate non-zero crowd scanned ratio based on peak gate density', async () => {
    const ctx = await buildStadiumContext();
    expect(ctx.crowd.totalScannedRatio).toBeGreaterThan(0);
    expect(ctx.crowd.totalScannedRatio).toBeLessThanOrEqual(100);
  });

  it('9. should reflect active matches and group phases correctly', async () => {
    const ctx = await buildStadiumContext();
    expect(ctx.venue.currentMatch).toContain('USA vs. England');
  });

  it('10. should maintain timestamp accuracy on build', async () => {
    const ctx = await buildStadiumContext();
    const parsedTime = Date.parse(ctx.timestamp);
    expect(isNaN(parsedTime)).toBe(false);
  });
});
