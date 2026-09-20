import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SigninDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'User email address.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Senha123',
    description: 'User password.',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
