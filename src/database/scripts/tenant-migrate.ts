import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createTenantDataSource } from '../../config/data-source-tenant';

const args = process.argv.slice(2);
const tenantArgument = args.find((arg) => arg.startsWith('--tenant='));
const tenant = tenantArgument?.split('=')[1];
const migrateAll = args.includes('--all');

if (!tenant && !migrateAll) {
  console.error('Informe --tenant=tenant_001 ou --all.');

  process.exit(1);
}

async function getTenants(): Promise<string[]> {
  const dataSource = new DataSource({
    type: 'mssql',

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'dbo',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  await dataSource.initialize();

  const result: [] = await dataSource.query(`
    SELECT schema_name
    FROM dbo.tenants
    WHERE active = 1
    ORDER BY id
  `);

  await dataSource.destroy();

  return result.map((item: { schema_name: string }) => item.schema_name);
}

async function migrateTenant(schema: string): Promise<void> {
  console.log(`\nMigrando ${schema}...`);

  const dataSource = createTenantDataSource(schema);

  try {
    await dataSource.initialize();

    await dataSource.runMigrations();

    console.log(`✓ ${schema} atualizado com sucesso`);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

async function main(): Promise<void> {
  const tenants = migrateAll ? await getTenants() : [tenant!];

  for (const schema of tenants) {
    await migrateTenant(schema);
  }
}

main().catch((error) => {
  console.error('\nErro durante migration:', error);

  process.exit(1);
});
