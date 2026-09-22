import { Module } from '@nestjs/common';

import { TenantModule } from '@modules/Tenant/tenant.module';
import { TrackingHistoryController } from './trackingHistory.controller';
import { TrackingHistoryService } from './trackingHistory.service';

@Module({
  imports: [TenantModule],
  controllers: [TrackingHistoryController],
  providers: [TrackingHistoryService],
  exports: [TrackingHistoryService],
})
export class TrackingHistoryModule {}
