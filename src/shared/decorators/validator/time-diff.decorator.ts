import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

type TimeDiffType = 'after' | 'before' | 'equal' | 'notEqual' | 'afterEqual' | 'beforeEqual';

const msgMap: Record<TimeDiffType, string> = {
  after: '必须晚于',
  before: '必须早于',
  equal: '必须等于',
  notEqual: '必须不等于',
  afterEqual: '必须晚于等于',
  beforeEqual: '必须早于等于',
};

function getSeconds(time: string) {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function diffTime(time1: string, time2: string, type: TimeDiffType) {
  const diff = getSeconds(time1) - getSeconds(time2);
  if (type === 'after')
    return diff > 0;
  if (type === 'before')
    return diff < 0;
  if (type === 'equal')
    return diff === 0;
  if (type === 'notEqual')
    return diff !== 0;
  if (type === 'afterEqual')
    return diff >= 0;
  if (type === 'beforeEqual')
    return diff <= 0;
  return false;
}

export function TimeDiff(diffType: TimeDiffType, diffProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'timeDiff',
      target: object.constructor,
      propertyName,
      constraints: [diffProperty, diffType],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [diffKey, type] = args.constraints;
          const diffValue = (args.object as any)[diffKey];
          return diffTime(value, diffValue, type);
        },
        defaultMessage(args: ValidationArguments) {
          const [diffKey, type] = args.constraints;
          return `${args.property}${msgMap[type]}${diffKey}`;
        },
      },
    });
  };
}
