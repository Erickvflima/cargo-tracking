import { TrackingEntity } from '@modules/Tracking/entities/tracking.entity';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export const createTenantDataSource = (schema: string): DataSource => {
  return new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema,
    entities: [TrackingEntity],
    migrations: [`${__dirname}/../database/migrations/tenant/*.ts`],
    synchronize: false,
    logging: ['error'],
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });
};
