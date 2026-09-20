import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  async findById(id: number): Promise<IBaseResponse<TenantEntity | null>> {
    try {
      const tenant = await this.tenantRepo.findOne({
        where: { id },
      });

      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (!tenant.active) {
        throw new BadRequestException('Tenant is inactive');
      }

      return {
        status: 'success',
        message: 'Tenant found',
        data: tenant,
      };
    } catch (error) {
      throw handleError(error, 'Error retrieving tenant');
    }
  }
}
