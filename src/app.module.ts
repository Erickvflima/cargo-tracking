import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from './utils/env';
import { HealthModule } from '@modules/Health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoModule } from '@modules/Cargo/cargo.module';
import { createDataSource } from '@config/data.source';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthModule } from '@modules/Auth/auth.module';

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
    HealthModule,
    CargoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
