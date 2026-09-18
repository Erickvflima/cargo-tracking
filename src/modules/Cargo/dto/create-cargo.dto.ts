import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  trackingCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status: string;
}
