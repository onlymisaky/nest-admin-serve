import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeService } from '@/core/decorators/safe-service.decorator';
import { DomainEntity, DomainStatus } from '@/entities/domain.entity';
import { ListQueryService } from '@/shared/service/list-query.service';
import { createRangeFieldQueryConfig } from '@/shared/utils/range-dto';
import { CreateDomainDto, QueryDomainListDto, UpdateDomainDto } from './dto/domain.dto';

@Injectable()
export class DomainService {
  @SafeService({
    errorHandler(_error, { prop }) {
      throw new UnprocessableEntityException(`Failed to execute ${String(prop)}`);
    },
  })
  @InjectRepository(DomainEntity)
  private readonly domainRepository: Repository<DomainEntity>;

  @Inject(ListQueryService)
  private readonly listQueryService: ListQueryService;

  async createDomain(createDomainDto: CreateDomainDto) {
    const domain = new DomainEntity();
    Object.assign(domain, createDomainDto);
    return this.domainRepository.save(domain);
  }

  async getDomainPagedList(queryDto: QueryDomainListDto) {
    const alias = 'domain';
    const queryBuilder = this.domainRepository.createQueryBuilder(alias);
    queryBuilder.andWhere(`${alias}.is_deleted = :isDeleted`, { isDeleted: false });
    const data = await this.listQueryService.getPagedList(this.domainRepository, queryDto, {
      queryBuilder,
      fieldConfigs: {
        char: { queryType: 'exact' },
        varchar: { queryType: 'like' },
        decimalRange: createRangeFieldQueryConfig(queryDto.params.decimalRange, 'decimal'),
        enum: { queryType: 'in' },
        datetimeRange: createRangeFieldQueryConfig(queryDto.params.datetimeRange, 'datetime'),
      },
    });
    return data;
  }

  async getDomain(id: number) {
    const domain = await this.domainRepository.findOne({ where: { id, isDeleted: false } });
    if (!domain) {
      throw new NotFoundException('domain不存在');
    }
    return domain;
  }

  async updateDomain(id: number, updateDomainDto: UpdateDomainDto) {
    const domain = await this.getDomain(id);
    await this.domainRepository.save({ ...domain, ...updateDomainDto });
    return '更新成功';
  }

  async updateDomainEnum(id: number, enumm: DomainStatus) {
    const domain = await this.getDomain(id);
    await this.domainRepository.save({ ...domain, enum: enumm });
    return 'enum更新成功';
  }

  async deleteDomain(id: number) {
    const domain = await this.getDomain(id);
    domain.isDeleted = true;
    await this.domainRepository.save(domain);
    return '删除成功';
  }
}
