import { CargoEntity } from '@modules/Cargo/entities/cargo.entity';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { UserEntity } from '@modules/User/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const createDataSource = (config: ConfigService): DataSourceOptions => ({
  type: 'mssql',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_DATABASE'),
  schema: 'dbo',
  entities: [TenantEntity, UserEntity, CargoEntity],
  migrations: ['src/database/migrations/*.ts'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
