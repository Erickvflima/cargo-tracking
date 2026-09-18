import { Body, Controller, Post } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CargoService } from './cargo.service';

@Controller('cargo')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post()
  async create(@Body() dto: CreateCargoDto) {
    const result = await this.cargoService.create({
      schema: 'tenant_001',
      userEmail: 'teste@teste.com',
      data: dto,
    });
    return result;
  }
}
