import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackingOverviewView1790099702104 implements MigrationInterface {
  name = 'CreateTrackingOverviewView1790099702104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataSource = (queryRunner as any).connection;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const schema = dataSource.options.schema;

    await queryRunner.query(`
      CREATE VIEW "${schema}"."v_tracking_overview"
      AS
      SELECT
        t."tracking_code",
        t."status",
        t."created_by",
        t."created_at",
        t."estimated_delivery_at",
        ten."name" AS "tenant_name",
        ten."active" AS "tenant_active"
      FROM "${schema}"."tracking" t
      INNER JOIN "dbo"."tenants" ten
        ON ten."schema_name" = '${schema}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataSource = (queryRunner as any).connection;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const schema = dataSource.options.schema;

    await queryRunner.query(`
      DROP VIEW "${schema}"."v_tracking_overview"
    `);
  }
}
