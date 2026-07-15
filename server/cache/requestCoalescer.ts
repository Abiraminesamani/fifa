type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
type PromiseRejecter = (reason?: any) => void;

interface PendingPromise<T> {
  promise: Promise<T>;
  resolvers: PromiseResolver<T>[];
  rejecters: PromiseRejecter[];
}

class RequestCoalescer {
  private pending: Map<string, PendingPromise<any>> = new Map();

  /**
   * Coalesces concurrent calls to the same async function under a unique key.
   */
  public async coalesce<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) {
      // Return the already pending promise
      return existing.promise;
    }

    // Prepare resolvers list
    const resolvers: PromiseResolver<T>[] = [];
    const rejecters: PromiseRejecter[] = [];

    const promise = new Promise<T>((resolve, reject) => {
      resolvers.push(resolve);
      rejecters.push(reject);
    });

    const pendingEntry: PendingPromise<T> = {
      promise,
      resolvers,
      rejecters
    };

    this.pending.set(key, pendingEntry);

    try {
      const result = await fetchFn();
      
      // Resolve all waiters
      const currentEntry = this.pending.get(key);
      if (currentEntry) {
        currentEntry.resolvers.forEach(resolve => resolve(result));
      }
      return result;
    } catch (error) {
      // Reject all waiters
      const currentEntry = this.pending.get(key);
      if (currentEntry) {
        currentEntry.rejecters.forEach(reject => reject(error));
      }
      throw error;
    } finally {
      this.pending.delete(key);
    }
  }

  public getPendingCount(): number {
    return this.pending.size;
  }
}

export const requestCoalescer = new RequestCoalescer();
export default requestCoalescer;
