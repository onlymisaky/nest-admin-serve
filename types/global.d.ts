import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

declare global {
  namespace NodeJS {

    interface ProcessEnv {
      ENVIRONMENT: 'development' | 'production' | string
    }
  }

  // TODO
  interface Config {
    server: {
      port: number
    }
    mysql: MysqlConnectionOptions
  }

  interface IResponse<T> {
    // 原始 http 状态码
    status: number
    // 是否成功
    success: boolean
    // 数据，失败的时候也有可能返回data，可以根据data分析具体错误原因
    data?: T
    // 失败时消息
    message?: string
    // 失败时请求信息
    request?: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string
      url: string
      body: any
      params: any
      query: any
    }
    // 时间戳
    timestamp: number
  }
}

export { };
