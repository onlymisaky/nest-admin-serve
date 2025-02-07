import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { ListQueryDto } from '../dto/list-query.dto';

export type QueryConfig<Dto = any> = {
  [P in keyof Dto]?: {
    dbField?: string
    queryType?: 'exact' | 'like' | 'in' | 'between' | 'gt' | 'gte' | 'lt' | 'lte'
  }
};

interface Builder<Entity extends ObjectLiteral> { builder: SelectQueryBuilder<Entity> }
interface Alias { alias: string }
type QueryBuilderOptions<Entity extends ObjectLiteral, Dto = any> = Partial<Builder<Entity> | Alias> & { queryConfig?: QueryConfig<Dto> };

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
      const config = queryConfig[paramKey] || { dbField: paramKey, queryType: 'like' };
      const { dbField = paramKey, queryType = 'like' } = config;

      const val = params[paramKey];

      if (val === undefined || val === '' || val === null)
        return;

      let value;

      if (['in', 'between'].includes(queryType)) {
        if (Array.isArray(val)) {
          value = val;
        }
        // sql 中 IN 和 BETWEEN 都是类型敏感的
        // 所以如果不是 string 类型，还是老老实实的传输组吧
        else if (typeof value === 'string') {
          value = val.split(',');
        }
        else {
          value = [val, val] as any[];
        }
      }
      else if (['gt', 'gte', 'lt', 'lte'].includes(queryType)) {
        // 可能是由 between 降级到这一层的
        // 比如传入了 [1, 's'], [1], ['s', 1], ['2024-01-01', 'sasd'], ['2024-01-01'], ['asdasd', '2024-01-02']
        // 总之就是其中一个范围格式正确，另一个范围格式不正确或丢失
        // 这种情况在 controller 层，通过 range-dto 处理成 [合法, null] 或 [null, 合法]
        // 在 service 层，调用 getPagedList 前判判断是否由 between 降级为 'gt', 'gte', 'lt', 'lte'
        // 所以此处判断 val 是否为数组，如果是，将第一个不是 null 取出 参与 sql 查找
        if (Array.isArray(val)) {
          value = val.find((item) => item !== null);
        }
        else {
          value = val;
        }
      }
      else {
        value = val;
      }

      switch (queryType) {
        case 'like':
          queryBuilder.andWhere(`${alias}.${dbField} LIKE :${paramKey}`, {
            [paramKey]: `%${value}%`,
          });
          break;
        case 'in':
          queryBuilder.andWhere(`${alias}.${dbField} IN (:...${paramKey})`, {
            [paramKey]: value,
          });
          break;
        case 'between':
          if (value.length === 2) {
            queryBuilder.andWhere(`${alias}.${dbField} BETWEEN :${paramKey}Start AND :${paramKey}End`, {
              [`${paramKey}Start`]: value[0],
              [`${paramKey}End`]: value[1],
            });
          }
          break;
        case 'exact':
          queryBuilder.andWhere(`${alias}.${dbField} = :${paramKey}`, {
            [paramKey]: value,
          });
          break;
        case 'gt':
          queryBuilder.andWhere(`${alias}.${dbField} > :${paramKey}`, {
            [paramKey]: value,
          });
          break;
        case 'gte':
          queryBuilder.andWhere(`${alias}.${dbField} >= :${paramKey}`, {
            [paramKey]: value,
          });
          break;
        case 'lt':
          queryBuilder.andWhere(`${alias}.${dbField} < :${paramKey}`, {
            [paramKey]: value,
          });
          break;
        case 'lte':
          queryBuilder.andWhere(`${alias}.${dbField} <= :${paramKey}`, {
            [paramKey]: value,
          });
          break;
      }
    });

    if (sort?.sortBy) {
      const sortConfig = queryConfig[sort.sortBy] || {};
      const sortField = sortConfig.dbField || sort.sortBy;
      queryBuilder.orderBy(`${alias}.${sortField}`, sort.sortOrder);
    }
  }

  protected createListQueryBuilder<Entity extends ObjectLiteral>(
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

  async getPagedList<Dto extends ListQueryDto, Entity extends ObjectLiteral = any>(
    repository: Repository<Entity>,
    queryDto: Dto,
    queryOptions?: QueryBuilderOptions<Entity, Dto['params']>,
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
