import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime2',
    default: () => 'GETDATE()',
  })
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'nvarchar',
    length: 255,
  })
  createdBy: string;

  @Column({
    name: 'updated_by',
    nullable: true,
    type: 'nvarchar',
    length: 255,
  })
  updatedBy: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime2',
    nullable: true,
  })
  updatedAt: Date | null;
}
