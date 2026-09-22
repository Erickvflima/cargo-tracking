import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTrackingHistoryDto {
  @ApiProperty({
    example: 'IN_TRANSIT',
    description: 'Status recorded for the cargo.',
  })
  @IsString()
  @MaxLength(50)
  status: string;

  @ApiPropertyOptional({
    example: '2026-09-22T14:30:00.000Z',
    description: 'Date and time when the event occurred.',
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({
    example: -19.9167,
    description: 'Latitude of the occurrence.',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: -43.9345,
    description: 'Longitude of the occurrence.',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Cargo received at the distribution center.',
    description: 'Optional observation about the occurrence.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observation?: string;
}
