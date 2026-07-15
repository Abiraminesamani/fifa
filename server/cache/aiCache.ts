interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  avgHitLatencyMs: number;
  avgMissLatencyMs: number;
  accumulatedSavingsMs: number;
}

class AiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  public stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    avgHitLatencyMs: 0,
    avgMissLatencyMs: 0,
    accumulatedSavingsMs: 0
  };

  private lastMissLatencies: number[] = [];

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key); // Evict expired entry
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlSeconds: number): void {
    if (ttlSeconds <= 0) return; // Do not cache
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public recordHit(latencyMs: number, estimatedMissLatencyMs: number = 850): void {
    this.stats.hits++;
    this.stats.totalRequests++;
    
    // Average hit latency
    const prevAvg = this.stats.avgHitLatencyMs;
    this.stats.avgHitLatencyMs = parseFloat(
      ((prevAvg * (this.stats.hits - 1) + latencyMs) / this.stats.hits).toFixed(1)
    );

    // Savings
    const savings = Math.max(0, estimatedMissLatencyMs - latencyMs);
    this.stats.accumulatedSavingsMs += savings;
  }

  public recordMiss(latencyMs: number): void {
    this.stats.misses++;
    this.stats.totalRequests++;

    this.lastMissLatencies.push(latencyMs);
    if (this.lastMissLatencies.length > 50) this.lastMissLatencies.shift();

    const sum = this.lastMissLatencies.reduce((a, b) => a + b, 0);
    this.stats.avgMissLatencyMs = Math.round(sum / this.lastMissLatencies.length);
  }

  public getAverageMissLatency(): number {
    return this.stats.avgMissLatencyMs || 850;
  }

  public generateKey(task: string, query: string, language: string, contextStateHash: string): string {
    const normalizedQuery = query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
    
    return `${task}:${normalizedQuery}:${language.toLowerCase()}:${contextStateHash}`;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const aiCache = new AiCache();
export default aiCache;
