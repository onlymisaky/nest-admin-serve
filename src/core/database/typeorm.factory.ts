import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as mysql from 'mysql2/promise';
import { getEnv } from '@/config/configuration';

/**
 * 创建 MySQL 类型的 TypeORM 配置选项
 */
export function createMysqlTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql' as const,
    autoLoadEntities: true,
    host: configService.get('mysql.host') as string,
    port: configService.get('mysql.port') as number,
    username: configService.get('mysql.user') as string,
    password: configService.get('mysql.password') as string,
    database: configService.get('mysql.database') as string,
    logging: configService.get('mysql.logging') as boolean,
    poolSize: configService.get('mysql.poolSize') as number,
    synchronize: getEnv() === 'production' ? false : configService.get('mysql.synchronize') as boolean,
    connectorPackage: configService.get('mysql.connectorPackage') as 'mysql2',
  };
}

/**
 * 创建 SQLite 类型的 TypeORM 配置选项
 */
export function createSqliteTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'sqlite' as const,
    database: `${(configService.get('mysql.database') || 'database')}.db`,
    autoLoadEntities: true,
  };
}

/**
 * 根据 MySQL 连接可用性自动选择数据库类型
 * 如果 MySQL 可用则使用 MySQL，否则回退到 SQLite
 */
export async function createTypeOrmOptions(configService: ConfigService): Promise<TypeOrmModuleOptions> {
  const hasMysql = await mysql.createConnection({
    host: configService.get('mysql.host'),
    port: configService.get('mysql.port'),
    user: configService.get('mysql.user'),
    password: configService.get('mysql.password'),
  }).then((connection) => {
    connection.end();
    return true;
  }).catch(() => {
    return false;
  });

  return hasMysql
    ? createMysqlTypeOrmOptions(configService)
    : createSqliteTypeOrmOptions(configService);
}
