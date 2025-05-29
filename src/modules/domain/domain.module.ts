import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEntity } from '@/entities/domain.entity';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([DomainEntity])],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule { }
