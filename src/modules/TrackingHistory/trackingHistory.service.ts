import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';
import { handleError } from '@common/errors/handle-error.util';

import { IBaseResponse } from '@interface/baseResponse';

import { TenantService } from '@modules/Tenant/tenant.service';
import { TrackingEntity } from '@modules/Tracking/entities/tracking.entity';

import { CreateTrackingHistoryDto } from './dto/create-tracking-history.dto';
import { TrackingHistoryEntity } from './entities/trackingHistory.entity';
import { TrackingHistoryFactory } from './tracking-history.factory';

@Injectable()
export class TrackingHistoryService {
  constructor(
    private readonly tenantRepositoryFactory: TenantRepositoryFactory,
    private readonly tenantService: TenantService,
  ) {}

  private async getRepositories(tenantId: number) {
    const tenantResponse = await this.tenantService.findById(tenantId);

    if (!tenantResponse.data) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResponse.data;

    const trackingRepository = await this.tenantRepositoryFactory.getRepository(
      tenant.schemaName,
      TrackingEntity,
    );

    const historyRepository = await this.tenantRepositoryFactory.getRepository(
      tenant.schemaName,
      TrackingHistoryEntity,
    );

    return {
      trackingRepository,
      historyRepository,
    };
  }

  async findAll(
    tenantId: number,
  ): Promise<IBaseResponse<TrackingHistoryEntity[]>> {
    try {
      const { historyRepository } = await this.getRepositories(tenantId);

      const history = await historyRepository.find({
        relations: {
          tracking: true,
        },
        order: {
          occurredAt: 'DESC',
        },
      });
      const document = TrackingHistoryFactory.toResponseList(history);

      return {
        status: 'success',
        message: 'Tracking history found successfully',
        document,
      };
    } catch (error) {
      Logger.error(error);

      throw handleError(error, 'Failed to retrieve tracking history');
    }
  }

  async create(
    tenantId: number,
    userEmail: string,
    trackingCode: string,
    data: CreateTrackingHistoryDto,
  ): Promise<IBaseResponse<TrackingHistoryEntity>> {
    try {
      const { trackingRepository, historyRepository } =
        await this.getRepositories(tenantId);

      const tracking = await trackingRepository.findOne({
        where: {
          trackingCode,
        },
      });

      if (!tracking) {
        throw new NotFoundException('Tracking not found.');
      }

      const history = historyRepository.create({
        tracking: { id: tracking.id },
        status: data.status,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
        latitude: data.latitude,
        longitude: data.longitude,
        observation: data.observation,
        createdBy: userEmail,
      });

      const savedHistory = await historyRepository.save(history);

      return {
        status: 'success',
        message: 'Tracking history created successfully',
        document: savedHistory,
      };
    } catch (error) {
      Logger.error(error);

      throw handleError(error, 'Failed to create tracking history');
    }
  }
}
