import { GeolocationProvider } from '@interface/geolocationProvider';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { GeolocationResultDto } from '../dto/geolocation-result.dto';

interface NominatimResult {
  lat: string;
  lon: string;
}

@Injectable()
export class OpenStreetMapProvider implements GeolocationProvider {
  private readonly logger = new Logger(OpenStreetMapProvider.name);

  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private readonly httpService: HttpService) {}

  async geocode(address: string): Promise<GeolocationResultDto | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await firstValueFrom(
      this.httpService.get<NominatimResult[]>(this.baseUrl, {
        params: {
          q: address,
          format: 'jsonv2',
          limit: 1,
          countrycodes: 'br',
        },
        headers: {
          'User-Agent': 'cargo-tracking/1.0',
        },
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const result = response.data[0];

    if (!result) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const latitude = Number(result.lat);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const longitude = Number(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      this.logger.warn(`Invalid coordinates returned for address: ${address}`);

      return null;
    }

    return {
      latitude,
      longitude,
    };
  }
}
