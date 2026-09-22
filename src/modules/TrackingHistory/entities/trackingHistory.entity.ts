import { BaseEntity } from '@common/dataBase/base.entity';
import { TrackingEntity } from '@modules/Tracking/entities/tracking.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'tracking_history',
})
export class TrackingHistoryEntity extends BaseEntity {
  @Column({
    name: 'tracking_id',
  })
  trackingId: string;

  @ManyToOne(() => TrackingEntity, (tracking) => tracking.history)
  @JoinColumn({
    name: 'tracking_id',
  })
  tracking: TrackingEntity;

  @Column({
    length: 50,
  })
  status: string;

  @Column({
    name: 'occurred_at',
    type: 'datetime2',
  })
  occurredAt: Date;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observation: string;
}
