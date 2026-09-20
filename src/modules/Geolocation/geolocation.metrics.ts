import { Injectable } from '@nestjs/common';

@Injectable()
export class GeolocationMetrics {
  private calls = 0;
  private cacheHits = 0;
  private successes = 0;
  private failures = 0;

  incrementCalls(): void {
    this.calls++;
  }

  incrementCacheHits(): void {
    this.cacheHits++;
  }

  incrementSuccesses(): void {
    this.successes++;
  }

  incrementFailures(): void {
    this.failures++;
  }

  getMetrics() {
    return {
      calls: this.calls,
      cacheHits: this.cacheHits,
      successes: this.successes,
      failures: this.failures,
    };
  }
}
