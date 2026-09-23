import { Controller, Get, Query, Req } from '@nestjs/common';

import { TrackingOverviewService } from './tracking-overview.service';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/roles';
import { AuthenticatedRequest } from '@interface/iAuthenticatedUser';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrackingOverviewQueryDto } from './dto/tracking-overview.dto';

@Controller('trackingOverview')
export class TrackingOverviewController {
  constructor(
    private readonly trackingOverviewService: TrackingOverviewService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'List tracking overview',
    description:
      'Lists tracking records from the schema associated with the authenticated user tenant, including tenant information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking overview retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: TrackingOverviewQueryDto,
  ) {
    return this.trackingOverviewService.findAll(req.user.tenantId, query);
  }
}
