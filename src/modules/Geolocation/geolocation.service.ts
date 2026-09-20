import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  GEOLOCATION_CONFIG,
  GEOLOCATION_PROVIDER,
} from './geolocation.constants';

import { GeolocationResultDto } from './dto/geolocation-result.dto';
import { GeolocationMetrics } from './geolocation.metrics';
import { GeolocationProvider } from '@interface/geolocationProvider';

interface CacheEntry {
  result: GeolocationResultDto;
  expiresAt: number;
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @Inject(GEOLOCATION_PROVIDER)
    private readonly provider: GeolocationProvider,

    private readonly metrics: GeolocationMetrics,
  ) {}

  async geocode(address: string): Promise<GeolocationResultDto | null> {
    const normalizedAddress = this.normalizeAddress(address);

    const cached = this.getFromCache(normalizedAddress);

    if (cached) {
      this.metrics.incrementCacheHits();

      this.logger.log(`Geolocation cache hit: ${normalizedAddress}`);

      return cached;
    }

    this.metrics.incrementCalls();

    const result = await this.executeWithRetry(normalizedAddress);

    if (!result) {
      this.metrics.incrementFailures();

      this.logger.warn(`Geolocation failed: ${normalizedAddress}`);

      return null;
    }

    this.metrics.incrementSuccesses();

    this.saveToCache(normalizedAddress, result);

    return result;
  }

  private async executeWithRetry(
    address: string,
  ): Promise<GeolocationResultDto | null> {
    for (
      let attempt = 1;
      attempt <= GEOLOCATION_CONFIG.maxAttempts;
      attempt++
    ) {
      try {
        this.logger.log(
          `Geolocation attempt ${attempt}/${GEOLOCATION_CONFIG.maxAttempts}: ${address}`,
        );

        const result = await this.executeWithTimeout(address);

        return result;
      } catch {
        this.logger.warn(`Geolocation attempt ${attempt} failed: ${address}`);

        if (attempt === GEOLOCATION_CONFIG.maxAttempts) {
          this.logger.error(`Geolocation exhausted retries: ${address}`);

          return null;
        }

        const delay = GEOLOCATION_CONFIG.baseRetryDelay * 2 ** (attempt - 1);

        await this.sleep(delay);
      }
    }

    return null;
  }

  private async executeWithTimeout(
    address: string,
  ): Promise<GeolocationResultDto | null> {
    return Promise.race([
      this.provider.geocode(address),

      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Geolocation provider timeout'));
        }, GEOLOCATION_CONFIG.timeout);
      }),
    ]);
  }

  private getFromCache(address: string): GeolocationResultDto | null {
    const entry = this.cache.get(address);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(address);
      return null;
    }

    return entry.result;
  }

  private saveToCache(address: string, result: GeolocationResultDto): void {
    this.cache.set(address, {
      result,
      expiresAt: Date.now() + GEOLOCATION_CONFIG.cacheTtl,
    });
  }

  private normalizeAddress(address: string): string {
    return address.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}
