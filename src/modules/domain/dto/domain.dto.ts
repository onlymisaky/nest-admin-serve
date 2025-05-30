import { Buffer } from 'node:buffer';
import { DomainStatus, TinyintEnum } from '@entities/domain.entity';
import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { IsDecimal } from '@shared/decorators/validator/is-decimal.decorator';
import { getEnumNumbers } from '@shared/utils/enum';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsISO8601, IsJSON, IsNotEmpty, IsNumberString, IsOptional, IsString, Length, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { IsNumberRange } from '@/shared/decorators/validator/is-number-range.decorator';
import { ListQueryDto } from '@/shared/dto/list-query.dto';

export class DomainDto {
  @Length(6, 6, { message: 'char 长度必须是6个字符' })
  @IsString({ message: '必须是字符串' })
  @IsNotEmpty({ message: 'char 不能为空' })
  char: string;

  @MaxLength(255, { message: 'varchar 不能超过255个字符' })
  @MinLength(1, { message: '至少为1个字符' })
  @IsString({ message: '必须是字符串' })
  @IsNotEmpty({ message: 'varchar 不能为空' })
  varchar: string;

  @IsString({ message: 'text 必须是字符串' })
  @IsOptional()
  text?: string;

  @IsInt({ message: 'int 必须是整数' })
  @IsNotEmpty({ message: 'int 不能为空' })
  int: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null)
      return value;
    return Number(value);
  })
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'decimal 必须是小数，最多两位小数' })
  @IsOptional()
  decimal?: number;

  @IsBoolean({ message: 'boolean 必须是布尔值' })
  @IsOptional()
  boolean?: boolean;

  @IsEnum(DomainStatus, { message: `enum 必须是${Object.values(DomainStatus).join('或')}` })
  @IsOptional()
  enum?: DomainStatus;

  @IsEnum(getEnumNumbers(TinyintEnum), { message: `tinyintToAchieveEnum 选项必须是${getEnumNumbers(TinyintEnum).join('或')}` })
  @IsOptional()
  tinyintToAchieveEnum?: TinyintEnum;

  @IsDateString({}, { message: 'date 必须是日期字符串' })
  @IsOptional()
  date?: string;

  @Matches(/^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    // /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    // /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    message: 'datetime 格式必须是 HH:mm 或 HH:mm:ss',
  })
  @IsOptional()
  time?: string;

  @IsISO8601({ strict: true })
  @Type(() => String)
  @IsOptional()
  datetime?: string;

  @IsNumberString({}, { message: 'timestamp 必须是数字字符串' })
  @IsOptional()
  timestamp?: string;

  @IsJSON({ message: 'json 必须是JSON格式' })
  @IsOptional()
  json?: object;

  @IsArray({ message: 'array 必须是数组' })
  @IsOptional()
  array?: string[];

  @IsOptional()
  varbinary?: Buffer;

  @IsOptional()
  blob?: Buffer;
}

export class CreateDomainDto extends OmitType(DomainDto, ['varbinary', 'blob']) {

}

export class UpdateDomainDto extends PartialType(DomainDto) {

}

export class UpdateDomainEnumDto extends PickType(DomainDto, ['enum']) {

}

export class QueryDomainDto extends PartialType(PickType(DomainDto, ['char', 'varchar'])) {
  @Transform((args) => {
    // 只做转换，不做任何验证
    if (Array.isArray(args.value)) {
      // 确保 args.value 至少有两个元素
      const [start, end, ...rest] = args.value;
      return [start, end, ...rest].map(item => {
        if (['', 'null', 'undefined'].includes(`${item}`.trim())) {
          return null;
        }
        const n = Number(item);
        if (Number.isNaN(Number(item))) {
          return null;
        }
        return n;
      });
    }
    return null;
  })
  @IsNumberRange()
  @IsOptional()
  decimalRange?: [number?, number?];

  @IsArray()
  @IsOptional()
  enum?: DomainStatus[];

  @IsArray()
  @IsOptional()
  datetimeRange?: [string?, string?];
}

export class QueryDomainListDto extends ListQueryDto {
  @ValidateNested()
  @Type(() => QueryDomainDto)
  params: QueryDomainDto;
}
