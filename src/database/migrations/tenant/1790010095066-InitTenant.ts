import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTenant1790010095066 implements MigrationInterface {
  name = 'InitTenant1790010095066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataSource = (queryRunner as any).connection;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const schema = dataSource.options.schema;

    await queryRunner.query(`
            CREATE TABLE "${schema}"."tracking" (
                "id" int NOT NULL IDENTITY(1, 1),
                "created_at" datetime2 NOT NULL CONSTRAINT "DF_0436de4ad65492d3aeb8ab4572f" DEFAULT GETDATE(),
                "created_by" nvarchar(255) NOT NULL,
                "updated_by" nvarchar(255),
                "updated_at" datetime2 CONSTRAINT "DF_c6540cf741a2346a015d7bce9a6" DEFAULT getdate(),
                "tracking_code" nvarchar(50) NOT NULL,
                "status" nvarchar(50) NOT NULL,
                "version" int NOT NULL,
                CONSTRAINT "UQ_f61468c3218f76232f8130a0c72" UNIQUE ("tracking_code"),
                CONSTRAINT "PK_c6d380f3abe9852840e5aff1439" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "tenant_001"."tracking"
        `);
  }
}
