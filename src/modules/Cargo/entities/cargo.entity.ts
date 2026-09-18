import { BaseEntity } from '@common/dataBase/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'cargo',
})
export class CargoEntity extends BaseEntity {
  @Column({
    name: 'tracking_code',
    length: 50,
  })
  trackingCode: string;

  @Column({
    length: 50,
  })
  status: string;
}
