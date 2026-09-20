import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCargoDto {
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
    description: 'Current status of the cargo',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status: string;
}
