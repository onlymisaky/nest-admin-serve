import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsMobile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMobile',
      target: object.constructor,
      propertyName,
      options: {
        message: '请输入正确的手机号码',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string')
            return false;
          // 中国大陆手机号码正则表达式
          // 支持 13x, 14x, 15x, 16x, 17x, 18x, 19x 开头的手机号
          return /^1[3-9]\d{9}$/.test(value);
        },
      },
    });
  };
}
