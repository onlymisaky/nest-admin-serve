import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

type TimeComparisonType = 'after' | 'before' | 'equal' | 'notEqual' | 'afterEqual' | 'beforeEqual';

const comparisonMessageMap: Record<TimeComparisonType, string> = {
  after: '必须晚于',
  before: '必须早于',
  equal: '必须等于',
  notEqual: '必须不等于',
  afterEqual: '必须晚于等于',
  beforeEqual: '必须早于等于',
};

function convertTimeToSeconds(timeString: string): number {
  const [hours = 0, minutes = 0, seconds = 0] = `${timeString}`.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function compareTime(time1: string, time2: string, comparisonType: TimeComparisonType): boolean {
  const timeDiff = convertTimeToSeconds(time1) - convertTimeToSeconds(time2);
  if (comparisonType === 'after')
    return timeDiff > 0;
  if (comparisonType === 'before')
    return timeDiff < 0;
  if (comparisonType === 'equal')
    return timeDiff === 0;
  if (comparisonType === 'notEqual')
    return timeDiff !== 0;
  if (comparisonType === 'afterEqual')
    return timeDiff >= 0;
  if (comparisonType === 'beforeEqual')
    return timeDiff <= 0;
  return false;
}

export function TimeComparison(comparisonType: TimeComparisonType, compareWithProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'timeComparison',
      target: object.constructor,
      propertyName,
      constraints: [compareWithProperty, comparisonType],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [compareWithKey, type] = args.constraints;
          const compareWithValue = (args.object as any)[compareWithKey];
          return compareTime(value, compareWithValue, type);
        },
        defaultMessage(args: ValidationArguments) {
          const [compareWithKey, type] = args.constraints;
          return `${args.property}${comparisonMessageMap[type]}${compareWithKey}`;
        },
      },
    });
  };
}
