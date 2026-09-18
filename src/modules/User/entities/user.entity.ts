import { BaseEntity } from '@common/dataBase/base.entity';
import { Entity, Column, Unique } from 'typeorm';

@Entity('User')
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @Column()
  email: string;
}
