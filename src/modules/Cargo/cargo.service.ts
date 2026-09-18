import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CargoEntity } from './entities/cargo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IBaseResponse } from '@interface/baseResponse';

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(CargoEntity)
    private readonly cargoRepository: Repository<CargoEntity>,
  ) {}

  async create({
    schema,
    userEmail,
    data,
  }: {
    schema: string;
    userEmail: string;
    data: CreateCargoDto;
  }): Promise<IBaseResponse<CargoEntity>> {
    try {
      const cargo = this.cargoRepository.create({
        ...data,
        createdBy: userEmail,
      });

      await this.cargoRepository
        .createQueryBuilder()
        .insert()
        .into(`${schema}.cargo`)
        .values(cargo)
        .execute();

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
}
