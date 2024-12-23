import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListQueryDto } from '../dto/list-quert.dto';

@Injectable()
export class ListQueryService {
  createListQueryBuilder<Entity>(
    repository: Repository<Entity>,
    alias: string,
    queryDto: ListQueryDto,
    queryBuilder?: SelectQueryBuilder<Entity>,
  ): SelectQueryBuilder<Entity> {
    const builder = queryBuilder || repository.createQueryBuilder(alias);
    const { params = {}, sort } = queryDto;

    // 处理查询参数
    Object.keys(params).forEach(key => {
      builder.andWhere(`${alias}.${key} = :${key}`, { [key]: params[key] });
    });

    // 处理排序
    if (sort) {
      builder.orderBy(`${alias}.${sort.sortBy}`, sort.sortOrder);
    }

    return builder;
  }

  async getPagedList<Entity>(
    repository: Repository<Entity>,
    queryDto: ListQueryDto,
    alias: string = 'entity',
  ) {
    const { pagination = { page: 1, pageSize: 10 } } = queryDto;
    const { page = 1, pageSize = 10 } = pagination;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.createListQueryBuilder(repository, alias, queryDto);

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
      },
      total,
    };
  }
}
