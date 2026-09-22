import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTrackingDto {
  @ApiProperty({
    example: 'TRK-000001',
    description: 'Unique tracking code of the cargo',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  trackingCode: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Initial status of the cargo',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status: string;

  @ApiProperty({
    example: 'Belo Horizonte',
    description: 'Origin city of the cargo',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  originCity: string;

  @ApiProperty({
    example: 'Brazil',
    description: 'Origin country of the cargo',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  originCountry: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Destination city of the cargo',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  destinationCity: string;

  @ApiProperty({
    example: 'Brazil',
    description: 'Destination country of the cargo',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  destinationCountry: string;

  @ApiProperty({
    example: '2026-09-22T10:00:00.000Z',
    description: 'Cargo departure date and time',
  })
  @IsDateString()
  departureAt: string;

  @ApiProperty({
    example: '2026-09-25T18:00:00.000Z',
    description: 'Estimated delivery date and time',
  })
  @IsDateString()
  estimatedDeliveryAt: string;
}
