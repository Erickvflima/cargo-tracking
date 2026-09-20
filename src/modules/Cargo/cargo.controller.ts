import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { AuthenticatedRequest } from '@interface/iAuthenticatedUser';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/roles';

@ApiTags('Cargo')
@ApiBearerAuth('access-token')
@Controller('cargo')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'Create a cargo',
    description:
      'Creates a cargo in the schema associated with the authenticated user tenant.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cargo created successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async create(@Req() req: AuthenticatedRequest, @Body() data: CreateCargoDto) {
    return this.cargoService.create(req.user.tenantId, req.user.email, data);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({
    summary: 'List cargos',
    description:
      'Returns cargos belonging exclusively to the authenticated user tenant.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    description: 'Optional cargo ID filter.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cargos found successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findAll(@Req() req: AuthenticatedRequest, @Query('id') id?: string) {
    return this.cargoService.findAll(
      req.user.tenantId,
      id ? Number(id) : undefined,
    );
  }
}
