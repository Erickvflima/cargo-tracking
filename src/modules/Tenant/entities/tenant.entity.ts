import { BaseEntity } from '@common/dataBase/base.entity';
import { UserEntity } from '@modules/User/entities/user.entity';
import { Column, Entity, Unique, OneToMany } from 'typeorm';

@Entity({ name: 'tenants', schema: 'dbo' })
@Unique(['schemaName'])
export class TenantEntity extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ name: 'schema_name', length: 100 })
  schemaName: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => UserEntity, (user) => user.tenant)
  users: UserEntity[];
}
