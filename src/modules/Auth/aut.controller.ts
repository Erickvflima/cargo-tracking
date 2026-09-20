import { Public } from '@common/decorators/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user associated with the provided tenant and returns a JWT access token.',
  })
  @ApiOkResponse({
    description: 'User registered successfully.',
    schema: {
      example: {
        status: 'success',
        message: 'User authenticated successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid tenant or user already exists.',
    schema: {
      example: {
        status: 'error',
        message: 'User already exists',
      },
    },
  })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.tenantId);
  }

  @Public()
  @Post('signin')
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Authenticates the user credentials and returns a JWT access token containing the user and tenant identification.',
  })
  @ApiOkResponse({
    description: 'User authenticated successfully.',
    schema: {
      example: {
        status: 'success',
        message: 'User authenticated successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkXVCJ9...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or inactive/invalid tenant.',
    schema: {
      example: {
        status: 'error',
        message: 'Invalid username or password',
      },
    },
  })
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto.email, dto.password);
  }
}
