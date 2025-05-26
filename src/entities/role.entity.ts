import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntityWithId } from './base.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'role' })
export class Role extends BaseEntityWithId {
  @Column({ type: 'varchar', length: 50, comment: '角色名' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '角色描述' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permission_role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permission_permission_id',
    },
  })
  permissions: Permission[];
}
