import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { AuthenticatedRequest } from '@interface/iAuthenticatedUser';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/roles';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';

@ApiTags('Tracking')
@ApiBearerAuth('access-token')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

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
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateTrackingDto,
  ) {
    return this.trackingService.create(req.user.tenantId, req.user.email, data);
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
    return this.trackingService.findAll(
      req.user.tenantId,
      id ? Number(id) : undefined,
    );
  }

  @Put(':trackingCode/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('trackingCode') trackingCode: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateTrackingStatusDto,
  ) {
    return this.trackingService.updateStatus(
      req.user.tenantId,
      req.user.email,
      trackingCode,
      data,
    );
  }
}
