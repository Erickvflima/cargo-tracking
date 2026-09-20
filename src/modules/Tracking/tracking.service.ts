import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { TrackingEntity } from './entities/tracking.entity';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';
import { TenantService } from '@modules/Tenant/tenant.service';
import { handleError } from '@common/errors/handle-error.util';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly tenantRepositoryFactory: TenantRepositoryFactory,
    private readonly tenantService: TenantService,
  ) {}

  private async getTrackingRepository(tenantId: number) {
    const tenantResponse = await this.tenantService.findById(tenantId);

    if (!tenantResponse.data) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResponse.data;

    return this.tenantRepositoryFactory.getRepository(
      tenant.schemaName,
      TrackingEntity,
    );
  }

  async create(
    tenantId: number,
    userEmail: string,
    data: CreateTrackingDto,
  ): Promise<IBaseResponse<TrackingEntity>> {
    try {
      const cargoRepository = await this.getTrackingRepository(tenantId);

      const existingCargo = await cargoRepository.findOne({
        where: {
          trackingCode: data.trackingCode,
        },
      });

      if (existingCargo) {
        throw new ConflictException('Tracking code already exists.');
      }

      const cargo = cargoRepository.create({
        ...data,
        createdBy: userEmail,
      });

      const savedCargo = await cargoRepository.save(cargo);

      return {
        status: 'success',
        message: 'Cargo created successfully',
        document: savedCargo,
      };
    } catch (error) {
      Logger.error(error);
      throw handleError(error, 'Failed to create cargo');
    }
  }

  async findAll(
    tenantId: number,
    id?: number,
  ): Promise<IBaseResponse<TrackingEntity[]>> {
    try {
      const cargoRepository = await this.getTrackingRepository(tenantId);

      const cargos = id
        ? await cargoRepository.find({
            where: { id },
          })
        : await cargoRepository.find();

      return {
        status: 'success',
        message: 'Cargos found successfully',
        document: cargos,
      };
    } catch (error) {
      Logger.error(error);

      return {
        status: 'error',
        message: 'Failed to retrieve cargos',
      };
    }
  }

  async updateStatus(
    tenantId: number,
    userEmail: string,
    trackingCode: string,
    data: UpdateTrackingStatusDto,
  ): Promise<IBaseResponse<TrackingEntity>> {
    try {
      const trackingRepository = await this.getTrackingRepository(tenantId);
      const result = await trackingRepository
        .createQueryBuilder()
        .update(TrackingEntity)
        .set({
          status: data.status,
          updatedBy: userEmail,
          version: () => 'version + 1',
        })
        .where('tracking_code = :tracking_code', {
          tracking_code: trackingCode,
        })
        .andWhere('version = :version', {
          version: data.version,
        })
        .execute();

      if (result.affected === 0) {
        const tracking = await trackingRepository.findOne({
          where: { trackingCode },
        });

        if (!tracking) {
          throw new NotFoundException('Tracking not found.');
        }

        throw new ConflictException('Tracking was modified by another user.');
      }

      const updatedTracking = await trackingRepository.findOne({
        where: { trackingCode },
      });

      if (!updatedTracking) {
        throw new NotFoundException('Tracking not found.');
      }

      return {
        status: 'success',
        message: 'Tracking status updated successfully',
        document: updatedTracking,
      };
    } catch (error) {
      Logger.error(error);
      throw handleError(error, 'Failed to update tracking status');
    }
  }
}
