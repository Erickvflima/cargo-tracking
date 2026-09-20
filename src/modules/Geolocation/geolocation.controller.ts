import { Controller, Get, Query } from '@nestjs/common';

import { GeolocationService } from './geolocation.service';
import { GeolocationMetrics } from './geolocation.metrics';

@Controller('geolocation')
export class GeolocationController {
  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly metrics: GeolocationMetrics,
  ) {}

  @Get()
  async geocode(@Query('address') address: string) {
    return this.geolocationService.geocode(address);
  }

  @Get('metrics')
  getMetrics() {
    return this.metrics.getMetrics();
  }
}
