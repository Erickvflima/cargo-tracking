import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from './utils/env';
import { HealthModule } from '@modules/Health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingModule } from '@modules/Tracking/tracking.module';
import { createDataSource } from '@config/data.source';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthModule } from '@modules/Auth/auth.module';
import { TenantModule } from '@modules/Tenant/tenant.module';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const options = createDataSource(configService);
        Logger.verbose('Database is connected!');
        return options;
      },
    }),
    AuthModule,
    TenantModule,
    HealthModule,
    TrackingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
