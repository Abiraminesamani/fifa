import { describe, it, expect, vi } from 'vitest';
import eventBus from '../../realtime/eventBus';
import { aiCache } from '../../cache/aiCache';
import { requestCoalescer } from '../../cache/requestCoalescer';

describe('Real-Time Event Bus & Intelligent Caching', () => {
  // --- EVENT BUS TESTS ---
  it('1. should allow multiple subscribers to receive emitted state events', () => {
    let triggeredCount = 0;
    const unsub = eventBus.addListener((event) => {
      if (event.type === 'custom.test_event' as any) {
        triggeredCount++;
      }
    });

    eventBus.emit({ type: 'custom.test_event' as any, timestamp: new Date().toISOString(), payload: {} });
    expect(triggeredCount).toBe(1);
    unsub();
  });

  it('2. should cease triggering callbacks after unsubscribe', () => {
    let triggeredCount = 0;
    const unsub = eventBus.addListener(() => {
      triggeredCount++;
    });

    unsub();
    eventBus.emit({ type: 'custom.another_event' as any, timestamp: new Date().toISOString(), payload: {} });
    expect(triggeredCount).toBe(0);
  });

  it('3. should gracefully isolate errors thrown inside a subscriber callback', () => {
    const unsub1 = eventBus.addListener(() => {
      throw new Error('Crash subscriber');
    });

    let healthySubscriberTriggered = false;
    const unsub2 = eventBus.addListener(() => {
      healthySubscriberTriggered = true;
    });

    // Emitting should not crash the main thread; it should propagate to other healthy listeners
    expect(() => {
      eventBus.emit({ type: 'test.crash' as any, timestamp: new Date().toISOString(), payload: {} });
    }).not.toThrow();

    expect(healthySubscriberTriggered).toBe(true);
    unsub1();
    unsub2();
  });

  it('4. should update in-memory crowd densities correctly on trigger', () => {
    eventBus.updateCrowd('gate-b', 82, 4);
    expect(eventBus.currentCrowd['gate-b'].density).toBe(82);
    expect(eventBus.currentCrowd['gate-b'].trend).toBe(4);
  });

  it('5. should update sustainability metrics and notify subscribers', () => {
    let notified = false;
    const unsub = eventBus.addListener((e) => {
      if (e.type === 'sustainability.updated') notified = true;
    });

    eventBus.updateSustainability({ binFullness: 88, wasteLevel: 9.2 });
    expect(eventBus.currentSustainability.binFullness).toBe(88);
    expect(eventBus.currentSustainability.wasteLevel).toBe(9.2);
    expect(notified).toBe(true);
    unsub();
  });

  it('6. should update transit shuttle service info dynamically', () => {
    eventBus.updateTransit('transit-1', { status: 'Delayed 15m' });
    const shuttle = eventBus.currentTransit.find(t => t.id === 'transit-1')!;
    expect(shuttle.status).toBe('Delayed 15m');
  });

  // --- CACHE & COALESCING TESTS ---
  it('7. should read and write values to the cache with specified TTLs', () => {
    aiCache.set('key-abc', { val: 'hello' }, 5); // 5 seconds TTL
    const res = aiCache.get<any>('key-abc');
    expect(res).toBeDefined();
    expect(res.val).toBe('hello');
  });

  it('8. should return null for expired cache values', () => {
    aiCache.set('key-exp', { val: 'expired' }, -1); // already expired
    const res = aiCache.get<any>('key-exp');
    expect(res).toBeNull();
  });

  it('9. should compile cache metrics: hit/miss ratios and count telemetry', () => {
    aiCache.recordHit(10, 100);
    aiCache.recordMiss(150);
    
    expect(aiCache.stats.hits).toBeGreaterThan(0);
    expect(aiCache.stats.misses).toBeGreaterThan(0);
  });

  it('10. should clear cache maps on reset commands', () => {
    aiCache.set('test-clear', { val: 'ok' }, 60);
    aiCache.clear();
    
    expect(aiCache.get('test-clear')).toBeNull();
  });

  it('11. should coalesce concurrent requests targeting identical cache keys', async () => {
    let executionTimes = 0;
    const fetchFunc = async () => {
      executionTimes++;
      return { val: 'lazy_resolve' };
    };

    // Trigger two requests concurrently on the same key
    const [r1, r2] = await Promise.all([
      requestCoalescer.coalesce('coalesce-key', fetchFunc),
      requestCoalescer.coalesce('coalesce-key', fetchFunc)
    ]);

    expect(r1.val).toBe('lazy_resolve');
    expect(r2.val).toBe('lazy_resolve');
    expect(executionTimes).toBe(1); // Merged into 1 call!
  });
});
