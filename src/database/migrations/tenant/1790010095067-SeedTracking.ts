import { MigrationInterface, QueryRunner } from 'typeorm';
import { SqlServerConnectionCredentialsOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionCredentialsOptions.js';

type SqlServerOptionsWithSchema = SqlServerConnectionCredentialsOptions & {
  schema?: string;
};

export class SeedTracking1790010095067 implements MigrationInterface {
  name = 'SeedTracking1790010095067';

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
        "version"
      )
      VALUES
        ('seed', 'TRK-000001', 'CREATED', 1),
        ('seed', 'TRK-000002', 'IN_TRANSIT', 1),
        ('seed', 'TRK-000003', 'DELIVERED', 1)
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
