import { ListQueryDto } from '../dto/list-query.dto';
import { FieldQueryConfig } from '../service/list-query.service';

export function handleNumberRangeInQueryParams<Dto extends ListQueryDto>(queryDto: Dto, rangeName: keyof Dto['params']) {
  const range = queryDto?.params?.[rangeName];
  if (!range)
    return;

  if (!Array.isArray(range)) {
    delete queryDto.params.sellPriceRange;
    return;
  }

  let [startNum, endNum] = queryDto.params[rangeName];
  startNum = startNum === null ? Number.NaN : Number(startNum);
  endNum = endNum === null ? Number.NaN : Number(endNum);

  const isInvalidStartNum = Number.isNaN(startNum);
  const isInvalidEndNum = Number.isNaN(endNum);

  if (isInvalidStartNum && isInvalidEndNum) {
    delete queryDto.params[rangeName];
    return;
  }

  queryDto.params[rangeName] = [
    isInvalidStartNum ? null : startNum,
    isInvalidEndNum ? null : endNum,
  ];
}

export function handleTimeRangeInQueryParams<Dto extends ListQueryDto>(queryDto: Dto, rangeName: keyof Dto['params']) {
  const range = queryDto?.params?.[rangeName];
  if (!range)
    return;

  if (!Array.isArray(range)) {
    delete queryDto.params.sellPriceRange;
    return;
  }

  const [startTime, endTime] = queryDto.params[rangeName];
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const isInvalidStartTime = startTime && /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(startTime);
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const isInvalidEndTime = endTime && /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(endTime);

  if (isInvalidStartTime && isInvalidEndTime) {
    delete queryDto.params[rangeName];
  }

  queryDto.params[rangeName] = [
    isInvalidStartTime ? null : startTime?.trim(),
    isInvalidEndTime ? null : endTime?.trim(),
  ];
}

function getQueryType(startValue: number, endValue: number): 'between' | 'gte' | 'lte' | null {
  if (startValue !== null && endValue !== null)
    return 'between';
  if (startValue !== null)
    return 'gte';
  if (endValue !== null)
    return 'lte';
  return null;
}

export function createRangeFieldQueryConfig(range: any, dbField?: string) {
  const fieldConfig: FieldQueryConfig = {};

  if (!range || !Array.isArray(range)) {
    return fieldConfig;
  }

  const [startValue, endValue] = range;
  const queryType = getQueryType(startValue, endValue);

  if (queryType) {
    fieldConfig.queryType = queryType;
    fieldConfig.dbField = dbField || '';
  }

  return fieldConfig;
}
