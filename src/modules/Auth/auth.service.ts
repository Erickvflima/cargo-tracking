import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantService } from '@modules/Tenant/tenant.service';
import { UserEntity } from '@modules/User/entities/user.entity';
import { UserService } from '@modules/User/user.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
  ) {}

  async signup({
    email,
    password,
    tenantId,
    role,
  }: SignupDto): Promise<IBaseResponse> {
    try {
      const tenantResult = await this.tenantService.findById(tenantId);

      if (!tenantResult.data) {
        throw new BadRequestException('Tenant invalid');
      }

      const result = await this.userService.create(
        email,
        password,
        tenantResult.data.id,
        role,
      );

      if (result.status !== 'success') {
        throw new BadRequestException(
          'Authentication error during user creation',
        );
      }

      return this.generateToken(result.document, tenantId);
    } catch (error) {
      throw handleError(error, 'Error during registration');
    }
  }

  async signin(email: string, password: string): Promise<IBaseResponse> {
    try {
      const result = await this.userService.findByEmail(email);

      if (!result.document) {
        throw new UnauthorizedException('Invalid username or password');
      }

      const user = result.document as UserEntity;

      const passwordValid = await bcrypt.compare(password, user.password);

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid username or password');
      }

      const tenantResult = await this.tenantService.findById(user.tenantId);

      if (!tenantResult.data) {
        throw new UnauthorizedException('Tenant Invalid');
      }

      return this.generateToken(user, tenantResult.data.id);
    } catch (error) {
      Logger.error(error);
      throw handleError(error, 'Error during signin');
    }
  }

  private generateToken(user: UserEntity, tenantId: number): IBaseResponse {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        tenantId,
        role: user.role,
      };

      return {
        status: 'success',
        message: 'User authenticated successfully',
        data: {
          accessToken: this.jwtService.sign(payload),
        },
      };
    } catch {
      throw new UnauthorizedException('Error generating JWT token');
    }
  }
}
