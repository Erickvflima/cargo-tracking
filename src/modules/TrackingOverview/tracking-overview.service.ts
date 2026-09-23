import { Injectable, Logger } from '@nestjs/common';

import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';
import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantService } from '@modules/Tenant/tenant.service';
import { TrackingOverviewEntity } from './entities/tracking-overview.entity';
import { TrackingOverviewQueryDto } from './dto/tracking-overview.dto';
import { IPaginatedResponse } from '@interface/paginatedResponse';

@Injectable()
export class TrackingOverviewService {
  constructor(
    private readonly tenantRepositoryFactory: TenantRepositoryFactory,
    private readonly tenantService: TenantService,
  ) {}

  private async getTrackingOverviewRepository(tenantId: number) {
    const tenantResponse = await this.tenantService.findById(tenantId);

    if (!tenantResponse.data) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResponse.data;

    return this.tenantRepositoryFactory.getRepository(
      tenant.schemaName,
      TrackingOverviewEntity,
    );
  }

  async findAll(
    tenantId: number,
    query: TrackingOverviewQueryDto,
  ): Promise<IBaseResponse<IPaginatedResponse, TrackingOverviewEntity[]>> {
    try {
      const repository = await this.getTrackingOverviewRepository(tenantId);

      const page = query.page;
      const limit = query.limit;
      const skip = (page - 1) * limit;

      const [data, total] = await repository.findAndCount({
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: limit,
      });

      return {
        status: 'success',
        message: 'Tracking overview successfully retrieved',
        document: data,
        data: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      Logger.error(error);
      throw handleError(error, 'Failed to retrieve tracking overview');
    }
  }
}
