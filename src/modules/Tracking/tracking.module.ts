import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TenantModule } from '@modules/Tenant/tenant.module';
import { TrackingHistoryModule } from '@modules/TrackingHistory/trackingHistory.module';

@Module({
  imports: [TenantModule, TrackingHistoryModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
