import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid', { comment: 'ID' })
  id: string;

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

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @JoinTable({
    name: 'user_role_relation',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => Role)
  roles: Role[];
}
