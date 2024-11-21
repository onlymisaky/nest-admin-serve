import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, comment: '密码' })
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

  @Column({ name: 'is_super_admin', type: 'tinyint', default: 0, comment: '是否超级管理员' })
  isSuperAdmin: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
