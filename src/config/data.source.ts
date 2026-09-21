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
  entities: [`${__dirname}/../**/*.entity.{js,ts}`],
  synchronize: false,
  logging: ['error'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
