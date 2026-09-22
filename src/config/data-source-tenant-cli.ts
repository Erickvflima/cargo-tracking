import { TrackingEntity } from '@modules/Tracking/entities/tracking.entity';
import { TrackingHistoryEntity } from '@modules/TrackingHistory/entities/trackingHistory.entity';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mssql',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'tenant_001',
  entities: [TrackingEntity, TrackingHistoryEntity],
  migrations: [`${__dirname}/../database/migrations/tenant/*.ts`],

  synchronize: false,

  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
