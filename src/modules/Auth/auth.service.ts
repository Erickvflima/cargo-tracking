import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { UserEntity } from '@modules/User/entities/user.entity';
import { UserService } from '@modules/User/user.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string): Promise<IBaseResponse> {
    try {
      const result = await this.userService.create(email);

      if (!result.data) {
        throw new BadRequestException('Usuário não pôde ser criado');
      }

      return this.generateToken(result.data);
    } catch (error) {
      throw handleError(error, 'Erro ao realizar cadastro');
    }
  }

  async signin(email: string): Promise<IBaseResponse> {
    try {
      const result = await this.userService.findByEmail(email);

      if (!result.data) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      return this.generateToken(result.data);
    } catch (error) {
      throw handleError(error, 'Erro ao realizar login');
    }
  }

  private generateToken(user: UserEntity): IBaseResponse {
    try {
      const payload = { sub: user.id, email: user.email };

      return {
        status: 'success',
        message: 'Usuário autenticado com sucesso',
        data: {
          accessToken: this.jwtService.sign(payload),
        },
      };
    } catch {
      throw new UnauthorizedException('Erro ao gerar token JWT');
    }
  }
}
