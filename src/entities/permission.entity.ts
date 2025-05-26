import { Column, Entity } from 'typeorm';
import { BaseEntityWithId } from './base.entity';

@Entity({ name: 'permission' })
export class Permission extends BaseEntityWithId {
  @Column({ type: 'varchar', length: 50, comment: '权限名' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '权限描述' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;
}
