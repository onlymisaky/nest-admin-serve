import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntityWithId } from './base.emtity';
import { Permission } from './permission.entity';

@Entity({ name: 'role' })
export class Role extends BaseEntityWithId {
  @Column({ type: 'varchar', length: 50, comment: '角色名' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '角色描述' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;

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
