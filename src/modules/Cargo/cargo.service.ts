import { Injectable, Logger } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CargoEntity } from './entities/cargo.entity';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantRepositoryFactory } from '@common/dataBase/tenant-repository.factory';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { TenantService } from '@modules/Tenant/tenant.service';

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

  async create({
    userEmail,
    data,
    tenant,
  }: {
    userEmail: string;
    data: CreateCargoDto;
    tenant: TenantEntity;
  }): Promise<IBaseResponse<CargoEntity>> {
    try {
      const cargoRepository = await this.getCargoRepository(1);
      // const cargo = cargoRepository.create({
      //   ...data,
      //   createdBy: userEmail,
      // });

      // await this.cargoRepository
      //   .createQueryBuilder()
      //   .insert()
      //   .into(`$.cargo`)
      //   .values(cargo)
      //   .execute();

      return {
        status: 'success',
        message: 'cargo created successfully',
      };
    } catch (error) {
      Logger.error(error);

      return {
        status: 'error',
        message: 'Failed to create cargo',
      };
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
        data: cargos,
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
