import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTenant1790099702102 implements MigrationInterface {
  name = 'InitTenant1790099702102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataSource = (queryRunner as any).connection;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const schema = dataSource.options.schema;

    await queryRunner.query(`
            CREATE TABLE "${schema}"."tracking_history" (
                "id" int NOT NULL IDENTITY(1, 1),
                "created_at" datetime2 NOT NULL CONSTRAINT "DF_d4a97dc0d77a6bdb7d65bd5ef0a" DEFAULT GETDATE(),
                "created_by" nvarchar(255) NOT NULL,
                "updated_by" nvarchar(255),
                "updated_at" datetime2 CONSTRAINT "DF_a84e8073d861fcfdf518e6700d9" DEFAULT getdate(),
                "tracking_id" int NOT NULL,
                "status" nvarchar(50) NOT NULL,
                "occurred_at" datetime2 NOT NULL,
                "latitude" decimal(10, 7),
                "longitude" decimal(10, 7),
                "observation" varchar(500),
                CONSTRAINT "PK_5e58aa7bd8c7a6342010afd445a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "${schema}"."tracking" (
                "id" int NOT NULL IDENTITY(1, 1),
                "created_at" datetime2 NOT NULL CONSTRAINT "DF_0436de4ad65492d3aeb8ab4572f" DEFAULT GETDATE(),
                "created_by" nvarchar(255) NOT NULL,
                "updated_by" nvarchar(255),
                "updated_at" datetime2 CONSTRAINT "DF_c6540cf741a2346a015d7bce9a6" DEFAULT getdate(),
                "tracking_code" nvarchar(50) NOT NULL,
                "status" nvarchar(50) NOT NULL,
                "origin_city" nvarchar(100) NOT NULL,
                "origin_country" nvarchar(100) NOT NULL,
                "destination_city" nvarchar(100) NOT NULL,
                "destination_country" nvarchar(100) NOT NULL,
                "departure_at" datetime2 NOT NULL,
                "estimated_delivery_at" datetime2 NOT NULL,
                "current_latitude" decimal(10, 7),
                "current_longitude" decimal(10, 7),
                "version" int NOT NULL,
                CONSTRAINT "UQ_f61468c3218f76232f8130a0c72" UNIQUE ("tracking_code"),
                CONSTRAINT "PK_c6d380f3abe9852840e5aff1439" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tracking_history"
            ADD CONSTRAINT "FK_fe9c38e4855d64c5801b777dfb4" FOREIGN KEY ("tracking_id") REFERENCES "${schema}"."tracking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const dataSource = (queryRunner as any).connection;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const schema = dataSource.options.schema;
    await queryRunner.query(`
            ALTER TABLE "${schema}"."tracking_history" DROP CONSTRAINT "FK_fe9c38e4855d64c5801b777dfb4"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."tracking"
        `);
    await queryRunner.query(`
            DROP TABLE "${schema}"."tracking_history"
        `);
  }
}
