import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDbo1789999164324 implements MigrationInterface {
    name = 'InitDbo1789999164324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tenants" (
                "id" int NOT NULL IDENTITY(1, 1),
                "created_at" datetime2 NOT NULL CONSTRAINT "DF_1dba291f7611c0f2388055c40b4" DEFAULT GETDATE(),
                "created_by" nvarchar(255) NOT NULL,
                "updated_by" nvarchar(255),
                "updated_at" datetime2 CONSTRAINT "DF_a61a56d6a40cfbc5564968f5275" DEFAULT getdate(),
                "name" nvarchar(150) NOT NULL,
                "schema_name" nvarchar(100) NOT NULL,
                "active" bit NOT NULL CONSTRAINT "DF_7167592380eb99910824e948327" DEFAULT 1,
                CONSTRAINT "UQ_c2a961556326eec0e3b19f3ced5" UNIQUE ("schema_name"),
                CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "User" (
                "id" int NOT NULL IDENTITY(1, 1),
                "created_at" datetime2 NOT NULL CONSTRAINT "DF_162490c2439e0528260529d5563" DEFAULT GETDATE(),
                "created_by" nvarchar(255) NOT NULL,
                "updated_by" nvarchar(255),
                "updated_at" datetime2 CONSTRAINT "DF_4b365a49b2e822f288eaecc18ad" DEFAULT getdate(),
                "email" nvarchar(255) NOT NULL,
                "password" nvarchar(255) NOT NULL,
                "tenant_id" int NOT NULL,
                "role" nvarchar(20) NOT NULL CONSTRAINT "DF_e825d71115803906c14fe79e963" DEFAULT 'VIEWER',
                CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"),
                CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "User"
        `);
        await queryRunner.query(`
            DROP TABLE "tenants"
        `);
    }

}
