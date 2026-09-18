import { Env } from '@env';
import { IBaseResponse } from '@interface/baseResponse';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResponse {
  status: string;
  environment: string;
  timestamp: string;
  uptime: number;
}

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  healthStatus(): IBaseResponse<HealthCheckResponse> {
    try {
      const environment = this.configService.get('NODE_ENV', { infer: true });

      return {
        status: 'success',
        message: 'The application is available.',
        document: {
          environment,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
      };
    } catch {
      return {
        status: 'error',
        message: 'Error processing the request',
      };
    }
  }
}
