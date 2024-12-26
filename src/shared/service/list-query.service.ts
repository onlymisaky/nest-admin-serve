import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListQueryDto } from '../dto/list-quert.dto';

interface QueryConfig {
  [key: string]: {
    dbField?: string
    queryType?: 'exact' | 'like' | 'in' | 'between'
  }
}

interface Builder<Entity> { builder: SelectQueryBuilder<Entity> }
interface Alias { alias: string }
type QueryBuilderOptions<Entity> = Partial<Builder<Entity> | Alias> & { queryConfig?: QueryConfig };

@Injectable()
export class ListQueryService {
  protected handleQueryBuilder(
    queryBuilder: SelectQueryBuilder<any>,
    params: Record<string, any>,
    queryConfig: QueryConfig = {},
    sort?: { sortBy: string, sortOrder: 'ASC' | 'DESC' },
  ) {
    const alias = queryBuilder.alias;

    Object.keys(params).forEach(paramKey => {
      const value = params[paramKey];

      if (value === undefined || value === '' || value === null)
        return;

      let values: Array<string | number | any> = [];
      if (Array.isArray(value)) {
        values = value;
      }
      else if (typeof value === 'string') {
        values = value.split(',');
      }
      else {
        values = [value] as any[];
      }

      const config = queryConfig[paramKey] || { dbField: paramKey, queryType: 'like' };
      const { dbField = paramKey, queryType = 'like' } = config;

      switch (queryType) {
        case 'like':
          queryBuilder.andWhere(`${alias}.${dbField} LIKE :${paramKey}`, {
            [paramKey]: `%${value}%`,
          });
          break;
        case 'in':
          queryBuilder.andWhere(`${alias}.${dbField} IN (:...${paramKey})`, {
            [paramKey]: values,
          });
          break;
        case 'between':
          if (values.length === 2) {
            queryBuilder.andWhere(`${alias}.${dbField} BETWEEN :${paramKey}Start AND :${paramKey}End`, {
              [`${paramKey}Start`]: values[0],
              [`${paramKey}End`]: values[1],
            });
          }
          break;
        case 'exact':
          queryBuilder.andWhere(`${alias}.${dbField} = :${paramKey}`, {
            [paramKey]: value,
          });
      }
    });

    if (sort?.sortBy) {
      const sortConfig = queryConfig[sort.sortBy] || {};
      const sortField = sortConfig.dbField || sort.sortBy;
      queryBuilder.orderBy(`${alias}.${sortField}`, sort.sortOrder);
    }
  }

  createListQueryBuilder<Entity>(
    repository: Repository<Entity>,
    queryDto: ListQueryDto,
    queryBuilderOptions?: QueryBuilderOptions<Entity>,
  ): SelectQueryBuilder<Entity> {
    let alias: string = (queryBuilderOptions as Alias)?.alias || 'entity';
    alias = `${alias}`;
    let builder: SelectQueryBuilder<Entity>;
    let queryConfig: QueryConfig = {};

    // 校验 + 赋值
    // 可读性和代码简介性平衡
    if (queryBuilderOptions) {
      if ((queryBuilderOptions as Builder<Entity>).builder instanceof SelectQueryBuilder) {
        builder = (queryBuilderOptions as Builder<Entity>).builder;
      }
      else {
        builder = repository.createQueryBuilder(alias);
      }

      if (typeof queryBuilderOptions.queryConfig === 'object' && queryBuilderOptions.queryConfig !== null) {
        queryConfig = queryBuilderOptions.queryConfig;
      }
    }
    else {
      builder = repository.createQueryBuilder(alias);
    }

    const { params = {}, sort } = queryDto;

    this.handleQueryBuilder(builder, params, queryConfig, sort);

    return builder;
  }

  async getPagedList<Entity>(
    repository: Repository<Entity>,
    queryDto: ListQueryDto,
    queryOptions?: QueryBuilderOptions<Entity>,
  ) {
    const { pagination = { page: 1, pageSize: 10 } } = queryDto;
    const { page = 1, pageSize = 10 } = pagination;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.createListQueryBuilder(repository, queryDto, queryOptions);

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: items,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
      },
      total,
    };
  }
}
