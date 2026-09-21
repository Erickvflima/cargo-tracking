import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { UserEntity } from '@modules/User/entities/user.entity';

dotenv.config();

export default new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'dbo',
  entities: [TenantEntity, UserEntity],
  migrations: [`${__dirname}/../database/migrations/dbo/*.ts`],
  synchronize: false,
  logging: ['error'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
