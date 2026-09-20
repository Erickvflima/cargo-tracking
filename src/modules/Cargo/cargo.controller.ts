import { Body, Controller, Get, Query, Req } from '@nestjs/common';
// import { CreateCargoDto } from './dto/create-cargo.dto';
import { CargoService } from './cargo.service';

@Controller('cargo')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  // @Post()
  // async create(@Body() dto: CreateCargoDto) {
  //   const tenantId = req.user['tenantId'];
  //   const result = await this.cargoService.create({
  //     userEmail: 'teste@teste.com',
  //     data: dto,
  //   });
  //   return result;
  // }

  @Get()
  async findAll(@Req() req: Request & { user: any }, @Query('id') id?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const tenantId = req.user['tenantId'];

    return this.cargoService.findAll(tenantId, id ? Number(id) : undefined);
  }
}
