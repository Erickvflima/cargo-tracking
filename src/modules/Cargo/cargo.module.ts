import { Module } from '@nestjs/common';
import { CargoController } from './cargo.controller';
import { CargoService } from './cargo.service';
import { TenantModule } from '@modules/Tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [CargoController],
  providers: [CargoService],
})
export class CargoModule {}
