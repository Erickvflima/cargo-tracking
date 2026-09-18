import { Public } from '@common/decorators/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  @ApiOkResponse({
    description: 'Usuário cadastrado com sucesso',
    schema: {
      example: {
        status: 'success',
        message: 'Usuário autenticado com sucesso',
        data: {
          accessToken: 'jwt_token',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Usuário já existe',
    schema: {
      example: {
        status: 'error',
        message: 'Usuário já existe',
      },
    },
  })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email);
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiOkResponse({
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        status: 'success',
        message: 'Usuário autenticado com sucesso',
        data: {
          accessToken: 'jwt_token',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        status: 'error',
        message: 'Usuário não encontrado',
      },
    },
  })
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto.email);
  }
}
