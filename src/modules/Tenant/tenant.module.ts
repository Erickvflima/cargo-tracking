import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantEntity } from './entities/tenant.entity';
import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantService, TenantRepositoryFactory],
  exports: [TenantService, TenantRepositoryFactory],
})
export class TenantModule {}
