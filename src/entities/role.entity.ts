import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Permission } from './permission.entity';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '角色名' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '角色描述' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @JoinTable({
    name: 'role_permission_relation',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => Permission)
  permissions: Permission[];
}
