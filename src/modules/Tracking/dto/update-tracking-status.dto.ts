import { TrackingStatus } from '@common/enums/tracking';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTrackingStatusDto {
  @ApiProperty({
    example: 'IN_TRANSIT',
    description: 'New status of the tracking.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsEnum(TrackingStatus)
  status: TrackingStatus;

  @ApiProperty({
    example: 1,
    description: 'Current version of the tracking record.',
  })
  @IsInt()
  @Min(1)
  version: number;
}
