import * as Joi from 'joi';

export const validationSchema = Joi.object({
  server: Joi.object({
    port: Joi.number().default(3000),
  }),

  mysql: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().default(3306),
    user: Joi.string().required(),
    password: Joi.string().required(),
    database: Joi.string().required(),
    logging: Joi.boolean().default(true),
    poolSize: Joi.number().default(10),
    synchronize: Joi.boolean().default(true),
    connectorPackage: Joi.string().valid('mysql2').default('mysql2'),
  }),

  jwt: Joi.object({
    global: Joi.boolean().default(true),
    secret: Joi.string().required(),
    expiresIn: Joi.string().default('1h'),
  }),

  redis: Joi.object({
    host: Joi.string().default('localhost'),
    port: Joi.number().default(6379),
    database: Joi.number().default(0),
  }),
});

export function validateConfig(config: Record<string, any>): void {
  const { error } = validationSchema.validate(config, {
    abortEarly: false, // 显示所有验证错误
    allowUnknown: true, // 允许未知属性
  });

  if (error) {
    throw new Error(`配置验证失败:\n${error.details.map(d => ` - ${d.message}`).join('\n')}`);
  }
}
