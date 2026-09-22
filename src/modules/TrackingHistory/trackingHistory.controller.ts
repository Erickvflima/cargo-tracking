import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthenticatedRequest } from '@interface/iAuthenticatedUser';

import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/roles';

import { CreateTrackingHistoryDto } from './dto/create-tracking-history.dto';
import { TrackingHistoryService } from './trackingHistory.service';

@ApiTags('Tracking History')
@ApiBearerAuth('access-token')
@Controller('trackingHistory')
export class TrackingHistoryController {
  constructor(
    private readonly trackingHistoryService: TrackingHistoryService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List tracking history',
    description:
      'Returns all tracking history records belonging to the authenticated user tenant. Restricted to administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking history found successfully.',
  })
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.trackingHistoryService.findAll(req.user.tenantId);
  }

  @Post(':trackingCode')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create tracking history',
    description:
      'Adds a manual occurrence or movement to the specified cargo. Restricted to internal or administrative use.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tracking history created successfully.',
  })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('trackingCode') trackingCode: string,
    @Body() data: CreateTrackingHistoryDto,
  ) {
    return this.trackingHistoryService.create(
      req.user.tenantId,
      req.user.email,
      trackingCode,
      data,
    );
  }
}
