import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'permission' })
export class Permission {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '权限名' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '权限描述' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
