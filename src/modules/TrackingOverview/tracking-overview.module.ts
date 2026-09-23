import { Module } from '@nestjs/common';

import { TenantModule } from '@modules/Tenant/tenant.module';
import { TrackingOverviewController } from './tracking-overview.controller';
import { TrackingOverviewService } from './tracking-overview.service';

@Module({
  imports: [TenantModule],
  controllers: [TrackingOverviewController],
  providers: [TrackingOverviewService],
})
export class TrackingOverviewModule {}
