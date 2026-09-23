import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TenantEntity])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
