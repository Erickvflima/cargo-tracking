import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Checks the applications health and environment' })
  @ApiResponse({
    status: 200,
    description: 'The application is available.',
    schema: {
      example: {
        status: 'success',
        message: 'The application is available.',
        document: {
          environment: 'development',
          timestamp: '2026-09-18T10:54:14.000Z',
          uptime: 12.34,
        },
      },
    },
  })
  checkHealth() {
    return this.healthService.healthStatus();
  }
}
