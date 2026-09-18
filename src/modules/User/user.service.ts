import { handleError } from '@common/errors/handle-error.util';
import { IBaseResponse } from '@interface/baseResponse';
import { UserEntity } from '@modules/User/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(email: string): Promise<IBaseResponse<UserEntity>> {
    try {
      const exists = await this.userRepo.findOne({ where: { email } });
      if (exists) {
        throw new BadRequestException('User already exists');
      }

      const user = this.userRepo.create({ email });
      const saved = await this.userRepo.save(user);

      return {
        status: 'success',
        message: 'User successfully created',
        data: saved,
      };
    } catch (error) {
      throw handleError(error, 'Error creating user');
    }
  }

  async findByEmail(email: string): Promise<IBaseResponse<UserEntity | null>> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });

      return {
        status: 'success',
        message: user ? 'User found' : 'User not found',
        data: user,
      };
    } catch (error) {
      throw handleError(error, 'Error retrieving user');
    }
  }
}
