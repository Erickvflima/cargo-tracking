import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123',
    description: 'Senha do usuário',
  })
  @IsString()
  password: string;
}
