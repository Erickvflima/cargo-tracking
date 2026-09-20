import { BaseEntity } from '@common/dataBase/base.entity';
import { UserRole } from '@common/enums/roles';
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

  @Column({
    length: 20,
    default: UserRole.VIEWER,
  })
  role: UserRole;
}
