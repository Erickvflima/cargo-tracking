import { BaseEntity } from '@common/dataBase/base.entity';
import { TrackingHistoryEntity } from '@modules/TrackingHistory/entities/trackingHistory.entity';

import { Column, Entity, OneToMany, VersionColumn } from 'typeorm';

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

  @Column({
    name: 'origin_city',
    length: 100,
  })
  originCity: string;

  @Column({
    name: 'origin_country',
    length: 100,
  })
  originCountry: string;

  @Column({
    name: 'destination_city',
    length: 100,
  })
  destinationCity: string;

  @Column({
    name: 'destination_country',
    length: 100,
  })
  destinationCountry: string;

  @Column({
    name: 'departure_at',
    type: 'datetime2',
  })
  departureAt: Date;

  @Column({
    name: 'estimated_delivery_at',
    type: 'datetime2',
  })
  estimatedDeliveryAt: Date;

  @Column({
    name: 'current_latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  currentLatitude: number;

  @Column({
    name: 'current_longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  currentLongitude: number;

  @VersionColumn()
  version: number;

  @OneToMany(() => TrackingHistoryEntity, (history) => history.tracking)
  history: TrackingHistoryEntity[];
}
