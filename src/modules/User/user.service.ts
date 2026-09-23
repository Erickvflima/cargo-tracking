import { UserRole } from '@common/enums/roles';
import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { UserEntity } from '@modules/User/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async create(
    email: string,
    password: string,
    tenantId: number,
    role: UserRole,
  ): Promise<IBaseResponse<UserEntity>> {
    try {
      const exists = await this.userRepository.findOne({
        where: { email },
      });

      if (exists) {
        throw new BadRequestException('User already exists');
      }
      const tenant = await this.tenantRepository.findOne({
        where: {
          id: tenantId,
          active: true,
        },
      });

      if (!tenant) {
        throw new BadRequestException('Tenant not found or inactive');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        tenantId,
        role,
        createdBy: 'SYSTEM',
      });

      const saved = await this.userRepository.save(user);

      return {
        status: 'success',
        message: 'User successfully created',
        document: saved,
      };
    } catch (error) {
      throw handleError(error, 'Error creating user');
    }
  }

  async findByEmail(email: string): Promise<IBaseResponse<UserEntity | null>> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      return {
        status: 'success',
        message: user ? 'User found' : 'User not found',
        document: user,
      };
    } catch (error) {
      throw handleError(error, 'Error retrieving user');
    }
  }
}
