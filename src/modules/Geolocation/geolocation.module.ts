import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GeolocationService } from './geolocation.service';
import { GeolocationMetrics } from './geolocation.metrics';
import { GEOLOCATION_PROVIDER } from './geolocation.constants';
import { OpenStreetMapProvider } from './providers/openstreetmap.provider';
import { GeolocationController } from './geolocation.controller';

@Module({
  imports: [HttpModule],
  controllers: [GeolocationController],
  providers: [
    GeolocationService,
    GeolocationMetrics,
    OpenStreetMapProvider,
    {
      provide: GEOLOCATION_PROVIDER,
      useExisting: OpenStreetMapProvider,
    },
  ],
  exports: [GeolocationService, GeolocationMetrics],
})
export class GeolocationModule {}
