import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

declare global {
  namespace NodeJS {

    interface ProcessEnv {
      ENVIRONMENT: 'development' | 'production' | string
    }
  }

  // TODO
  interface Config {
    mysql: MysqlConnectionOptions
  }

}

export { };
