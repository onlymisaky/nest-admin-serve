import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

type NumberDiffType = 'greater' | 'less' | 'equal' | 'notEqual' | 'greaterEqual' | 'lessEqual';

const msgMap: Record<NumberDiffType, string> = {
  greater: '必须大于',
  less: '必须小于',
  equal: '必须等于',
  notEqual: '必须不等于',
  greaterEqual: '必须大于等于',
  lessEqual: '必须小于等于',
};

function diffNumber(value: number, diffValue: number, type: NumberDiffType) {
  if (type === 'greater')
    return value > diffValue;
  if (type === 'less')
    return value < diffValue;
  if (type === 'equal')
    return value === diffValue;
  if (type === 'notEqual')
    return value !== diffValue;
  if (type === 'greaterEqual')
    return value >= diffValue;
  if (type === 'lessEqual')
    return value <= diffValue;
  return false;
}

export function NumberDiff(diffType: NumberDiffType, diffProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [diffProperty, diffType],
      validator: {
        validate: (value: number, args: ValidationArguments) => {
          const [diffKey, type] = args.constraints;
          const diffValue = (args.object as any)[diffKey];
          return diffNumber(value, diffValue, type);
        },
        defaultMessage(args: ValidationArguments) {
          const [diffKey, type] = args.constraints;
          return `${args.property}${msgMap[type]}${diffKey}`;
        },
      },

    });
  };
}
