import { ApiProperty } from '@nestjs/swagger';

export class GeolocationResultDto {
  @ApiProperty({
    example: -19.9166813,
    description: 'Latitude of the resolved location.',
  })
  latitude: number;

  @ApiProperty({
    example: -44.0800314,
    description: 'Longitude of the resolved location.',
  })
  longitude: number;
}
