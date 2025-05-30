import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export interface IsNumberRangeOptions {
  strictNumber?: boolean
}

function isNumber(value: any, strict = false): boolean {
  if (strict) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  return !Number.isNaN(Number(value));
}

const NOT_ARRAY = 'NOT_ARRAY';
const LENGTH_TOO_LONG = 'LENGTH_TOO_LONG';
const START_NOT_NUMBER = 'START_NOT_NUMBER';
const END_NOT_NUMBER = 'END_NOT_NUMBER';
const START_GREATER_THAN_END = 'START_GREATER_THAN_END';
const INVALID_RANGE = 'INVALID_RANGE';

type ErrorCode = typeof NOT_ARRAY | typeof LENGTH_TOO_LONG | typeof START_NOT_NUMBER | typeof END_NOT_NUMBER | typeof START_GREATER_THAN_END | typeof INVALID_RANGE;

const ERROR_CODE: Record<ErrorCode, string> = {
  [NOT_ARRAY]: '值必须是数组',
  [LENGTH_TOO_LONG]: '数组长度不能超过2',
  [START_NOT_NUMBER]: '起始值必须是数字',
  [END_NOT_NUMBER]: '结束值必须是数字',
  [START_GREATER_THAN_END]: '起始值不能大于结束值',
  [INVALID_RANGE]: '范围格式不正确',
};

export function isNumberRange(value: any, isNumberRangeOptions: IsNumberRangeOptions): boolean | Error {
  // 允许 undefined 或 null
  if (value === undefined || value === null) {
    return true;
  }

  // 必须是数组
  if (!Array.isArray(value)) {
    return new Error(NOT_ARRAY);
  }

  // 数组长度不能超过2
  if (value.length > 2) {
    return new Error(LENGTH_TOO_LONG);
  }

  const [start, end] = value;

  if ((start === undefined || start === null) && (end === undefined || end === null)) {
    return new Error(INVALID_RANGE);
  }

  const options = {
    strictNumber: false,
    ...isNumberRangeOptions,
  };

  if (start !== undefined && start !== null && !isNumber(start, options.strictNumber)) {
    return new Error(START_NOT_NUMBER);
  }

  if (end !== undefined && end !== null && !isNumber(end, options.strictNumber)) {
    return new Error(END_NOT_NUMBER);
  }

  // 验证范围
  if (start !== undefined && start !== null && end !== undefined && end !== null && start > end) {
    return new Error(START_GREATER_THAN_END);
  }

  return true;
}

export function IsNumberRange(options: IsNumberRangeOptions = {}, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    let res: boolean | Error | null = null;

    registerDecorator({
      name: 'IsNumberRange',
      target: object.constructor,
      propertyName,
      options: {
        message: (_args: ValidationArguments) => {
          if (res instanceof Error) {
            const msg = ERROR_CODE[res.message as ErrorCode];
            res = null;
            return `${propertyName} ${msg}`;
          }
          res = null;
          return `${propertyName} must be a valid number range`;
        },
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          res = isNumberRange(value, options);
          if (res instanceof Error) {
            return false;
          }
          res = null;
          return true;
        },
      },
    });
  };
}
