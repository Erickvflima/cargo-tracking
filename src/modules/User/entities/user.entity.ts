import { BaseEntity } from '@common/dataBase/base.entity';
import { Entity, Column, Unique } from 'typeorm';

@Entity({
  name: 'User',
  schema: 'dbo',
})
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    name: 'tenant_id',
  })
  tenantId: number;
}
