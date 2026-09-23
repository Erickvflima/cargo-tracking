import { BaseEntity } from '@common/dataBase/base.entity';
import { UserRole } from '@common/enums/roles';
import { TenantEntity } from '@modules/Tenant/entities/tenant.entity';
import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';

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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.users, {
    nullable: false,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @Column({
    length: 20,
    default: UserRole.VIEWER,
  })
  role: UserRole;
}
