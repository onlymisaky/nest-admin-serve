import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntityWithUUID } from './base.entity';
import { Role } from './role.entity';

@Entity({ name: 'user' })
export class User extends BaseEntityWithUUID {
  @Column({ type: 'varchar', length: 50, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, comment: '密码', default: 'e10adc3949ba59abbe56e057f20f883e' })
  password: string;

  @Column({ name: 'nick_name', type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickName: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  mobile: string;

  @Column({ type: 'varchar', length: 50, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否激活' })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_user_role_user_id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_user_role_role_id',
    },
  })
  roles: Role[];
}
