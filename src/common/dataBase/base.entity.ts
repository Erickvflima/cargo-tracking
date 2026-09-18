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
  })
  createdAt: Date;

  @Column({
    name: 'created_by',
  })
  createdBy: string;

  @Column({
    name: 'updated_by',
    nullable: true,
  })
  updatedBy: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime2',
    nullable: true,
  })
  updatedAt: Date | null;
}
