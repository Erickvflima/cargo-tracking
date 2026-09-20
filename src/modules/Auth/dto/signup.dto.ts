import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Senha123',
    description: 'Senha do usuário',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '1',
    description: 'Id do tenant',
  })
  @IsNumber()
  tenantId: number;
}
