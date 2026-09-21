import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTenants1789999164325 implements MigrationInterface {
  name = 'SeedTenants1789999164325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tenants = [
      'Alpha Transportes',
      'Beta Logística',
      'Gamma Cargas',
      'Delta Distribuição',
      'Epsilon Transportadora',
      'Zeta Logística',
      'Sigma Transportes',
      'Omega Cargas',
      'Nexus Distribuição',
      'Atlas Transportadora',
    ];

    for (let index = 0; index < tenants.length; index++) {
      const schemaName = `tenant_${String(index + 1).padStart(3, '0')}`;
      const tenantName = tenants[index];

      await queryRunner.query(`
        IF NOT EXISTS (
          SELECT 1
          FROM sys.schemas
          WHERE name = '${schemaName}'
        )
        BEGIN
          EXEC('CREATE SCHEMA [${schemaName}]');
        END
      `);

      await queryRunner.query(
        `
          IF NOT EXISTS (
            SELECT 1
            FROM dbo.tenants
            WHERE schema_name = @0
          )
          BEGIN
            INSERT INTO dbo.tenants (
              name,
              schema_name,
              active,
              created_by
            )
            VALUES (
              @1,
              @0,
              1,
              'seed'
            );
          END
        `,
        [schemaName, tenantName],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tenants = [
      'tenant_001',
      'tenant_002',
      'tenant_003',
      'tenant_004',
      'tenant_005',
      'tenant_006',
      'tenant_007',
      'tenant_008',
      'tenant_009',
      'tenant_010',
    ];

    for (const schemaName of tenants) {
      await queryRunner.query(
        `
          DELETE FROM dbo.tenants
          WHERE schema_name = @0
        `,
        [schemaName],
      );

      await queryRunner.query(`
        IF EXISTS (
          SELECT 1
          FROM sys.schemas
          WHERE name = '${schemaName}'
        )
        BEGIN
          EXEC('DROP SCHEMA [${schemaName}]');
        END
      `);
    }
  }
}
