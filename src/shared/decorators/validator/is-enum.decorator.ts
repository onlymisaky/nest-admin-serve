import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// TODO
export function IsEnumType(enumType: Record<string, number>, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnumType',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const genderPattern = `^${Object.values(enumType).join('|')}$`;
          const regex = new RegExp(genderPattern, 'i');
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是${Object.values(enumType).join('或')}`;
        },
      },
    });
  };
}
