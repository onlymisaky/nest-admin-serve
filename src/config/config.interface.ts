export interface ServerConfig {
  port: number
}

export interface MysqlConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  logging: boolean
  poolSize: number
  synchronize: boolean
  connectorPackage: string
}

export interface JwtConfig {
  global: boolean
  secret: string
  expiresIn: string
}

export interface RedisConfig {
  host: string
  port: number
  database: number
}

export interface AppConfig {
  server: ServerConfig
  mysql: MysqlConfig
  jwt: JwtConfig
  redis: RedisConfig
}
