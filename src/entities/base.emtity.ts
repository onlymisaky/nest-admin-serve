import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    default: 0,
    comment: '是否软删除(0:否,1:是)',
  })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}

export class BaseEntityWithId extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
}

export class BaseEntityWithUUID extends BaseEntity {
  // increment number 自增长整数，每次插入新记录时，自动加1，MySQL中是 AUTO_INCREMENT
  // uuid string 36位字符串，不依赖数据库自增，可以预先生成，索引性能比自增ID差
  // rowid number SQLite 特有的主键策略，自动生成行ID，类似于自增长，但实现机制不同，number
  // identity number SQL Server 和 PostgreSQL 特有的主键策略，类似于自增长，使用数据库的 IDENTITY 特性
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
