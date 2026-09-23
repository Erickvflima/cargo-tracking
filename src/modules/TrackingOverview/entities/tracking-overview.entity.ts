import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'v_tracking_overview',
})
export class TrackingOverviewEntity {
  @PrimaryColumn({ name: 'tracking_code' })
  trackingCode: string;

  @Column()
  status: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'estimated_delivery_at' })
  estimatedDeliveryAt: Date;

  @Column({ name: 'tenant_name' })
  tenantName: string;

  @Column({ name: 'tenant_active' })
  tenantActive: boolean;
}
