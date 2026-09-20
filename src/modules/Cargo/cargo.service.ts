import { Injectable, Logger } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CargoEntity } from './entities/cargo.entity';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';
import { TenantService } from '@modules/Tenant/tenant.service';
import { handleError } from '@common/errors/handle-error.util';

@Injectable()
export class CargoService {
  constructor(
    private readonly tenantRepositoryFactory: TenantRepositoryFactory,
    private readonly tenantService: TenantService,
  ) {}

  private async getCargoRepository(tenantId: number) {
    const tenantResponse = await this.tenantService.findById(tenantId);

    if (!tenantResponse.data) {
      throw new Error('Tenant not found');
    }

    const tenant = tenantResponse.data;

    return this.tenantRepositoryFactory.getRepository(
      tenant.schemaName,
      CargoEntity,
    );
  }

  async create(
    tenantId: number,
    userEmail: string,
    data: CreateCargoDto,
  ): Promise<IBaseResponse<CargoEntity>> {
    try {
      const cargoRepository = await this.getCargoRepository(tenantId);

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
  ): Promise<IBaseResponse<CargoEntity[]>> {
    try {
      const cargoRepository = await this.getCargoRepository(tenantId);

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
}
