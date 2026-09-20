import { GeolocationResultDto } from '@modules/Geolocation/dto/geolocation-result.dto';

export interface GeolocationProvider {
  geocode(address: string): Promise<GeolocationResultDto | null>;
}
