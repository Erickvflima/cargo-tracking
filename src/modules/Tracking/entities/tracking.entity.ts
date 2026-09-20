import { BaseEntity } from '@common/dataBase/base.entity';
import { Column, Entity, VersionColumn } from 'typeorm';

@Entity({
  name: 'tracking',
})
export class TrackingEntity extends BaseEntity {
  @Column({
    name: 'tracking_code',
    unique: true,
    length: 50,
  })
  trackingCode: string;

  @Column({
    length: 50,
  })
  status: string;

  @VersionColumn()
  version: number;
}
