import { MigrationInterface, QueryRunner } from 'typeorm';

import { SqlServerConnectionCredentialsOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionCredentialsOptions.js';

type SqlServerOptionsWithSchema = SqlServerConnectionCredentialsOptions & {
  schema?: string;
};

export class SeedTracking1790099702103 implements MigrationInterface {
  name = 'SeedTracking1790099702103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const options = queryRunner.manager.connection
      .options as SqlServerOptionsWithSchema;

    const schema = options.schema;

    if (!schema) {
      throw new Error('Schema do tenant não informado');
    }

    await queryRunner.query(`
      INSERT INTO "${schema}"."tracking"
      (
        "created_by",
        "tracking_code",
        "status",
        "origin_city",
        "origin_country",
        "destination_city",
        "destination_country",
        "departure_at",
        "estimated_delivery_at",
        "current_latitude",
        "current_longitude",
        "version"
      )
      VALUES
        (
          'seed',
          'TRK-000001',
          'CREATED',
          'Contagem',
          'Brazil',
          'São Paulo',
          'Brazil',
          '2026-09-22T08:00:00',
          '2026-09-25T18:00:00',
          -19.9167,
          -44.0833,
          1
        ),
        (
          'seed',
          'TRK-000002',
          'IN_TRANSIT',
          'Belo Horizonte',
          'Brazil',
          'Rio de Janeiro',
          'Brazil',
          '2026-09-20T07:30:00',
          '2026-09-24T17:00:00',
          -20.3155,
          -40.3128,
          1
        ),
        (
          'seed',
          'TRK-000003',
          'DELIVERED',
          'Curitiba',
          'Brazil',
          'São Paulo',
          'Brazil',
          '2026-09-15T09:00:00',
          '2026-09-18T18:00:00',
          NULL,
          NULL,
          1
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const options = queryRunner.manager.connection
      .options as SqlServerOptionsWithSchema;

    const schema = options.schema;

    if (!schema) {
      throw new Error('Schema do tenant não informado');
    }

    await queryRunner.query(`
      DELETE FROM "${schema}"."tracking"
      WHERE "tracking_code" IN (
        'TRK-000001',
        'TRK-000002',
        'TRK-000003'
      )
    `);
  }
}
