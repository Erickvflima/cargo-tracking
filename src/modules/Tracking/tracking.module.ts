import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TenantModule } from '@modules/Tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
