import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

type NumberComparisonType = 'greater' | 'less' | 'equal' | 'notEqual' | 'greaterEqual' | 'lessEqual';

const msgMap: Record<NumberComparisonType, string> = {
  greater: '必须大于',
  less: '必须小于',
  equal: '必须等于',
  notEqual: '必须不等于',
  greaterEqual: '必须大于等于',
  lessEqual: '必须小于等于',
};

function compareNumbers(value1: number, value2: number, comparisonType: NumberComparisonType): boolean {
  if (comparisonType === 'greater')
    return value1 > value2;
  if (comparisonType === 'less')
    return value1 < value2;
  if (comparisonType === 'equal')
    return value1 === value2;
  if (comparisonType === 'notEqual')
    return value1 !== value2;
  if (comparisonType === 'greaterEqual')
    return value1 >= value2;
  if (comparisonType === 'lessEqual')
    return value1 <= value2;
  return false;
}

export function NumberComparison(comparisonType: NumberComparisonType, compareWithProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NumberComparison',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [compareWithProperty, comparisonType],
      validator: {
        validate: (value: number, args: ValidationArguments) => {
          const [compareWithKey, type] = args.constraints;
          const compareWithValue = (args.object as any)[compareWithKey];
          return compareNumbers(value, compareWithValue, type);
        },
        defaultMessage(args: ValidationArguments) {
          const [compareWithKey, type] = args.constraints;
          return `${args.property}${msgMap[type]}${compareWithKey}`;
        },
      },
    });
  };
}
