import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';

@Injectable()
export class TenantRepositoryFactory implements OnModuleDestroy {
  private readonly dataSources = new Map<string, DataSource>();

  constructor(private readonly dataSource: DataSource) {}

  async getRepository<T extends ObjectLiteral>(
    schema: string,
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const tenantDataSource = await this.getDataSource(schema);

    return tenantDataSource.getRepository(entity);
  }

  private async getDataSource(schema: string): Promise<DataSource> {
    console.log('TENANT SCHEMA:', schema);

    const existingDataSource = this.dataSources.get(schema);

    if (existingDataSource?.isInitialized) {
      return existingDataSource;
    }

    const options = {
      ...this.dataSource.options,
      schema,
      name: `tenant_${schema}`,
    } as unknown as DataSourceOptions;

    const tenantDataSource = new DataSource(options);

    await tenantDataSource.initialize();

    this.dataSources.set(schema, tenantDataSource);

    return tenantDataSource;
  }

  async onModuleDestroy() {
    for (const dataSource of this.dataSources.values()) {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }
}
