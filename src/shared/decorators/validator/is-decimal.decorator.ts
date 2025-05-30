import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export interface IsDecimalOptions {
  /**
   * @default false
   */
  force_decimal?: boolean | undefined
  /**
   * @default '1,'
   */
  decimal_digits?: string | undefined
}

function isDecimal(value: any, isDecimalOptions: IsDecimalOptions): boolean {
  if (['', 'undefined', 'null'].includes(`${value}`.trim())) {
    return false;
  }
  const options = {
    force_decimal: false,
    decimal_digits: '1,',
    ...isDecimalOptions,
  };

  const regExp = new RegExp(
    `^[-+]?([0-9]+)?(\\.([0-9]{${options.decimal_digits}}))${options.force_decimal ? '' : '?'}$`,
  );
  return regExp.test(value);
}

export interface IsDecimalOptions {
  /**
   * @default false
   */
  force_decimal?: boolean | undefined
  /**
   * @default '1,'
   */
  decimal_digits?: string | undefined
}

export function IsDecimal(options: IsDecimalOptions, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDecimal',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} is not a valid decimal number`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return isDecimal(value, options);
        },
      },
    });
  };
}
