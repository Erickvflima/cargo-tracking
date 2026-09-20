import { UserRole } from '@common/enums/roles';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
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

  @ApiProperty({
    example: 1,
    description: 'ID of the tenant associated with the user.',
  })
  @IsNumber()
  tenantId: number;

  @ApiProperty({
    example: UserRole.OPERATOR,
    enum: UserRole,
    description: 'Role assigned to the user.',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
