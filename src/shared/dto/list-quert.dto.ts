import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page 必须是整数' })
  @Min(1, { message: 'page 最小值为 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize 必须是整数' })
  @Min(1, { message: 'pageSize 最小值为 1' })
  pageSize?: number = 10;
}

export class SortDto {
  @IsOptional()
  @IsString({ message: 'sortBy 必须是字符串' })
  sortBy: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'sortOrder 必须是 ASC 或 DESC' })
  sortOrder: 'ASC' | 'DESC';
}

export abstract class ListQueryDto {
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SortDto)
  sort?: SortDto;

  abstract params?: Record<string, any>;
}
