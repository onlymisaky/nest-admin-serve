import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PublicRoute } from '@/core/decorators/public-route.decorator';
import { DomainStatus } from '@/entities/domain.entity';
import { DomainService } from './domain.service';
import { CreateDomainDto, QueryDomainListDto, UpdateDomainDto } from './dto/domain.dto';

@PublicRoute()
@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) { }

  @Post()
  async createDomain(@Body() createDomainDto: CreateDomainDto) {
    return this.domainService.createDomain(createDomainDto);
  }

  @Delete(':id')
  async deleteDomain(@Param('id') id: number) {
    return this.domainService.deleteDomain(id);
  }

  @Get(':id')
  async getDomain(@Param('id') id: number) {
    return this.domainService.getDomain(id);
  }

  @Patch(':id')
  async updateDomain(@Param('id') id: number, @Body() updateDomainDto: UpdateDomainDto) {
    return this.domainService.updateDomain(id, updateDomainDto);
  }

  @Patch(':id/enum')
  async updateDomainEnum(@Param('id') id: number, @Body('enum') enumm: DomainStatus) {
    return this.domainService.updateDomainEnum(id, enumm);
  }

  @Post('list')
  async getDomainList(@Body() queryDto: QueryDomainListDto) {
    return this.domainService.getDomainPagedList(queryDto);
  }
}
